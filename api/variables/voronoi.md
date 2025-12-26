[textmode.synth.js](../index.md) / voronoi

# Variable: voronoi()

```ts
const voronoi: (scale?, speed?, blending?) => SynthSource;
```

Generate Voronoi (cellular) patterns.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | `number` \| `number`[] \| (`ctx`) => `number` | Scale of Voronoi cells (default: 5.0) |
| `speed?` | `number` \| `number`[] \| (`ctx`) => `number` | Animation speed (default: 0.3) |
| `blending?` | `number` \| `number`[] \| (`ctx`) => `number` | Blending between cell regions (default: 0.3) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Animated Voronoi pattern
t.layers.base.synth(
  charVoronoi(5, 0.3, 8)
    .charColor(voronoi(5, 0.3, 0.3))
);
```
