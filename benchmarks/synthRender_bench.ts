
import { synthRender } from '../src/lifecycle/synthRender';
import { osc } from '../src/api';
import { CharacterResolver } from '../src/utils/CharacterResolver';

// Mock TextmodeFont
const mockFont = {
    characters: Array.from(' ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    characterMap: new Map(Array.from(' ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((c, i) => [c, { index: i, width: 8, height: 16 }]))
};

// Mock TextmodeFramebuffer
const createMockFramebuffer = () => ({
    textures: [{}, {}, {}],
    begin: () => {},
    end: () => {},
    dispose: () => {},
});

// Mock TextmodeLayer
const mockLayer: any = {
    grid: { width: 800, height: 600, cols: 100, rows: 75 },
    drawFramebuffer: createMockFramebuffer(),
    font: mockFont,
    _pluginState: new Map(),
    getPluginState: function(name: string) { return this._pluginState.get(name); },
    setPluginState: function(name: string, state: any) { this._pluginState.set(name, state); }
};

let uniformSetCount = 0;

// Mock Textmodifier (context)
const mockTextmodifier = {
    secs: 0,
    frameCount: 0,
    createFilterShader: async () => ({ dispose: () => {} }), // Mock shader
    createFramebuffer: createMockFramebuffer,
    clear: () => {},
    shader: () => {},
    setUniform: (name: string, val: any) => { uniformSetCount++; }, // HOT PATH
    rect: () => {},
};

// Setup State
const source = osc(10, 0.1, 0);
const state: any = {
    source: source,
    characterResolver: new CharacterResolver(),
    needsCompile: true,
    pingPongIndex: 0,
    dynamicValues: new Map(),
    resolutionCache: [0, 0],
    synthContext: {
        time: 0,
        frameCount: 0,
        width: 800,
        height: 600,
        cols: 100,
        rows: 75,
        bpm: 120
    }
};

mockLayer.setPluginState('textmode.synth.js', state);

async function runBenchmark() {
    // Warmup and Compile
    await synthRender(mockLayer, mockTextmodifier);
    state.needsCompile = false;

    uniformSetCount = 0;
    const iterations = 1000000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
        mockTextmodifier.secs += 0.016;
        mockTextmodifier.frameCount++;
        await synthRender(mockLayer, mockTextmodifier);
    }

    const end = performance.now();
    console.log(`Total time for ${iterations} iterations: ${(end - start).toFixed(2)}ms`);
    console.log(`Average time per frame: ${((end - start) / iterations).toFixed(4)}ms`);
    console.log(`Uniforms set: ${uniformSetCount}`);
}

runBenchmark().catch(console.error);
