## Entry #1 — Phantom Parameters in Documentation
**Finding:** Documentation examples and tables included parameters that do not exist in the implementation (`charCount` for `char()`, and an unnamed 4th argument for `osc()`).
**Pattern:** Broken Examples / API Drift
**Action:** Removed non-existent parameters from `README.md` table, `src/api/sources.ts` examples, and `src/core/ISynthSource.ts` examples. Updated generated documentation.
**Learning:** Verify function signatures in implementation vs examples. Copy-paste errors or outdated API references can persist in examples even if code compiles (when using `any` or loose typing, though here TypeScript would catch it if compiled).
