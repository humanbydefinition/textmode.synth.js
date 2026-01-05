[textmode.synth.js](../index.md) / noise

# Function: noise()

```ts
function noise(scale?, offset?): SynthSource;
```

Generate Perlin noise patterns.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | `number` \| `number`[] \| (`ctx`) => `number` | Scale of the noise pattern (default: 10.0) |
| `offset?` | `number` \| `number`[] \| (`ctx`) => `number` | Offset in noise space (default: 0.1) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Basic noise pattern
t.layers.base.synth(
  noise(10, 0.1)
);
```
