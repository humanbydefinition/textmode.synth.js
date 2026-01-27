## Entry #1 — Ping-Pong Buffer Management in Synth Render
**Resource:** WebGL Framebuffers (Ping-Pong buffers for feedback)
**Pattern:** Missing Disposal / Missing Resize Logic
**Cause:** Framebuffers were created when feedback was enabled but never disposed when feedback was disabled or when grid dimensions changed.
**Fix:** Added logic in `synthRender` to check `pingPongDimensions` against current grid size and `usesAnyFeedback` flag. Disposes buffers if mismatch or unused.
**Learning:** Always track dimensions of resizing resources to trigger recreation, and dispose of resources immediately when a feature is disabled dynamically.
