[textmode.synth.js](../index.md) / charColor

# Function: charColor()

```ts
function charColor(source): SynthSource;
```

Create a synth source with character foreground color defined.

This function creates a SynthSource where the character foreground color
is driven by the provided source pattern. This is compositional and can be
combined with `char()` and `cellColor()`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`SynthSource`](../classes/SynthSource.md) | A SynthSource producing color values for character foreground |

## Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource configured with character color

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Start with character color
const pattern = osc(10, 0.1);
t.layers.base.synth(
  charColor(pattern)
    .char(noise(10))
    .cellColor(solid(0, 0, 0, 0.5))
);

// Using different patterns for each aspect
t.layers.base.synth(
  charColor(voronoi(5).mult(osc(20)))
    .char(noise(10), 16)
    .charMap('@#%*+=-:. ')
);
```
