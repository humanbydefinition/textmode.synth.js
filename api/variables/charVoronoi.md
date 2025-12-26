[textmode.synth.js](../index.md) / charVoronoi

# Variable: charVoronoi()

```ts
const charVoronoi: (scale?, speed?, charCount?) => SynthSource;
```

Generate character indices using Voronoi (cellular) patterns.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | `number` \| `number`[] \| (`ctx`) => `number` | Scale of Voronoi cells (default: 5.0) |
| `speed?` | `number` \| `number`[] \| (`ctx`) => `number` | Animation speed (default: 0.3) |
| `charCount?` | `number` \| `number`[] \| (`ctx`) => `number` | Number of different characters to use (default: 256) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Voronoi-based character generation
t.layers.base.synth(
  charVoronoi(5, 0.3, 8)
    .charColor(voronoi(5, 0.3, 0.3))
);
```
