## Entry #1 — Phantom Parameters in Documentation
**Finding:** Documentation examples and tables included parameters that do not exist in the implementation (`charCount` for `char()`, and an unnamed 4th argument for `osc()`).
**Pattern:** Broken Examples / API Drift
**Action:** Removed non-existent parameters from `README.md` table, `src/api/sources.ts` examples, and `src/core/ISynthSource.ts` examples. Updated generated documentation.
**Learning:** Verify function signatures in implementation vs examples. Copy-paste errors or outdated API references can persist in examples even if code compiles (when using `any` or loose typing, though here TypeScript would catch it if compiled).

## Entry #2 — Missing Examples for Modulate Transforms
**Finding:** Several modulate transform methods (`modulateScale`, `modulateRotate`, etc.) in `ISynthSource` lacked usage examples, making them harder to understand compared to other documented methods.
**Pattern:** Missing example blocks
**Action:** Added `@example` blocks to `modulateScale`, `modulateRotate`, `modulateScrollX`, and `modulateScrollY` in `src/core/ISynthSource.ts`.
**Learning:** README often lists categories of functions (e.g., "Modulate"), but the individual interface methods might miss examples. Cross-reference README lists with interface docs.

## Entry #3 — Incomplete Imports in Examples
**API:** `voronoi`
**Issue:** Example code used `textmode.create` and `SynthPlugin` without importing them, preventing the code from running if copy-pasted.
**Fix:** Added explicit imports for `textmode`, `SynthPlugin`, and `voronoi` to the example.
**Pattern:** Always include imports in examples using `textmode.create` or plugin registration.
