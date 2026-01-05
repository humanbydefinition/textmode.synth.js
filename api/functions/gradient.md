[textmode.synth.js](../index.md) / gradient

# Function: gradient()

```ts
function gradient(speed?): SynthSource;
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
  gradient([1, 2, 4])
);
```
