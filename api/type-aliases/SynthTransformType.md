[textmode.synth.js](../index.md) / SynthTransformType

# Type Alias: SynthTransformType

```ts
type SynthTransformType = 
  | "src"
  | "coord"
  | "color"
  | "combine"
  | "combineCoord"
  | "char"
  | "charModify"
  | "charColor"
  | "cellColor";
```

Transform type categories determining how functions compose in the shader pipeline.

Each type has specific input/output signatures:
- `src`: Source generators that produce colors from UV coordinates
- `coord`: Coordinate transforms that modify UV before sampling
- `color`: Color transforms that modify existing color values
- `combine`: Blending operations that combine two color sources
- `combineCoord`: Modulation that uses one source to affect another's coordinates
- `charModify`: Character property modifiers (flip, rotate, invert)
