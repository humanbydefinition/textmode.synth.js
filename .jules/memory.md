## Entry #1 — Ping-Pong Buffer Management in Synth Render
**Resource:** WebGL Framebuffers (Ping-Pong buffers for feedback)
**Pattern:** Missing Disposal / Missing Resize Logic
**Cause:** Framebuffers were created when feedback was enabled but never disposed when feedback was disabled or when grid dimensions changed.
**Fix:** Added logic in `synthRender` to check `pingPongDimensions` against current grid size and `usesAnyFeedback` flag. Disposes buffers if mismatch or unused.
**Learning:** Always track dimensions of resizing resources to trigger recreation, and dispose of resources immediately when a feature is disabled dynamically.

## Entry #2 — Async Shader Compilation Race Condition
**Resource:** WebGL Shader (Filter Shader)
**Pattern:** Race Condition / Use-After-Free (Zombie Resource)
**Cause:** Asynchronous shader creation (`createFilterShader`) could complete *after* the layer was disposed. The disposal logic ran first, cleaning up old resources, but the new shader arrived later and was assigned to a dead state, becoming unreachable and undeletable.
**Fix:** Added `isDisposed` flag to `LayerSynthState`. Checked this flag immediately after the async creation returns. If true, the new resource is immediately disposed.
**Learning:** When creating resources asynchronously, always verify the owner's liveness after the operation completes and before assigning the resource.
