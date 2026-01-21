## 2025-05-25 - Argument Resolution Duplication
**Pattern:** Argument resolution logic (`args[i] ?? input.default`) was repeated 4 times across `TransformFactory`.
**Risk:** Inconsistent default value handling if one call site is updated but others are missed.
**Guidance:** Centralize repetitive array mapping logic into helper functions, especially when it involves fallback values or default resolution.
