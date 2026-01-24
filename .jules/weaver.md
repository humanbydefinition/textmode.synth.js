## 2025-05-25 - Argument Resolution Duplication
**Pattern:** Argument resolution logic (`args[i] ?? input.default`) was repeated 4 times across `TransformFactory`.
**Risk:** Inconsistent default value handling if one call site is updated but others are missed.
**Guidance:** Centralize repetitive array mapping logic into helper functions, especially when it involves fallback values or default resolution.

## 2025-05-26 - GLSL Logic Duplication
**Pattern:** Complex `smoothstep` thresholding logic with magic epsilon (`0.0000001`) repeated in multiple transforms (`luma`, `thresh`).
**Risk:** Drift in epsilon value or logic could cause inconsistent behavior for edge cases (zero-width range).
**Guidance:** Extract repeated GLSL math patterns into `UTILITY_FUNCTIONS` in `GLSLGenerator.ts` rather than duplicating the string literals in transform definitions.

## 2025-10-24 - Channel Usage Tracking Duplication
**Pattern:** Redundant control flow for mapping `TextureChannel` (from `CompilationTarget`) to boolean usage flags (`usesChar`, `usesCellColor`, `usesCharColor`) across `ExternalLayerManager` and `FeedbackTracker`.
**Risk:** Divergence in how channels are mapped to usage states, leading to potential shader compilation errors or missing uniforms.
**Guidance:** Use the shared `ChannelUsage` interface and `updateChannelUsage` helper in `src/compiler/channels.ts` to manage this mapping consistently.
