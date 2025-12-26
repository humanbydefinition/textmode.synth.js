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

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Rotating shape with eased animation
t.layers.base.synth(
  charShape(4)
    .rotate([-3.14, 3.14].ease('easeInOutCubic'))
    .charColor(
      shape(4).rotate([-3.14, 3.14].ease('easeInOutCubic'))
    )
    .cellColor(
      shape(4).rotate([-3.14, 3.14].ease('easeInOutCubic')).invert()
    )
);
```
