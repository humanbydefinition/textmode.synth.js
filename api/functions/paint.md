[textmode.synth.js](../index.md) / paint

# Function: paint()

```ts
function paint(
   rOrSource,
   g?,
   b?,
   a?): SynthSource;
```

Create a synth source with both character and cell colors defined.

This function creates a SynthSource where both the character foreground color
and the cell background color are driven by the same source pattern.

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

A new SynthSource configured with both color sources

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Use solid color for everything (RGBA overload)
t.layers.base.synth(
  paint(1, 1, 1)
);

// Use same pattern for both foreground and background
t.layers.base.synth(
  paint(osc(10, 0.1))
);
```
