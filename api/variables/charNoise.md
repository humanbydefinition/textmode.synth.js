[textmode.synth.js](../index.md) / charNoise

# Variable: charNoise()

```ts
const charNoise: (scale?, offset?, charCount?) => SynthSource;
```

Generate character indices using Perlin noise.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | `number` \| `number`[] \| (`ctx`) => `number` | Scale of the noise pattern (default: 10.0) |
| `offset?` | `number` \| `number`[] \| (`ctx`) => `number` | Offset in noise space (default: 0.1) |
| `charCount?` | `number` \| `number`[] \| (`ctx`) => `number` | Number of different characters to use (default: 256) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Noise-based character generation
t.layers.base.synth(
  charNoise(10, 0.1)
    .charColor(noise(10, 0.1))
);
```
