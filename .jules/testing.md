# Test Coverage Journal

## Entry #1 — CharacterResolver Coverage
**Finding:** `CharacterResolver` in `src/utils` lacked unit tests despite having caching logic.
**Pattern:** missing coverage
**Action:** Created `tests/utils/CharacterResolver.test.ts` covering `resolve`, `invalidate`, caching, and fallbacks.
**Learning:** Mocking `TextmodeFont` interface with `as unknown as TextmodeFont` allows testing logic without importing heavy dependencies or full implementation.
