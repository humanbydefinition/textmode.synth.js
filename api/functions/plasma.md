[textmode.synth.js](../index.md) / plasma

# Function: plasma()

```ts
function plasma(
   scale?, 
   speed?, 
   phase?, 
   contrast?): SynthSource;
```

Generate plasma-like sine field patterns.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | `number` \| `number`[] \| (`ctx`) => `number` | Spatial scale of the plasma (default: 10.0) |
| `speed?` | `number` \| `number`[] \| (`ctx`) => `number` | Animation speed (default: 0.5) |
| `phase?` | `number` \| `number`[] \| (`ctx`) => `number` | Phase offset (default: 0.0) |
| `contrast?` | `number` \| `number`[] \| (`ctx`) => `number` | Contrast adjustment (default: 1.0) |

## Returns

[`SynthSource`](../classes/SynthSource.md)
