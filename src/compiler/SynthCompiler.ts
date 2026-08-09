/**
 * SynthCompiler - Compiles SynthSource chains into MRT GLSL shaders.
 *
 * This compiler takes a SynthSource chain and produces a GLSL fragment shader
 * that outputs to textmode.js's triple-target MRT rendering:
 *   - Target 0: Character data (indexLow, indexHigh, packedFlags, rotation)
 *   - Target 1: Primary/foreground color (RGBA)
 *   - Target 2: Secondary/cell background color (RGBA)
 *
 * The compilation process is modular, delegating to:
 *   - FeedbackTracker: Manages feedback texture usage
 *   - ExternalLayerManager: Manages cross-layer sampling
 *   - TransformCodeGenerator: Generates GLSL for individual transforms
 *   - ArgumentLowerer: Type-directed uniform/literal lowering
 *   - GLSLGenerator: Assembles the final shader
 */

import { SynthSource } from '../core/SynthSource';
import type { CompiledSynthShader, ChainCompilationResult, CompilationTarget } from './types';
import { FeedbackTracker } from './FeedbackTracker';
import { ExternalLayerManager } from './ExternalLayerManager';
import { TextmodeSourceManager } from './TextmodeSourceManager';
import { TransformCodeGenerator } from './TransformCodeGenerator';
import { ArgumentLowerer } from './ArgumentLowerer';
import { generateFragmentShader, generateCharacterOutputCode } from './GLSLGenerator';
import type { RegisteredTransform, NormalizedTransformInput } from '../transforms/TransformDefinition';
import type { ExternalLayerReference } from '../core';
import { COMBINE_TYPES, COORD_TYPES } from '../core/constants';

/**
 * Compile a SynthSource chain into a complete MRT GLSL shader.
 *
 * @param source The SynthSource chain to compile
 * @returns A compiled shader with fragment source and uniform definitions
 */
export function compileSynthSource(source: SynthSource): CompiledSynthShader {
	const compiler = new SynthCompiler();
	return compiler.compile(source);
}

/**
 * Internal compiler class that compiles SynthSource chains into MRT GLSL shaders.
 *
 * This compiler takes a SynthSource chain and produces a GLSL fragment shader
 * that outputs to textmode.js's triple-target MRT rendering:
 *   - Target 0: Character data (indexLow, indexHigh, packedFlags, rotation)
 *   - Target 1: Primary/foreground color (RGBA)
 *   - Target 2: Secondary/cell background color (RGBA)
 *
 * The compilation process is modular, delegating to:
 *   - FeedbackTracker: Manages feedback texture usage
 *   - ExternalLayerManager: Manages cross-layer sampling
 *   - TransformCodeGenerator: Generates GLSL for individual transforms
 *   - ArgumentLowerer: Type-directed uniform/literal lowering
 *   - GLSLGenerator: Assembles the final shader
 */
class SynthCompiler {
	// Delegated managers
	private readonly _argumentLowerer = new ArgumentLowerer();
	private readonly _feedbackTracker = new FeedbackTracker();
	private readonly _externalLayerManager = new ExternalLayerManager();
	private readonly _textmodeSourceManager = new TextmodeSourceManager();
	private readonly _codeGenerator = new TransformCodeGenerator();

	// Compilation state
	private readonly _glslFunctions = new Set<string>();
	private readonly _mainCode: string[] = [];
	private _varCounter = 0;
	private _currentTarget: CompilationTarget = 'main';
	private _usesCharSource = false;

	/**
	 * Compile a SynthSource into a shader.
	 */
	public compile(source: SynthSource): CompiledSynthShader {
		this._reset();

		// Compile the main chain (default color white for visibility)
		const chainResult = this._compileChain(source, 'main', 'vec4(1.0, 1.0, 1.0, 1.0)', 'v_uv', 'main');

		// Compile character source if using char() function
		let charVar: string | undefined = chainResult.charVar;
		if (source.charSource) {
			charVar = this._compileCharSource(source);
		}

		// Compile color source if separate
		let primaryColorVar = chainResult.colorVar;
		if (source.charColorSource) {
			const colorChain = this._compileChain(
				source.charColorSource,
				'charColor',
				'vec4(1.0, 1.0, 1.0, 1.0)',
				'v_uv',
				'charColor'
			);
			primaryColorVar = colorChain.colorVar;
		}

		// Compile cell color source if separate (default to transparent)
		let cellColorVar = 'vec4(0.0, 0.0, 0.0, 0.0)';
		if (source.cellColorSource) {
			const cellChain = this._compileChain(
				source.cellColorSource,
				'cellColor',
				'vec4(0.0, 0.0, 0.0, 0.0)',
				'v_uv',
				'cellColor'
			);
			cellColorVar = cellChain.colorVar;
		}

		// Generate character output
		const charOutputCode = generateCharacterOutputCode(!!charVar, charVar ?? 'vec4(0.0)', chainResult.colorVar);

		// Get feedback usage from tracker
		const feedbackUsage = this._feedbackTracker.getUsage();

		// Build the final shader
		const fragmentSource = generateFragmentShader({
			uniforms: this._argumentLowerer.getUniforms(),
			glslFunctions: this._glslFunctions,
			mainCode: this._mainCode,
			charOutputCode,
			primaryColorVar,
			cellColorVar,
			charMapping: source.charMapping,
			usesFeedback: feedbackUsage.usesCharColorFeedback,
			usesCharFeedback: feedbackUsage.usesCharFeedback,
			usesCellColorFeedback: feedbackUsage.usesCellColorFeedback,
			usesCharSource: this._usesCharSource,
			externalLayers: this._externalLayerManager.getExternalLayers(),
			textmodeSources: this._textmodeSourceManager.getSources(),
		});

		return {
			fragmentSource,
			uniforms: this._argumentLowerer.getUniforms(),
			dynamicUpdaters: this._argumentLowerer.getDynamicUpdaters(),
			charMapping: source.charMapping,
			usesCharColorFeedback: feedbackUsage.usesCharColorFeedback,
			usesCharFeedback: feedbackUsage.usesCharFeedback,
			usesCellColorFeedback: feedbackUsage.usesCellColorFeedback,
			usesCharSource: this._usesCharSource,
			externalLayers: this._externalLayerManager.getExternalLayers(),
			textmodeSources: this._textmodeSourceManager.getSources(),
		};
	}

	/**
	 * Reset all compilation state for a fresh compilation.
	 */
	private _reset(): void {
		this._varCounter = 0;
		this._argumentLowerer.clear();
		this._feedbackTracker.reset();
		this._externalLayerManager.reset();
		this._textmodeSourceManager.reset();
		this._glslFunctions.clear();
		this._mainCode.length = 0;
		this._currentTarget = 'main';
		this._usesCharSource = false;
	}

	/**
	 * Compile the char source and return the character variable name.
	 */
	private _compileCharSource(source: SynthSource): string {
		this._usesCharSource = true;

		const charChain = this._compileChain(source.charSource!, 'charSrc', 'vec4(1.0, 1.0, 1.0, 1.0)', 'v_uv', 'char');

		const charVar = `charFromSource_${this._varCounter++}`;

		// Use uniform for char count - set at render time based on charMap or font
		this._mainCode.push(`\t// Convert charSource color to character index`);
		this._mainCode.push(`\tfloat charLum_${charVar} = clamp(_luminance(${charChain.colorVar}.rgb), 0.0, 1.0);`);
		this._mainCode.push(`\tfloat charCount_${charVar} = max(u_charSourceCount, 1.0);`);
		this._mainCode.push(
			`\tint charIdx_${charVar} = int(min(charLum_${charVar} * charCount_${charVar}, charCount_${charVar} - 1.0));`
		);
		this._mainCode.push(`\tvec4 ${charVar} = _packChar(charIdx_${charVar});`);

		return charVar;
	}

	/**
	 * Compile a transform chain.
	 *
	 * @param source The SynthSource chain to compile
	 * @param prefix Variable name prefix for this chain
	 * @param defaultColor Default color value for the chain (used if no color source)
	 * @param initialCoordExpr Initial coordinate expression (default 'v_uv')
	 * @param target Compilation target for feedback tracking
	 * @returns Variable names for coordinates, color, char, flags, and rotation
	 */
	private _compileChain(
		source: SynthSource,
		prefix: string,
		defaultColor: string,
		initialCoordExpr: string = 'v_uv',
		target: CompilationTarget = 'main'
	): ChainCompilationResult {
		// Save and set the current compilation target
		const previousTarget = this._currentTarget;
		this._currentTarget = target;

		const coordVar = `${prefix}_st`;
		let colorVar = `${prefix}_c`;
		let charVar: string | undefined;
		let flagsVar: string | undefined;
		let rotationVar: string | undefined;

		// Initialize variables
		this._mainCode.push(`\tvec2 ${coordVar} = ${initialCoordExpr};`);
		this._mainCode.push(`\tvec4 ${colorVar} = ${defaultColor};`);

		const transforms = source.transforms;

		// Chain records capture immutable registered transforms at call time,
		// so redefinition or disposal cannot change an existing chain.
		const defs = transforms.map((t) => t.transform);

		// Identify coordinate transforms (applied in reverse order)
		const coordWrapperIndices = this._identifyCoordTransforms(defs);

		// Create transform applicator
		const applyTransformAtIndex = (i: number): void => {
			const record = transforms[i];
			const def = defs[i];
			if (!def) {
				throw new Error(`[textmode.synth.js] Unknown transform in chain: ${record.name}`);
			}

			// Check for external layer reference at this index
			const externalRef = source.externalLayerRefs.get(i);

			// Check for TextmodeSource reference at this index
			const textmodeSourceRef = source.textmodeSourceRefs.get(i);

			// Track feedback/external layer/textmode source usage
			if (record.name === 'src') {
				this._trackSrcUsage(externalRef);
			} else if (record.name === 'srcTexture' && textmodeSourceRef) {
				this._textmodeSourceManager.trackUsage(textmodeSourceRef, this._currentTarget);
			}

			// Add GLSL function (with context-aware src handling)
			const glslFunc = this._codeGenerator.getContextAwareGlslFunction(
				def,
				record.name,
				this._currentTarget,
				externalRef,
				textmodeSourceRef,
				(layerId) => this._externalLayerManager.getPrefix(layerId),
				(sourceId) => this._textmodeSourceManager.getUniformName(sourceId)
			);
			this._glslFunctions.add(glslFunc);

			// Process arguments (type-directed lowering with sampler support)
			const args = this._processArguments(
				source,
				i,
				def,
				record.userArgs,
				`${prefix}_${i}_${record.name}`,
				coordVar,
				target
			);

			// Handle nested sources for combine operations
			const nestedSource = source.nestedSources.get(i);
			let nestedColorVar: string | undefined;
			if (nestedSource && COMBINE_TYPES.has(def.type)) {
				const nestedResult = this._compileChain(
					nestedSource,
					`${prefix}_nested_${i}`,
					defaultColor,
					coordVar,
					target
				);
				nestedColorVar = nestedResult.colorVar;
			}

			// Generate transform code
			const result = this._codeGenerator.generateTransformCode(
				this._mainCode,
				def,
				this._varCounter++,
				coordVar,
				colorVar,
				charVar,
				flagsVar,
				rotationVar,
				args,
				this._currentTarget,
				nestedColorVar,
				externalRef,
				textmodeSourceRef,
				(layerId) => this._externalLayerManager.getPrefix(layerId),
				(sourceId) => this._textmodeSourceManager.getUniformName(sourceId)
			);

			colorVar = result.colorVar;
			if (result.charVar) charVar = result.charVar;
			if (result.flagsVar) flagsVar = result.flagsVar;
			if (result.rotationVar) rotationVar = result.rotationVar;
		};

		// 1) Apply seed transforms first (so _seed is set before noise/voronoi run)
		for (let i = 0; i < transforms.length; i++) {
			const def = defs[i];
			if (def && transforms[i].name === 'seed') {
				applyTransformAtIndex(i);
			}
		}

		// 2) Apply coordinate wrappers in reverse call order
		for (let w = coordWrapperIndices.length - 1; w >= 0; w--) {
			applyTransformAtIndex(coordWrapperIndices[w]);
		}

		// 3) Apply all remaining transforms in forward call order
		for (let i = 0; i < transforms.length; i++) {
			const def = defs[i];
			// Skip coordinate transforms and seed (already applied)
			if (def && COORD_TYPES.has(def.type)) continue;
			if (transforms[i].name === 'seed') continue;
			applyTransformAtIndex(i);
		}

		// Restore previous target after chain compilation
		this._currentTarget = previousTarget;

		return { coordVar, colorVar, charVar, flagsVar, rotationVar };
	}

	/**
	 * Identify coordinate transform indices for reverse-order application.
	 */
	private _identifyCoordTransforms(defs: Array<RegisteredTransform | undefined>): number[] {
		const coordWrapperIndices: number[] = [];
		for (let i = 0; i < defs.length; i++) {
			const def = defs[i];
			if (!def) continue;
			if (COORD_TYPES.has(def.type)) {
				coordWrapperIndices.push(i);
			}
		}
		return coordWrapperIndices;
	}

	/**
	 * Track src() usage for feedback or external layer.
	 */
	private _trackSrcUsage(externalRef?: ExternalLayerReference): void {
		if (externalRef) {
			// External layer reference
			this._externalLayerManager.trackUsage(externalRef, this._currentTarget);
		} else {
			// Self-feedback
			this._feedbackTracker.trackUsage(this._currentTarget);
		}
	}

	/**
	 * Process user arguments and create uniforms for dynamic values.
	 * Scalar and vector inputs are lowered by {@link ArgumentLowerer};
	 * sampler2D inputs resolve the reference attached at chain construction
	 * and register it with the TextmodeSource manager for render-time binding.
	 */
	private _processArguments(
		source: SynthSource,
		index: number,
		def: RegisteredTransform,
		userArgs: readonly unknown[],
		prefix: string,
		coordVar: string,
		target: CompilationTarget
	): string[] {
		const result: string[] = [];

		for (let j = 0; j < def.inputs.length; j++) {
			const input = def.inputs[j];
			const arg = userArgs[j] ?? input.default;

			if (input.type === 'sampler2D') {
				result.push(this._lowerSamplerInput(source, index, input));
				continue;
			}

			// A SynthSource passed to a vec4 input compiles recursively at the
			// current coordinate/target, matching Hydra's nested source support.
			if (input.type === 'vec4' && arg instanceof SynthSource) {
				result.push(this._compileNestedVec4(arg, coordVar, target));
				continue;
			}

			result.push(this._argumentLowerer.process(input, arg, prefix).glslValue);
		}

		return result;
	}

	/**
	 * Compile a nested source for a vec4 input and return its color variable.
	 */
	private _compileNestedVec4(nested: SynthSource, coordVar: string, target: CompilationTarget): string {
		const nestedResult = this._compileChain(
			nested,
			`${coordVar.replace(/\W/g, '')}_nested_${this._varCounter++}`,
			'vec4(0.0)',
			coordVar,
			target
		);
		return nestedResult.colorVar;
	}

	/**
	 * Lower a sampler2D input to its TextmodeSource uniform name.
	 */
	private _lowerSamplerInput(source: SynthSource, index: number, input: NormalizedTransformInput): string {
		const ref = source.textmodeSourceRefs.get(index);
		if (!ref) {
			throw new Error(
				`[textmode.synth.js] sampler2D input "${input.publicName}" requires a TextmodeSource value. ` +
					'Pass an image/video loaded through t.loadImage()/t.loadVideo().'
			);
		}
		this._textmodeSourceManager.trackUsage(ref, this._currentTarget);
		return this._textmodeSourceManager.getUniformName(ref.sourceId);
	}
}
