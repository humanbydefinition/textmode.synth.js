# textmode.synth.js

<div align="center">

<img alt="textmode.synth.js — patch textmode live and modular" src=".github/assets/readme-og.png" />

</div>

`textmode.synth.js` is a free, modular visual-synthesis add-on for [`textmode.js`](https://github.com/humanbydefinition/textmode.js) that brings a `hydra`-inspired, chainable API to procedural ASCII and textmode animation. It translates composable sources and transforms into optimized GLSL shaders while targeting separate character, foreground-color, and background-color textures.

The add-on is designed for live coding, rapid experimentation, and expressive generative workflows. Whether you're combining oscillators and noise, building feedback loops, or extending the system with custom sources and transforms, `textmode.synth.js` makes complex animated compositions approachable through concise, compositional chains.

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
- **[Try editor.textmode.art](https://editor.textmode.art/)** to experiment with synthesis chains in the browser.

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

## License

`textmode.synth.js` is licensed under the [AGPL-3.0 License](./LICENSE).

## Acknowledgements

- **[hydra-synth](https://github.com/hydra-synth/hydra-synth)**
  - Derivative source by [Olivia Jack](https://github.com/ojack) for core synthesis logic, GLSL shader generation, and functional API design; adapted for `textmode.js`'s three-texture rendering pipeline (characters, foreground colors, background colors) and plugin system.
  - License: [AGPL-3.0](https://github.com/hydra-synth/hydra-synth/blob/main/LICENSE).

---

<div align="center">

<br />

**[↑ back to top](#textmodesynthjs)**

</div>
