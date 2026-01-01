[textmode.synth.js](../index.md) / cellColorSrc

# Variable: cellColorSrc()

```ts
const cellColorSrc: () => SynthSource;
```

Sample the previous frame's cell/secondary color for feedback effects.
Reads from the previous frame's secondary color texture, which contains
the cell background color.

Use this to create feedback loops that affect cell background colors.

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Cell color feedback
t.layers.base.synth(
  cellColorSrc().hue(0.01).blend(solid(0, 0, 0), 0.1)
);
```
