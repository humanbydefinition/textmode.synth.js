---
title: src
description: src function API reference for textmode.js.
category: Functions
api: true
kind: Function
lastModified: 2026-02-06
---

[textmode.synth.js](../index.md) / src

# Function: src()

```ts
function src(source?): SynthSource;
```

Sample a source for synth compositions.

This is the core of feedback loops and source sampling - it reads from various sources,
enabling effects like trails, motion blur, image processing, and recursive patterns.

**Three modes of operation:**

1. **Self-feedback** (`src()` with no arguments): Samples from the previous frame
   - Context-aware: automatically samples the appropriate texture based on compilation context
   - Inside `char(...)` → samples previous frame's character data
   - Inside `charColor(...)` → samples previous frame's primary color
   - Inside `cellColor(...)` → samples previous frame's cell color

2. **Cross-layer sampling** (`src(layer)`): Samples from another layer's output
   - Enables hydra-style multi-output compositions
   - Context-aware based on current compilation target

3. **TextmodeSource sampling** (`src(image)` or `src(video)`): Samples from loaded media
   - Works with TextmodeImage and TextmodeVideo loaded via `t.loadImage()` or `t.loadVideo()`
   - Samples directly from the source texture

Equivalent to hydra's `src(o0)`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source?` | \| `TextmodeLayer` \| `TextmodeSource` \| () => `TextmodeLayer` \| `TextmodeSource` \| `undefined` | Optional source to sample from: TextmodeLayer for cross-layer, or TextmodeImage/TextmodeVideo for media |

## Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource that samples the specified source or self

## Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  src()
    .scale(1.01)
    .blend(osc(6, 0.1, 1.2), 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
