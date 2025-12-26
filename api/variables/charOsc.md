[textmode.synth.js](../index.md) / charOsc

# Variable: charOsc()

```ts
const charOsc: (frequency?, sync?, offset?, charCount?) => SynthSource;
```

Generate character indices using oscillating sine waves.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `frequency?` | `number` \| `number`[] \| (`ctx`) => `number` | Frequency of the oscillation (default: 60.0) |
| `sync?` | `number` \| `number`[] \| (`ctx`) => `number` | Synchronization offset (default: 0.1) |
| `offset?` | `number` \| `number`[] \| (`ctx`) => `number` | Phase offset (default: 0.0) |
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

// Oscillating characters with dynamic frequency
t.layers.base.synth(
  charOsc([1, 10, 50, 100, 250, 500].fast(2), 0.001)
    .charColor(osc([1, 10, 50, 100, 250, 500].fast(2), 0.001))
);

// Using context function for time-based animation
t.layers.base.synth(
  charOsc(0.1, 0.1)
    .charColor(
      osc(10, 0.1, (ctx) => Math.sin(ctx.time / 10) * 100)
    )
);
```
