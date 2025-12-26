[textmode.synth.js](../index.md) / shape

# Variable: shape()

```ts
const shape: (sides?, radius?, smoothing?) => SynthSource;
```

Generate geometric shapes (polygons).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sides?` | `number` \| `number`[] \| (`ctx`) => `number` | Number of sides (default: 3) |
| `radius?` | `number` \| `number`[] \| (`ctx`) => `number` | Radius of the shape (default: 0.3) |
| `smoothing?` | `number` \| `number`[] \| (`ctx`) => `number` | Edge smoothing amount (default: 0.01) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Triangle with smooth edges
t.layers.base.synth(
  charShape(3, 0, 1, 0.5)
    .charMap('. ')
);

// High-sided polygon (circle-like)
t.layers.base.synth(
  charShape(100, 0, 1, 0.5)
    .charMap('. ')
);
```
