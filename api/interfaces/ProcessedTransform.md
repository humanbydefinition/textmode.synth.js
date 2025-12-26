[textmode.synth.js](../index.md) / ProcessedTransform

# Interface: ProcessedTransform

A processed transform with complete GLSL function.

## Extends

- [`TransformDefinition`](TransformDefinition.md)

## Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="description"></a> `description?` | `string` | Optional description for documentation | [`TransformDefinition`](TransformDefinition.md).[`description`](TransformDefinition.md#description) |
| <a id="glsl"></a> `glsl` | `string` | GLSL function body (without function signature) | [`TransformDefinition`](TransformDefinition.md).[`glsl`](TransformDefinition.md#glsl) |
| <a id="glslfunction"></a> `glslFunction` | `string` | Complete GLSL function code | - |
| <a id="inputs"></a> `inputs` | [`TransformInput`](TransformInput.md)[] | Input parameters | [`TransformDefinition`](TransformDefinition.md).[`inputs`](TransformDefinition.md#inputs) |
| <a id="name"></a> `name` | `string` | Function name (used in JS API and GLSL) | [`TransformDefinition`](TransformDefinition.md).[`name`](TransformDefinition.md#name) |
| <a id="type"></a> `type` | [`SynthTransformType`](../type-aliases/SynthTransformType.md) | Transform type determining composition behavior | [`TransformDefinition`](TransformDefinition.md).[`type`](TransformDefinition.md#type) |
