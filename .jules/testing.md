# Test Coverage Journal

## Entry #1 — CharacterResolver Coverage
**Finding:** `CharacterResolver` in `src/utils` lacked unit tests despite having caching logic.
**Pattern:** missing coverage
**Action:** Created `tests/utils/CharacterResolver.test.ts` covering `resolve`, `invalidate`, caching, and fallbacks.
**Learning:** Mocking `TextmodeFont` interface with `as unknown as TextmodeFont` allows testing logic without importing heavy dependencies or full implementation.

## Entry #2 — ArrayUtils Coverage
**Finding:** `ArrayUtils` in `src/utils` lacked unit tests, specifically for Hydra-style array modulation.
**Pattern:** missing coverage
**Action:** Created `tests/utils/ArrayUtils.test.ts` covering prototype extension, modulation methods, and value interpolation logic.
**Learning:** `ArrayUtils.smooth(1)` centers the transition around integer indices, meaning the midpoint of transition happens at `index=integer`, not `index=integer+0.5`.

## Entry #3 — collectExternalLayerRefs Coverage
**Finding:** `collectExternalLayerRefs` in `src/utils` lacked tests despite being a critical recursive utility.
**Pattern:** missing coverage
**Action:** Created `tests/utils/collectExternalLayerRefs.test.ts` covering direct references, nested sources, and property sources.
**Learning:** `SynthSource` can be instantiated directly in tests without `bootstrap.ts` if only data properties are being tested, avoiding complex dependency injection setup.

## Entry #4 — TransformRegistry Coverage
**Finding:** `TransformRegistry` in `src/transforms` was a core singleton completely lacking tests.
**Pattern:** missing coverage
**Action:** Created `tests/transforms/TransformRegistry.test.ts` covering all public methods including caching and type filtering.
**Learning:** Singletons like `transformRegistry` need careful `beforeEach`/`afterEach` cleanup (`clear()`) to prevent state pollution between tests.

## Entry #5 — TransformFactory Coverage
**Finding:** `TransformFactory` in `src/transforms` handles critical dynamic method injection but had no tests.
**Pattern:** missing coverage
**Action:** Created `tests/transforms/TransformFactory.test.ts` covering `injectMethods`, `generateStandaloneFunctions`, and `addTransform`.
**Learning:** Testing singletons that modify prototypes requires careful cleanup and using fresh mock classes in `beforeEach` to avoid prototype pollution between tests.

## Entry #6 — Compiler Channel Utilities Coverage
**Finding:** `src/compiler/channels.ts` had no unit tests despite containing critical pure logic for channel mapping.
**Pattern:** missing coverage
**Action:** Created `tests/compiler/channels.test.ts` covering `getTextureChannel` and `updateChannelUsage` for all compilation targets.
**Learning:** Pure functions like those in `channels.ts` are high-value/low-cost targets for coverage as they require no complex mocking or state management.

## Entry #7 — FeedbackTracker Coverage
**Finding:** `FeedbackTracker` in `src/compiler` was a stateful class critical for compiling feedback loops but had no tests.
**Pattern:** missing coverage
**Action:** Created `tests/compiler/FeedbackTracker.test.ts` covering state tracking, accumulation, and resetting behavior.
**Learning:** State wrappers around pure logic (like `FeedbackTracker` around `channels.ts`) are excellent test candidates because they isolate state management bugs from logic errors.
