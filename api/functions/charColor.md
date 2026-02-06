[textmode.synth.js](../index.md) / charColor

# Function: charColor()

## Call Signature

```ts
function charColor(source): SynthSource;
```

Create a synth source with character foreground color defined.

This function creates a SynthSource where the character foreground color
is driven by the provided source pattern. This is compositional and can be
combined with `char()` and `cellColor()`.

Accepts either a `SynthSource` (pattern) or RGBA values (solid color).

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`SynthSource`](../classes/SynthSource.md) | A SynthSource producing color values |

### Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource configured with character color

### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  charColor(osc(10, 0.1, 1.2))
    .char(noise(8))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

## Call Signature

```ts
function charColor(
   r, 
   g?, 
   b?, 
   a?): SynthSource;
```

Create a synth source with character foreground color defined using RGBA values.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel (0-1) or value |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel (0-1) or value |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel (0-1) or value |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel (0-1) or value |

### Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource configured with character color

### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  charColor(1, 0.2, 0.1, 1)
    .char(noise(10))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

## Call Signature

```ts
function charColor(gray): SynthSource;
```

Create a synth source with character foreground color defined using a grayscale value.

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
  charColor(0.9)
    .char(noise(6))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
