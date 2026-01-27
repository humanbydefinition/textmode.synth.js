import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { synthRender } from '../../src/lifecycle/synthRender';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { Textmodifier, TextmodeFramebuffer } from 'textmode.js';
import type { LayerSynthState } from '../../src/core/types';
import { SynthSource } from '../../src/core/SynthSource';

const createMockFramebuffer = (): TextmodeFramebuffer => ({
	dispose: vi.fn(),
	textures: [{}, {}, {}],
	begin: vi.fn(),
	end: vi.fn(),
} as unknown as TextmodeFramebuffer);

const createMockTextmodifier = () => ({
	createFramebuffer: vi.fn(() => createMockFramebuffer()),
	createFilterShader: vi.fn(() => Promise.resolve({ dispose: vi.fn() })),
	setUniform: vi.fn(),
	clear: vi.fn(),
	shader: vi.fn(),
	rect: vi.fn(),
	secs: 10,
	frameCount: 100,
} as unknown as Textmodifier);

const createMockLayer = (cols = 10, rows = 10): TextmodeLayer => ({
	grid: { cols, rows, width: cols * 10, height: rows * 10 },
	drawFramebuffer: {
		begin: vi.fn(),
		end: vi.fn(),
		textures: [],
	},
	getPluginState: vi.fn(),
	setPluginState: vi.fn(),
	font: { characters: [] },
} as unknown as TextmodeLayer);

describe('synthRender Lifecycle', () => {
	let layer: TextmodeLayer;
	let textmodifier: Textmodifier;
	let state: Partial<LayerSynthState>;

	beforeEach(() => {
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
		};
		vi.mocked(layer.getPluginState).mockReturnValue(state);
	});

	describe('Buffer Management', () => {
		it('should create ping-pong buffers when feedback is required', async () => {
			// Arrange
			state.compiled = {
				fragmentSource: 'void main() {}',
				uniforms: new Map(),
				dynamicUpdaters: new Map(),
				usesCharColorFeedback: true,
			} as any;

			// Act
			await synthRender(layer, textmodifier);

			// Assert
			expect(textmodifier.createFramebuffer).toHaveBeenCalledTimes(2);
			expect(state.pingPongBuffers).toBeDefined();
			expect(state.pingPongBuffers).toHaveLength(2);
			expect(state.pingPongDimensions).toEqual({ cols: 10, rows: 10 });
		});

		it('should dispose ping-pong buffers when feedback is disabled dynamically', async () => {
			// Arrange: Start with buffers
			state.compiled = {
				fragmentSource: 'void main() {}',
				uniforms: new Map(),
				dynamicUpdaters: new Map(),
				usesCharColorFeedback: true,
			} as any;
			await synthRender(layer, textmodifier);

			const [bufferA, bufferB] = state.pingPongBuffers!;

			// Act: Disable feedback
			state.compiled = {
				...state.compiled,
				usesCharColorFeedback: false,
			} as any;
			state.needsCompile = true; // Force re-eval (though logic runs every frame)

			await synthRender(layer, textmodifier);

			// Assert
			expect(bufferA.dispose).toHaveBeenCalled();
			expect(bufferB.dispose).toHaveBeenCalled();
			expect(state.pingPongBuffers).toBeUndefined();
			expect(state.pingPongDimensions).toBeUndefined();
		});

		it('should recreate buffers when grid dimensions change', async () => {
			// Arrange: Initial render at 10x10
			state.compiled = {
				fragmentSource: 'void main() {}',
				uniforms: new Map(),
				dynamicUpdaters: new Map(),
				usesCharColorFeedback: true,
			} as any;
			await synthRender(layer, textmodifier);

			const [oldBufferA, oldBufferB] = state.pingPongBuffers!;
			vi.clearAllMocks(); // Clear create/dispose calls

			// Act: Resize layer
			(layer as any).grid = { cols: 20, rows: 20, width: 200, height: 200 };
			await synthRender(layer, textmodifier);

			// Assert: Old buffers disposed
			expect(oldBufferA.dispose).toHaveBeenCalled();
			expect(oldBufferB.dispose).toHaveBeenCalled();

			// Assert: New buffers created with new dimensions
			expect(textmodifier.createFramebuffer).toHaveBeenCalledTimes(2);
			expect(textmodifier.createFramebuffer).toHaveBeenCalledWith(expect.objectContaining({
				width: 20,
				height: 20
			}));
			expect(state.pingPongDimensions).toEqual({ cols: 20, rows: 20 });
		});

		it('should maintain existing buffers if dimensions and requirements are unchanged', async () => {
			// Arrange
			state.compiled = {
				fragmentSource: 'void main() {}',
				uniforms: new Map(),
				dynamicUpdaters: new Map(),
				usesCharColorFeedback: true,
			} as any;
			await synthRender(layer, textmodifier);

			const initialBuffers = state.pingPongBuffers;
			vi.clearAllMocks();

			// Act
			await synthRender(layer, textmodifier);

			// Assert
			expect(textmodifier.createFramebuffer).not.toHaveBeenCalled();
			expect(state.pingPongBuffers).toBe(initialBuffers);
		});
	});
});
