# textmode.synth.js

A `hydra`-inspired chainable visual synthesis system for `textmode.js`.
Enables procedural generation of characters, colors, and visual effects
through method chaining.

## Example

```ts
import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, osc, solid } from 'textmode.synth.js';

// Create textmode instance with SynthPlugin
const t = textmode.create({
  width: 800,
  height: 600,
  fontSize: 16,
  plugins: [SynthPlugin]
});

// Create a synth chain with procedural characters and colors
const synth = charNoise(10)
  .charMap('@#%*+=-:. ')
  .charRotate(0.1)
  .charColor(osc(5).kaleid(4))
  .cellColor(solid(0, 0, 0, 0.5))
  .scroll(0.1, 0);

// Apply synth to the base layer
t.layers.base.synth(synth);
```

## Classes

| Class | Description |
| ------ | ------ |
| [SynthSource](classes/SynthSource.md) | A chainable synthesis source that accumulates transforms to be compiled into a shader. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [ModulatedArray](interfaces/ModulatedArray.md) | Extended array interface with modulation methods. |
| [SynthContext](interfaces/SynthContext.md) | Context passed to dynamic parameter functions during rendering. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [EasingFunction](type-aliases/EasingFunction.md) | Easing functions from https://gist.github.com/gre/1650294 |
| [SynthParameterValue](type-aliases/SynthParameterValue.md) | Dynamic parameter value types supported by the synth system. |
| [SynthTransformType](type-aliases/SynthTransformType.md) | Transform type categories determining how functions compose in the shader pipeline. |

## Variables

| Variable | Description |
| ------ | ------ |
| [charGradient](variables/charGradient.md) | Generate character indices using a rotating radial gradient. |
| [charNoise](variables/charNoise.md) | Generate character indices using Perlin noise. |
| [charOsc](variables/charOsc.md) | Generate character indices using oscillating sine waves. |
| [charShape](variables/charShape.md) | Generate character indices based on geometric shapes (polygons). |
| [charSolid](variables/charSolid.md) | Generate a solid character index across the entire canvas. |
| [charVoronoi](variables/charVoronoi.md) | Generate character indices using Voronoi (cellular) patterns. |
| [gradient](variables/gradient.md) | Generate a rotating radial gradient. |
| [noise](variables/noise.md) | Generate Perlin noise patterns. |
| [osc](variables/osc.md) | Generate oscillating patterns using sine waves. |
| [shape](variables/shape.md) | Generate geometric shapes (polygons). |
| [solid](variables/solid.md) | Generate a solid color. |
| [SynthPlugin](variables/SynthPlugin.md) | The `textmode.synth.js` plugin to install. |
| [voronoi](variables/voronoi.md) | Generate Voronoi (cellular) patterns. |
