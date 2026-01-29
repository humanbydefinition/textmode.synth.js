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

## Entry #3 — Plugin State Leaks on Uninstall
**Resource:** Plugin State Object and Async Resources (Shader/Buffers)
**Pattern:** Zombie State / Incomplete Cleanup
**Cause:** `uninstall` method disposed internal resources but failed to remove the state object from the layer. This allowed `synthRender` hooks (which remain registered) to continue accessing the state, and potentially leaked async-created resources because `isDisposed` was not set.
**Fix:** Updated `uninstall` to set `state.isDisposed = true` and explicitly remove the state from the layer using `layer.setPluginState(PLUGIN_NAME, undefined)`.
**Learning:** When tearing down a plugin, ensure the state object is both neutralized (flags) and detached (removed from host) to prevent zombie processes.
