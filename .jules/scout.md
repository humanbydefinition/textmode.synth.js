## 2025-05-23 - Array Prototype Pollution
**Finding:** Custom methods added to `Array.prototype` (fast, smooth, ease, etc.) were defined by direct assignment, making them enumerable in `for...in` loops.
**Implication:** This causes "prototype pollution" where these methods appear as keys in every array loop throughout the application, potentially breaking unrelated logic.
**Guidance:** Always use `Object.defineProperty` with `enumerable: false` when extending native prototypes.
