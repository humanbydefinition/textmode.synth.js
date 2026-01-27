## Entry #1 — Consistent Primitive Overloads for `char()`

**Finding:** The `char()` function and method only accepted `SynthSource`, whereas `charColor()`, `cellColor()`, and `paint()` accepted both `SynthSource` and primitive values (numbers/RGBA).
**Pattern:** Missing Overloads (Priority 2).
**Impact:** Users had to wrap scalar values in `solid()` when defining static character indices (e.g., `char(solid(0.5))`), creating friction and inconsistency compared to other color-setting methods.
**Resolution:**
1.  Updated `ISynthSource` interface with an overload for `char(r, g, b, a)`.
2.  Refactored `char` export in `src/api/sources.ts` from a `const` arrow function to a named `function` with overloads.
3.  Updated `SynthSource` implementation to use `_ensureSource` helper (consistent with other methods).
**Learning:** When creating wrapper methods that delegate to source generators (like `solid`), ensure they expose the same primitive overloads as the underlying generator to maintain API fluency.
