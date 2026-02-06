[textmode.synth.js](../index.md) / osc

# Function: osc()

```ts
function osc(
   frequency?, 
   sync?, 
   offset?): SynthSource;
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .kaleid(5)
    .color(0.9, 0.2, 1.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
