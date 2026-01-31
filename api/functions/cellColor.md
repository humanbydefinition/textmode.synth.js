[textmode.synth.js](../index.md) / cellColor

# Function: cellColor()

```ts
function cellColor(
   rOrSource,
   g?,
   b?,
   a?): SynthSource;
```

Create a synth source with cell background color defined.

This function creates a SynthSource where the cell background color
is driven by the provided source pattern. This is compositional and can be
combined with `char()` and `charColor()`.

Accepts either a `SynthSource` (pattern) or RGBA values (solid color).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `rOrSource` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | A SynthSource producing color values, or Red channel (0-1) |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel (0-1) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel (0-1) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel (0-1) |

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

// Use a solid color (RGBA overload)
t.layers.base.synth(
  cellColor(0, 0, 0, 0.5).char(noise(10))
);

// Use a pattern source
t.layers.base.synth(
  cellColor(osc(5).invert())
);
```
