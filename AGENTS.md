# Repository Guidelines

## Project Structure & Module Organization

This TypeScript library provides the synth engine for `textmode.js`. Source code lives in `src/`; public entry points are `src/index.ts` and `src/bootstrap.ts`. Runtime classes are in `src/core/`, compiler and GLSL code in `src/compiler/`, transforms in `src/transforms/`, lifecycle helpers in `src/lifecycle/`, plugin integration in `src/plugin/`, and shared helpers in `src/utils/`. Tests mirror these areas under `tests/`. Browser sketches live in `examples/`. Generated output belongs in `dist/` and `api/`; do not hand-edit it.

## Build, Test, and Development Commands

- `npm run dev`: start the Vite development server on port 5174.
- `npm run build`: create ESM/UMD bundles and TypeScript declarations.
- `npm run test`: run all Vitest projects once.
- `npm run test:unit` / `npm run test:integration`: run focused test groups.
- `npm run test:coverage`: run Vitest with V8 coverage.
- `npm run lint`: lint `src/**/*.{ts,js}` with ESLint.
- `npm run check`: run format, lint, type, API doc, test, and build checks.
- `npm run build:docs`: generate TypeDoc docs.

## Coding Style & Naming Conventions

Use ES modules and TypeScript. Prettier enforces tabs, semicolons, single quotes, ES5 trailing commas, and a 120-column print width. Run `npm run format` for broad formatting changes, or `npm run check:format` to verify only. Prefer explicit types at public boundaries. Classes and types use `PascalCase`, functions and variables use `camelCase`, and tests use `*.test.ts`. Keep barrel exports in existing `index.ts` files current.

## Testing Guidelines

Vitest runs in `jsdom` with globals enabled. Unit tests belong in `tests/{api,compiler,core,transforms,utils}/`; integration coverage belongs in `tests/{lifecycle,plugin}/`. Name tests after the module under test, for example `tests/compiler/UniformManager.test.ts`. Add tests for new transforms, compiler behavior, lifecycle behavior, and bug fixes. Use `npm run test:coverage` for shared runtime or compiler changes.

## Commit & Pull Request Guidelines

Commits follow Conventional Commits enforced by commitlint, for example `feat: add osc transform` or `fix: preserve feedback uniforms`. Allowed types include `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, and `revert`; keep headers under 100 characters. Pull requests should describe the change, list verification commands, link issues, and include screenshots or sketch notes for visual/example changes. Run `npm run check` before review when practical.