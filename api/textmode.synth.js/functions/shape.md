---
title: shape
description: shape function API reference for textmode.js.
category: Functions
api: true
kind: Function
lastModified: 2026-02-06
---

[textmode.synth.js](../index.md) / shape

# Function: shape()

```ts
function shape(
   sides?, 
   radius?, 
   smoothing?): SynthSource;
```

Generate geometric shapes (polygons).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sides?` | `number` \| `number`[] \| (`ctx`) => `number` | Number of sides (default: 3) |
| `radius?` | `number` \| `number`[] \| (`ctx`) => `number` | Radius of the shape (default: 0.3) |
| `smoothing?` | `number` \| `number`[] \| (`ctx`) => `number` | Edge smoothing amount (default: 0.01) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(6, 0.35, 0.02)
    .rotate(() => t.secs)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
