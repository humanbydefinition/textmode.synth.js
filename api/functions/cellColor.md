[textmode.synth.js](../index.md) / cellColor

# Function: cellColor()

## Call Signature

```ts
function cellColor(source): SynthSource;
```

Create a synth source with cell background color defined.

This function creates a SynthSource where the cell background color
is driven by the provided source pattern. This is compositional and can be
combined with `char()` and `charColor()`.

Accepts either a `SynthSource` (pattern) or RGBA values (solid color).

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`SynthSource`](../classes/SynthSource.md) | A SynthSource producing color values |

### Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource configured with cell color

### Example

```typescript
// Use a pattern source
t.layers.base.synth(
  cellColor(osc(5).invert())
);
```

## Call Signature

```ts
function cellColor(gray): SynthSource;
```

Create a synth source with cell background color defined using a grayscale value.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `gray` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Grayscale value (0-1) |

### Returns

[`SynthSource`](../classes/SynthSource.md)

## Call Signature

```ts
function cellColor(
   r, 
   g?, 
   b?, 
   a?): SynthSource;
```

Create a synth source with cell background color defined using RGBA values.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel (0-1) or value |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel (0-1) or value |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel (0-1) or value |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel (0-1) or value |

### Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource configured with cell color

### Example

```typescript
// Use a solid color
t.layers.base.synth(
  cellColor(0, 0, 0, 0.5).char(noise(10))
);
```
