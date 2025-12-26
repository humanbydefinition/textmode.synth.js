[textmode.synth.js](../index.md) / defineTransform

# Function: defineTransform()

```ts
function defineTransform<T>(definition): TransformDefinition;
```

Helper to define a transform with type inference.
This makes transform definitions more concise and type-safe.

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* [`SynthTransformType`](../type-aliases/SynthTransformType.md) |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `definition` | [`TransformDefinition`](../interfaces/TransformDefinition.md) & `object` |

## Returns

[`TransformDefinition`](../interfaces/TransformDefinition.md)
