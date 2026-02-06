---
title: gradient
description: gradient function API reference for textmode.js.
category: Functions
api: true
kind: Function
lastModified: 2026-02-06
---

[textmode.synth.js](../index.md) / gradient

# Function: gradient()

```ts
function gradient(speed?): SynthSource;
```

Generate a rotating radial gradient.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `speed?` | `number` \| `number`[] \| (`ctx`) => `number` | Rotation speed (default: 0.0) |

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
  gradient(0.2)
    .kaleid(5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
