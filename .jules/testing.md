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
