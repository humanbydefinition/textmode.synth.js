[textmode.synth.js](../index.md) / setGlobalErrorCallback

# Function: setGlobalErrorCallback()

```ts
function setGlobalErrorCallback(callback): void;
```

Set a global error callback for dynamic parameter evaluation errors.

Provides a centralized way for live coding environments to receive
notifications whenever a dynamic parameter fails to evaluate.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `callback` | \| [`DynamicErrorCallback`](../type-aliases/DynamicErrorCallback.md) \| `null` |

## Returns

`void`

## Example

```typescript
import { setGlobalErrorCallback } from 'textmode.synth.js';

setGlobalErrorCallback((error, uniformName) => {
  console.error(`[Synth] Parameter "${uniformName}" error:`, error);
});
```
