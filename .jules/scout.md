## 2025-05-23 - Array Prototype Pollution
**Finding:** Custom methods added to `Array.prototype` (fast, smooth, ease, etc.) were defined by direct assignment, making them enumerable in `for...in` loops.
**Implication:** This causes "prototype pollution" where these methods appear as keys in every array loop throughout the application, potentially breaking unrelated logic.
**Guidance:** Always use `Object.defineProperty` with `enumerable: false` when extending native prototypes.

## 2025-05-24 - Duplicated Type Definitions in Bootstrap
**Finding:** The `SynthSource` class type and prototype injection in `src/bootstrap.ts` used inline type definitions that duplicated `SynthSourcePrototype`.
**Implication:** Changes to the core `SynthSourcePrototype` interface would not be automatically reflected in the bootstrap logic, leading to potential desynchronization.
**Guidance:** Import and use the canonical `SynthSourcePrototype` interface for type assertions in dynamic injection logic.
