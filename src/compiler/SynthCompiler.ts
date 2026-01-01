/**
 * SynthCompiler - Compiles SynthSource chains into MRT GLSL shaders.
 *
 * This compiler takes a SynthSource chain and produces a GLSL fragment shader
 * that outputs to textmode.js's triple-target MRT rendering:
 *   - Target 0: Character data (indexLow, indexHigh, packedFlags, rotation)
 *   - Target 1: Primary/foreground color (RGBA)
 *   - Target 2: Secondary/cell background color (RGBA)
 */

import type { SynthSource } from '../core/SynthSource';
import type { CompiledSynthShader, ChainCompilationResult, CompilationTarget, ExternalLayerInfo } from './types';
import { UniformManager } from './UniformManager';
import { generateFragmentShader, generateCharacterOutputCode } from './GLSLGenerator';
import { transformRegistry } from '../transforms/TransformRegistry';
import type { ProcessedTransform } from '../transforms/TransformDefinition';
import type { ExternalLayerReference } from '../core/types';

/**
 * Compile a SynthSource chain into a complete MRT GLSL shader.
 *
 * @param source The SynthSource chain to compile
 * @returns A compiled shader with fragment source and uniform definitions
 */
export function compileSynthSource(source: SynthSource): CompiledSynthShader {
	const compiler = new SynthCompilerContext();
	return compiler.compile(source);
}

/**
 * Internal compiler context that maintains state during compilation.
 */
class SynthCompilerContext {
	private _varCounter = 0;
	private readonly _uniformManager = new UniformManager();
	private readonly _glslFunctions = new Set<string>();
	private readonly _mainCode: string[] = [];
	private _usesFeedback = false;
	private _usesCharFeedback = false;
	private _usesCellColorFeedback = false;
	/** Current compilation target - determines which texture src() samples */
	private _currentTarget: CompilationTarget = 'main';
	/** External layer references collected during compilation */
	private readonly _externalLayers = new Map<string, ExternalLayerInfo>();
	/** Counter for generating unique external layer uniform prefixes */
	private _externalLayerCounter = 0;
	/** Map from layerId to uniform prefix for consistent naming */
	private readonly _layerIdToPrefix = new Map<string, string>();

	/**
	 * Compile a SynthSource into a shader.
	 */
	public compile(source: SynthSource): CompiledSynthShader {
		// Reset state
		this._varCounter = 0;
		this._uniformManager.clear();
		this._glslFunctions.clear();
		this._mainCode.length = 0;
		this._usesFeedback = false;
		this._usesCharFeedback = false;
		this._usesCellColorFeedback = false;
		this._externalLayers.clear();
		this._externalLayerCounter = 0;
		this._layerIdToPrefix.clear();

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
		let charSourceCharCount: number | undefined;
		if (source.charSource) {
			const charChain = this._compileChain(
				source.charSource,
				'charSrc',
				'vec4(1.0, 1.0, 1.0, 1.0)',
				'v_uv',
				'char'
			);
			// The charSource produces a color - we'll convert it to char indices
			// Store the color var and charCount for the character output code
			charVar = `charFromSource_${this._varCounter++}`;
			charSourceCharCount = source.charCount ?? 256;
			
			// Generate code to convert color luminance to character index
			this._mainCode.push(`\t// Convert charSource color to character index`);
			this._mainCode.push(`\tfloat charLum_${charVar} = _luminance(${charChain.colorVar}.rgb);`);
			this._mainCode.push(`\tint charIdx_${charVar} = int(charLum_${charVar} * ${charSourceCharCount.toFixed(1)});`);
			this._mainCode.push(`\tvec4 ${charVar} = vec4(float(charIdx_${charVar} % 256) / 255.0, float(charIdx_${charVar} / 256) / 255.0, 0.0, 0.0);`);
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

		// Build the final shader
		const fragmentSource = generateFragmentShader({
			uniforms: this._uniformManager.getUniforms(),
			glslFunctions: this._glslFunctions,
			mainCode: this._mainCode,
			charOutputCode,
			primaryColorVar,
			cellColorVar,
			charMapping: source.charMapping,
			usesFeedback: this._usesFeedback,
			usesCharFeedback: this._usesCharFeedback,
			usesCellColorFeedback: this._usesCellColorFeedback,
			externalLayers: this._externalLayers,
		});

		return {
			fragmentSource,
			uniforms: this._uniformManager.getUniforms(),
			dynamicUpdaters: this._uniformManager.getDynamicUpdaters(),
			charMapping: source.charMapping,
			usesFeedback: this._usesFeedback,
			usesCharFeedback: this._usesCharFeedback,
			usesCellColorFeedback: this._usesCellColorFeedback,
			externalLayers: new Map(this._externalLayers),
		};
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
		const defs: Array<ProcessedTransform | undefined> = transforms.map((t) =>
			this._getProcessedTransform(t.name)
		);

		// Coord-like transforms are wrappers in hydra-style chaining.
		// They must be applied to coordinates before evaluating sources/char generators,
		// and in reverse call order (last called coord transform applies first to the input).
		const coordWrapperIndices: number[] = [];
		for (let i = 0; i < defs.length; i++) {
			const def = defs[i];
			if (!def) continue;
			if (def.type === 'coord' || def.type === 'combineCoord') {
				coordWrapperIndices.push(i);
			}
		}

		const applyTransformAtIndex = (i: number): void => {
			const record = transforms[i];
			const def = defs[i];
			if (!def) {
				console.warn(`[SynthCompiler] Unknown transform: ${record.name}`);
				return;
			}

			// Check for external layer reference at this index
			const externalRef = source.externalLayerRefs.get(i);

			// Track which feedback sources are used (context-aware for src)
			if (record.name === 'src') {
				if (externalRef) {
					// External layer reference - track which textures are needed
					this._trackExternalLayerUsage(externalRef, this._currentTarget);
				} else {
					// Self-feedback - src() samples different textures based on compilation context
					switch (this._currentTarget) {
						case 'char':
							this._usesCharFeedback = true;
							break;
						case 'cellColor':
							this._usesCellColorFeedback = true;
							break;
						case 'charColor':
						case 'main':
						default:
							this._usesFeedback = true;
							break;
					}
				}
			}

			// Add GLSL function (with context-aware src handling)
			const glslFunc = this._getContextAwareGlslFunction(def, record.name, externalRef);
			this._glslFunctions.add(glslFunc);

			const args = this._processArguments(
				record.userArgs,
				def.inputs,
				`${prefix}_${i}_${record.name}`
			);

			const nestedSource = source.nestedSources.get(i);
			let nestedColorVar: string | undefined;
			if (nestedSource && (def.type === 'combine' || def.type === 'combineCoord')) {
				// Both 'combine' and 'combineCoord' operations sample the nested source
				// at the CURRENT transformed coordinates. In hydra, coord transforms
				// before the combine affect both the main source and the nested source.
				// The nested source then applies its own coord transforms on top of that.
				// Nested chains inherit the parent's compilation target for context-aware src()
				const nestedResult = this._compileChain(
					nestedSource,
					`${prefix}_nested_${i}`,
					defaultColor,
					coordVar,  // Always use current coords, not v_uv
					target     // Inherit parent's compilation target
				);
				nestedColorVar = nestedResult.colorVar;
			}

			const varId = this._varCounter++;
			const result = this._generateTransformCode(
				def,
				varId,
				coordVar,
				colorVar,
				charVar,
				flagsVar,
				rotationVar,
				args,
				nestedColorVar,
				externalRef
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
	 * Get a processed transform definition.
	 */
	private _getProcessedTransform(name: string): ProcessedTransform | undefined {
		return transformRegistry.getProcessed(name);
	}

	/**
	 * Get the GLSL function for a transform, with context-aware handling for src().
	 * 
	 * When the transform is 'src', this generates a context-specific GLSL function
	 * that samples the appropriate texture based on the current compilation target:
	 * - char context → samples prevCharBuffer
	 * - charColor/main context → samples prevBuffer (primary color)
	 * - cellColor context → samples prevCellColorBuffer
	 * 
	 * For external layer references, generates a function that samples from
	 * the external layer's texture uniforms.
	 */
	private _getContextAwareGlslFunction(
		def: ProcessedTransform, 
		name: string,
		externalRef?: ExternalLayerReference
	): string {
		if (name !== 'src') {
			return def.glslFunction;
		}

		if (externalRef) {
			// External layer reference - generate sampler for external layer
			const prefix = this._getExternalLayerPrefix(externalRef.layerId);
			const samplerMap: Record<CompilationTarget, string> = {
				'char': `${prefix}_char`,
				'charColor': `${prefix}_primary`,
				'cellColor': `${prefix}_cell`,
				'main': `${prefix}_primary`
			};

			const sampler = samplerMap[this._currentTarget];
			const funcName = `src_ext_${prefix}_${this._currentTarget}`;

			return `
vec4 ${funcName}(vec2 _st) {
	return texture(${sampler}, fract(_st));
}
`;
		}

		// Self-feedback - generate context-specific src function
		const samplerMap: Record<CompilationTarget, string> = {
			'char': 'prevCharBuffer',
			'charColor': 'prevBuffer',
			'cellColor': 'prevCellColorBuffer',
			'main': 'prevBuffer'
		};

		const sampler = samplerMap[this._currentTarget];
		const funcName = `src_${this._currentTarget}`;

		return `
vec4 ${funcName}(vec2 _st) {
	return texture(${sampler}, fract(_st));
}
`;
	}

	/**
	 * Get or create a uniform prefix for an external layer.
	 */
	private _getExternalLayerPrefix(layerId: string): string {
		let prefix = this._layerIdToPrefix.get(layerId);
		if (!prefix) {
			prefix = `extLayer${this._externalLayerCounter++}`;
			this._layerIdToPrefix.set(layerId, prefix);
		}
		return prefix;
	}

	/**
	 * Track usage of an external layer's textures.
	 */
	private _trackExternalLayerUsage(ref: ExternalLayerReference, target: CompilationTarget): void {
		const prefix = this._getExternalLayerPrefix(ref.layerId);
		
		let info = this._externalLayers.get(ref.layerId);
		if (!info) {
			info = {
				layerId: ref.layerId,
				uniformPrefix: prefix,
				usesChar: false,
				usesPrimary: false,
				usesCellColor: false,
			};
			this._externalLayers.set(ref.layerId, info);
		}

		// Mark which texture is used based on compilation context
		switch (target) {
			case 'char':
				info.usesChar = true;
				break;
			case 'cellColor':
				info.usesCellColor = true;
				break;
			case 'charColor':
			case 'main':
			default:
				info.usesPrimary = true;
				break;
		}
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

	/**
	 * Generate GLSL code for a transform.
	 */
	private _generateTransformCode(
		def: ProcessedTransform,
		varId: number,
		coordVar: string,
		colorVar: string,
		charVar: string | undefined,
		flagsVar: string | undefined,
		rotationVar: string | undefined,
		args: string[],
		nestedColorVar?: string,
		externalRef?: ExternalLayerReference
	): {
		colorVar: string;
		charVar?: string;
		flagsVar?: string;
		rotationVar?: string;
	} {
		// Helper to build function call arguments
		const buildArgs = (...baseArgs: string[]) => {
			const allArgs = [...baseArgs, ...args];
			return allArgs.join(', ');
		};

		// Get the function name to call (context-aware for src, with external layer support)
		let funcName = def.name;
		if (def.name === 'src') {
			if (externalRef) {
				const prefix = this._getExternalLayerPrefix(externalRef.layerId);
				funcName = `src_ext_${prefix}_${this._currentTarget}`;
			} else {
				funcName = `src_${this._currentTarget}`;
			}
		}

		let newColorVar = colorVar;
		let newCharVar = charVar;
		let newFlagsVar = flagsVar;
		let newRotationVar = rotationVar;

		switch (def.type) {
			case 'src': {
				const newColor = `c${varId}`;
				this._mainCode.push(`\tvec4 ${newColor} = ${funcName}(${buildArgs(coordVar)});`);
				newColorVar = newColor;
				break;
			}

			case 'coord': {
				const newCoord = `st${varId}`;
				this._mainCode.push(`\tvec2 ${newCoord} = ${funcName}(${buildArgs(coordVar)});`);
				this._mainCode.push(`\t${coordVar} = ${newCoord};`);
				break;
			}

			case 'color': {
				const newColor = `c${varId}`;
				this._mainCode.push(`\tvec4 ${newColor} = ${funcName}(${buildArgs(colorVar)});`);
				newColorVar = newColor;
				break;
			}

			case 'combine': {
				const newColor = `c${varId}`;
				this._mainCode.push(`\tvec4 ${newColor} = ${funcName}(${buildArgs(colorVar, nestedColorVar ?? 'vec4(0.0)')});`);
				newColorVar = newColor;
				break;
			}

			case 'combineCoord': {
				const newCoord = `st${varId}`;
				this._mainCode.push(`\tvec2 ${newCoord} = ${funcName}(${buildArgs(coordVar, nestedColorVar ?? 'vec4(0.0)')});`);
				this._mainCode.push(`\t${coordVar} = ${newCoord};`);
				break;
			}

			case 'charModify': {
				if (!newCharVar) {
					newCharVar = `char${varId}`;
					newFlagsVar = `flags${varId}`;
					newRotationVar = `rot${varId}`;
					this._mainCode.push(`\tvec4 ${newCharVar} = vec4(0.0);`);
					this._mainCode.push(`\tfloat ${newFlagsVar} = 0.0;`);
					this._mainCode.push(`\tfloat ${newRotationVar} = 0.0;`);
				}
				this._mainCode.push(`\t${newCharVar} = ${funcName}(${buildArgs(newCharVar)});`);
				break;
			}
		}

		return {
			colorVar: newColorVar,
			charVar: newCharVar,
			flagsVar: newFlagsVar,
			rotationVar: newRotationVar,
		};
	}
}

// Re-export for convenience
export type { CompiledSynthShader } from './types';
