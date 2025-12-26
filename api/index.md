# textmode.synth.js

textmode.synth.js

A `hydra`-inspired chainable visual synthesis system for `textmode.js`.
Enables procedural generation of characters, colors, and visual effects
through method chaining.

## Example

```ts
import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, osc, solid } from 'textmode.synth.js';

// Create textmode instance with SynthPlugin
const t = textmode.create({
  width: 800,
  height: 600,
  fontSize: 16,
  plugins: [SynthPlugin]
});

// Create a synth chain with procedural characters and colors
const synth = charNoise(10)
  .charMap('@#%*+=-:. ')
  .charRotate(0.1)
  .charColor(osc(5).kaleid(4))
  .cellColor(solid(0, 0, 0, 0.5))
  .scroll(0.1, 0);

// Apply synth to the base layer
t.layers.base.synth(synth);
```

## Classes

| Class | Description |
| ------ | ------ |
| [CharacterResolver](classes/CharacterResolver.md) | Resolver for character indices using font data. |
| [SynthChain](classes/SynthChain.md) | A mutable chain of transform records for the fluent API. While the internal implementation is mutable for compatibility with the existing fluent API, the returned readonly arrays provide a consistent view. |
| [SynthRenderer](classes/SynthRenderer.md) | Renderer for compiled synth shaders. |
| [SynthSource](classes/SynthSource.md) | A chainable synthesis source that accumulates transforms to be compiled into a shader. |
| [UniformManager](classes/UniformManager.md) | Manager for shader uniforms. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [ChainCompilationResult](interfaces/ChainCompilationResult.md) | Result from compiling a chain. |
| [CharacterMapping](interfaces/CharacterMapping.md) | Character set mapping for charMap transform. |
| [CompiledSynthShader](interfaces/CompiledSynthShader.md) | Result of compiling a SynthSource. |
| [GeneratedFunctions](interfaces/GeneratedFunctions.md) | Generated standalone functions for source transforms. |
| [GenerationContext](interfaces/GenerationContext.md) | Context for code generation. |
| [IRNode](interfaces/IRNode.md) | Intermediate representation node for a transform. |
| [ISynthSource](interfaces/ISynthSource.md) | Forward declaration for SynthSource to avoid circular imports. |
| [ModulatedArray](interfaces/ModulatedArray.md) | Extended array interface with modulation methods. |
| [ProcessedTransform](interfaces/ProcessedTransform.md) | A processed transform with complete GLSL function. |
| [SynthContext](interfaces/SynthContext.md) | Context passed to dynamic parameter functions during rendering. |
| [SynthSourceOptions](interfaces/SynthSourceOptions.md) | Options for creating a SynthSource instance. |
| [SynthSourcePrototype](interfaces/SynthSourcePrototype.md) | Interface for the SynthSource class that will have methods injected. This is used to avoid circular dependencies. |
| [SynthUniform](interfaces/SynthUniform.md) | Uniform definition for compiled shaders. |
| [TransformDefinition](interfaces/TransformDefinition.md) | Definition of a synthesis transform function. |
| [TransformInput](interfaces/TransformInput.md) | Input parameter definition for a transform function. |
| [TransformRecord](interfaces/TransformRecord.md) | A recorded transform in the synthesis chain. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [EasingFunction](type-aliases/EasingFunction.md) | - |
| [GLSLType](type-aliases/GLSLType.md) | GLSL type for transform inputs. |
| [SynthParameterValue](type-aliases/SynthParameterValue.md) | Dynamic parameter value types supported by the synth system. |
| [SynthTransformType](type-aliases/SynthTransformType.md) | Transform type categories determining how functions compose in the shader pipeline. |

## Variables

| Variable | Description |
| ------ | ------ |
| [ALL\_TRANSFORMS](variables/ALL_TRANSFORMS.md) | All built-in transforms combined. |
| [CELL\_COLOR\_TRANSFORMS](variables/CELL_COLOR_TRANSFORMS.md) | All cell color transforms. |
| [CHAR\_COLOR\_TRANSFORMS](variables/CHAR_COLOR_TRANSFORMS.md) | All character color transforms. |
| [CHAR\_MODIFY\_TRANSFORMS](variables/CHAR_MODIFY_TRANSFORMS.md) | All character modifier transforms. |
| [CHAR\_TRANSFORMS](variables/CHAR_TRANSFORMS.md) | All character generator transforms. |
| [charGradient](variables/charGradient.md) | - |
| [charNoise](variables/charNoise.md) | - |
| [charOsc](variables/charOsc.md) | - |
| [charShape](variables/charShape.md) | - |
| [charSolid](variables/charSolid.md) | - |
| [charVoronoi](variables/charVoronoi.md) | - |
| [COLOR\_TRANSFORMS](variables/COLOR_TRANSFORMS.md) | All color transforms. |
| [COMBINE\_COORD\_TRANSFORMS](variables/COMBINE_COORD_TRANSFORMS.md) | All combine coordinate transforms. |
| [COMBINE\_TRANSFORMS](variables/COMBINE_TRANSFORMS.md) | All combine transforms. |
| [COORD\_TRANSFORMS](variables/COORD_TRANSFORMS.md) | All coordinate transforms. |
| [gradient](variables/gradient.md) | - |
| [noise](variables/noise.md) | - |
| [osc](variables/osc.md) | - |
| [shape](variables/shape.md) | - |
| [solid](variables/solid.md) | - |
| [SOURCE\_TRANSFORMS](variables/SOURCE_TRANSFORMS.md) | All source generator transforms. |
| [SYNTH\_VERTEX\_SHADER](variables/SYNTH_VERTEX_SHADER.md) | Vertex shader source for synth rendering. |
| [SynthPlugin](variables/SynthPlugin.md) | The textmode-synth plugin. |
| [TRANSFORM\_TYPE\_INFO](variables/TRANSFORM_TYPE_INFO.md) | Return type signature lookup for each transform type. |
| [TransformFactory](variables/TransformFactory.md) | Singleton instance of the transform factory. |
| [TransformRegistry](variables/TransformRegistry.md) | Singleton instance of the transform registry. |
| [voronoi](variables/voronoi.md) | - |

## Functions

| Function | Description |
| ------ | ------ |
| [compileSynthSource](functions/compileSynthSource.md) | Compile a SynthSource chain into a complete MRT GLSL shader. |
| [createCharacterMapping](functions/createCharacterMapping.md) | Create a CharacterMapping from a string of characters. |
| [defineTransform](functions/defineTransform.md) | Helper to define a transform with type inference. This makes transform definitions more concise and type-safe. |
| [formatNumber](functions/formatNumber.md) | Format a number for GLSL (ensure decimal point for floats). |
| [generateCharacterOutputCode](functions/generateCharacterOutputCode.md) | Generate character output code based on chain result. |
| [generateFragmentShader](functions/generateFragmentShader.md) | Generate the complete fragment shader. |
| [getArrayValue](functions/getArrayValue.md) | Get the current value from a modulated array based on context. |
| [getDefaultArgs](functions/getDefaultArgs.md) | Get default values for a transform's inputs. |
| [isModulatedArray](functions/isModulatedArray.md) | Check if a value is a modulated array. In Hydra, ALL number arrays are treated as time-varying sequences, even without explicit .fast() or .smooth() modulation. |
| [isSourceType](functions/isSourceType.md) | Check if a transform type is a source generator. |
| [processTransform](functions/processTransform.md) | Process a transform definition into a processed transform with complete GLSL function. |
| [requiresNestedSource](functions/requiresNestedSource.md) | Check if a transform type requires a nested source. |
