
import { synthRender } from '../src/lifecycle/synthRender';
import { SynthSource } from '../src/core/SynthSource';
import { performance } from 'perf_hooks';

// Mocks
const createMockFramebuffer = () => ({
    dispose: () => { },
    textures: [{}, {}, {}],
    begin: () => { },
    end: () => { },
});

const createMockTextmodifier = () => {
    const setUniformCalls: string[] = [];
    return {
        createFramebuffer: () => createMockFramebuffer(),
        createFilterShader: () => Promise.resolve({ dispose: () => { }, id: 'shader_1' }),
        setUniform: (name: string, val: any) => {
            setUniformCalls.push(name);
        },
        clear: () => { },
        shader: () => { },
        rect: () => { },
        secs: 10,
        frameCount: 100,
        setUniformCalls,
    };
};

const cachedIndices = new Int32Array([1, 2, 3]);

const createMockLayer = (cols = 10, rows = 10) => {
    const state = {
        source: new SynthSource(),
        needsCompile: true,
        dynamicValues: new Map(),
        characterResolver: {
            resolve: () => cachedIndices, // Return same reference
            invalidate: () => { },
        },
        compiled: {
            fragmentSource: 'void main() {}',
            uniforms: new Map([
                ['u_static1', { value: 1, isDynamic: false }],
                ['u_static2', { value: 2, isDynamic: false }],
            ]),
            dynamicUpdaters: new Map(),
            charMapping: { chars: 'abc', indices: [] }
        }
    };

    return {
        grid: { cols, rows, width: cols * 10, height: rows * 10 },
        drawFramebuffer: {
            begin: () => { },
            end: () => { },
            textures: [],
        },
        getPluginState: () => state,
        setPluginState: () => { },
        font: { characters: [] },
    };
};

async function runBenchmark() {
    const textmodifier = createMockTextmodifier();
    const layer = createMockLayer() as any;

    // First render (compiles and sets everything)
    await synthRender(layer, textmodifier as any);

    // Reset stats
    textmodifier.setUniformCalls.length = 0;

    const iterations = 10000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
        textmodifier.frameCount++;
        textmodifier.secs += 0.016;
        await synthRender(layer, textmodifier as any);
    }

    const end = performance.now();
    const time = end - start;

    console.log(`Iterations: ${iterations}`);
    console.log(`Total Time: ${time.toFixed(2)}ms`);
    console.log(`Avg Time: ${(time / iterations).toFixed(4)}ms`);
    console.log(`Total setUniform calls: ${textmodifier.setUniformCalls.length}`);
    console.log(`Calls per frame: ${textmodifier.setUniformCalls.length / iterations}`);

    // Analysis of calls
    const callCounts: Record<string, number> = {};
    for (const name of textmodifier.setUniformCalls) {
        callCounts[name] = (callCounts[name] || 0) + 1;
    }
    console.log('Call counts per uniform:', JSON.stringify(callCounts, null, 2));
}

runBenchmark();
