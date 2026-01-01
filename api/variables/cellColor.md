[textmode.synth.js](../index.md) / cellColor

# Variable: cellColor()

```ts
const cellColor: (source) => SynthSource;
```

Create a synth source with cell background color defined.

This function creates a SynthSource where the cell background color
is driven by the provided source pattern. This is compositional and can be
combined with `char()` and `charColor()`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`SynthSource`](../classes/SynthSource.md) | A SynthSource producing color values for cell background |

## Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource configured with cell color

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Start with cell color
t.layers.base.synth(
  cellColor(solid(0, 0, 0, 0.5))
    .char(noise(10))
    .charColor(osc(5))
);

// Complete composition - all three defined
const colorPattern = voronoi(5, 0.3);
t.layers.base.synth(
  cellColor(colorPattern.clone().invert())
    .char(noise(10), 16)
    .charMap('@#%*+=-:. ')
    .charColor(colorPattern)
);
```
