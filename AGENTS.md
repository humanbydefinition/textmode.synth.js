# AGENTS.md — textmode.synth.js

> **Ground-truth reference for AI coding agents working on this hydra-inspired synthesis add-on for textmode.js.**

---

## 1. Quick Context

**textmode.synth.js** is an add-on library that brings hydra-synth-style visual synthesis to textmode.js. It compiles method chains like `osc(10).rotate(0.1).kaleid(4)` into optimized GLSL shaders that drive the three-texture textmode rendering system (characters, foreground colors, background colors).

| Attribute | Value |
|-----------|-------|
| Language | TypeScript (strict mode) |
| Peer Dependency | textmode.js ≥0.8.5 |
| Build | Vite + Rollup |
| Test Runner | Vitest (jsdom) |
| Output | ESM + UMD bundles |

---

## 2. Core Directives

1. **Always Verify**: Run `npm run verify` before considering *any* task complete. This runs formatting, linting, build, and tests.
2. **Edit Source, Not Artifacts**: Never edit files in `dist/` or `api/` (generated docs). Trace back to `src/`.
3. **Strict Typing**: Use strict TypeScript. Avoid `any`. Use `unknown` with narrowing or specific types.
4. **Zero Runtime Deps**: This is a library. Do not add runtime dependencies. `textmode.js` is a peer dependency.
5. **Performance First**: We run in the render loop. Minimize allocations, avoid heavy math in JS (move to GLSL), and watch bundle size.

---

## 3. Architecture Overview

```text
src/
├── index.ts                 # Public exports
├── bootstrap.ts             # Side-effect initialization (runs on import)
├── api/                     # Public API functions (osc, noise, char, etc.)
├── core/                    # Core abstractions
│   ├── SynthSource.ts       # Chainable source class (the fluent API)
│   ├── SynthChain.ts        # Transform record accumulator
│   ├── types.ts             # Core type definitions
│   └── GlobalState.ts       # Global BPM state
├── compiler/                # GLSL shader generation
│   ├── SynthCompiler.ts     # Main compilation orchestrator
│   ├── GLSLGenerator.ts     # GLSL assembly
│   ├── TransformCodeGenerator.ts
│   ├── UniformManager.ts    # Shader uniform management
│   ├── FeedbackTracker.ts   # Feedback texture tracking
│   └── ExternalLayerManager.ts
├── transforms/              # Transform definitions
│   ├── TransformRegistry.ts # Singleton registry
│   ├── TransformDefinition.ts
│   ├── TransformFactory.ts  # Method injection
│   └── categories/          # Transform definitions by type
│       ├── sources.ts       # osc, noise, voronoi, gradient, shape, solid, src
│       ├── colors.ts        # brightness, contrast, invert, hue, saturate, etc.
│       ├── coordinates.ts   # rotate, scale, scroll, pixelate, repeat, kaleid
│       ├── combine.ts       # add, sub, mult, blend, diff, layer, mask
│       └── combineCoord.ts  # modulate, modulateScale, modulateRotate, etc.
├── extensions/              # textmode.js extension methods
│   ├── textmodelayer.ts     # layer.synth(), layer.clearSynth(), layer.bpm()
│   └── textmodifier.ts      # textmodifier.bpm()
├── lifecycle/               # Render loop integration
│   ├── synthRender.ts       # Pre-render hook (compiles & renders synth)
│   └── synthDispose.ts      # Cleanup on layer dispose
├── plugin/                  # Plugin system
│   └── SynthPlugin.ts       # Main plugin export
└── utils/                   # Utilities
    ├── ArrayUtils.ts        # Hydra-style array modulation (.fast(), .smooth(), .ease())
    ├── CharacterResolver.ts # Character mapping resolution
    └── SafeEvaluator.ts     # Error handling for live coding
```

---

## 4. Key Concepts

### Transform Types

| Type | Description | Examples |
|------|-------------|----------|
| `src` | Creates color from UV coords | `osc`, `noise`, `voronoi`, `shape`, `solid` |
| `coord` | Modifies UV before sampling | `rotate`, `scale`, `scroll`, `pixelate`, `kaleid` |
| `color` | Modifies color output | `brightness`, `contrast`, `invert`, `hue`, `saturate` |
| `combine` | Blends two color sources | `add`, `mult`, `blend`, `layer`, `mask` |
| `combineCoord` | Uses one source to modulate another's UVs | `modulate`, `modulateScale`, `modulateRotate` |

### Three-Texture System

We target three framebuffer attachments in textmode.js:

1. **Character**: Index (RG), flags, rotation.
2. **Foreground**: RGBA color.
3. **Background**: RGBA color.

### Declaration Merging

`SynthSource` uses TypeScript declaration merging to support dynamic method injection while maintaining strict typing.

- **Explicit Methods**: Defined in `SynthSource` class (e.g., `addTransform`).
- **Injected Methods**: Defined in `ISynthSource` interface in `src/core/ISynthSource.ts` (e.g., `kaleid`, `osc`).

---

## 5. Development Workflow

### Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server at http://localhost:5174 |
| `npm run build` | TypeScript + Vite production build |
| `npm run test:run` | Run tests once (preferred over `vitest`) |
| `npm run verify` | **Full CI check** (format, lint, build, test) |
| `npm run size` | Check bundle size limits |
| `npm run build:docs` | Rebuild API documentation |

### Verification

Always run `npm run verify`. If it fails, do not commit.

### Documentation

- **API Docs**: `src/api/sources.ts` and `src/core/ISynthSource.ts` are the sources of truth.
- **Examples**:
  - Use `textmode.create({ ... plugins: [SynthPlugin] })`.
  - Do not include imports in JSDoc examples unless necessary.
  - Assume global access for simple snippets (UMD style compatibility).

---

## 6. Testing Guidelines

### Strategy

- **Unit Tests**: Organize in `tests/` mirroring `src/` structure (e.g., `tests/core/SynthSource.test.ts`).
- **Environment**: JSDOM.
- **Running**: Use `npm run test:run`.

### Mocking

1. **textmode.js**: Requires deep mocking.
   - **WebGL2**: Mock `depthMask`, `clearDepth`, `pixelStorei`, `blendFuncSeparate`.
   - **2D Context**: Mock `beginPath`.
   - **Layer**: Use `TextmodeLayer` type from `textmode.js/layering`.
2. **Singletons**: `TransformRegistry` persists.
   - **Action**: Call `TransformRegistry.clear()` in `beforeEach`/`afterEach`.
3. **SynthSource**:
   - **Action**: In transform tests, define a local mock `SynthSource` and inject it via `setSynthSourceClass` to prevent prototype pollution.

### Resource Disposal

- Verify `dispose()` is called on WebGL resources (framebuffers, shaders).
- Mock objects should spy on `dispose`.

---

## 7. Coding Standards

### naming

- **Classes**: PascalCase (`SynthSource`)
- **Transforms**: camelCase (`osc`, `modulateScale`)
- **Internal**: `_` prefix (`_ensureSource`, `_compile`)

### Performance

- **Math**: Use `val - Math.floor(val)` instead of modulo for hot paths.
- **Allocations**: Prefer reusing `state.resolutionArray` or `state.staticUniformsAppliedTo` over new allocations in render loop.
- **GLSL**: Use optimized built-ins defined in `UTILITY_FUNCTIONS` (`src/compiler/GLSLGenerator.ts`).

### Plugin Lifecycle

- **Uninstall**: Must strictly clean up state.
  - `layer.setPluginState(PLUGIN_NAME, undefined)`
  - `state.isDisposed = true`
  - Dispose shaders and framebuffers.

---

## 8. Agent Decision Tree

```text
Task received
    │
    ├─ Is it a transform/GLSL feature?
    │   ├─ Definition: src/transforms/categories/
    │   ├─ Injection: src/transforms/TransformFactory.ts
    │   └─ GLSL: src/compiler/GLSLGenerator.ts
    │
    ├─ Is it a documentation task?
    │   ├─ Public API: src/api/
    │   ├─ Interfaces: src/core/ISynthSource.ts
    │   └─ Run: npm run build:docs
    │
    ├─ Is it a bug fix?
    │   ├─ Create test case in tests/
    │   ├─ Verify with npm run test:run
    │   └─ Check .jules/memory.md for similar issues
    │
    └─ Is it performance related?
        ├─ Check src/lifecycle/synthRender.ts
        ├─ Run npm run size
        └─ Log in .jules/performance.md
```

---

## 9. Common Pitfalls

1. **Race Conditions**: Async shader compilation in `synthRender`.
   - *Fix*: Check `state.isDisposed` after `await`.
2. **Singleton Pollution**: `TransformRegistry` leaking between tests.
   - *Fix*: Explicit `clear()`.
3. **Type Mismatches**: `TextmodeLayer` vs `ExternalLayerReference`.
   - *Fix*: Use `textmode.js/layering` types.
4. **Overloads**: `char(source)` vs `char(value)`.
   - *Fix*: Use `_ensureSource` and explicit union types in implementation.
