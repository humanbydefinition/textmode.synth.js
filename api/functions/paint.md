[textmode.synth.js](../index.md) / paint

# Function: paint()

## Call Signature

```ts
function paint(source): SynthSource;
```

Create a synth source with both character and cell colors defined.

This function creates a SynthSource where both the character foreground color
and the cell background color are driven by the same source pattern.

Accepts either a `SynthSource` (pattern) or RGBA values (solid color).

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`SynthSource`](../classes/SynthSource.md) | A SynthSource producing color values |

### Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource configured with both color sources

### Example

```typescript
// Use same pattern for both foreground and background
t.layers.base.synth(
  paint(osc(10, 0.1))
);
```

## Call Signature

```ts
function paint(
   r,
   g?,
   b?,
   a?): SynthSource;
```

Create a synth source with both character and cell colors defined using RGBA values.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel (0-1) or value |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel (0-1) or value |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel (0-1) or value |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel (0-1) or value |

### Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource configured with both color sources

### Example

```typescript
// Use solid color for everything
t.layers.base.synth(
  paint(1, 1, 1)
);
```
