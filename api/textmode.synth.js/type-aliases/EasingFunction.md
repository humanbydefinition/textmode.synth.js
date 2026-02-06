---
title: EasingFunction
description: Easing functions from
category: Type Aliases
api: true
kind: TypeAlias
lastModified: 2026-02-06
---

[textmode.synth.js](../index.md) / EasingFunction

# Type Alias: EasingFunction

```ts
type EasingFunction = keyof typeof EASING_FUNCTIONS | (t) => number;
```

Easing functions from https://gist.github.com/gre/1650294

Available easing functions: `'linear'`, `'easeInQuad'`, `'easeOutQuad'`, `'easeInOutQuad'`,
`'easeInCubic'`, `'easeOutCubic'`, `'easeInOutCubic'`, `'easeInQuart'`, `'easeOutQuart'`,
`'easeInOutQuart'`, `'easeInQuint'`, `'easeOutQuint'`, `'easeInOutQuint'`, `'sin'`

## Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4)
    .rotate([-1.5, 1.5].ease('easeInOutCubic'))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
