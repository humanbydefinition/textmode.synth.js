# AGENTS.md — textmode.synth.js

> Ground-truth reference for AI coding agents working on this hydra-inspired synthesis add-on for textmode.js.

---

## Quick Context

**textmode.synth.js** is an add-on library that brings hydra-synth-style visual synthesis to textmode.js. It compiles method chains like `osc(10).rotate(0.1).kaleid(4)` into optimized GLSL shaders that drive the three-texture textmode rendering system (characters, foreground colors, background colors).

| Attribute | Value |
|-----------|-------|
| Language | TypeScript (strict mode) |
| Peer Dependency | textmode.js ≥0.8.5 |
| Build | Vite + Rollup |
| Test Runner | Vitest (jsdom) |
| Output | ESM + UMD bundles |

---

## Verification Command

```bash
npm run verify
```

This runs: `format:check` → `lint:md` → `build` → `test:run`

**If this fails, do not create a PR.** Fix the issue or abort.

---

## Architecture Overview

```
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

## Key Concepts

### 1. Transform Types

Transforms are categorized by their input/output signatures:

| Type | Description | Examples |
|------|-------------|----------|
| `src` | Creates color from UV coords | `osc`, `noise`, `voronoi`, `shape`, `solid` |
| `coord` | Modifies UV before sampling | `rotate`, `scale`, `scroll`, `pixelate`, `kaleid` |
| `color` | Modifies color output | `brightness`, `contrast`, `invert`, `hue`, `saturate` |
| `combine` | Blends two color sources | `add`, `mult`, `blend`, `layer`, `mask` |
| `combineCoord` | Uses one source to modulate another's UVs | `modulate`, `modulateScale`, `modulateRotate` |

### 2. Compilation Pipeline

```
SynthSource chain
    ↓
SynthCompiler.compile()
    ↓
├── FeedbackTracker (detect src() usage)
├── ExternalLayerManager (cross-layer refs)
├── TransformCodeGenerator (GLSL per transform)
├── UniformManager (collect uniforms)
    ↓
GLSLGenerator.generateFragmentShader()
    ↓
MRT Fragment Shader (3 outputs: char, charColor, cellColor)
```

### 3. Three-Texture System

textmode.js renders to three framebuffer attachments:
- **Target 0**: Character data (index (RG), flags, rotation)
- **Target 1**: Foreground/character color (RGBA)
- **Target 2**: Cell background color (RGBA)

The synth compiler generates shaders that output to all three simultaneously.

### 4. Entry Point Functions

| Function | Purpose |
|----------|---------|
| `char(source)` | Drive character indices from a pattern |
| `charColor(source)` | Drive foreground color |
| `cellColor(source)` | Drive background color |
| `paint(source)` | Drive both foreground AND background (pixel art mode) |
| `osc()`, `noise()`, etc. | Source generators that start chains |

---

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server at http://localhost:5174 |
| `npm run build` | TypeScript + Vite production build |
| `npm run test:run` | Run tests once |
| `npm run verify` | **Full CI check** (format, lint, build, test) |
| `npm run format` | Auto-format with Prettier |
| `npm run size` | Check bundle size limits |

---

## Coding Conventions

### Naming

| Element | Convention | Example |
|---------|------------|---------|
| Classes | PascalCase | `SynthSource`, `TransformRegistry` |
| Transform definitions | camelCase | `osc`, `modulateScale` |
| Internal methods | `_` prefix | `_chain`, `_charMapping` |
| Types | PascalCase | `SynthContext`, `TransformInput` |

### Transform Definition Pattern

```typescript
// In src/transforms/categories/*.ts
import { defineTransform } from '../TransformDefinition';

export const myTransform = defineTransform({
  name: 'myTransform',
  type: 'color', // 'src' | 'coord' | 'color' | 'combine' | 'combineCoord'
  inputs: [
    { name: 'amount', type: 'float', default: 1.0 },
  ],
  glsl: `
    return vec4(_c0.rgb * amount, _c0.a);
  `,
  description: 'Description for docs',
});
```

### GLSL Conventions

- `_st` = UV coordinates (vec2)
- `_c0` = Current color (vec4) — for color/combine transforms
- `_c1` = Second source color (vec4) — for combine transforms
- `time` = Time in seconds (float)
- Built-in helpers: `_luminance()`, `_rgbToHsv()`, `_hsvToRgb()`, `_noise()`

---

## Common Tasks

### Adding a New Transform

1. Add definition in appropriate `src/transforms/categories/*.ts`
2. Export from `src/transforms/categories/index.ts`
3. It's automatically registered via `bootstrap.ts`
4. If it's a source type, export from `src/api/sources.ts` and `src/index.ts`

### Adding a New Source Generator

1. Define in `src/transforms/categories/sources.ts` with `type: 'src'`
2. Export from `src/api/sources.ts` with JSDoc documentation
3. Export from `src/index.ts`

### Modifying the Compiler

The compiler is modular. Key files:
- `SynthCompiler.ts` — Orchestration, chain traversal
- `GLSLGenerator.ts` — Final shader assembly
- `TransformCodeGenerator.ts` — Per-transform GLSL generation
- `UniformManager.ts` — Uniform declarations and tracking

---

## TypeScript Strict Mode

This project uses strict TypeScript. Watch for:

| Error | Fix |
|-------|-----|
| `TS6133` unused variable | Remove it or prefix with `_` |
| `TS2322` type mismatch | Fix the type or add proper cast |
| `noUnusedParameters` | Prefix unused params with `_` |

---

## Bundle Size Limits

| Bundle | Limit (gzip) | Limit (uncompressed) |
|--------|--------------|----------------------|
| ESM | 15 kB | 55 kB |
| UMD | 15 kB | 45 kB |

Run `npm run size` to check. If legitimate changes exceed limits, update `package.json` under `"size-limit"` with rationale in PR.

---

## Agent Decision Tree

```
Task received
    │
    ├─ Is it about transforms/GLSL?
    │   └─ Check src/transforms/categories/ and compiler/
    │
    ├─ Is it about the plugin/integration?
    │   └─ Check src/plugin/ and src/extensions/
    │
    ├─ Is it about rendering?
    │   └─ Check src/lifecycle/synthRender.ts
    │
    ├─ Is it about the API surface?
    │   └─ Check src/api/ and src/index.ts
    │
    └─ Is it about array modulation (.fast(), .ease())?
        └─ Check src/utils/ArrayUtils.ts
```

---

## Boundaries

### Always Do
- Run `npm run verify` before any PR
- Keep changes minimal and focused
- Follow existing patterns in the codebase
- Document public API with JSDoc

### Ask First
- Adding new peer dependencies
- Changing the compilation pipeline significantly
- Modifying the plugin lifecycle hooks

### Never Do
- Skip verification
- Break existing transform definitions
- Add runtime dependencies (this is a zero-runtime-dep library)
- Modify textmode.js types directly (use augmentations)

---

## Commit Convention

Uses [Conventional Commits](https://www.conventionalcommits.org/) with commitlint:

```
feat(compiler): add new blend mode support
fix(transforms): correct kaleid center offset
docs: update API examples
chore(deps): bump vite
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

---

## Relationship to textmode.js

This is an **add-on library**, not a fork:
- Depends on textmode.js as a peer dependency
- Extends via the plugin system (`SynthPlugin`)
- Uses type augmentations in `src/augmentations/` to add methods to textmode.js interfaces
- Does NOT modify textmode.js source

---

## Files to Read First

When starting work on this codebase:

1. [src/index.ts](src/index.ts) — Public exports
2. [src/core/SynthSource.ts](src/core/SynthSource.ts) — Core chainable class
3. [src/compiler/SynthCompiler.ts](src/compiler/SynthCompiler.ts) — How chains become shaders
4. [src/transforms/categories/sources.ts](src/transforms/categories/sources.ts) — Transform definition examples
5. [src/plugin/SynthPlugin.ts](src/plugin/SynthPlugin.ts) — Plugin integration

---

## Abort Conditions

Stop and do not create a PR if:
- `npm run verify` fails after attempted fixes
- Changes would break existing public API
- You're unsure about the impact on shader compilation
- The task requires modifying textmode.js core (wrong repo)
