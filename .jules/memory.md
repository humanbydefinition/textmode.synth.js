## Entry #1 — WebGL Framebuffer Leak on Resize/Feedback Toggle
**Resource:** WebGL Framebuffers (ping-pong buffers)
**Pattern:** Missing Disposal (Native Resources)
**Cause:** `synthRender` created buffers when needed but never checked if they were stale (wrong size) or no longer needed (feedback disabled), leading to accumulated VRAM usage or incorrect rendering.
**Fix:** Added explicit lifecycle check in `synthRender` to dispose buffers when grid dimensions change or feedback is disabled. Added `pingPongDimensions` to state to track size.
**Learning:** Always track the parameters used to create a native resource (like dimensions) alongside the resource itself to detect invalidation requirements.
