[textmode.synth.js](../index.md) / char

# Variable: char()

```ts
const char: (source, charCount?) => SynthSource;
```

Create a character source from any color/pattern source.

This function converts any pattern (like `osc()`, `noise()`, `voronoi()`) into
character indices. The pattern's luminance or color values are mapped to character indices.

This is the recommended way to define character generation in textmode.synth.js,
as it provides a unified, compositional API where the same patterns can drive
characters, character colors, and cell colors.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`SynthSource`](../classes/SynthSource.md) | A SynthSource producing color values that will be mapped to characters |
| `charCount?` | `number` | Number of different characters to use (default: 256) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource configured for character generation

## Example

```typescript
// Simple usage - same pattern for chars and colors
const pattern = osc(1, 0.1);
layer.synth(
  char(pattern)
    .charColor(pattern.clone())
);

// With limited character count
layer.synth(
  char(noise(10), 16)
    .charMap('@#%*+=-:. ')
);
```
