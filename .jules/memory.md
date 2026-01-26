# Memory Journal

## Entry #1 — Ping-Pong Framebuffer Leak in synthRender
**Resource:** WebGL Framebuffers (Ping-Pong buffers for feedback)
**Pattern:** Missing Disposal / Unbounded Resource Growth (on resize)
**Cause:** `synthRender` created framebuffers when feedback was enabled but never disposed of them when feedback was disabled or when the grid was resized.
**Fix:** Added `pingPongDimensions` to `LayerSynthState` to track buffer size. Implemented logic in `synthRender` to dispose buffers if dimensions change or if feedback is no longer used.
**Learning:** Always track dimensions of size-dependent resources and verify cleanup when state toggles (e.g. feedback on/off).
