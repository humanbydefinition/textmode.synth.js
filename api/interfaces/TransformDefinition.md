[textmode.synth.js](../index.md) / TransformDefinition

# Interface: TransformDefinition

Definition of a synthesis transform function.

## Extended by

- [`ProcessedTransform`](ProcessedTransform.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="description"></a> `description?` | `string` | Optional description for documentation |
| <a id="glsl"></a> `glsl` | `string` | GLSL function body (without function signature) |
| <a id="inputs"></a> `inputs` | [`TransformInput`](TransformInput.md)[] | Input parameters |
| <a id="name"></a> `name` | `string` | Function name (used in JS API and GLSL) |
| <a id="type"></a> `type` | [`SynthTransformType`](../type-aliases/SynthTransformType.md) | Transform type determining composition behavior |
