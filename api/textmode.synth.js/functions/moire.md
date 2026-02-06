---
title: moire
description: moire function API reference for textmode.js.
category: Functions
api: true
kind: Function
lastModified: 2026-02-06
---

[textmode.synth.js](../index.md) / moire

# Function: moire()

```ts
function moire(
   freqA?, 
   freqB?, 
   angleA?, 
   angleB?, 
   speed?, 
   phase?): SynthSource;
```

Generate moire interference patterns.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `freqA?` | `number` \| `number`[] \| (`ctx`) => `number` | Frequency of first grating (default: 20.0) |
| `freqB?` | `number` \| `number`[] \| (`ctx`) => `number` | Frequency of second grating (default: 21.0) |
| `angleA?` | `number` \| `number`[] \| (`ctx`) => `number` | Angle of first grating in radians (default: 0.0) |
| `angleB?` | `number` \| `number`[] \| (`ctx`) => `number` | Angle of second grating in radians (default: 1.5708) |
| `speed?` | `number` \| `number`[] \| (`ctx`) => `number` | Animation speed (default: 0.1) |
| `phase?` | `number` \| `number`[] \| (`ctx`) => `number` | Phase offset (default: 0.0) |

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
  moire(14, 15, 0.2, 1.2, 0.2, 0.1)
    .color(0.7, 0.5, 1.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
