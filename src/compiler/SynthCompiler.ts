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
 *   - UniformManager: Manages shader uniforms
 *   - GLSLGenerator: Assembles the final shader
 */

import type { SynthSource } from '../core/SynthSource';
import type { CompiledSynthShader, ChainCompilationResult, CompilationTarget } from './types';
import { FeedbackTracker } from './FeedbackTracker';
import { ExternalLayerManager } from './ExternalLayerManager';
import { TransformCodeGenerator } from './TransformCodeGenerator';
import { UniformManager } from './UniformManager';
import { generateFragmentShader, generateCharacterOutputCode } from './GLSLGenerator';
import { transformRegistry } from '../transforms/TransformRegistry';
import type { ProcessedTransform } from '../transforms/TransformDefinition';

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
 *   - UniformManager: Manages shader uniforms
 *   - GLSLGenerator: Assembles the final shader
 */
class SynthCompiler {
	// Delegated managers
	private readonly _uniformManager = new UniformManager();
	private readonly _feedbackTracker = new FeedbackTracker();
	private readonly _externalLayerManager = new ExternalLayerManager();
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
		const chainResult = this._compileChain(
			source,
			'main',
			'vec4(1.0, 1.0, 1.0, 1.0)',
			'v_uv',
			'main'
		);

		// Compile character source if using char() function
		let charVar: string | undefined = chainResult.charVar;
		if (source.charSource) {
			charVar = this._compileCharSource(source);
		}

		// Compile color source if separate
		let primaryColorVar = chainResult.colorVar;
		if (source.colorSource) {
			const colorChain = this._compileChain(
				source.colorSource,
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
		const charOutputCode = generateCharacterOutputCode(
			!!charVar,
			charVar ?? 'vec4(0.0)',
			chainResult.colorVar
		);

		// Get feedback usage from tracker
		const feedbackUsage = this._feedbackTracker.getUsage();

		// Build the final shader
		const fragmentSource = generateFragmentShader({
			uniforms: this._uniformManager.getUniforms(),
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
		});

		return {
			fragmentSource,
			uniforms: this._uniformManager.getUniforms(),
			dynamicUpdaters: this._uniformManager.getDynamicUpdaters(),
			charMapping: source.charMapping,
			usesCharColorFeedback: feedbackUsage.usesCharColorFeedback,
			usesCharFeedback: feedbackUsage.usesCharFeedback,
			usesCellColorFeedback: feedbackUsage.usesCellColorFeedback,
			usesCharSource: this._usesCharSource,
			externalLayers: this._externalLayerManager.getExternalLayers(),
		};
	}

	/**
	 * Reset all compilation state for a fresh compilation.
	 */
	private _reset(): void {
		this._varCounter = 0;
		this._uniformManager.clear();
		this._feedbackTracker.reset();
		this._externalLayerManager.reset();
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

		const charChain = this._compileChain(
			source.charSource!,
			'charSrc',
			'vec4(1.0, 1.0, 1.0, 1.0)',
			'v_uv',
			'char'
		);

		const charVar = `charFromSource_${this._varCounter++}`;

		// Use uniform for char count - set at render time based on charMap or font
		this._mainCode.push(`\t// Convert charSource color to character index`);
		this._mainCode.push(`\tfloat charLum_${charVar} = _luminance(${charChain.colorVar}.rgb);`);
		this._mainCode.push(
			`\tint charIdx_${charVar} = int(charLum_${charVar} * u_charSourceCount);`
		);
		this._mainCode.push(`\tvec4 ${charVar} = _packChar(charIdx_${charVar});`);

		return charVar;
	}

	/**
	 * Compile a transform chain.
	 * @param target - The compilation target context (determines src() behavior)
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

		// Resolve all transform defs once
		const defs = transforms.map((t) => this._getProcessedTransform(t.name));

		// Identify coordinate transforms (applied in reverse order)
		const coordWrapperIndices = this._identifyCoordTransforms(defs);

		// Create transform applicator
		const applyTransformAtIndex = (i: number): void => {
			const record = transforms[i];
			const def = defs[i];
			if (!def) {
				console.warn(`[SynthCompiler] Unknown transform: ${record.name}`);
				return;
			}

			// Check for external layer reference at this index
			const externalRef = source.externalLayerRefs.get(i);

			// Track feedback/external layer usage
			if (record.name === 'src') {
				this._trackSrcUsage(externalRef);
			}

			// Add GLSL function (with context-aware src handling)
			const glslFunc = this._codeGenerator.getContextAwareGlslFunction(
				def,
				record.name,
				this._currentTarget,
				externalRef,
				(layerId) => this._externalLayerManager.getPrefix(layerId)
			);
			this._glslFunctions.add(glslFunc);

			// Process arguments
			const args = this._processArguments(
				record.userArgs,
				def.inputs,
				`${prefix}_${i}_${record.name}`
			);

			// Handle nested sources for combine operations
			const nestedSource = source.nestedSources.get(i);
			let nestedColorVar: string | undefined;
			if (nestedSource && (def.type === 'combine' || def.type === 'combineCoord')) {
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
				(layerId) => this._externalLayerManager.getPrefix(layerId)
			);

			colorVar = result.colorVar;
			if (result.charVar) charVar = result.charVar;
			if (result.flagsVar) flagsVar = result.flagsVar;
			if (result.rotationVar) rotationVar = result.rotationVar;
		};

		// 1) Apply coordinate wrappers in reverse call order
		for (let w = coordWrapperIndices.length - 1; w >= 0; w--) {
			applyTransformAtIndex(coordWrapperIndices[w]);
		}

		// 2) Apply all remaining transforms in forward call order
		for (let i = 0; i < transforms.length; i++) {
			const def = defs[i];
			if (def && (def.type === 'coord' || def.type === 'combineCoord')) continue;
			applyTransformAtIndex(i);
		}

		// Restore previous target after chain compilation
		this._currentTarget = previousTarget;

		return { coordVar, colorVar, charVar, flagsVar, rotationVar };
	}

	/**
	 * Identify coordinate transform indices for reverse-order application.
	 */
	private _identifyCoordTransforms(defs: Array<ProcessedTransform | undefined>): number[] {
		const coordWrapperIndices: number[] = [];
		for (let i = 0; i < defs.length; i++) {
			const def = defs[i];
			if (!def) continue;
			if (def.type === 'coord' || def.type === 'combineCoord') {
				coordWrapperIndices.push(i);
			}
		}
		return coordWrapperIndices;
	}

	/**
	 * Track src() usage for feedback or external layer.
	 */
	private _trackSrcUsage(externalRef?: { layerId: string; layer: unknown }): void {
		if (externalRef) {
			// External layer reference
			this._externalLayerManager.trackUsage(externalRef, this._currentTarget);
		} else {
			// Self-feedback
			this._feedbackTracker.trackUsage(this._currentTarget);
		}
	}

	/**
	 * Get a processed transform definition.
	 */
	private _getProcessedTransform(name: string): ProcessedTransform | undefined {
		return transformRegistry.getProcessed(name);
	}

	/**
	 * Process user arguments and create uniforms for dynamic values.
	 */
	private _processArguments(
		userArgs: readonly unknown[],
		inputs: readonly { name: string; type: string; default: number | number[] | null }[],
		prefix: string
	): string[] {
		const result: string[] = [];

		for (let i = 0; i < inputs.length; i++) {
			const input = inputs[i];
			const arg = userArgs[i] ?? input.default;

			const processed = this._uniformManager.processArgument(
				arg as never,
				input as never,
				prefix
			);
			result.push(processed.glslValue);
		}

		return result;
	}
}
