[textmode.synth.js](../index.md) / SynthSourcePrototype

# Interface: SynthSourcePrototype

Interface for the SynthSource class that will have methods injected.
This is used to avoid circular dependencies.

## Methods

### \_addCombineTransform()

```ts
_addCombineTransform(
   name, 
   source, 
   userArgs): unknown;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `source` | `unknown` |
| `userArgs` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md)[] |

#### Returns

`unknown`

***

### \_addTransform()

```ts
_addTransform(name, userArgs): unknown;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `userArgs` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md)[] |

#### Returns

`unknown`
