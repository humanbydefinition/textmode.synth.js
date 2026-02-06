---
title: voronoi
description: voronoi function API reference for textmode.js.
category: Functions
api: true
kind: Function
lastModified: 2026-02-06
---

[textmode.synth.js](../index.md) / voronoi

# Function: voronoi()

```ts
function voronoi(
   scale?, 
   speed?, 
   blending?): SynthSource;
```

Generate voronoi patterns.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | `number` \| `number`[] \| (`ctx`) => `number` | Scale of voronoi cells (default: 5.0) |
| `speed?` | `number` \| `number`[] \| (`ctx`) => `number` | Animation speed (default: 0.3) |
| `blending?` | `number` \| `number`[] \| (`ctx`) => `number` | Blending between cell regions (default: 0.3) |

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
  voronoi(6, 0.4, 0.2)
    .color(0.8, 0.4, 1.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
