import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { synthRender } from '../../src/lifecycle/synthRender';
import { synthDispose } from '../../src/lifecycle/synthDispose';
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

	describe('Shader Management', () => {
		it('should prevent race conditions and leaks during rapid updates', async () => {
			// Arrange
			state.compiled = {
				fragmentSource: 'void main() {}',
				uniforms: new Map(),
				dynamicUpdaters: new Map(),
			} as any;

			// Mock createFilterShader to return controllable promises
			let resolveShader1: (v: any) => void;
			const shaderPromise1 = new Promise((resolve) => { resolveShader1 = resolve; });

			let resolveShader2: (v: any) => void;
			const shaderPromise2 = new Promise((resolve) => { resolveShader2 = resolve; });

			let callCount = 0;
			vi.mocked(textmodifier.createFilterShader).mockImplementation(() => {
				callCount++;
				if (callCount === 1) return shaderPromise1 as any;
				return shaderPromise2 as any;
			});

			// Initial shader
			const initialShader = { dispose: vi.fn(), id: 'initial' };
			state.shader = initialShader as any;

			// Act 1: Trigger first compile
			const render1 = synthRender(layer, textmodifier);

			// Act 2: Trigger second compile immediately (before first finishes)
			// In the buggy implementation, needsCompile is still true, so this triggers another compile
			const render2 = synthRender(layer, textmodifier);

			// Resolve promises
			const shader1 = { dispose: vi.fn(), id: 'shader1' };
			const shader2 = { dispose: vi.fn(), id: 'shader2' };

			resolveShader1!(shader1);
			resolveShader2!(shader2);

			await Promise.all([render1, render2]);

			// Assertions for the BUG state:
			// 1. initialShader disposed twice (once per call)
			// 2. createFilterShader called twice
			// 3. state.shader is shader2 (last one wins)
			// 4. shader1 is NOT disposed (LEAK!)

			// We assert that the FIX prevents this.
			// Ideally:
			// 1. initialShader disposed ONCE (after new shader is ready)
			// 2. createFilterShader called ONCE (second call skipped or queued)
			// OR if called twice, the intermediate one must be disposed.

			// Check for double free of initial shader
			expect(initialShader.dispose).toHaveBeenCalledTimes(1);

			// Check for leak of intermediate shader
			// If shader1 was created but isn't the current shader, it MUST be disposed
			if (state.shader !== shader1) {
				// If callCount was 2, shader1 was created. If it's not state.shader, did we dispose it?
				// In the bug, callCount is 2, shader1 is NOT disposed.
				const wasDisposed = (shader1.dispose as Mock).mock.calls.length > 0;
				const isLeak = callCount >= 1 && !wasDisposed;
				expect(isLeak).toBe(false);
			}
		});

		it('should dispose shader created after layer disposal (LEAK FIX)', async () => {
			// Arrange
			state.compiled = {
				fragmentSource: 'void main() {}',
				uniforms: new Map(),
				dynamicUpdaters: new Map(),
			} as any;

			let resolveShader: (v: any) => void;
			const shaderPromise = new Promise((resolve) => { resolveShader = resolve; });

			// Mock createFilterShader to hang
			vi.mocked(textmodifier.createFilterShader).mockReturnValue(shaderPromise as any);

			// Act 1: Start rendering (triggers compilation)
			const renderPromise = synthRender(layer, textmodifier);

			// Act 2: Dispose layer immediately while compiling
			synthDispose(layer);

			// Verify we are in compiling state
			expect(state.isCompiling).toBe(true);
			expect(state.isDisposed).toBe(true);

			// Act 3: Finish compilation
			const newShader = { dispose: vi.fn(), id: 'leaked_shader' };
			resolveShader!(newShader);
			await renderPromise;

			// Assert: The new shader should be disposed because the layer is dead
			expect(newShader.dispose).toHaveBeenCalled();
			// And state.shader should NOT be set
			expect(state.shader).not.toBe(newShader);
		});
	});
});
