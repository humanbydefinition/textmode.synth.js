---
title: char
description: char function API reference for textmode.js.
category: Functions
api: true
kind: Function
lastModified: 2026-02-06
---

[textmode.synth.js](../index.md) / char

# Function: char()

```ts
function char(source): SynthSource;
```

Create a character source from any color/pattern source.

This function converts any pattern (like `osc()`, `noise()`, `voronoi()`) into
character indices. The pattern's luminance or color values are mapped to character indices.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`SynthSource`](../classes/SynthSource.md) | A SynthSource producing color values that will be mapped to characters |

## Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource configured for character generation

## Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  char(osc(6, 0.1, 1.2))
    .charMap('@#%*+=-:. ')
    .charColor(osc(12, 0.05, 0.2))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
