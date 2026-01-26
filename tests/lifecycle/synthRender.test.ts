import { describe, it, expect, vi, beforeEach } from 'vitest';
import { synthRender } from '../../src/lifecycle/synthRender';
import * as SynthCompiler from '../../src/compiler/SynthCompiler';
import * as Utils from '../../src/utils';

// Mocks
vi.mock('../../src/compiler/SynthCompiler');
vi.mock('../../src/utils');
vi.mock('../../src/core/GlobalState', () => ({
    getGlobalBpm: vi.fn(() => 120),
}));

describe('synthRender', () => {
    let layer: any;
    let textmodifier: any;
    let state: any;
    let mockShader: any;

    beforeEach(() => {
        vi.resetAllMocks();

        mockShader = {
            dispose: vi.fn(),
        };

        textmodifier = {
            createFramebuffer: vi.fn(() => ({
                begin: vi.fn(),
                end: vi.fn(),
                textures: [{}, {}, {}],
                dispose: vi.fn(),
            })),
            createFilterShader: vi.fn().mockResolvedValue(mockShader),
            clear: vi.fn(),
            shader: vi.fn(),
            setUniform: vi.fn(),
            rect: vi.fn(),
            secs: 10,
            frameCount: 100,
        };

        state = {
            source: {},
            compiled: {
                usesCharColorFeedback: true, // Force feedback usage
                usesCharFeedback: false,
                usesCellColorFeedback: false,
                dynamicUpdaters: new Map(),
                uniforms: new Map(),
                fragmentSource: 'void main() {}',
            },
            needsCompile: true,
            characterResolver: { resolve: vi.fn(() => []) },
            dynamicValues: new Map(),
        };

        layer = {
            grid: { cols: 10, rows: 10, width: 100, height: 100 },
            drawFramebuffer: {
                begin: vi.fn(),
                end: vi.fn(),
                textures: [{}, {}, {}],
            },
            getPluginState: vi.fn(() => state),
            font: { characters: [] },
        };

        // Mock compiler result
        vi.mocked(SynthCompiler.compileSynthSource).mockReturnValue(state.compiled);
        vi.mocked(Utils.collectExternalLayerRefs).mockReturnValue(new Map());
    });

    it('recreates ping-pong buffers when grid dimensions change', async () => {
        // First render
        await synthRender(layer, textmodifier);

        expect(textmodifier.createFramebuffer).toHaveBeenCalledTimes(2); // Two buffers created
        const firstBuffers = state.pingPongBuffers;
        expect(firstBuffers).toBeDefined();
        expect(firstBuffers).toHaveLength(2);

        const oldBuffer1 = firstBuffers[0];
        const oldBuffer2 = firstBuffers[1];

        // Change grid dimensions
        layer.grid = { cols: 20, rows: 20, width: 200, height: 200 };

        // Second render
        await synthRender(layer, textmodifier);

        // Expectation: Old buffers should be disposed because dimensions changed
        expect(oldBuffer1.dispose).toHaveBeenCalled();
        expect(oldBuffer2.dispose).toHaveBeenCalled();

        // New buffers should be created
        expect(textmodifier.createFramebuffer).toHaveBeenCalledTimes(4); // 2 + 2
        expect(state.pingPongBuffers).not.toBe(firstBuffers);
        expect(state.pingPongBuffers[0]).not.toBe(oldBuffer1);
    });

    it('disposes ping-pong buffers when feedback is no longer used', async () => {
        // First render with feedback enabled (from beforeEach)
        await synthRender(layer, textmodifier);

        expect(state.pingPongBuffers).toBeDefined();
        const oldBuffer1 = state.pingPongBuffers[0];
        const oldBuffer2 = state.pingPongBuffers[1];

        // Disable feedback in compiled source
        state.compiled = {
            ...state.compiled,
            usesCharColorFeedback: false,
            usesCharFeedback: false,
            usesCellColorFeedback: false,
        };
        // We force compiled to update but usually this happens via recompilation.
        // synthRender checks compiled flags.

        // Second render
        await synthRender(layer, textmodifier);

        // Expectation: Buffers should be disposed
        expect(oldBuffer1.dispose).toHaveBeenCalled();
        expect(oldBuffer2.dispose).toHaveBeenCalled();
        expect(state.pingPongBuffers).toBeUndefined();
    });
});
