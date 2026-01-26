# Code Deduplication Journal (Critical Learnings Only)

<!-- 
This file is maintained by the Code Deduplication Agent (🧵 Weaver).
DO NOT write routine refactoring notes here.
ONLY document:
- Duplication patterns specific to this codebase
- Performance implications of a deduplication
- Failed refactoring attempts with lessons
- Tree-shaking discoveries
- Bundle size impact measurements

ENTRY FORMAT:
## Entry #[N] — [Title]
**Pattern:** [What duplication was found]
**Risk:** [Performance/functionality risk assessment]
**Guidance:** [How to deduplicate safely, or why not to]
-->

## Entry #1 — Centralized Texture Channel Constants
**Pattern:** Hardcoded string literals for texture uniform names (`prevCharColorBuffer`, etc.) were repeated across compiler, runtime, and transform definitions.
**Risk:** Low risk. Runtime performance is unaffected (property access vs literal).
**Action:** Moved `TextureChannel` type to `src/core/types.ts` and created `src/core/constants.ts` for `CHANNEL_SAMPLERS`.
**Learning:** Centralizing shared constants used in both compiler (build-time logic) and runtime (render loop) requires a bottom-level module (like `core`) to avoid circular dependencies.

## Entry #2 — Unified CompilationTarget Type
**Pattern:** `CompilationTarget` type in compiler duplicated the union members of `TextureChannel` type from core.
**Risk:** Zero risk (compile-time only).
**Action:** Refactored `CompilationTarget` to use `TextureChannel | 'main'`, enforcing consistency.
**Learning:** Type aliases that extend other types (e.g., `Type A = Type B | 'extra'`) are safe candidates for deduplication that improves maintainability without affecting bundle size.
