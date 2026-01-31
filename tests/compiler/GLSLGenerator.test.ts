import { describe, it, expect } from 'vitest';
import {
	generateFragmentShader,
	generateCharacterOutputCode,
	type ShaderGenerationOptions,
} from '../../src/compiler/GLSLGenerator';
import type { SynthUniform } from '../../src/core/types';
import { CHANNEL_SAMPLERS } from '../../src/core/constants';

describe('GLSLGenerator', () => {
	describe('generateCharacterOutputCode', () => {
		it('generates code using provided char variable when hasCharVar is true', () => {
			const code = generateCharacterOutputCode(true, 'myCharVar', 'myColorVar');
			expect(code).toContain('vec4 charOutput = myCharVar;');
			expect(code).not.toContain('_luminance');
		});

		it('generates code deriving char from luminance when hasCharVar is false', () => {
			const code = generateCharacterOutputCode(false, 'myCharVar', 'myColorVar');
			expect(code).toContain('float lum = _luminance(myColorVar.rgb);');
			expect(code).toContain('vec4 charOutput = _packChar(charIdx);');
		});
	});

	describe('generateFragmentShader', () => {
		const baseOptions: ShaderGenerationOptions = {
			uniforms: new Map(),
			glslFunctions: new Set(),
			mainCode: ['// main code here'],
			charOutputCode: '// char output here',
			primaryColorVar: 'v_primary',
			cellColorVar: 'v_cell',
		};

		it('generates a minimal shader with required components', () => {
			const shader = generateFragmentShader(baseOptions);

			expect(shader).toContain('#version 300 es');
			expect(shader).toContain('precision highp float;');
			expect(shader).toContain('in vec2 v_uv;');
			expect(shader).toContain('layout(location = 0) out vec4 o_character;');
			expect(shader).toContain('void main() {');
			expect(shader).toContain('// main code here');
			expect(shader).toContain('o_primaryColor = v_primary;');
			expect(shader).toContain('o_secondaryColor = v_cell;');
		});

		it('includes custom uniforms', () => {
			const uniforms = new Map<string, SynthUniform>();
			uniforms.set('u_custom', {
				name: 'u_custom',
				type: 'float',
				value: 1.0,
				isDynamic: false
			});

			const options = { ...baseOptions, uniforms };
			const shader = generateFragmentShader(options);

			expect(shader).toContain('uniform float u_custom;');
		});

		it('includes character mapping code when charMapping is provided', () => {
			const options: ShaderGenerationOptions = {
				...baseOptions,
				charMapping: {
					chars: 'ABC',
					indices: [65, 66, 67]
				}
			};

			const shader = generateFragmentShader(options);

			expect(shader).toContain('uniform int u_charMap[3];');
			expect(shader).toContain('uniform int u_charMapSize;');
			expect(shader).toContain('int mappedCharIdx = u_charMap[');
		});

		it('includes feedback samplers when flags are set', () => {
			const options: ShaderGenerationOptions = {
				...baseOptions,
				usesFeedback: true,
				usesCharFeedback: true,
				usesCellColorFeedback: true
			};

			const shader = generateFragmentShader(options);

			expect(shader).toContain(`uniform sampler2D ${CHANNEL_SAMPLERS.charColor};`);
			expect(shader).toContain(`uniform sampler2D ${CHANNEL_SAMPLERS.char};`);
			expect(shader).toContain(`uniform sampler2D ${CHANNEL_SAMPLERS.cellColor};`);
		});

		it('includes external layer samplers', () => {
			const externalLayers = new Map();
			externalLayers.set('layer1', {
				layerId: 'layer1',
				uniformPrefix: 'u_layer1',
				usesChar: true,
				usesCharColor: true,
				usesCellColor: false
			});

			const options: ShaderGenerationOptions = {
				...baseOptions,
				externalLayers
			};

			const shader = generateFragmentShader(options);

			expect(shader).toContain('uniform sampler2D u_layer1_char;');
			expect(shader).toContain('uniform sampler2D u_layer1_charColor;');
			expect(shader).not.toContain('uniform sampler2D u_layer1_cellColor;');
		});

		it('includes u_charSourceCount when usesCharSource is true', () => {
			const options: ShaderGenerationOptions = {
				...baseOptions,
				usesCharSource: true
			};

			const shader = generateFragmentShader(options);

			expect(shader).toContain('uniform float u_charSourceCount;');
		});
	});
});
