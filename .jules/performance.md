## Entry #1 — Reduce Allocations in Render Loop
**Finding:** `synthRender` allocates a new `[cols, rows]` array every frame for the `resolution` uniform.
**Metric:** Measured via benchmark: ~321ms for 1M iterations (approx 0.3μs/frame). Allocation count reduced by 1,000,000 objects per 1M frames (2M if feedback enabled).
**Optimization:** Added `resolutionCache` to `LayerSynthState` to reuse the array.
**Result:** Time performance is similar (within measurement noise), but GC pressure is significantly reduced by eliminating a per-frame allocation in the hottest path.
**Learning:** Simple array literals in hot paths are allocations; reuse persistent objects where possible.
