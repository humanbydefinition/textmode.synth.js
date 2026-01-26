import { performance } from 'perf_hooks';

// Mock types
interface MockTextmodifier {
  setUniform(name: string, value: any): void;
}

interface MockState {
    resolutionCache?: [number, number];
}

interface MockContext {
    cols: number;
    rows: number;
}

let accumulator = 0;
// Simulate external retention/processing preventing escape analysis
let lastValue: any = null;

const textmodifier: MockTextmodifier = {
    setUniform: (name, value) => {
        if (name === 'resolution') {
           lastValue = value; // Escape!
           accumulator += value[0] + value[1];
        }
    }
};

const ctx: MockContext = { cols: 120, rows: 60 };
const state: MockState = {};

// Simulation parameters
const FRAMES = 5_000_000;
const PING_PONG_RATIO = 0.5;

function runBaseline() {
    accumulator = 0;
    const start = performance.now();
    const startHeap = process.memoryUsage().heapUsed;

    for (let i = 0; i < FRAMES; i++) {
        const isPingPong = i < FRAMES * PING_PONG_RATIO;

        textmodifier.setUniform('resolution', [ctx.cols, ctx.rows]);

        if (isPingPong) {
            textmodifier.setUniform('resolution', [ctx.cols, ctx.rows]);
        }
    }
    const end = performance.now();
    const endHeap = process.memoryUsage().heapUsed;

    if (accumulator === 0) console.log("Warning: 0 accumulator");
    return { time: end - start, memory: endHeap - startHeap };
}

function runOptimized() {
    accumulator = 0;
    state.resolutionCache = [0, 0];
    const cache = state.resolutionCache;

    const start = performance.now();
    const startHeap = process.memoryUsage().heapUsed;

    for (let i = 0; i < FRAMES; i++) {
        const isPingPong = i < FRAMES * PING_PONG_RATIO;

        // Update cache
        cache[0] = ctx.cols;
        cache[1] = ctx.rows;

        textmodifier.setUniform('resolution', cache);

        if (isPingPong) {
            textmodifier.setUniform('resolution', cache);
        }
    }
    const end = performance.now();
    const endHeap = process.memoryUsage().heapUsed;

    if (accumulator === 0) console.log("Warning: 0 accumulator");
    return { time: end - start, memory: endHeap - startHeap };
}

// Warmup
console.log('Warming up...');
runBaseline();
runOptimized();

if (global.gc) { global.gc(); }

// Measure
console.log(`Running benchmarks (${FRAMES} frames)...`);

// Run Baseline
const baseline = runBaseline();
console.log(`Baseline: ${baseline.time.toFixed(2)}ms, Memory delta: ${(baseline.memory / 1024 / 1024).toFixed(2)} MB`);

if (global.gc) { global.gc(); }

// Run Optimized
const optimized = runOptimized();
console.log(`Optimized: ${optimized.time.toFixed(2)}ms, Memory delta: ${(optimized.memory / 1024 / 1024).toFixed(2)} MB`);

const timeImprovement = ((baseline.time - optimized.time) / baseline.time) * 100;
console.log(`Time Improvement: ${timeImprovement.toFixed(2)}%`);
