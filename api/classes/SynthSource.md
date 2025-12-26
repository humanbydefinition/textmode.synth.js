[textmode.synth.js](../index.md) / SynthSource

# Class: SynthSource

A chainable synthesis source that accumulates transforms to be compiled into a shader.

This is the core class that enables hydra-like method chaining for
generating procedural textmode visuals. Each method call adds a
transform to the chain, which is later compiled into a GLSL shader.

## Example

```ts
// Create a synth chain with procedural characters and colors
const chain = charNoise(10)
  .charMap('@#%*+=-:. ')
  .charRotate(0.1)
  .charColor(osc(5).kaleid(4))
  .scroll(0.1, 0);
```

## Properties

### add()

```ts
add: (source, amount?) => this;
```

Add another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Source to add |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

#### Example

```typescript
// Add two shapes with animated blend amount
charShape(3)
  .scale(0.5)
  .charColor(
    shape(3)
      .scale(0.5)
      .add(shape(4).scale(2), [0, 0.25, 0.5, 0.75, 1])
  );
```

***

### b()

```ts
b: (scale?, offset?) => this;
```

Scale and offset blue channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 0.0) |

#### Returns

`this`

***

### blend()

```ts
blend: (source, amount?) => this;
```

Blend with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Source to blend |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

#### Example

```typescript
// Blend two shapes
charShape(3)
  .scale(0.5)
  .charColor(
    shape(3)
      .scale(0.5)
      .blend(shape(4).scale(2), [0, 0.25, 0.5, 0.75, 1])
  );
```

***

### brightness()

```ts
brightness: (amount?) => this;
```

Adjust brightness.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Brightness adjustment amount (default: 0.4) |

#### Returns

`this`

#### Example

```typescript
// Animate brightness with sine wave
charOsc(20, 0, 2, 16)
  .charColor(
    osc(20, 0, 2).brightness((ctx) => Math.sin(ctx.time))
  );
```

***

### cellColorComplement()

```ts
cellColorComplement: (amount?) => this;
```

Set cell color as complement of character color.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Effect amount (default: 1.0) |

#### Returns

`this`

***

### cellColorFromChar()

```ts
cellColorFromChar: (hueShift?, saturation?, brightness?) => this;
```

Generate cell color from character.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hueShift?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Hue shift amount (default: 0.5) |
| `saturation?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Saturation (default: 1.0) |
| `brightness?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Brightness (default: 0.5) |

#### Returns

`this`

***

### cellColorSolid()

```ts
cellColorSolid: (r?, g?, b?, a?) => this;
```

Set solid cell background color.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel (default: 0.0) |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel (default: 0.0) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel (default: 0.0) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel (default: 0.0) |

#### Returns

`this`

***

### charColorFromIndex()

```ts
charColorFromIndex: (hueOffset?, saturation?, brightness?) => this;
```

Generate character color from character index.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hueOffset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Hue offset (default: 0.0) |
| `saturation?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Saturation (default: 1.0) |
| `brightness?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Brightness (default: 1.0) |

#### Returns

`this`

***

### charColorGradient()

```ts
charColorGradient: (speed?) => this;
```

Generate character color using a gradient.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Gradient animation speed (default: 0.0) |

#### Returns

`this`

***

### charColorSolid()

```ts
charColorSolid: (r?, g?, b?, a?) => this;
```

Set solid character color.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel (default: 1.0) |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel (default: 1.0) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel (default: 1.0) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel (default: 1.0) |

#### Returns

`this`

***

### charFlipX()

```ts
charFlipX: (toggle?) => this;
```

Flip characters horizontally.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `toggle?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Toggle flip (default: 1.0) |

#### Returns

`this`

***

### charFlipY()

```ts
charFlipY: (toggle?) => this;
```

Flip characters vertically.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `toggle?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Toggle flip (default: 1.0) |

#### Returns

`this`

***

### charGradient()

```ts
charGradient: (charCount?, direction?) => this;
```

Generate character indices using a gradient.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `charCount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of different characters to use (default: 256) |
| `direction?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Gradient direction (default: 0.0) |

#### Returns

`this`

***

### charInvert()

```ts
charInvert: (toggle?) => this;
```

Invert character indices.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `toggle?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Toggle invert (default: 1.0) |

#### Returns

`this`

***

### charNoise()

```ts
charNoise: (scale?, speed?, charCount?) => this;
```

Generate character indices using Perlin noise.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale of the noise pattern (default: 10.0) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Animation speed (default: 0.1) |
| `charCount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of different characters to use (default: 256) |

#### Returns

`this`

***

### charOsc()

```ts
charOsc: (frequency?, sync?, charCount?) => this;
```

Generate character indices using oscillating sine waves.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `frequency?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Frequency of the oscillation (default: 60.0) |
| `sync?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Synchronization offset (default: 0.1) |
| `charCount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of different characters to use (default: 256) |

#### Returns

`this`

***

### charRotate()

```ts
charRotate: (angle?, speed?) => this;
```

Rotate characters.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `angle?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Rotation angle in radians (default: 0.0) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Rotation speed (default: 0.0) |

#### Returns

`this`

***

### charRotateFrom()

```ts
charRotateFrom: (amount?) => this;
```

Rotate characters based on underlying value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Rotation amount multiplier (default: 1.0) |

#### Returns

`this`

***

### charShape()

```ts
charShape: (sides?, innerChar?, outerChar?, radius?) => this;
```

Generate character indices based on geometric shapes (polygons).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sides?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of sides (default: 3) |
| `innerChar?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Character index for inside the shape (default: 0) |
| `outerChar?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Character index for outside the shape (default: 1) |
| `radius?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Radius of the shape (default: 0.3) |

#### Returns

`this`

***

### charSolid()

```ts
charSolid: (charIndex?) => this;
```

Generate a solid character index across the entire canvas.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `charIndex?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Character index to use (default: 0) |

#### Returns

`this`

***

### charVoronoi()

```ts
charVoronoi: (scale?, speed?, charCount?) => this;
```

Generate character indices using Voronoi (cellular) patterns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale of Voronoi cells (default: 5.0) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Animation speed (default: 0.3) |
| `charCount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of different characters to use (default: 256) |

#### Returns

`this`

***

### color()

```ts
color: (r?, g?, b?, a?) => this;
```

Set color channels.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel (default: 1.0) |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel (default: 1.0) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel (default: 1.0) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel (default: 1.0) |

#### Returns

`this`

***

### colorama()

```ts
colorama: (amount?) => this;
```

Apply colorama effect (hue rotation based on luminance).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Effect amount (default: 0.005) |

#### Returns

`this`

***

### contrast()

```ts
contrast: (amount?) => this;
```

Adjust contrast.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Contrast amount (default: 1.6) |

#### Returns

`this`

#### Example

```typescript
// Animate contrast
charOsc(20, 0.1, 0, 16)
  .charColor(
    osc(20).contrast((ctx) => Math.sin(ctx.time) * 5)
  );
```

***

### diff()

```ts
diff: (source) => this;
```

Difference with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Source to compare |

#### Returns

`this`

#### Example

```typescript
// Create difference pattern between two oscillators
charOsc(9, 0.1, 2, 16)
  .charColor(
    osc(9, 0.1, 2).diff(osc(13, 0.5, 5))
  );
```

***

### g()

```ts
g: (scale?, offset?) => this;
```

Scale and offset green channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 0.0) |

#### Returns

`this`

***

### gradient()

```ts
gradient: (speed?) => this;
```

Generate a rotating radial gradient.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Rotation speed (default: 0.0) |

#### Returns

`this`

***

### hue()

```ts
hue: (hue?) => this;
```

Shift hue.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hue?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Hue shift amount (default: 0.4) |

#### Returns

`this`

#### Example

```typescript
// Animate hue shift
charOsc(30, 0.1, 1, 16)
  .charColor(
    osc(30, 0.1, 1).hue((ctx) => Math.sin(ctx.time))
  );
```

***

### invert()

```ts
invert: (amount?) => this;
```

Invert colors.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Inversion amount (default: 1.0) |

#### Returns

`this`

#### Example

```typescript
// Toggle inversion with array
charSolid(16)
  .charColor(solid(1, 1, 1).invert([0, 1]))
  .cellColor(solid(1, 1, 1).invert([1, 0]));
```

***

### kaleid()

```ts
kaleid: (nSides?) => this;
```

Apply kaleidoscope effect.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `nSides?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of kaleidoscope sides (default: 4.0) |

#### Returns

`this`

#### Example

```typescript
// Create a 50-sided kaleidoscope pattern
charOsc(25, -0.1, 0.5, 32)
  .kaleid(50)
  .charColor(osc(25, -0.1, 0.5).kaleid(50));
```

***

### layer()

```ts
layer: (source) => this;
```

Layer another source on top.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Source to layer |

#### Returns

`this`

***

### luma()

```ts
luma: (threshold?, tolerance?) => this;
```

Apply threshold based on luminance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `threshold?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Threshold value (default: 0.5) |
| `tolerance?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Tolerance range (default: 0.1) |

#### Returns

`this`

***

### mask()

```ts
mask: (source) => this;
```

Mask using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Source to use as mask |

#### Returns

`this`

#### Example

```typescript
// Mask gradient with voronoi pattern
charGradient(0, 16)
  .charColor(
    gradient(5).mask(voronoi()).invert([0, 1])
  );
```

***

### modulate()

```ts
modulate: (source, amount?) => this;
```

Modulate coordinates using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Modulation source |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Modulation amount (default: 0.1) |

#### Returns

`this`

#### Example

```typescript
// Modulate voronoi with kaleidoscope pattern
charVoronoi(5, 0.3, 16)
  .rotate((ctx) => (ctx.time % 360) / 2)
  .modulate(
    osc(25, 0.1, 0.5)
      .kaleid(50)
      .scale((ctx) => Math.sin(ctx.time) * 0.5 + 1)
      .modulate(noise(0.6, 0.5)),
    0.5
  );
```

***

### modulateKaleid()

```ts
modulateKaleid: (source, nSides?) => this;
```

Modulate kaleidoscope using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Modulation source |
| `nSides?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of sides (default: 4.0) |

#### Returns

`this`

***

### modulatePixelate()

```ts
modulatePixelate: (source, multiple?, offset?) => this;
```

Modulate pixelation using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Modulation source |
| `multiple?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Pixelation multiplier (default: 10.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 3.0) |

#### Returns

`this`

***

### modulateRotate()

```ts
modulateRotate: (source, multiple?, offset?) => this;
```

Modulate rotation using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Modulation source |
| `multiple?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Rotation multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 0.0) |

#### Returns

`this`

***

### modulateScale()

```ts
modulateScale: (source, multiple?, offset?) => this;
```

Modulate scale using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Modulation source |
| `multiple?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 1.0) |

#### Returns

`this`

***

### modulateScrollX()

```ts
modulateScrollX: (source, scrollX?, speed?) => this;
```

Modulate X scroll using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Modulation source |
| `scrollX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X scroll amount (default: 0.5) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scroll speed (default: 0.0) |

#### Returns

`this`

***

### modulateScrollY()

```ts
modulateScrollY: (source, scrollY?, speed?) => this;
```

Modulate Y scroll using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Modulation source |
| `scrollY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y scroll amount (default: 0.5) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scroll speed (default: 0.0) |

#### Returns

`this`

***

### mult()

```ts
mult: (source, amount?) => this;
```

Multiply with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Source to multiply |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

***

### noise()

```ts
noise: (scale?, speed?) => this;
```

Generate Perlin noise patterns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale of the noise pattern (default: 10.0) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Animation speed (default: 0.1) |

#### Returns

`this`

***

### osc()

```ts
osc: (frequency?, sync?, offset?) => this;
```

Generate oscillating patterns using sine waves.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `frequency?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Frequency of the oscillation (default: 60.0) |
| `sync?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Synchronization offset (default: 0.1) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Phase offset (default: 0.0) |

#### Returns

`this`

***

### pixelate()

```ts
pixelate: (pixelX?, pixelY?) => this;
```

Pixelate the output.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pixelX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Pixel size in X (default: 20.0) |
| `pixelY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Pixel size in Y (default: 20.0) |

#### Returns

`this`

#### Example

```typescript
// Pixelate noise pattern
charNoise(1, 0.05)
  .pixelate(20, 20)
  .charColor(noise().pixelate(20, 20));
```

***

### posterize()

```ts
posterize: (bins?, gamma?) => this;
```

Posterize colors to limited palette.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bins?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of color bins (default: 3.0) |
| `gamma?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Gamma correction (default: 0.6) |

#### Returns

`this`

#### Example

```typescript
// Posterize gradient with array modulation
charGradient(0, 16)
  .rotate(1.57)
  .charColor(
    gradient(0).posterize([1, 5, 15, 30], 0.5)
  );
```

***

### r()

```ts
r: (scale?, offset?) => this;
```

Scale and offset red channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 0.0) |

#### Returns

`this`

***

### repeat()

```ts
repeat: (repeatX?, repeatY?, offsetX?, offsetY?) => this;
```

Repeat coordinates in both X and Y directions.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `repeatX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of X repetitions (default: 3.0) |
| `repeatY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of Y repetitions (default: 3.0) |
| `offsetX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X offset between repetitions (default: 0.0) |
| `offsetY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y offset between repetitions (default: 0.0) |

#### Returns

`this`

#### Example

```typescript
// Repeat a shape in a 3x3 grid
charShape(3)
  .repeat(3, 3, 0, 0)
  .charColor(shape().repeat(3, 3, 0, 0));
```

***

### repeatX()

```ts
repeatX: (reps?, offset?) => this;
```

Repeat coordinates in X direction.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `reps?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of repetitions (default: 3.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset between repetitions (default: 0.0) |

#### Returns

`this`

***

### repeatY()

```ts
repeatY: (reps?, offset?) => this;
```

Repeat coordinates in Y direction.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `reps?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of repetitions (default: 3.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset between repetitions (default: 0.0) |

#### Returns

`this`

***

### rotate()

```ts
rotate: (angle?, speed?) => this;
```

Rotate coordinates.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `angle?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Rotation angle in radians (default: 10.0) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Rotation speed multiplier (default: 0.0) |

#### Returns

`this`

#### Example

```typescript
// Rotate shape continuously
charOsc(50, 0, 0, 16)
  .rotate((ctx) => ctx.time % 360)
  .charColor(osc(50).rotate((ctx) => ctx.time % 360));
```

***

### saturate()

```ts
saturate: (amount?) => this;
```

Adjust color saturation.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Saturation amount (default: 2.0) |

#### Returns

`this`

#### Example

```typescript
// Animate saturation
charOsc(10, 0, 1, 16)
  .charColor(
    osc(10, 0, 1).saturate((ctx) => Math.sin(ctx.time) * 10)
  );
```

***

### scale()

```ts
scale: (amount?, xMult?, yMult?, offsetX?, offsetY?) => this;
```

Scale coordinates.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale amount (default: 1.5) |
| `xMult?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X axis multiplier (default: 1.0) |
| `yMult?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y axis multiplier (default: 1.0) |
| `offsetX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X offset (default: 0.5) |
| `offsetY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y offset (default: 0.5) |

#### Returns

`this`

#### Example

```typescript
// Scale a triangle shape
charShape(3).scale(1.5, 1, 1);
```

***

### scroll()

```ts
scroll: (scrollX?, scrollY?, speedX?, speedY?) => this;
```

Scroll coordinates in both X and Y directions.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scrollX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X scroll amount (default: 0.5) |
| `scrollY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y scroll amount (default: 0.5) |
| `speedX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X scroll speed (default: 0.0) |
| `speedY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y scroll speed (default: 0.0) |

#### Returns

`this`

#### Example

```typescript
// Scroll a shape diagonally
charShape(3).scroll(0.1, -0.3);
```

***

### scrollX()

```ts
scrollX: (scrollX?, speed?) => this;
```

Scroll coordinates in X direction.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scrollX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X scroll amount (default: 0.5) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scroll speed (default: 0.0) |

#### Returns

`this`

***

### scrollY()

```ts
scrollY: (scrollY?, speed?) => this;
```

Scroll coordinates in Y direction.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scrollY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y scroll amount (default: 0.5) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scroll speed (default: 0.0) |

#### Returns

`this`

***

### shape()

```ts
shape: (sides?, radius?, smoothing?) => this;
```

Generate geometric shapes (polygons).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sides?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of sides (default: 3) |
| `radius?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Radius of the shape (default: 0.3) |
| `smoothing?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Edge smoothing amount (default: 0.01) |

#### Returns

`this`

***

### solid()

```ts
solid: (r?, g?, b?, a?) => this;
```

Generate a solid color.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel (0-1, default: 0.0) |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel (0-1, default: 0.0) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel (0-1, default: 0.0) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel (0-1, default: 1.0) |

#### Returns

`this`

***

### sub()

```ts
sub: (source, amount?) => this;
```

Subtract another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | Source to subtract |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

***

### thresh()

```ts
thresh: (threshold?, tolerance?) => this;
```

Apply hard threshold.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `threshold?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Threshold value (default: 0.5) |
| `tolerance?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Tolerance range (default: 0.04) |

#### Returns

`this`

***

### voronoi()

```ts
voronoi: (scale?, speed?, blending?) => this;
```

Generate Voronoi (cellular) patterns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale of Voronoi cells (default: 5.0) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Animation speed (default: 0.3) |
| `blending?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blending between cell regions (default: 0.3) |

#### Returns

`this`

## Methods

### cellColor()

```ts
cellColor(source): this;
```

Set the cell background color using a color source chain.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | A SynthSource producing color values, or RGBA values |

#### Returns

`this`

The SynthSource for chaining

#### Example

```ts
// Transparent background
charNoise(10).cellColor(solid(0, 0, 0, 0))

// Complement of character color
charNoise(10).charColor(osc(5)).cellColor(osc(5).invert())
```

***

### charColor()

```ts
charColor(source): this;
```

Set the character foreground color using a color source chain.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | A SynthSource producing color values, or RGBA values |

#### Returns

`this`

The SynthSource for chaining

#### Example

```ts
// Use oscillator for rainbow colors
charNoise(10).charColor(osc(5, 0.1))

// Use solid color
charNoise(10).charColor(solid(1, 0.5, 0))

// Use gradient
charNoise(10).charColor(gradient(0.5).hue(0.3))
```

***

### charMap()

```ts
charMap(chars): this;
```

Map character indices to a specific character set.
This is the primary textmode-native way to define which characters to use.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `chars` | `string` | A string of characters to map indices to |

#### Returns

`this`

The SynthSource for chaining

#### Example

```ts
// Map noise values to ASCII art characters
charNoise(10).charMap('@#%*+=-:. ')

// Use block characters
charOsc(8).charMap(' .:-=+*#%@')

// Use custom symbols
charGradient().charMap('-<>^v')
```
