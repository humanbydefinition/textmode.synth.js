# textmode.synth.js

**A derivative work of [hydra-synth](https://github.com/hydra-synth/hydra-synth) by [Olivia Jack](https://github.com/ojack), adapted for the [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem.**

Create procedural ASCII/text animations with a `hydra`-inspired, chainable visual synthesis system.

## Features

- 🎨 **Procedural generation** - Oscillators, noise, voronoi, and more
- 🔗 **Method chaining** - Hydra-style fluent API for complex visuals
- 🎯 **Three-texture system** - Independent control over characters, foreground, and background
- ⚡ **WebGL powered** - Compiled to optimized GLSL shaders
- 🔄 **Feedback loops** - Trails, motion blur, and recursive patterns
- 📦 **Compositional API** - Start from any aspect and build organically
- 📚 **Extensible** - Add your own sources, transforms, and more

## Try it online first

To go along with the release of this library, we've created a **live coding environment** where you can explore everything in the browser: [synth.textmode.art](https://synth.textmode.art)

It features IntelliSense & auto-completion, documentation on hover, curated examples to explore, and a lot more. The whole `textmode.js` ecosystem is available at your fingertips.

## Prerequisites

- **textmode.js v0.8.5+** - This library depends on the core `textmode.js` package v0.8.5 or higher.

## Installation

```bash
npm install textmode.synth.js
```

## Quick start

```javascript
import { textmode } from 'textmode.js';
import { SynthPlugin, char, osc } from 'textmode.synth.js';

const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  fontSize: 16,
  plugins: [SynthPlugin]
});

const charChain = osc(1, -0.1, 0.5).kaleid(50);
const colorChain = osc(25, -0.1, 0.5).kaleid(50);

t.layers.base.synth(
  char(charChain)
    .charMap('@#%*+=-:. ')
    .charColor(colorChain)
    .cellColor(colorChain.clone().invert())
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

## Core concepts

### Compositional API

`textmode.js` renders to three textures: characters, foreground colors, and background colors. `textmode.synth.js` provides functions to drive each independently:

| Function | Purpose |
|----------|---------|
| `char(source)` | Character generation |
| `charColor(source)` | Foreground color |
| `cellColor(source)` | Background color |
| `paint(source)` | Both foreground & background |

Start from any entry point and chain the others:

```javascript
// From characters
char(noise(10)).charColor(osc(5)).cellColor(solid(0,0,0,0.5));

// From colors
charColor(voronoi(5)).char(noise(10)).cellColor(gradient(0.5));

// Shorthand for pixel art style
paint(noise(10));
```

### Pixel art mode

Use `paint()` to color both foreground and background identically, effectively hiding the characters:

```javascript
t.fontSize(16);
t.layers.base.synth(paint(noise(10)));
```

> **Tip:** With `t.fontSize(1)`, you can recreate most hydra visuals 1:1.

### Direct source usage

You can also pass a source directly to `.synth()` without any wrapper function:

```javascript
t.layers.base.synth(noise(10));
```

This drives both characters *and* foreground colors from the same source *(background defaults to black)*. In practice, using separate sources for characters often looks better - character cycling is more rapid than color changes.

### Source generators

| Generator | Description |
|-----------|-------------|
| `osc(freq, sync, offset)` | Sine wave patterns |
| `noise(scale, offset)` | Perlin noise |
| `voronoi(scale, speed, blend)` | Cellular patterns |
| `gradient(speed)` | Radial gradient |
| `shape(sides, radius, smooth)` | Geometric polygons |
| `solid(r, g, b, a)` | Solid colors |
| `src(layer?)` | Feedback / cross-layer sampling |
| `...` | ...and many more..? |

### Transforms

Chain transforms to modify patterns:

| Category | Methods |
|----------|---------|
| **Geometry** | `rotate`, `scale`, `scroll`, `pixelate`, `repeat`, `kaleid`, ... |
| **Color** | `brightness`, `contrast`, `invert`, `hue`, `saturate`, `colorama`, ... |
| **Blend** | `add`, `sub`, `mult`, `blend`, `diff`, `layer`, `mask`, ... |
| **Modulate** | `modulate`, `modulateScale`, `modulateRotate`, `modulateKaleid`, ... |

### Character mapping

Use `.charMap()` to define the character set. By default, all characters available in the layer's font are used.

```javascript
char(noise(10)).charMap('@#%*+=-:. ');  // ASCII gradient
char(voronoi(5)).charMap('█▓▒░ ');       // Block characters
```

## Documentation

There's a lot more to explore beyond this overview:

- **[Online documentation](https://code.textmode.art/docs/synth)** - Full guides and tutorials
- **[API reference](./api/index.md)** - Complete API documentation
- **[synth.textmode.art](https://synth.textmode.art)** - Live coding environment

## License

Distributed under the **AGPL-3.0** License. See [LICENSE](./LICENSE) for more information.

## Credits

This project is a derivative work of [hydra-synth](https://github.com/hydra-synth/hydra-synth) by [Olivia Jack](https://github.com/ojack), adapted for the [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem.

- **hydra-synth**: Core synthesis logic, GLSL shader generation, and functional API design.
- **Modifications**: Adapted for `textmode.js`'s three-texture rendering pipeline *(characters, foreground colors, background colors)* and plugin system.
