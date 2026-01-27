## Entry #1 — Phantom Parameters in Documentation
**Finding:** Documentation examples and tables included parameters that do not exist in the implementation (`charCount` for `char()`, and an unnamed 4th argument for `osc()`).
**Pattern:** Broken Examples / API Drift
**Action:** Removed non-existent parameters from `README.md` table, `src/api/sources.ts` examples, and `src/core/ISynthSource.ts` examples. Updated generated documentation.
**Learning:** Verify function signatures in implementation vs examples. Copy-paste errors or outdated API references can persist in examples even if code compiles (when using `any` or loose typing, though here TypeScript would catch it if compiled).

## Entry #2 — Missing Examples for Modulate Transforms
**Finding:** Several modulate transform methods (`modulateScale`, `modulateRotate`, etc.) in `ISynthSource` lacked usage examples, making them harder to understand compared to other documented methods.
**Pattern:** Missing example blocks
**Action:** Added `@example` blocks to `modulateScale`, `modulateRotate`, `modulateScrollX`, and `modulateScrollY` in `src/core/ISynthSource.ts`.
**Learning:** README often lists categories of functions (e.g., "Modulate"), but the individual interface methods might miss examples. Cross-reference README lists with interface docs.

## Entry #3 — Docstring Example Standards
**API:** Docstring Examples
**Issue:** Previous attempts to "fix" examples by adding explicit imports were incorrect.
**Fix:** Examples should assume a UMD environment where `textmode`, `SynthPlugin`, and synth functions are globally available.
**Pattern:**
```javascript
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8, // or 16
	plugins: [SynthPlugin]
});

// Create a synth program
t.layers.base.synth(
	voronoi()
		.color(0.9, 0.25, 0.15)
		.rotate(() => (t.secs % 360) / 2)
		.modulate([1, 1, 0, 1])
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

## Entry #4 — Missing Examples for Core Methods
**Finding:** Several core methods (`osc`, `noise`, `voronoi`, `shape`, `solid`, `thresh`, `shift`) in `ISynthSource` lacked usage examples.
**Pattern:** Missing example blocks
**Action:** Added `@example` blocks to `src/core/ISynthSource.ts` for these methods, using concise chain syntax consistent with existing interface examples.
**Learning:** `ISynthSource` interface documentation is the primary reference shown in IDEs. Even if standalone function exports have examples, the interface methods (used for chaining) need their own examples to provide immediate context during development.
