# textmode.synth.js

A `hydra`-inspired chainable visual synthesis system for `textmode.js`. Create procedural ASCII/text animations with simple, expressive code.

## Features

- 🎨 **Procedural Generation**: Generate characters, colors, and patterns using oscillators, noise, voronoi, and more
- 🔗 **Method Chaining**: Hydra-style fluent API for building complex visual effects
- 🎯 **Three-Texture System**: Independent control over characters, character colors, and cell backgrounds
- ⚡ **WebGL Powered**: Compiled to optimized GLSL shaders for real-time performance
- 🔄 **Feedback Loops**: Create trails, motion blur, and recursive patterns
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
const pattern = osc(10, 0.1, 1.5);
t.layers.base.synth(
  char(pattern)
    .charMap('@#%*+=-:. ')
    .charColor(pattern.clone())
    .cellColor(pattern.clone().invert())
);
```

## Core Concepts

### The New Compositional API

textmode.synth.js provides three standalone functions for defining different aspects of your visual:

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

### Source Generators

Create patterns using these generators:

- `osc(frequency, sync, offset)` - Oscillating sine wave patterns
- `noise(scale, offset)` - Perlin noise
- `voronoi(scale, speed, blending)` - Cellular/voronoi patterns
- `gradient(speed)` - Rotating radial gradient
- `shape(sides, radius, smoothing)` - Geometric shapes
- `solid(r, g, b, a)` - Solid colors

### Transforms

Chain transforms to modify patterns:

**Geometry:** `rotate()`, `scale()`, `scroll()`, `pixelate()`, `repeat()`, `kaleid()`
**Color:** `brightness()`, `contrast()`, `invert()`, `hue()`, `saturate()`, `colorama()`
**Blend:** `add()`, `sub()`, `mult()`, `blend()`, `diff()`, `layer()`, `mask()`
**Modulate:** `modulate()`, `modulateScale()`, `modulateRotate()`, `modulateScrollX()`, etc.

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
