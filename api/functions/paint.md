[textmode.synth.js](../index.md) / paint

# Function: paint()

```ts
function paint(source): SynthSource;
```

Create a synth source with both character and cell colors defined.

This function creates a SynthSource where both the character foreground color
and the cell background color are driven by the same source pattern.
This is a convenience function equivalent to calling both `charColor()` and
`cellColor()` with the same source, allowing for easy pixel art without visible characters.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`SynthSource`](../classes/SynthSource.md) | A SynthSource producing color values for both character and cell colors |

## Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource configured with both color sources

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Use same pattern for both foreground and background colors
t.layers.base.synth(
  paint(osc(10, 0.1).mult(voronoi(5)))
);

// Paint with gradient
t.layers.base.synth(
  paint(gradient(0.5))
);
```
