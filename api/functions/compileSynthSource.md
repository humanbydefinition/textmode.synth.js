[textmode.synth.js](../index.md) / compileSynthSource

# Function: compileSynthSource()

```ts
function compileSynthSource(source): CompiledSynthShader;
```

Compile a SynthSource chain into a complete MRT GLSL shader.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | [`SynthSource`](../classes/SynthSource.md) | The SynthSource chain to compile |

## Returns

[`CompiledSynthShader`](../interfaces/CompiledSynthShader.md)

A compiled shader with fragment source and uniform definitions
