# Performance Journal

## Entry #1 — Resolution Uniform Allocation

- **Finding**: The `resolution` uniform was being allocated as a new `[number, number]` array every frame in `synthRender`.
- **Metric**: Benchmark `benchmarks/render_perf.ts` showed ~32ms for 10k iterations.
- **Optimization**: Added `resolutionArray` to `LayerSynthState` to persist the array and reused it by updating indices.
- **Result**: Benchmark time improved to ~28ms (12.5% faster). Allocations reduced by 1 per frame per layer.
- **Learning**: Even small allocations in hot paths like render loops add up. Reusing objects is a simple and effective optimization for WebGL uniforms.
