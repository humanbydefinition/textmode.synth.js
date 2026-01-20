## 2025-05-23 - Array Prototype Pollution
**Finding:** Custom methods added to `Array.prototype` (fast, smooth, ease, etc.) were defined by direct assignment, making them enumerable in `for...in` loops.
**Implication:** This causes "prototype pollution" where these methods appear as keys in every array loop throughout the application, potentially breaking unrelated logic.
**Guidance:** Always use `Object.defineProperty` with `enumerable: false` when extending native prototypes.

## 2025-05-24 - Unsafe Math Helpers
**Finding:** The internal `map` helper function lacked protection against division-by-zero when input ranges were identical (`inMin === inMax`).
**Implication:** Operations like `fit(0, 1)` on arrays with identical values (e.g., `[5, 5, 5]`) silently produced `NaN` values, destabilizing the synthesis pipeline.
**Guidance:** Ensure all range-based math utilities handle zero-width domains gracefully (e.g., by returning a midpoint or default).
