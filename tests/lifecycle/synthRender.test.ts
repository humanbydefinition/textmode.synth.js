import { describe, it, expect, vi, beforeEach } from 'vitest';
import { synthRender } from '../../src/lifecycle/synthRender';
import { PLUGIN_NAME } from '../../src/plugin/constants';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { Textmodifier, TextmodeFramebuffer } from 'textmode.js';
import type { LayerSynthState } from '../../src/core/types';
import { SynthSource } from '../../src/core/SynthSource';

// Mocks
const mockDispose = vi.fn();
const mockCreateFramebuffer = vi.fn(() => ({
	dispose: mockDispose,
	textures: [{}, {}, {}],
	begin: vi.fn(),
	end: vi.fn(),
} as unknown as TextmodeFramebuffer));

const mockShaderDispose = vi.fn();
const mockCreateFilterShader = vi.fn(() => Promise.resolve({
	dispose: mockShaderDispose,
} as any));

const mockTextmodifier = {
	createFramebuffer: mockCreateFramebuffer,
	createFilterShader: mockCreateFilterShader,
	setUniform: vi.fn(),
	clear: vi.fn(),
	shader: vi.fn(),
	rect: vi.fn(),
	secs: 0,
	frameCount: 0,
} as unknown as Textmodifier;

describe('synthRender Memory Leak', () => {
	let layer: TextmodeLayer;
	let state: Partial<LayerSynthState>;

	beforeEach(() => {
		mockDispose.mockClear();
		mockCreateFramebuffer.mockClear();
		mockShaderDispose.mockClear();
		mockCreateFilterShader.mockClear();

		state = {
			source: new SynthSource(),
			needsCompile: true,
			dynamicValues: new Map(),
			characterResolver: {
				resolve: () => [],
				invalidate: () => {},
			} as any,
		};

		layer = {
			grid: { cols: 10, rows: 10, width: 100, height: 100 },
			drawFramebuffer: {
				begin: vi.fn(),
				end: vi.fn(),
				textures: [],
			},
			getPluginState: vi.fn(() => state),
			setPluginState: vi.fn(),
			font: { characters: [] },
		} as unknown as TextmodeLayer;
	});

	it('should dispose ping-pong buffers when feedback is no longer needed', async () => {
		// 1. Setup state with feedback needed
		state.compiled = {
			fragmentSource: 'void main() {}',
			uniforms: new Map(),
			dynamicUpdaters: new Map(),
			usesCharColorFeedback: true, // Needs feedback
			usesCharFeedback: false,
			usesCellColorFeedback: false,
		} as any;
		state.needsCompile = true;

		// 2. Render first frame (creates buffers)
		await synthRender(layer, mockTextmodifier);
		expect(mockCreateFramebuffer).toHaveBeenCalledTimes(2);
		expect(state.pingPongBuffers).toBeDefined();

		// 3. Setup state with NO feedback needed
		state.compiled = {
			fragmentSource: 'void main() {}',
			uniforms: new Map(),
			dynamicUpdaters: new Map(),
			usesCharColorFeedback: false, // No feedback
			usesCharFeedback: false,
			usesCellColorFeedback: false,
		} as any;
		state.needsCompile = true;

		// Reset mocks to track new calls
		mockDispose.mockClear();

		// 4. Render second frame
		await synthRender(layer, mockTextmodifier);

		// EXPECTATION: Buffers should be disposed
		expect(mockDispose).toHaveBeenCalledTimes(2); // Should be called for both buffers
		expect(state.pingPongBuffers).toBeUndefined(); // Should be cleared
	});

	it('should dispose and recreate ping-pong buffers when grid dimensions change', async () => {
		// 1. Setup state with feedback needed
		state.compiled = {
			fragmentSource: 'void main() {}',
			uniforms: new Map(),
			dynamicUpdaters: new Map(),
			usesCharColorFeedback: true,
			usesCharFeedback: false,
			usesCellColorFeedback: false,
		} as any;
		state.needsCompile = true;

		// 2. Render first frame (10x10)
		await synthRender(layer, mockTextmodifier);
		expect(mockCreateFramebuffer).toHaveBeenCalledTimes(2);
		expect(mockCreateFramebuffer).toHaveBeenCalledWith(expect.objectContaining({ width: 10, height: 10 }));

		const initialBuffers = state.pingPongBuffers;

		// 3. Change grid dimensions
		layer.grid = { cols: 20, rows: 20, width: 200, height: 200 };

		// Reset mocks
		mockDispose.mockClear();
		mockCreateFramebuffer.mockClear();

		// 4. Render second frame
		await synthRender(layer, mockTextmodifier);

		// EXPECTATION: Old buffers disposed, new ones created
		expect(mockDispose).toHaveBeenCalledTimes(2);
		expect(mockCreateFramebuffer).toHaveBeenCalledTimes(2);
		expect(mockCreateFramebuffer).toHaveBeenCalledWith(expect.objectContaining({ width: 20, height: 20 }));
		expect(state.pingPongBuffers).not.toBe(initialBuffers);
	});
});
