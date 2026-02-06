---
title: SynthPlugin
description: The textmode.synth.js plugin to install.
category: Variables
api: true
kind: Variable
lastModified: 2026-02-06
---

[textmode.synth.js](../index.md) / SynthPlugin

# Variable: SynthPlugin

```ts
const SynthPlugin: TextmodePlugin;
```

The `textmode.synth.js` plugin to install.

Install this plugin to enable `.synth()` on TextmodeLayer instances.

## Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise(10)
    .charMap('@#%*+=-:. ')
    .charColor(osc(5, 0.1, 1.2).kaleid(4))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
