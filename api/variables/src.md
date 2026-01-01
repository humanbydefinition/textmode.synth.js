[textmode.synth.js](../index.md) / src

# Variable: src()

```ts
const src: () => SynthSource;
```

Sample the previous frame's primary color output for feedback effects.
This is the core of feedback loops - it reads from the previous frame's
character foreground color, enabling effects like trails, motion blur, 
and recursive patterns.

Equivalent to hydra's `src(o0)`.

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Classic hydra-style feedback loop with noise modulation
t.layers.base.synth(
  src().modulate(noise(3), 0.005).blend(shape(4), 0.01)
);

// Feedback with color shift and scaling
t.layers.base.synth(
  src().hue(0.01).scale(1.01).blend(osc(10), 0.1)
);
```
