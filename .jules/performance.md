# Performance Journal

## Entry #1 — Resolution Uniform Allocation
**Finding:** The `resolution` uniform array (`[cols, rows]`) was being allocated 1-2 times per frame in `synthRender`, creating unnecessary GC pressure in the hot path.
**Metric:** Micro-benchmark simulating escaped array allocation vs reuse in a tight loop (5M iterations).
**Optimization:** Added `resolutionCache` to `LayerSynthState` to store the `[cols, rows]` tuple and reuse it across frames, updating values in-place.
**Result:** ~43% reduction in execution time in the micro-benchmark (191ms -> 108ms) and elimination of per-frame array allocation for this uniform.
**Learning:** Even small per-frame allocations in WebGL rendering loops can be optimized by caching mutable arrays on the state object.
