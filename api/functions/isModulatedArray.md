[textmode.synth.js](../index.md) / isModulatedArray

# Function: isModulatedArray()

```ts
function isModulatedArray(value): value is ModulatedArray;
```

Check if a value is a modulated array.
In Hydra, ALL number arrays are treated as time-varying sequences,
even without explicit .fast() or .smooth() modulation.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

## Returns

`value is ModulatedArray`
