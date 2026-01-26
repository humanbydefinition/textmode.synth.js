import { describe, it, expect, vi, beforeEach } from 'vitest';
import { synthRender } from '../../src/lifecycle/synthRender';
import { PLUGIN_NAME } from '../../src/plugin/constants';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { Textmodifier, TextmodeFramebuffer } from 'textmode.js';
import type { LayerSynthState } from '../../src/core/types';
import type { CompiledSynthShader } from '../../src/compiler/types';

// Mock dependencies
vi.mock('../../src/compiler/SynthCompiler', () => ({
  compileSynthSource: vi.fn((source) => source._compiledResult),
}));

vi.mock('../../src/utils', () => ({
  collectExternalLayerRefs: vi.fn(() => new Map()),
}));

describe('synthRender', () => {
  let layer: any;
  let textmodifier: any;
  let state: any;
  let framebufferMock: any;

  beforeEach(() => {
    framebufferMock = {
      dispose: vi.fn(),
      begin: vi.fn(),
      end: vi.fn(),
      textures: [{}, {}, {}], // Mock textures
    };

    textmodifier = {
      createFramebuffer: vi.fn(() => ({ ...framebufferMock })), // Return new instance
      createFilterShader: vi.fn(() => ({ dispose: vi.fn() })),
      clear: vi.fn(),
      shader: vi.fn(),
      setUniform: vi.fn(),
      rect: vi.fn(),
      secs: 10,
      frameCount: 100,
    };

    state = {
      source: {
        // Mock source with attached compiled result for our mock compiler
        _compiledResult: {
          fragmentSource: 'void main() {}',
          uniforms: [],
          dynamicUpdaters: new Map(),
          usesCharColorFeedback: false,
          usesCharFeedback: false,
          usesCellColorFeedback: false,
        },
      },
      compiled: undefined,
      shader: undefined,
      characterResolver: { resolve: vi.fn(() => []) },
      needsCompile: false,
      pingPongBuffers: undefined,
      pingPongIndex: 0,
      externalLayerMap: undefined,
      dynamicValues: new Map(),
      synthContext: undefined,
    };

    layer = {
      grid: { cols: 80, rows: 25, width: 800, height: 600 },
      drawFramebuffer: {
        begin: vi.fn(),
        end: vi.fn(),
      },
      font: { characters: [] },
      getPluginState: vi.fn(() => state),
      setPluginState: vi.fn(),
    };
  });

  it('creates ping-pong buffers when feedback is used', async () => {
    // Setup feedback usage
    state.source._compiledResult.usesCharColorFeedback = true;

    await synthRender(layer, textmodifier);

    expect(textmodifier.createFramebuffer).toHaveBeenCalledTimes(2);
    expect(state.pingPongBuffers).toBeDefined();
    expect(state.pingPongBuffers).toHaveLength(2);
  });

  it('disposes ping-pong buffers when feedback is no longer used', async () => {
    // 1. Render WITH feedback to create buffers
    state.source._compiledResult.usesCharColorFeedback = true;
    await synthRender(layer, textmodifier);

    const createdBuffers = state.pingPongBuffers;
    expect(createdBuffers).toBeDefined();

    // 2. Disable feedback and render again
    state.source._compiledResult.usesCharColorFeedback = false;
    // Force recompile logic simulation (since synthRender checks state.compiled)
    // We update state.compiled directly for the test since we mock the compiler
    state.compiled.usesCharColorFeedback = false;

    await synthRender(layer, textmodifier);

    // EXPECTATION: buffers should be disposed
    // NOTE: This currently fails because the logic is missing!
    expect(createdBuffers[0].dispose).toHaveBeenCalled();
    expect(createdBuffers[1].dispose).toHaveBeenCalled();
    expect(state.pingPongBuffers).toBeUndefined();
  });

  it('disposes and recreates buffers when grid dimensions change', async () => {
    // 1. Render with feedback
    state.source._compiledResult.usesCharColorFeedback = true;
    await synthRender(layer, textmodifier);

    const oldBuffers = state.pingPongBuffers;
    expect(oldBuffers).toBeDefined();

    // 2. Change grid dimensions
    layer.grid.cols = 100;
    layer.grid.rows = 30;

    await synthRender(layer, textmodifier);

    // EXPECTATION: old buffers disposed, new buffers created
    // NOTE: This currently fails because the logic is missing!
    expect(oldBuffers[0].dispose).toHaveBeenCalled();
    expect(oldBuffers[1].dispose).toHaveBeenCalled();
    expect(state.pingPongBuffers).not.toBe(oldBuffers);
    expect(textmodifier.createFramebuffer).toHaveBeenCalledTimes(4); // 2 initial + 2 new
  });
});
