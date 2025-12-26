[textmode.synth.js](../index.md) / gradient

# Variable: gradient()

```ts
const gradient: (speed?) => SynthSource;
```

Generate a rotating radial gradient.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `speed?` | `number` \| `number`[] \| (`ctx`) => `number` | Rotation speed (default: 0.0) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Animated gradient with array modulation
t.layers.base.synth(
  charGradient([1, 2, 4], 16)
    .charColor(gradient([1, 2, 4]))
    .cellColor(
      gradient([1, 2, 4])
        .invert((ctx) => Math.sin(ctx.time) * 2)
    )
);
```
