[textmode.synth.js](../index.md) / CompiledSynthShader

# Interface: CompiledSynthShader

Result of compiling a SynthSource.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="charmapping"></a> `charMapping?` | [`CharacterMapping`](CharacterMapping.md) | Character mapping if charMap was used |
| <a id="dynamicupdaters"></a> `dynamicUpdaters` | `Map`\<`string`, (`ctx`) => `number` \| `number`[]\> | Dynamic uniform updaters keyed by uniform name |
| <a id="fragmentsource"></a> `fragmentSource` | `string` | Complete fragment shader source |
| <a id="uniforms"></a> `uniforms` | `Map`\<`string`, [`SynthUniform`](SynthUniform.md)\> | Uniform definitions with their values/updaters |
