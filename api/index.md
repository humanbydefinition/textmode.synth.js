---
title: textmode.synth.js
description: A derivative work of hydra-synth by Olivia Jack, adapted for the textmode.js ecosystem, providing a visual synthesis system for procedural generation of char...
category: API Reference
api: true
kind: Project
lastModified: 2026-02-06
---

# textmode.synth.js

A derivative work of [hydra-synth](https://github.com/hydra-synth/hydra-synth) by [Olivia Jack](https://github.com/ojack),
adapted for the [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem, providing
a visual synthesis system for procedural generation of characters, colors,
and visual effects through method chaining.

## Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

const synth = noise(8)
  .rotate(0.2)
  .kaleid(5)
  .charColor(osc(6, 0.1, 1.2))
  .cellColor(osc(6, 0.1, 1.2).invert())
  .charMap('@#%*+=-:. ');

t.layers.base.synth(synth);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

## Classes

| Class | Description |
| ------ | ------ |
| [SynthSource](classes/SynthSource.md) | A chainable synthesis source that accumulates transforms to be compiled into a shader. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [SynthContext](interfaces/SynthContext.md) | Context passed to dynamic parameter functions during rendering. |
| [ModulatedArray](interfaces/ModulatedArray.md) | Extended array interface with modulation methods. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [SynthParameterValue](type-aliases/SynthParameterValue.md) | Dynamic parameter value types supported by the synth system. |
| [EasingFunction](type-aliases/EasingFunction.md) | Easing functions from https://gist.github.com/gre/1650294 |
| [DynamicErrorCallback](type-aliases/DynamicErrorCallback.md) | Callback signature for dynamic parameter evaluation errors. Live coding environments can use this to display errors without interrupting rendering. |

## Variables

| Variable | Description |
| ------ | ------ |
| [SynthPlugin](variables/SynthPlugin.md) | The `textmode.synth.js` plugin to install. |

## Functions

| Function | Description |
| ------ | ------ |
| [cellColor](functions/cellColor.md) | Create a synth source with cell background color defined. |
| [char](functions/char.md) | Create a character source from any color/pattern source. |
| [charColor](functions/charColor.md) | Create a synth source with character foreground color defined. |
| [gradient](functions/gradient.md) | Generate a rotating radial gradient. |
| [noise](functions/noise.md) | Generate Perlin noise patterns. |
| [plasma](functions/plasma.md) | Generate plasma-like sine field patterns. |
| [moire](functions/moire.md) | Generate moire interference patterns. |
| [osc](functions/osc.md) | Generate oscillating patterns using sine waves. |
| [paint](functions/paint.md) | Create a synth source with both character and cell colors defined. |
| [shape](functions/shape.md) | Generate geometric shapes (polygons). |
| [solid](functions/solid.md) | Generate a solid grayscale color. |
| [src](functions/src.md) | Sample a source for synth compositions. |
| [voronoi](functions/voronoi.md) | Generate voronoi patterns. |
| [setGlobalErrorCallback](functions/setGlobalErrorCallback.md) | Set a global error callback for dynamic parameter evaluation errors. |
