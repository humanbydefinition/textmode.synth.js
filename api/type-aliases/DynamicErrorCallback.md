[textmode.synth.js](../index.md) / DynamicErrorCallback

# Type Alias: DynamicErrorCallback()

```ts
type DynamicErrorCallback = (error, uniformName) => void;
```

Callback signature for dynamic parameter evaluation errors.
Live coding environments can use this to display errors without interrupting rendering.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `unknown` |
| `uniformName` | `string` |

## Returns

`void`
