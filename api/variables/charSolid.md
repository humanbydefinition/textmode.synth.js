[textmode.synth.js](../index.md) / charSolid

# Variable: charSolid()

```ts
const charSolid: (charIndex?) => SynthSource;
```

Generate a solid character index across the entire canvas.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `charIndex?` | `number` \| `number`[] \| (`ctx`) => `number` | Character index to use (default: 0) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Solid character with array modulation for cycling
t.layers.base.synth(
  charSolid([16, 17, 18])
    .charColor(solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1))
    .cellColor(
      solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1)
        .invert()
    )
);
```
