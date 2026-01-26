# API Consistency Journal

## Entry #1 — Missing Modulation Methods
**Finding:** Several modulation methods (`modulateRepeat`, `modulateRepeatX`, `modulateRepeatY`, `modulateHue`) existed in the runtime transform registry (`combineCoord.ts`) but were missing from the public `ISynthSource` interface.
**Pattern:** Missing Public API Definition (Hidden Implementation).
**Impact:** Users could not use these existing features in TypeScript projects, limiting the available creative tools and causing confusion if they saw them in source code but got type errors.
**Resolution:** Added the missing methods to `ISynthSource` interface and verified their existence via tests.
**Learning:** Always check that runtime-injected methods (via `TransformFactory`) have corresponding signatures in `ISynthSource`. The interface is the contract; implementation is dynamic.
