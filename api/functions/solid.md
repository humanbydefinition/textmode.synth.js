[textmode.synth.js](../index.md) / solid

# Function: solid()

## Call Signature

```ts
function solid(
   r?, 
   g?, 
   b?, 
   a?): SynthSource;
```

Generate a solid color.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel (0-1, default: 0.0) |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel (0-1, default: 0.0) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel (0-1, default: 0.0) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel (0-1, default: 1.0) |

### Returns

[`SynthSource`](../classes/SynthSource.md)

### Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Solid colors with array modulation
t.layers.base.synth(
  solid(0.6, 0, 0, 1)
    .charColor(solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1))
    .cellColor(solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1).invert())
);
```

## Call Signature

```ts
function solid(gray): SynthSource;
```

Generate a solid grayscale color.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `gray` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Grayscale value (0-1) |

### Returns

[`SynthSource`](../classes/SynthSource.md)
