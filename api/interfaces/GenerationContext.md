[textmode.synth.js](../index.md) / GenerationContext

# Interface: GenerationContext

Context for code generation.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="dynamicupdaters"></a> `dynamicUpdaters` | `Map`\<`string`, (`ctx`) => `number` \| `number`[]\> | Dynamic uniform updaters |
| <a id="glslfunctions"></a> `glslFunctions` | `Set`\<`string`\> | Accumulated GLSL function definitions |
| <a id="maincode"></a> `mainCode` | `string`[] | Accumulated main code lines |
| <a id="uniforms"></a> `uniforms` | `Map`\<`string`, [`SynthUniform`](SynthUniform.md)\> | Collected uniforms |
| <a id="varcounter"></a> `varCounter` | `number` | Counter for unique variable names |
