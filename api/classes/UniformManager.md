[textmode.synth.js](../index.md) / UniformManager

# Class: UniformManager

Manager for shader uniforms.

## Constructors

### Constructor

```ts
new UniformManager(): UniformManager;
```

#### Returns

`UniformManager`

## Methods

### clear()

```ts
clear(): void;
```

Clear all collected data.

#### Returns

`void`

***

### getDynamicUpdaters()

```ts
getDynamicUpdaters(): Map<string, (ctx) => number | number[]>;
```

Get all dynamic updaters.

#### Returns

`Map`\<`string`, (`ctx`) => `number` \| `number`[]\>

***

### getUniforms()

```ts
getUniforms(): Map<string, SynthUniform>;
```

Get all collected uniforms.

#### Returns

`Map`\<`string`, [`SynthUniform`](../interfaces/SynthUniform.md)\>

***

### processArgument()

```ts
processArgument(
   value, 
   input, 
   prefix): ProcessedArgument;
```

Process an argument and return its GLSL representation.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) |
| `input` | [`TransformInput`](../interfaces/TransformInput.md) |
| `prefix` | `string` |

#### Returns

`ProcessedArgument`
