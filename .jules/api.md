# API Consistency Journal

## Entry #1 — RGBA Overloads for Color Methods
**Finding:** `charColor`, `cellColor`, and `paint` only accepted `SynthSource` chains, forcing verbose `solid(r,g,b,a)` usage for simple colors, while `solid` and `color` accept RGBA values directly.
**Pattern:** Missing Overloads
**Impact:** Using solid colors required extra typing and knowledge of the `solid` generator.
**Resolution:** Added RGBA overloads to `charColor`, `cellColor`, and `paint` in both `ISynthSource` and `SynthSource`, internally wrapping values in a `solid` transform.
**Learning:** Core chaining methods that set colors should accept both `SynthSource` and primitive RGBA values for convenience.
