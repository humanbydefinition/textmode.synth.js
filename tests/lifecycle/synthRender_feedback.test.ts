
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { synthRender } from '../../src/lifecycle/synthRender';
import { shaderManager } from '../../src/lifecycle/ShaderManager';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { Textmodifier, TextmodeFramebuffer } from 'textmode.js';
import type { LayerSynthState } from '../../src/core/types';
import { SynthSource } from '../../src/core/SynthSource';

const createMockFramebuffer = (): TextmodeFramebuffer =>
	({
		dispose: vi.fn(),
		textures: ['texA', 'texB', 'texC'],
		begin: vi.fn(),
		end: vi.fn(),
	}) as unknown as TextmodeFramebuffer;

const createMockTextmodifier = () =>
	({
		createFramebuffer: vi.fn(() => createMockFramebuffer()),
		createFilterShader: vi.fn(() => Promise.resolve({ dispose: vi.fn(), id: 'shader_default' })),
		setUniform: vi.fn(),
		clear: vi.fn(),
		shader: vi.fn(),
		rect: vi.fn(),
		resetShader: vi.fn(),
		secs: 10,
		frameCount: 100,
	}) as unknown as Textmodifier;

const createMockLayer = (cols = 10, rows = 10): TextmodeLayer =>
	({
		grid: { cols, rows, width: cols * 10, height: rows * 10 },
		drawFramebuffer: {
			begin: vi.fn(),
			end: vi.fn(),
			textures: [],
		},
		getPluginState: vi.fn(),
		setPluginState: vi.fn(),
		font: { characters: [] },
	}) as unknown as TextmodeLayer;

describe('synthRender Feedback Optimization', () => {
	let layer: TextmodeLayer;
	let textmodifier: Textmodifier;
	let state: Partial<LayerSynthState>;

	beforeEach(() => {
		// Reset the copy shader manager before each test
		shaderManager.dispose();
		shaderManager.reset();

		textmodifier = createMockTextmodifier();
		layer = createMockLayer();
		state = {
			source: new SynthSource(),
			needsCompile: true,
			dynamicValues: new Map(),
			characterResolver: {
				resolve: () => [],
				invalidate: () => { },
			} as any,
			pingPongIndex: 0,
		};
		vi.mocked(layer.getPluginState).mockReturnValue(state);
	});

	afterEach(() => {
		shaderManager.dispose();
	});

	it('should use global copy shader for the second pass when initialized', async () => {
		// Arrange
		const mainShader = { id: 'main_shader', dispose: vi.fn() };
		const copyShader = { id: 'copy_shader', dispose: vi.fn() };

		state.compiled = {
			fragmentSource: 'void main() {}',
			uniforms: new Map(),
			dynamicUpdaters: new Map(),
			usesCharColorFeedback: true,
		} as any;
		state.shader = mainShader as any;
		state.needsCompile = false;
		state.pingPongBuffers = [createMockFramebuffer(), createMockFramebuffer()];
		state.pingPongDimensions = { cols: 10, rows: 10 };

		// Initialize copy shader manager
		vi.mocked(textmodifier.createFilterShader).mockResolvedValueOnce(copyShader as any);
		await shaderManager.initialize(textmodifier);

		// Act: Render
		await synthRender(layer, textmodifier);

		// Assert: Copy shader is used for the draw framebuffer pass
		const shaderCalls = vi.mocked(textmodifier.shader).mock.calls;
		expect(shaderCalls.length).toBe(2); // write buffer + draw buffer
		expect((shaderCalls[0][0] as any).id).toBe('main_shader'); // write buffer
		expect((shaderCalls[1][0] as any).id).toBe('copy_shader'); // draw buffer

		// Verify copy shader uniforms were set
		expect(textmodifier.setUniform).toHaveBeenCalledWith('u_charTex', 'texA');
		expect(textmodifier.setUniform).toHaveBeenCalledWith('u_charColorTex', 'texB');
		expect(textmodifier.setUniform).toHaveBeenCalledWith('u_cellColorTex', 'texC');
	});

	it('should fallback to main shader when copy shader is not initialized', async () => {
		// Arrange - don't initialize copy shader manager
		const mainShader = { id: 'main_shader', dispose: vi.fn() };

		state.compiled = {
			fragmentSource: 'void main() {}',
			uniforms: new Map(),
			dynamicUpdaters: new Map(),
			usesCharColorFeedback: true,
		} as any;
		state.shader = mainShader as any;
		state.needsCompile = false;
		state.pingPongBuffers = [createMockFramebuffer(), createMockFramebuffer()];
		state.pingPongDimensions = { cols: 10, rows: 10 };

		// Act: Render without initialized copy shader
		await synthRender(layer, textmodifier);

		// Assert: Main shader used for both passes (fallback behavior)
		const shaderCalls = vi.mocked(textmodifier.shader).mock.calls;
		expect(shaderCalls.length).toBe(2);
		expect((shaderCalls[0][0] as any).id).toBe('main_shader');
		expect((shaderCalls[1][0] as any).id).toBe('main_shader');
	});

	it('should compile copy shader only once via manager', async () => {
		// Arrange
		const copyShader = { id: 'copy_shader', dispose: vi.fn() };
		vi.mocked(textmodifier.createFilterShader).mockResolvedValue(copyShader as any);

		// Act: Initialize multiple times
		await shaderManager.initialize(textmodifier);
		await shaderManager.initialize(textmodifier);
		await shaderManager.initialize(textmodifier);

		// Assert: Only compiled once
		expect(textmodifier.createFilterShader).toHaveBeenCalledTimes(1);
		expect(shaderManager.isReady()).toBe(true);
		expect(shaderManager.getShader()).toBe(copyShader);
	});

	it('should properly dispose and reset the manager', async () => {
		// Arrange
		const copyShader = { id: 'copy_shader', dispose: vi.fn() };
		vi.mocked(textmodifier.createFilterShader).mockResolvedValue(copyShader as any);

		await shaderManager.initialize(textmodifier);
		expect(shaderManager.isReady()).toBe(true);

		// Act: Dispose
		shaderManager.dispose();

		// Assert: Shader disposed and manager reset
		expect(copyShader.dispose).toHaveBeenCalled();
		expect(shaderManager.isReady()).toBe(false);
		expect(shaderManager.getShader()).toBeNull();

		// Act: Reset and reinitialize
		shaderManager.reset();
		const newCopyShader = { id: 'new_copy_shader', dispose: vi.fn() };
		vi.mocked(textmodifier.createFilterShader).mockResolvedValue(newCopyShader as any);
		await shaderManager.initialize(textmodifier);

		// Assert: New shader created
		expect(shaderManager.isReady()).toBe(true);
		expect(shaderManager.getShader()).toBe(newCopyShader);
	});
});
