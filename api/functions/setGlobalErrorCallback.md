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

```ts
setGlobalErrorCallback((error, uniformName) => {
  console.error(`[Synth] Parameter "${uniformName}" error:`, error);
});

const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .modulate(noise((ctx) => 1 + Math.sin(ctx.time) * 0.5), 0.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
