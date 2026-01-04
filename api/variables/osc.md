[textmode.synth.js](../index.md) / osc

# Variable: osc()

```ts
const osc: (frequency?, sync?, offset?) => SynthSource;
```

Generate oscillating patterns using sine waves.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `frequency?` | `number` \| `number`[] \| (`ctx`) => `number` | Frequency of the oscillation (default: 60.0) |
| `sync?` | `number` \| `number`[] \| (`ctx`) => `number` | Synchronization offset (default: 0.1) |
| `offset?` | `number` \| `number`[] \| (`ctx`) => `number` | Phase offset (default: 0.0) |

## Returns

[`SynthSource`](../classes/SynthSource.md)

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Basic oscillating color pattern
t.layers.base.synth(
  osc(1, 0.1)
    .cellColor(osc(10, 0.1))
);

// Animated frequency using array modulation
t.layers.base.synth(
  osc([1, 10, 50, 100].fast(2), 0.001)
);
```
