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
import type { CompiledSynthShader, ChainCompilationResult } from './types';
import { UniformManager } from './UniformManager';
import { generateFragmentShader, generateCharacterOutputCode } from './GLSLGenerator';
import { TransformRegistry } from '../transforms/TransformRegistry';
import type { ProcessedTransform } from '../transforms/TransformDefinition';

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

	/**
	 * Compile a SynthSource into a shader.
	 */
	public compile(source: SynthSource): CompiledSynthShader {
		// Reset state
		this._varCounter = 0;
		this._uniformManager.clear();
		this._glslFunctions.clear();
		this._mainCode.length = 0;

		// Compile the main chain (default color white for visibility)
		const chainResult = this._compileChain(
			source,
			'main',
			'vec4(1.0, 1.0, 1.0, 1.0)'
		);

		// Compile color source if separate
		let primaryColorVar = chainResult.colorVar;
		if (source.colorSource) {
			const colorChain = this._compileChain(
				source.colorSource,
				'charColor',
				'vec4(1.0, 1.0, 1.0, 1.0)'
			);
			primaryColorVar = colorChain.colorVar;
		}

		// Compile cell color source if separate (default to transparent)
		let cellColorVar = 'vec4(0.0, 0.0, 0.0, 0.0)';
		if (source.cellColorSource) {
			const cellChain = this._compileChain(
				source.cellColorSource,
				'cellColor',
				'vec4(0.0, 0.0, 0.0, 0.0)'
			);
			cellColorVar = cellChain.colorVar;
		}

		// Generate character output
		const charOutputCode = generateCharacterOutputCode(
			!!chainResult.charVar,
			chainResult.charVar ?? 'vec4(0.0)',
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
		});

		return {
			fragmentSource,
			uniforms: this._uniformManager.getUniforms(),
			dynamicUpdaters: this._uniformManager.getDynamicUpdaters(),
			charMapping: source.charMapping,
		};
	}

	/**
	 * Compile a transform chain.
	 */
	private _compileChain(
		source: SynthSource,
		prefix: string,
		defaultColor: string,
		initialCoordExpr: string = 'v_uv'
	): ChainCompilationResult {
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
		// They must be applied to coordinates BEFORE evaluating sources/char generators,
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

			this._glslFunctions.add(def.glslFunction);

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
				const nestedResult = this._compileChain(
					nestedSource,
					`${prefix}_nested_${i}`,
					defaultColor,
					coordVar  // Always use current coords, not v_uv
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
				nestedColorVar
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

		return { coordVar, colorVar, charVar, flagsVar, rotationVar };
	}

	/**
	 * Get a processed transform definition.
	 */
	private _getProcessedTransform(name: string): ProcessedTransform | undefined {
		return TransformRegistry.getProcessed(name);
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
		nestedColorVar?: string
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

		let newColorVar = colorVar;
		let newCharVar = charVar;
		let newFlagsVar = flagsVar;
		let newRotationVar = rotationVar;

		switch (def.type) {
			case 'src': {
				const newColor = `c${varId}`;
				this._mainCode.push(`\tvec4 ${newColor} = ${def.name}(${buildArgs(coordVar)});`);
				newColorVar = newColor;
				break;
			}

			case 'coord': {
				const newCoord = `st${varId}`;
				this._mainCode.push(`\tvec2 ${newCoord} = ${def.name}(${buildArgs(coordVar)});`);
				this._mainCode.push(`\t${coordVar} = ${newCoord};`);
				break;
			}

			case 'color': {
				const newColor = `c${varId}`;
				this._mainCode.push(`\tvec4 ${newColor} = ${def.name}(${buildArgs(colorVar)});`);
				newColorVar = newColor;
				break;
			}

			case 'combine': {
				const newColor = `c${varId}`;
				this._mainCode.push(`\tvec4 ${newColor} = ${def.name}(${buildArgs(colorVar, nestedColorVar ?? 'vec4(0.0)')});`);
				newColorVar = newColor;
				break;
			}

			case 'combineCoord': {
				const newCoord = `st${varId}`;
				this._mainCode.push(`\tvec2 ${newCoord} = ${def.name}(${buildArgs(coordVar, nestedColorVar ?? 'vec4(0.0)')});`);
				this._mainCode.push(`\t${coordVar} = ${newCoord};`);
				break;
			}

			case 'char': {
				if (!newCharVar) {
					newCharVar = `char${varId}`;
					newFlagsVar = `flags${varId}`;
					newRotationVar = `rot${varId}`;
					this._mainCode.push(`\tvec4 ${newCharVar} = vec4(0.0);`);
					this._mainCode.push(`\tfloat ${newFlagsVar} = 0.0;`);
					this._mainCode.push(`\tfloat ${newRotationVar} = 0.0;`);
				}
				this._mainCode.push(`\t${newCharVar} = ${def.name}(${buildArgs(coordVar)});`);
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
				this._mainCode.push(`\t${newCharVar} = ${def.name}(${buildArgs(newCharVar)});`);
				break;
			}

			case 'charColor': {
				const newColor = `c${varId}`;
				this._mainCode.push(`\tvec4 ${newColor} = ${def.name}(${buildArgs(coordVar, newCharVar ?? 'vec4(0.0)')});`);
				newColorVar = newColor;
				break;
			}

			case 'cellColor': {
				const newColor = `c${varId}`;
				this._mainCode.push(`\tvec4 ${newColor} = ${def.name}(${buildArgs(coordVar, newCharVar ?? 'vec4(0.0)', colorVar)});`);
				newColorVar = newColor;
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
export { SYNTH_VERTEX_SHADER } from './GLSLGenerator';
export type { CompiledSynthShader } from './types';
