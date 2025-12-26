[textmode.synth.js](../index.md) / charShape

# Variable: charShape()

```ts
const charShape: (sides?, innerChar?, outerChar?, radius?) => SynthSource;
```

Generate character indices based on geometric shapes (polygons).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sides?` | `number` \| `number`[] \| (`ctx`) => `number` | Number of sides (default: 3) |
| `innerChar?` | `number` \| `number`[] \| (`ctx`) => `number` | Character index for inside the shape (default: 0) |
| `outerChar?` | `number` \| `number`[] \| (`ctx`) => `number` | Character index for outside the shape (default: 1) |
| `radius?` | `number` \| `number`[] \| (`ctx`) => `number` | Radius of the shape (default: 0.3) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Triangle shape with two character indices
t.layers.base.synth(
  charShape(3, 0, 1, 0.5)
    .charMap('. ')
);

// Circle-like shape (100 sides)
t.layers.base.synth(
  charShape(100, 0, 1, 0.5)
    .charMap('. ')
);
```
