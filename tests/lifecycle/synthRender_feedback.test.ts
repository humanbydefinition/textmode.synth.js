
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { synthRender } from '../../src/lifecycle/synthRender';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { Textmodifier, TextmodeFramebuffer } from 'textmode.js';
import type { LayerSynthState } from '../../src/core/types';
import { SynthSource } from '../../src/core/SynthSource';

const createMockFramebuffer = (): TextmodeFramebuffer => ({
    dispose: vi.fn(),
    textures: ['texA', 'texB', 'texC'],
    begin: vi.fn(),
    end: vi.fn(),
} as unknown as TextmodeFramebuffer);

const createMockTextmodifier = () => ({
    createFramebuffer: vi.fn(() => createMockFramebuffer()),
    createFilterShader: vi.fn(() => Promise.resolve({ dispose: vi.fn(), id: 'shader_default' })),
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

describe('synthRender Optimization', () => {
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

    it('should use Copy Shader for the second pass after async compilation', async () => {
        // Arrange
        state.compiled = {
            fragmentSource: 'void main() {}',
            uniforms: new Map(),
            dynamicUpdaters: new Map(),
            usesCharColorFeedback: true,
        } as any;

        // Mock createFilterShader to identify shaders
        vi.mocked(textmodifier.createFilterShader)
            .mockResolvedValueOnce({ id: 'main_shader', dispose: vi.fn() } as any) // 1. Main shader
            .mockResolvedValueOnce({ id: 'copy_shader', dispose: vi.fn() } as any); // 2. Copy shader

        // Act 1: First render
        // This triggers copy shader compilation in background (fire-and-forget)
        await synthRender(layer, textmodifier);

        // Assert 1: Compilation started
        expect(textmodifier.createFilterShader).toHaveBeenCalledTimes(2); // Main + Copy

        // Assert 2: First frame uses Fallback (main_shader used twice)
        // Last call should be main_shader because copy shader isn't ready yet (microtask)
        const shaderCallsFrame1 = vi.mocked(textmodifier.shader).mock.calls;
        const lastShaderCallFrame1 = shaderCallsFrame1[shaderCallsFrame1.length - 1][0] as any;
        expect(lastShaderCallFrame1.id).toBe('main_shader');

        // Act 2: Wait for microtasks (resolve promises)
        await new Promise(resolve => setTimeout(resolve, 0));

        // Act 3: Second render
        await synthRender(layer, textmodifier);

        // Assert 3: Second frame uses Copy Shader
        const shaderCallsFrame2 = vi.mocked(textmodifier.shader).mock.calls;
        const lastShaderCallFrame2 = shaderCallsFrame2[shaderCallsFrame2.length - 1][0] as any;
        expect(lastShaderCallFrame2.id).toBe('copy_shader');

        // Verify copy shader uniforms were set in the second frame
        expect(textmodifier.setUniform).toHaveBeenCalledWith('u_charTex', 'texA');
        expect(textmodifier.setUniform).toHaveBeenCalledWith('u_charColorTex', 'texB');
        expect(textmodifier.setUniform).toHaveBeenCalledWith('u_cellColorTex', 'texC');
    });

    it('should only compile Copy Shader once', async () => {
        // Arrange
        state.compiled = {
            fragmentSource: 'void main() {}',
            uniforms: new Map(),
            dynamicUpdaters: new Map(),
            usesCharColorFeedback: true,
        } as any;

        const mainShader = { id: 'main_shader', dispose: vi.fn() };
        const copyShader = { id: 'copy_shader', dispose: vi.fn() };

        // Pre-set main shader to avoid first compilation
        state.shader = mainShader as any;
        state.needsCompile = false;
        state.compiled = state.compiled; // ensure strict equality check passes if needed

        vi.mocked(textmodifier.createFilterShader)
            .mockResolvedValueOnce(copyShader as any);

        // Act 1: First Frame (compiles copy shader)
        await synthRender(layer, textmodifier);

        // Act 2: Wait for microtasks
        await new Promise(resolve => setTimeout(resolve, 0));

        // Act 3: Second Frame (reuses copy shader)
        await synthRender(layer, textmodifier);

        // Assert
        // createFilterShader called once (only for copy shader, since main was pre-set)
        expect(textmodifier.createFilterShader).toHaveBeenCalledTimes(1);

        // state should hold the copy shader
        expect(state.copyShader).toBe(copyShader);
    });
});
