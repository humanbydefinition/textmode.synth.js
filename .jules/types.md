# Warden Journal 🔒

## Entry #1 — Enforcing Textmodifier Types
**Pattern:** Explicit `any` in public API parameters (`synthRender` and extensions).
**Challenge:** `Textmodifier` is an external class from `textmode.js` that is also dynamically augmented via module augmentation in `src/augmentations/textmode.ts`. Using strict types initially raised concerns about missing properties (like `bpm`) that are added at runtime/compile-time via these augmentations.
**Solution:** Imported `Textmodifier` directly from `textmode.js`. Verified that `npm run build` passes, confirming that TypeScript correctly picks up the module augmentations defined in `src/augmentations/textmode.ts` and merges them with the imported class/interface.
**Learning:** When working with external libraries that are locally augmented, trust the compiler's module merging capabilities. Explicitly typing the extended object is safer and works seamlessly if the augmentations are correctly set up.

## Entry #2 — Removing `any` cast in SynthPlugin
**Pattern:** Explicit `any` cast to delete a property (`delete (_textmodifier as any).bpm`).
**Challenge:** The `bpm` property is added via module augmentation as a method. Deleting it requires the type to have the property as optional. `TextmodePlugin` uninstall hook receives `Textmodifier` where `bpm` is required (via augmentation).
**Solution:** Cast to `Partial<Textmodifier>`. This accurately represents "I am treating this object as having optional properties for the purpose of deletion", satisfying TypeScript's requirement that the operand of `delete` must be optional, without resorting to `any`.
**Learning:** `Partial<T>` is a type-safe alternative to `any` when needing to delete properties that are otherwise required in the interface `T`.

## Entry #3 — Removing Unsafe Casts in TransformFactory
**Pattern:** Double cast `(obj as unknown as Record<string, unknown>)` to perform dynamic property assignment.
**Challenge:** `SynthSourcePrototype` is an interface used for dynamic method injection but lacked an index signature, forcing the use of unsafe casts to "break" the type system to allow assignment of arbitrary methods.
**Solution:** Added `[key: string]: unknown` to `SynthSourcePrototype`. This accurately reflects the runtime reality that this object acts as a dynamic container for injected transform methods, allowing us to remove the unsafe double casts while keeping the base interface contract intact.
**Learning:** If an object is intended to be dynamic (like a prototype receiving plugins), explicitly typing it with an index signature is safer and more honest than using `as unknown` to bypass type checks.

## Entry #4 — Strengthening SynthSourcePrototype
**Pattern:** Loose interface definition (`[key: string]: unknown`) and `unknown` return types.
**Challenge:** `SynthSourcePrototype` was defined as a loose interface to avoid circular dependencies, resulting in weak types (`unknown`) for core methods like `addTransform` and dynamic method injection.
**Solution:** Refactored `SynthSourcePrototype` to be a type alias `SynthSource & { [key: string]: unknown }`, utilizing the existing `SynthSource` type (which includes `ISynthSource` via declaration merging). This provides full type safety for the prototype while maintaining flexibility for dynamic injection.
**Learning:** You can often avoid loose "mock" interfaces by using `import type` and type aliases/intersection types, allowing you to use the real class type even in circular dependency scenarios without runtime cost.
