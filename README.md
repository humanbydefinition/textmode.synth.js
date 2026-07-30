# textmode.synth.js

<div align="center">

<img alt="textmode.synth.js — patch textmode live and modular" src=".github/assets/readme-og.png" />

</div>

Create procedural ASCII/text animations with a `hydra`-inspired, chainable visual synthesis system.

## Features

- **Procedural generation** - Oscillators, noise, voronoi, and more
- **Method chaining** - Hydra-style fluent API for complex visuals
- **Three-texture system** - Independent control over characters, foreground, and background
- **WebGL powered** - Compiled to optimized GLSL shaders
- **Feedback loops** - Trails, motion blur, and recursive patterns
- **Compositional API** - Start from any aspect and build organically
- **Extensible** - Add your own sources, transforms, and more

## Try it online first

Open [editor.textmode.art](https://editor.textmode.art/), a browser-based live-coding environment for the
complete official `textmode.js` ecosystem. Sketches run as you edit, with no local toolchain required.

The editor includes `textmode.js` and all four official add-ons: `textmode.export.js`, `textmode.filters.js`,
`textmode.figlet.js`, and `textmode.synth.js`.

- Write with Monaco-powered completions, hover documentation, and diagnostics.
- Start with a blank sketch, an included example, or a community gallery sketch.
- Keep code and preferences saved in the browser, then share sketches through URL-based links.
- Use microphone or line-input analysis for audio-reactive work, and create on desktop or mobile.

Use it to build and modify synthesis chains through live coding.

## Installation

Follow the [official installation guide](https://code.textmode.art/docs/installation) to install
`textmode.synth.js` alongside `textmode.js` with npm or browser-ready UMD bundles.

## Next steps

- **[Read the synth documentation](https://code.textmode.art/docs/live-coding-synth-textmode-art)** for synthesis workflows and examples.
- **[Browse the API reference](https://code.textmode.art/api/textmode.synth.js/)** for the complete typed API.
- **[Explore the examples](./examples/)** to see sources, transforms, and composition patterns in action.
- **[Try synth.textmode.art](https://synth.textmode.art/)** to experiment with synthesis chains in the browser.

## Contributing

Thank you for considering contributing to this project! (✿◠‿◠)

Please read the [Contributing Guide](https://github.com/humanbydefinition/textmode.js-dev/blob/dev/CONTRIBUTING.md) to get started.

<!-- TEXTMODE-CONTRIBUTORS:START -->
<!-- prettier-ignore-start -->
<!-- Generated from https://github.com/humanbydefinition/code.textmode.art/blob/main/.vitepress/data/contributors.json. Do not edit this section directly. -->
## Contributors

Thanks to the people who contribute code, documentation, design, examples, ideas, infrastructure, and care
across the textmode.js ecosystem.

<!-- markdownlint-disable MD033 -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%">
        <a href="https://github.com/humanbydefinition">
          <img src="https://github.com/humanbydefinition.png?s=100" width="100px" alt="humanbydefinition avatar" />
          <br /><sub><b>humanbydefinition</b></sub>
        </a>
        <br /><span title="Code: Commits and pull requests" aria-label="Code: Commits and pull requests">💻</span> <span title="Documentation: README, guides, and API documentation" aria-label="Documentation: README, guides, and API documentation">📖</span> <span title="Design: User experience, branding, and visual design" aria-label="Design: User experience, branding, and visual design">🎨</span> <span title="Examples: Usage examples and creative sketches" aria-label="Examples: Usage examples and creative sketches">💡</span> <span title="Ideas and planning: Feature proposals, planning, and feedback" aria-label="Ideas and planning: Feature proposals, planning, and feedback">🤔</span> <span title="Maintenance: Refactoring and project upkeep" aria-label="Maintenance: Refactoring and project upkeep">🚧</span> <span title="Infrastructure: Continuous integration, hosting, and build systems" aria-label="Infrastructure: Continuous integration, hosting, and build systems">🚇</span> <span title="Tools: Developer and community tooling" aria-label="Tools: Developer and community tooling">🔧</span> <span title="Plugins and libraries: Plugin and utility library development" aria-label="Plugins and libraries: Plugin and utility library development">🔌</span> <span title="Code review: Reviewing pull requests" aria-label="Code review: Reviewing pull requests">👀</span>
      </td>
      <td align="center" valign="top" width="14.28%">
        <a href="https://github.com/trintlermint">
          <img src="https://github.com/trintlermint.png?s=100" width="100px" alt="trintlermint avatar" />
          <br /><sub><b>trintlermint</b></sub>
        </a>
        <br /><span title="Design: User experience, branding, and visual design" aria-label="Design: User experience, branding, and visual design">🎨</span> <span title="Examples: Usage examples and creative sketches" aria-label="Examples: Usage examples and creative sketches">💡</span>
      </td>
    </tr>
  </tbody>
</table>
<!-- markdownlint-enable MD033 -->

Contribution details and profile links are maintained on the [textmode.js contributors page](https://code.textmode.art/docs/contributors).
<!-- prettier-ignore-end -->
<!-- TEXTMODE-CONTRIBUTORS:END -->

## Quick start

```javascript
import { textmode } from 'textmode.js';
import { SynthPlugin, char, osc } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin],
});

const charChain = osc(1, -0.1, 0.5).kaleid(50);
const colorChain = osc(25, -0.1, 0.5).kaleid(50);

t.synth(char(charChain).charMap('@#%*+=-:. ').charColor(colorChain).cellColor(colorChain.clone().invert()));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

## Core concepts

### Compositional API

`textmode.js` renders to three textures: characters, foreground colors, and background colors. `textmode.synth.js` provides functions to drive each independently:

| Function            | Purpose                      |
| ------------------- | ---------------------------- |
| `char(source)`      | Character generation         |
| `charColor(source)` | Foreground color             |
| `cellColor(source)` | Background color             |
| `paint(source)`     | Both foreground & background |

Start from any entry point and chain the others:

```javascript
// From characters
char(noise(10))
	.charColor(osc(5))
	.cellColor(solid(0, 0, 0, 0.5));

// From colors
charColor(voronoi(5)).char(noise(10)).cellColor(gradient(0.5));

// Shorthand for pixel art style
paint(noise(10));
```

### Pixel art mode

Use `paint()` to color both foreground and background identically, effectively hiding the characters:

```javascript
t.fontSize(16);
t.synth(paint(noise(10)));
```

> **Tip:** With `t.fontSize(1)`, you can recreate most hydra visuals 1:1.

### Direct source usage

You can also pass a source directly to `.synth()` without any wrapper function:

```javascript
t.synth(noise(10));
```

This drives both characters *and* foreground colors from the same source *(background defaults to black)*. In practice, using separate sources for characters often looks better - character cycling is more rapid than color changes.

### Source generators

| Generator                      | Description                     |
| ------------------------------ | ------------------------------- |
| `osc(freq, sync, offset)`      | Sine wave patterns              |
| `noise(scale, offset)`         | Perlin noise                    |
| `voronoi(scale, speed, blend)` | Cellular patterns               |
| `gradient(speed)`              | Radial gradient                 |
| `shape(sides, radius, smooth)` | Geometric polygons              |
| `solid(r, g, b, a)`            | Solid colors                    |
| `src(layer?)`                  | Feedback / cross-layer sampling |
| `...`                          | ...and many more..?             |

### Transforms

Chain transforms to modify patterns:

| Category     | Methods                                                                |
| ------------ | ---------------------------------------------------------------------- |
| **Geometry** | `rotate`, `scale`, `scroll`, `pixelate`, `repeat`, `kaleid`, ...       |
| **Color**    | `brightness`, `contrast`, `invert`, `hue`, `saturate`, `colorama`, ... |
| **Blend**    | `add`, `sub`, `mult`, `blend`, `diff`, `layer`, `mask`, ...            |
| **Modulate** | `modulate`, `modulateScale`, `modulateRotate`, `modulateKaleid`, ...   |

### Character mapping

Use `.charMap()` to define the character set. By default, all characters available in the layer's font are used.

```javascript
char(noise(10)).charMap('@#%*+=-:. '); // ASCII gradient
char(voronoi(5)).charMap('█▓▒░ '); // Block characters
```

## License

`textmode.synth.js` is licensed under the [AGPL-3.0 License](./LICENSE).

## Acknowledgements

- **[hydra-synth](https://github.com/hydra-synth/hydra-synth)** — Derivative source by [Olivia Jack](https://github.com/ojack) for core synthesis logic, GLSL shader generation, and functional API design; adapted for `textmode.js`'s three-texture rendering pipeline (characters, foreground colors, background colors) and plugin system. License: [AGPL-3.0](https://github.com/hydra-synth/hydra-synth/blob/main/LICENSE).

---

<div align="center">

<br />

**[↑ back to top](#textmodesynthjs)**

</div>
