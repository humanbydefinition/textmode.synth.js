# Memory Journal

## Entry #1 — Ping-Pong Buffer Leaks
**Resource:** WebGL Framebuffers (Ping-Pong buffers for feedback)
**Pattern:** Missing Disposal & Missing Resize Logic
**Cause:**
1. Buffers were not disposed when switching from a feedback-enabled synth to a non-feedback synth.
2. Buffers were not disposed/recreated when the grid size (resolution) changed, leading to incorrect rendering and wasted memory.
**Fix:** Added logic in `synthRender` to check for unused buffers (`!usesAnyFeedback`) and dimension mismatch using explicit `pingPongDimensions` tracking in state. Disposes old buffers before creating new ones or when no longer needed.
**Learning:** Always check if cached WebGL resources (like framebuffers) match the current context dimensions (resize events).
