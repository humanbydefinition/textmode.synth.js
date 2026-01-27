# API Consistency Journal

## Entry #1 — RGBA Overloads for Color Methods
**Finding:** `charColor`, `cellColor`, and `paint` only accepted `SynthSource` chains, forcing verbose `solid(r,g,b,a)` usage for simple colors, while `solid` and `color` accept RGBA values directly.
**Pattern:** Missing Overloads
**Impact:** Using solid colors required extra typing and knowledge of the `solid` generator.
**Resolution:** Added RGBA overloads to `charColor`, `cellColor`, and `paint` in both `ISynthSource` and `SynthSource`, internally wrapping values in a `solid` transform.
**Learning:** Core chaining methods that set colors should accept both `SynthSource` and primitive RGBA values for convenience.

## Entry #2 — Primitive Values for Combine Transforms
**Finding:** Combine transforms like `add`, `mult`, `modulate` required a `SynthSource` instance, preventing convenient usage of primitive values (e.g. `add(0.5)`). Users had to write `add(solid(0.5))`.
**Pattern:** Missing Overloads
**Impact:** Simple operations like adding a constant value or modulating by a scalar were verbose.
**Resolution:** Updated `ISynthSource` interface and `TransformFactory` to allow `SynthParameterValue` (numbers, arrays) as the first argument for `combine` and `combineCoord` transforms. These values are automatically wrapped in a `solid()` source.
**Learning:** Generic transform injection logic should handle value wrapping to provide consistent convenience across all generated methods.

## Entry #3 — Standardized scalar arguments for color and solid
**Finding:** Single-argument calls to `solid(val)` and `color(val)` (and by extension `add(val)`, `mult(val)`, etc.) were interpreted as specifying the Red channel only (Red=val, Green=0, Blue=0), resulting in a red tint/filter effect.
**Pattern:** Signature Drift / Unintuitive Default Behavior. Standard graphics/math APIs typically interpret a single scalar value as applying to all channels (grayscale/uniform scaling).
**Impact:** Users attempting to dim an image with `mult(0.5)` would unknowingly filter out green and blue channels. `solid(0.5)` produced dark red instead of gray.
**Resolution:** Updated `TransformFactory` to detect single-argument number inputs for `solid` and `color` and replicate the value to RGB channels (`solid(val)` → `solid(val, val, val, 1)`). Also updated primitive wrapping logic for combine transforms to wrap scalars as grayscale solids.
**Learning:** When mapping variable arguments to GLSL uniforms (r, g, b, a), verify that implicit defaults (like 0) do not violate domain-specific expectations (like scalar multiplication).
