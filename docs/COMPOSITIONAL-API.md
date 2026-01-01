# New Compositional API for textmode.synth.js

## Overview

The new API provides standalone functions `char()`, `charColor()`, and `cellColor()` that create fully compositional synth chains. You can start with any of the three and chain the others in any order.

## API Reference

### `char(source, charCount?)`
Creates a SynthSource where the provided pattern drives character generation.
- `source`: A SynthSource (osc, noise, voronoi, etc.) to convert to character indices
- `charCount`: Optional number of unique characters (default: 256)

### `charColor(source)`
Creates a SynthSource where the provided pattern drives character foreground color.
- `source`: A SynthSource producing color values

### `cellColor(source)`
Creates a SynthSource where the provided pattern drives cell background color.
- `source`: A SynthSource producing color values

## Usage Examples

### Basic Usage - Same Pattern for All
```javascript
const pattern = osc(10, 0.1);
layer.synth(
  char(pattern)
    .charColor(pattern.clone())
    .cellColor(pattern.clone().invert())
);
```

### Start with Different Functions

```javascript
// Start with char()
char(noise(10), 16)
  .charMap('@#%*+=-:. ')
  .charColor(osc(5))
  .cellColor(solid(0, 0, 0, 0.5));

// Start with charColor()
charColor(voronoi(5).mult(osc(20)))
  .char(noise(10), 16)
  .cellColor(gradient(0.5));

// Start with cellColor()
cellColor(solid(0, 0, 0, 0.8))
  .char(noise(10))
  .charColor(osc(5).kaleid(4));
```

### Complete Composition - Different Patterns
```javascript
const charPattern = noise(5);
const colorPattern = voronoi(10, 0.5).mult(osc(20));
const bgPattern = gradient(0.2);

layer.synth(
  char(charPattern, 16)
    .charMap(' .:-=+*#%@')
    .charColor(colorPattern)
    .cellColor(bgPattern.invert())
);
```

### Minimal - Just Characters
```javascript
// Defaults to white characters on transparent background
char(noise(10), 16)
  .charMap('@#%*+=-:. ');
```

## Key Benefits

1. **Compositional**: Start with any aspect (char, charColor, cellColor) and build from there
2. **Reusable**: The same pattern can drive multiple aspects using `.clone()`
3. **Flexible**: Mix standalone functions with method-style chaining
4. **Intuitive**: Clear separation between character generation and coloring
5. **Unified**: No need for separate `charOsc`, `charNoise` functions - use `char(osc())`, `char(noise())`

## Migration from Old API

### Old API (Still Works)
```javascript
charOsc(10, 0.1, 0, 16)
  .charColor(osc(10, 0.1));
```

### New API (Recommended)
```javascript
char(osc(10, 0.1), 16)
  .charColor(osc(10, 0.1));
```

## Advanced: Mixing Styles

You can combine standalone functions with method chaining on the same chain:

```javascript
char(osc(10))
  .charMap('@#%*+=-:. ')
  .kaleid(4)           // Transform applied to main chain
  .charColor(voronoi(5).invert())  // Using method style
  .scroll(0.1, 0);     // More transforms
```

## Notes

- The `char()`, `charColor()`, and `cellColor()` **methods** on SynthSource still exist and work as before
- The new **standalone functions** create new SynthSource instances with specific properties set
- Both styles can be mixed in the same chain
- Old `charOsc`, `charNoise`, etc. functions still work for backward compatibility
