# textmode.synth.js

`textmode.synth.js` is a derivative work of [hydra-synth](https://github.com/hydra-synth/hydra-synth) by [Olivia Jack](https://github.com/olivia-jack), adapted for the [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem.

It provides a `hydra`-inspired chainable visual synthesis system for `textmode.js`, enabling you to create procedural ASCII/text animations with simple, expressive code.

## Features

- 🎨 **Procedural generation**: Generate characters, colors, and patterns using oscillators, noise, voronoi, and more
- 🔗 **Method chaining**: Hydra-style fluent API for building complex visual effects
- 🎯 **Three-texture system**: Independent control over characters, character colors, and cell backgrounds
- ⚡ **WebGL Powered**: Compiled to optimized GLSL shaders for real-time performance
- 🔄 **Feedback loops**: Create trails, motion blur, and recursive patterns
- 📦 **Compositional API**: Start with any aspect (char, color, background) and build from there

## Installation

```bash
npm install textmode.synth.js
```

## Quick Start

```javascript
import { textmode } from 'textmode.js';
import { SynthPlugin, char, osc, noise, solid } from 'textmode.synth.js';

const t = textmode.create({
  width: 800,
  height: 600,
  fontSize: 12,
  plugins: [SynthPlugin]
});

// Create a simple animated pattern
const charChain = osc(1, -0.1, 0.5).kaleid(50);
const colorChain = osc(25, -0.1, 0.5).kaleid(50);

t.layers.base.synth(
  char(charChain)
		.charMap('@#%*+=-:. ')
		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);
```

## Core Concepts

### The Compositional API

Since `textmode.js` is a three-texture system, `textmode.synth.js` provides three standalone functions for defining different aspects of your visual:

- **`char(source, charCount?)`** - Define which pattern drives character generation
- **`charColor(source)`** - Define character foreground colors
- **`cellColor(source)`** - Define cell background colors

You can start with any of these and chain the others:

```javascript
// Start with character generation
char(noise(10), 16)
  .charMap('@#%*+=-:. ')
  .charColor(osc(5))
  .cellColor(solid(0, 0, 0, 0.5));

// Start with colors
charColor(voronoi(5).mult(osc(20)))
  .char(noise(10), 16)
  .cellColor(gradient(0.5));

// Start with background
cellColor(solid(0, 0, 0, 0.8))
  .char(noise(10))
  .charColor(osc(5).kaleid(4));
```

Besides the three individual functions, you can also use `paint()` to effectively create pixel art, coloring the foreground and background of each cell based on a single source, making the rendered characters invisible/redundant:

```javascript
t.fontSize(16);
paint(noise(10), 16);

// With a font size of 1, you are virtually able to recreate most hydra visuals 1:1
t.fontSize(1);
paint(noise(10), 16);
```

Additionally, you don't need to use any of those functions, and just use `synth()` with a source generator as the first argument:

```javascript
t.synth(noise(10));
```

In this case, both the characters and foreground colors are driven by the same source generator, and the background is solid black. In many cases it makes sense to use separate character source though, since character cycling is much more rapid than color cycling.

### Source Generators

Create patterns using these generators:

- `osc(frequency, sync, offset)` - Oscillating sine wave patterns
- `noise(scale, offset)` - Perlin noise
- `voronoi(scale, speed, blending)` - Cellular/voronoi patterns
- `gradient(speed)` - Rotating radial gradient
- `shape(sides, radius, smoothing)` - Geometric shapes
- `solid(r, g, b, a)` - Solid colors
- `src(layer?)` - Previous output of another layer as a source, or the layers own previous output

### Transforms

Chain transforms to modify patterns:

- **Geometry:** `rotate()`, `scale()`, `scroll()`, `pixelate()`, `repeat()`, `kaleid()`
- **Color:** `brightness()`, `contrast()`, `invert()`, `hue()`, `saturate()`, `colorama()`
- **Blend:** `add()`, `sub()`, `mult()`, `blend()`, `diff()`, `layer()`, `mask()`
- **Modulate:** `modulate()`, `modulateScale()`, `modulateRotate()`, `modulateScrollX()`, etc.

### Character Mapping

Use `.charMap()` to define which characters to display:

```javascript
char(noise(10))
  .charMap('@#%*+=-:. ')      // ASCII gradient
  .charColor(osc(5));

char(voronoi(5))
  .charMap('█▓▒░ ')            // Block characters
  .charColor(gradient(0.5));
```

## Examples

### Same Pattern for Everything
```javascript
const pattern = osc([10, 30, 60].fast(2), 0.1);
layer.synth(
  char(pattern)
    .charMap('@#%*+=-:. ')
    .charColor(pattern.clone())
    .cellColor(pattern.clone().invert())
);
```

### Different Patterns for Each Aspect
```javascript
const charPattern = noise(5);
const colorPattern = voronoi(10, 0.5).mult(osc(20));
const bgPattern = gradient(0.2);

layer.synth(
  char(charPattern, 16)
    .charMap(' .:-=+*#%@')
    .charColor(colorPattern)
    .cellColor(bgPattern.invert())
);
```

### Feedback Loop
```javascript
// Classic hydra-style feedback
layer.synth(
  src()
    .modulate(noise(3), 0.005)
    .blend(shape(4), 0.01)
);
```

### Array Modulation
```javascript
// Animate between multiple values
layer.synth(
  char(osc([1, 10, 50, 100].fast(2), 0.1), 16)
    .charMap('@#%*+=-:. ')
    .charColor(osc([1, 10, 50, 100].fast(2), 0.1))
);
```

## Documentation

- [Full API Documentation](./api/index.md)
- [Compositional API Guide](./docs/COMPOSITIONAL-API.md)
- [Examples](./examples/)


## License

Distributed under the AGPL-3.0 License. See [LICENSE](./LICENSE) for more information.

## Credits

This project is a derivative work of [hydra-synth](https://github.com/hydra-synth/hydra-synth) by [Olivia Jack](https://github.com/olivia-jack), adapted for the [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem.

- **hydra-synth**: The core synthesis logic, GLSL shader generation, and functional API design are heavily based on `hydra-synth`.
- **Modifications**: The engine has been adapted to support `textmode.js`'s unique three-texture rendering pipeline *(characters, foreground colors, background colors)* and integrate with its plugin system.
