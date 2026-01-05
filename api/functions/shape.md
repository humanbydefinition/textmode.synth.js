[textmode.synth.js](../index.md) / shape

# Function: shape()

```ts
function shape(
   sides?, 
   radius?, 
   smoothing?): SynthSource;
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

// Triangle
t.layers.base.synth(
  shape(3)
);

// High-sided polygon (ellipse-like)
t.layers.base.synth(
  shape(100)
);
```
