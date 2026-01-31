## Entry #1 — GLSLGenerator Coverage

- **Finding**: The `GLSLGenerator` module was a critical compiler component with zero test coverage, despite containing complex logic for shader assembly and character code generation.
- **Pattern**: Code generation logic is often skipped in testing because it's seen as "implementation details," but asserting on the generated output structure is a valid and necessary behavior test.
- **Action**: Created `tests/compiler/GLSLGenerator.test.ts` with 8 comprehensive tests covering all configuration branches (char mapping, feedback, external layers).
- **Learning**: Code generators can be effectively tested by treating them as pure functions and asserting that the output string contains expected components (declarations, function calls) based on input options.
