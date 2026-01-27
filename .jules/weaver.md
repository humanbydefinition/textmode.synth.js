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

## Entry #3 — Simplified Texture Channel Mapping
**Pattern:** Verbose `switch` statement for simple mapping logic.
**Risk:** Low risk. Logic is equivalent.
**Action:** Replaced `switch` with `if` statement in `src/compiler/channels.ts`.
**Learning:** For simple enumerations where most cases map to a default, a conditional check is significantly smaller than a switch statement in the final bundle.

## Entry #4 — Centralized GLSL Character Packing
**Pattern:** The bitwise packing logic for storing 16-bit character indices in RG channels was repeated in 3 places within compiler string templates.
**Risk:** Low. Pure logic refactor.
**Action:** Moved logic to `_packChar` and `_unpackChar` in `UTILITY_FUNCTIONS` (GLSLGenerator).
**Learning:** Centralizing repetitive GLSL logic into helper functions reduced uncompressed JS bundle size by ~20 bytes, improving maintainability of the binary data protocol.

## Entry #5 — Deduplicated Color Channel Transforms
**Pattern:** Explicit duplication of `r`, `g`, `b` transforms with identical input structures and GLSL patterns (only channel accessor differed).
**Risk:** Low. Runtime behavior is identical.
**Action:** Created `createChannelTransform` helper in `src/transforms/categories/colors.ts` to generate these definitions dynamically.
**Learning:** For repetitive transforms that only differ by a single property (like a vector component), a factory function significantly reduces source code lines and bundle size (reduced by ~300 bytes).

## Entry #6 — Centralized Dynamic Uniform Creation
**Pattern:** Duplicate logic for creating dynamic uniforms (GLSL value generation, uniform object creation, updater registration) in `UniformManager.ts` for both modulated arrays and function values.
**Risk:** Low. The logic was identical, just differing in how the updater function was created.
**Action:** Extracted `_createDynamicUniform` method in `UniformManager` to encapsulate the shared logic.
**Learning:** Even within a single class, complex object creation logic often gets copy-pasted. Extracting it simplifies the main logic flow and reduces bundle size slightly (~150 bytes source).
