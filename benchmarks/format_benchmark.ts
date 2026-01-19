import { performance } from 'perf_hooks';

/**
 * Current implementation (Baseline)
 */
function formatNumberBaseline(n: number): string {
    const s = n.toString();
    return s.includes('.') ? s : s + '.0';
}

/**
 * Optimized implementation
 */
function formatNumberOptimized(n: number): string {
    if (Number.isInteger(n)) {
        return n.toString() + ".0";
    }
    return n.toString();
}

// --- Benchmark Setup ---

const ITERATIONS = 100;
const DATA_SIZE = 100000;
const numbers: number[] = [];

// Generate test data: Mix of integers, floats, and edge cases
for (let i = 0; i < DATA_SIZE; i++) {
    const r = Math.random();
    if (r < 0.4) {
        // Integer
        numbers.push(Math.floor(Math.random() * 10000));
    } else if (r < 0.8) {
        // Float
        numbers.push(Math.random() * 10000);
    } else if (r < 0.9) {
        // Small number (scientific notation potential)
        numbers.push(Math.random() * 1e-7);
    } else {
        // Large number
        numbers.push(Math.random() * 1e20);
    }
}
// Add explicit edge cases
numbers.push(NaN);
numbers.push(Infinity);
numbers.push(-Infinity);
numbers.push(0);
numbers.push(-0);

console.log(`Running benchmark with ${DATA_SIZE} numbers over ${ITERATIONS} iterations...`);

// --- Warmup ---
for (let i = 0; i < 5; i++) {
    for (const n of numbers) {
        formatNumberBaseline(n);
        formatNumberOptimized(n);
    }
}

// --- Run Baseline ---
const startBaseline = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const n of numbers) {
        formatNumberBaseline(n);
    }
}
const endBaseline = performance.now();
const timeBaseline = endBaseline - startBaseline;

// --- Run Optimized ---
const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const n of numbers) {
        formatNumberOptimized(n);
    }
}
const endOptimized = performance.now();
const timeOptimized = endOptimized - startOptimized;

// --- Results ---
console.log(`\nResults:`);
console.log(`Baseline:  ${timeBaseline.toFixed(2)} ms`);
console.log(`Optimized: ${timeOptimized.toFixed(2)} ms`);
console.log(`Improvement: ${(timeBaseline - timeOptimized).toFixed(2)} ms (${((1 - timeOptimized / timeBaseline) * 100).toFixed(2)}%)`);

// Instructions to run:
// npx tsc benchmarks/format_benchmark.ts && node benchmarks/format_benchmark.js
