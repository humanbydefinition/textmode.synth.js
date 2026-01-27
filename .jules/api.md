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
