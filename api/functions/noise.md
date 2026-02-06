---
title: noise
description: noise function API reference for textmode.js.
category: Functions
api: true
kind: Function
lastModified: 2026-02-06
---

[textmode.synth.js](../index.md) / noise

# Function: noise()

```ts
function noise(scale?, offset?): SynthSource;
```

Generate Perlin noise patterns.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | `number` \| `number`[] \| (`ctx`) => `number` | Scale of the noise pattern (default: 10.0) |
| `offset?` | `number` \| `number`[] \| (`ctx`) => `number` | Offset in noise space (default: 0.1) |

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
  noise(10, 0.1)
    .color(0.2, 0.6, 1.0)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
