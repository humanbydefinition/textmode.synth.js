[textmode.synth.js](../index.md) / solid

# Function: solid()

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

### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  solid(0.4)
    .char(osc(6, 0.1, 1.2))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  solid(0.1, 0.2, 0.5, 1)
    .char(noise(8))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
