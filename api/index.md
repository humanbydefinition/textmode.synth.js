# textmode.synth.js

`textmode.synth.js` is an add-on library for `textmode.js` that provides a
visual synthesis system for procedural generation of characters, colors,
and visual effects through method chaining.

The system is inspired by the [hydra-synth](https://github.com/ojack/hydra-synth)
project by [ojack](https://github.com/ojack).

## Example

```ts
// Create textmode instance with SynthPlugin
const t = textmode.create({
  width: 800,
  height: 600,
  fontSize: 16,
  plugins: [SynthPlugin]
});

// Create a synth chain with procedural characters and colors
const synth = noise(10)
  .rotate(0.1)
  .scroll(0.1, 0)

  .charColor(osc(5).kaleid(4))
  .cellColor(osc(5).kaleid(4).invert())

  .charMap('@#%*+=-:. ');

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
| [cellColor](variables/cellColor.md) | Create a synth source with cell background color defined. |
| [char](variables/char.md) | Create a character source from any color/pattern source. |
| [charColor](variables/charColor.md) | Create a synth source with character foreground color defined. |
| [gradient](variables/gradient.md) | Generate a rotating radial gradient. |
| [noise](variables/noise.md) | Generate Perlin noise patterns. |
| [osc](variables/osc.md) | Generate oscillating patterns using sine waves. |
| [paint](variables/paint.md) | Create a synth source with both character and cell colors defined. |
| [shape](variables/shape.md) | Generate geometric shapes (polygons). |
| [solid](variables/solid.md) | Generate a solid color. |
| [src](variables/src.md) | Sample the previous frame's primary color output for feedback effects. This is the core of feedback loops - it reads from the previous frame's character foreground color, enabling effects like trails, motion blur, and recursive patterns. |
| [SynthPlugin](variables/SynthPlugin.md) | The `textmode.synth.js` plugin to install. |
| [voronoi](variables/voronoi.md) | Generate Voronoi (cellular) patterns. |
