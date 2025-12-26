[textmode.synth.js](../index.md) / SynthRenderer

# Class: SynthRenderer

Renderer for compiled synth shaders.

## Constructors

### Constructor

```ts
new SynthRenderer(textmodifier, renderer): SynthRenderer;
```

Create a SynthRenderer.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `textmodifier` | `any` | - |
| `renderer` | `any` | The GLRenderer instance |

#### Returns

`SynthRenderer`

## Methods

### dispose()

```ts
dispose(): void;
```

Dispose of resources.

#### Returns

`void`

***

### render()

```ts
render(
   target, 
   width, 
   height, 
   context, 
   font): void;
```

Render the synth to the target framebuffer.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `GLFramebuffer` | The target MRT framebuffer |
| `width` | `number` | Width in pixels |
| `height` | `number` | Height in pixels |
| `context` | [`SynthContext`](../interfaces/SynthContext.md) | The synth context with time, resolution, etc. |
| `font` | `TextmodeFont` | The font to use for resolving character indices |

#### Returns

`void`

***

### setShader()

```ts
setShader(compiled): Promise<void>;
```

Set the compiled shader to use.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `compiled` | [`CompiledSynthShader`](../interfaces/CompiledSynthShader.md) | The compiled synth shader |

#### Returns

`Promise`\<`void`\>
