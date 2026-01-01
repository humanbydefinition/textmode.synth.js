[textmode.synth.js](../index.md) / solid

# Variable: solid()

```ts
const solid: (r?, g?, b?, a?) => SynthSource;
```

Generate a solid color.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r?` | `number` \| `number`[] \| (`ctx`) => `number` | Red channel (0-1, default: 0.0) |
| `g?` | `number` \| `number`[] \| (`ctx`) => `number` | Green channel (0-1, default: 0.0) |
| `b?` | `number` \| `number`[] \| (`ctx`) => `number` | Blue channel (0-1, default: 0.0) |
| `a?` | `number` \| `number`[] \| (`ctx`) => `number` | Alpha channel (0-1, default: 1.0) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Solid colors with array modulation
t.layers.base.synth(
  solid(0.6, 0, 0, 1)
    .charColor(solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1))
    .cellColor(
      solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1)
        .invert()
    )
);
```
