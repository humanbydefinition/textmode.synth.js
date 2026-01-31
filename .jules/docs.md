# Documentation Journal

## Entry #1 — Chainable `src()` Misdocumentation

**Author:** Jules (Scribe)

### Finding
The `ISynthSource` interface documented the `src()` method as accepting an optional `layer` parameter for cross-layer sampling. However, the implementation (via `TransformFactory` injection) ignores all arguments passed to the injected method because the `src` transform definition has no inputs. Consequently, `someSource.src(layer)` would silently behave as `someSource.src()` (self-feedback), leading to user confusion.

### Action
Updated `src/core/ISynthSource.ts` to:
- Remove the `layer` parameter from the `src()` signature.
- Clarify in the docstring that the chainable `src()` method is strictly for self-feedback.
- Direct users to the standalone `src(layer)` function for cross-layer sampling.

### Learning
When using dynamic method injection (like `TransformFactory`), the TypeScript interface must strictly match the runtime capabilities of the injected functions. Documentation must explicitly distinguish between "standalone factory functions" and "chainable instance methods" when their behaviors diverge (as is the case with `src`).
