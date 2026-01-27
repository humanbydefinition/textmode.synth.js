## Entry #1 — Standardized scalar arguments for color and solid
**Finding:** Single-argument calls to `solid(val)` and `color(val)` (and by extension `add(val)`, `mult(val)`, etc.) were interpreted as specifying the Red channel only (Red=val, Green=0, Blue=0), resulting in a red tint/filter effect.
**Pattern:** Signature Drift / Unintuitive Default Behavior. Standard graphics/math APIs typically interpret a single scalar value as applying to all channels (grayscale/uniform scaling).
**Impact:** Users attempting to dim an image with `mult(0.5)` would unknowingly filter out green and blue channels. `solid(0.5)` produced dark red instead of gray.
**Resolution:** Updated `TransformFactory` to detect single-argument number inputs for `solid` and `color` and replicate the value to RGB channels (`solid(val)` → `solid(val, val, val, 1)`). Also updated primitive wrapping logic for combine transforms to wrap scalars as grayscale solids.
**Learning:** When mapping variable arguments to GLSL uniforms (r, g, b, a), verify that implicit defaults (like 0) do not violate domain-specific expectations (like scalar multiplication).
