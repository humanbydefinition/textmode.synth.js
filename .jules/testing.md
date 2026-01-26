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
