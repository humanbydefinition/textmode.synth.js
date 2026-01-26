
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { synthRender } from '../../src/lifecycle/synthRender';
import { PLUGIN_NAME } from '../../src/plugin/constants';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { TextmodeFramebuffer } from 'textmode.js';
import type { LayerSynthState } from '../../src/core/types';
import type { CompiledSynthShader } from '../../src/compiler/types';
import { CharacterResolver } from '../../src/utils/CharacterResolver';
import { SynthSource } from '../../src/core/SynthSource';

// Mock dependencies
const mockDispose = vi.fn();
const mockCreateFramebuffer = vi.fn();

function createMockFramebuffer(width: number, height: number): any {
  return {
    width,
    height,
    dispose: mockDispose,
    begin: vi.fn(),
    end: vi.fn(),
    textures: [{}, {}, {}], // Mock textures
  };
}

describe('Resource Cleanup (Memory Leaks)', () => {
  let layer: any;
  let textmodifier: any;
  let state: LayerSynthState;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks
    mockCreateFramebuffer.mockImplementation((opts) => createMockFramebuffer(opts.width, opts.height));

    // Initial grid state
    const grid = { cols: 10, rows: 10, width: 100, height: 100 };

    // Mock layer state storage
    const pluginState = new Map();

    layer = {
      grid,
      drawFramebuffer: createMockFramebuffer(10, 10),
      font: { characters: [] },
      getPluginState: (name: string) => pluginState.get(name),
      setPluginState: (name: string, val: any) => pluginState.set(name, val),
    };

    // Mock textmodifier (plugin context)
    textmodifier = {
      createFramebuffer: mockCreateFramebuffer,
      createFilterShader: vi.fn().mockResolvedValue({ dispose: vi.fn() }),
      setUniform: vi.fn(),
      clear: vi.fn(),
      shader: vi.fn(),
      rect: vi.fn(),
      secs: 0,
      frameCount: 0,
    };

    // Initial synth state
    state = {
      source: new SynthSource(),
      compiled: {
        fragmentSource: '',
        uniforms: new Map(),
        dynamicUpdaters: new Map(),
        usesCharColorFeedback: false,
        usesCharFeedback: false,
        usesCellColorFeedback: false,
        usesCharSource: false,
        externalLayers: new Map(),
      } as CompiledSynthShader,
      shader: { dispose: vi.fn() } as any,
      characterResolver: new CharacterResolver(),
      needsCompile: false,
      pingPongIndex: 0,
      dynamicValues: new Map(),
      synthContext: {
        time: 0,
        frameCount: 0,
        width: 0,
        height: 0,
        cols: 0,
        rows: 0,
        bpm: 0,
      },
    };

    layer.setPluginState(PLUGIN_NAME, state);
  });

  it('should dispose ping-pong buffers when switching from feedback to non-feedback', async () => {
    // 1. Render WITH feedback
    state.compiled!.usesCharColorFeedback = true;
    await synthRender(layer, textmodifier);

    expect(mockCreateFramebuffer).toHaveBeenCalledTimes(2);
    expect(state.pingPongBuffers).toBeDefined();
    expect(state.pingPongBuffers?.length).toBe(2);

    const buffers = state.pingPongBuffers!;

    // 2. Render WITHOUT feedback
    state.compiled!.usesCharColorFeedback = false;
    await synthRender(layer, textmodifier);

    // FAILURE EXPECTED HERE (Current behavior: Buffers persist)
    // We want them to be disposed and removed
    expect(mockDispose).toHaveBeenCalledTimes(2); // Should dispose the 2 buffers
    expect(state.pingPongBuffers).toBeUndefined(); // Should clear the reference
  });

  it('should dispose and recreate ping-pong buffers when grid size changes', async () => {
    // 1. Render with feedback at initial size (10x10)
    state.compiled!.usesCharColorFeedback = true;
    await synthRender(layer, textmodifier);

    expect(mockCreateFramebuffer).toHaveBeenCalledTimes(2);
    const oldBuffers = state.pingPongBuffers!;
    expect(oldBuffers[0].width).toBe(10);

    // Clear call counts
    mockCreateFramebuffer.mockClear();
    mockDispose.mockClear();

    // 2. Resize grid
    layer.grid = { cols: 20, rows: 20, width: 200, height: 200 };

    // 3. Render again
    await synthRender(layer, textmodifier);

    // FAILURE EXPECTED HERE (Current behavior: Old buffers reused)
    // We want old buffers disposed
    expect(mockDispose).toHaveBeenCalledTimes(2);

    // And new buffers created
    expect(mockCreateFramebuffer).toHaveBeenCalledTimes(2);
    expect(state.pingPongBuffers).toBeDefined();
    expect(state.pingPongBuffers![0].width).toBe(20);
    expect(state.pingPongBuffers![0]).not.toBe(oldBuffers[0]);
  });
});
