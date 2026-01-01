[textmode.synth.js](../index.md) / charSrc

# Variable: charSrc()

```ts
const charSrc: () => SynthSource;
```

Sample the previous frame's character data for feedback effects.
Reads from the previous frame's character texture, which contains
character index and transform data.

Use this to create feedback loops that affect character selection.

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Character feedback with modulation
t.layers.base.synth(
  charSrc().modulate(noise(3), 0.01)
);
```
