## 2025-05-25 - Argument Resolution Duplication
**Pattern:** Argument resolution logic (`args[i] ?? input.default`) was repeated 4 times across `TransformFactory`.
**Risk:** Inconsistent default value handling if one call site is updated but others are missed.
**Guidance:** Centralize repetitive array mapping logic into helper functions, especially when it involves fallback values or default resolution.

## 2025-05-26 - GLSL Logic Duplication
**Pattern:** Complex `smoothstep` thresholding logic with magic epsilon (`0.0000001`) repeated in multiple transforms (`luma`, `thresh`).
**Risk:** Drift in epsilon value or logic could cause inconsistent behavior for edge cases (zero-width range).
**Guidance:** Extract repeated GLSL math patterns into `UTILITY_FUNCTIONS` in `GLSLGenerator.ts` rather than duplicating the string literals in transform definitions.
