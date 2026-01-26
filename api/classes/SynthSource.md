[textmode.synth.js](../index.md) / SynthSource

# Class: SynthSource

A chainable synthesis source that accumulates transforms to be compiled into a shader.

This is the core class that enables hydra-like method chaining for
generating procedural textmode visuals. Each method call adds a
transform to the chain, which is later compiled into a GLSL shader.

## Example

```ts
// Create a synth chain with procedural characters and colors
const synth = noise(10)
  .rotate(0.1)
  .scroll(0.1, 0)

  .charColor(osc(5).kaleid(4))
  .cellColor(osc(5).kaleid(4).invert())

  .charMap('@#%*+=-:. ');
```

## Extends

- `ISynthSource`

## Methods

### osc()

```ts
osc(
   frequency?, 
   sync?, 
   offset?): this;
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

#### Inherited from

```ts
ISynthSource.osc
```

***

### noise()

```ts
noise(scale?, speed?): this;
```

Generate Perlin noise patterns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale of the noise pattern (default: 10.0) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Animation speed (default: 0.1) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.noise
```

***

### voronoi()

```ts
voronoi(
   scale?, 
   speed?, 
   blending?): this;
```

Generate voronoi patterns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale of voronoi cells (default: 5.0) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Animation speed (default: 0.3) |
| `blending?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blending between cell regions (default: 0.3) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.voronoi
```

***

### gradient()

```ts
gradient(speed?): this;
```

Generate a rotating radial gradient.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Rotation speed (default: 0.0) |

#### Returns

`this`

#### Example

```typescript
gradient([1,2,4])
```

#### Inherited from

```ts
ISynthSource.gradient
```

***

### shape()

```ts
shape(
   sides?, 
   radius?, 
   smoothing?): this;
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

#### Inherited from

```ts
ISynthSource.shape
```

***

### solid()

```ts
solid(
   r?, 
   g?, 
   b?, 
   a?): this;
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

#### Inherited from

```ts
ISynthSource.solid
```

***

### src()

```ts
src(layer?): this;
```

Sample the previous frame for feedback effects, or sample from another layer.

**Self-feedback (no argument):** `src()` samples the current layer's previous frame.
The sampled texture is context-aware based on where it's used in the synth chain:

- Inside `char(...)` → samples previous frame's character data
- Inside `charColor(...)` → samples previous frame's primary color (character foreground)
- Inside `cellColor(...)` → samples previous frame's cell color (character background)
- Outside all three → samples previous frame's primary color

**Cross-layer sampling (with layer argument):** `src(layer)` samples from another
layer's output, enabling hydra-style multi-output compositions. The sampled texture
is still context-aware based on the current compilation target.

This is the core of feedback loops and multi-layer compositions - enabling effects
like trails, motion blur, recursive patterns, and complex layered visuals.
Equivalent to hydra's `src(o0)`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `layer?` | `unknown` | Optional TextmodeLayer to sample from. If omitted, samples from self (feedback). |

#### Returns

`this`

#### Example

```typescript
// Classic hydra-style feedback loop with noise modulation
src().modulate(noise(3), 0.005).blend(shape(4), 0.01)

// Feedback with color shift
src().hue(0.01).scale(1.01).blend(osc(10), 0.1)

// Context-aware: src() samples the appropriate texture automatically
char(noise(10).diff(src()))           // src() → character feedback
  .charColor(osc(5).blend(src(), 0.5)) // src() → primary color feedback
  .cellColor(voronoi().diff(src()))    // src() → cell color feedback
```

#### Inherited from

```ts
ISynthSource.src
```

***

### rotate()

```ts
rotate(angle?, speed?): this;
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
osc(50, 0, 0)
  .rotate((ctx) => ctx.time % 360)
  .charColor(osc(50).rotate((ctx) => ctx.time % 360));
```

#### Inherited from

```ts
ISynthSource.rotate
```

***

### scale()

```ts
scale(
   amount?, 
   xMult?, 
   yMult?, 
   offsetX?, 
   offsetY?): this;
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
shape(3).scale(1.5, 1, 1);
```

#### Inherited from

```ts
ISynthSource.scale
```

***

### scroll()

```ts
scroll(
   scrollX?, 
   scrollY?, 
   speedX?, 
   speedY?): this;
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
shape(3).scroll(0.1, -0.3);
```

#### Inherited from

```ts
ISynthSource.scroll
```

***

### scrollX()

```ts
scrollX(scrollX?, speed?): this;
```

Scroll coordinates in X direction.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scrollX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X scroll amount (default: 0.5) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scroll speed (default: 0.0) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.scrollX
```

***

### scrollY()

```ts
scrollY(scrollY?, speed?): this;
```

Scroll coordinates in Y direction.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scrollY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y scroll amount (default: 0.5) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scroll speed (default: 0.0) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.scrollY
```

***

### pixelate()

```ts
pixelate(pixelX?, pixelY?): this;
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
noise(1, 0.05)
  .pixelate(20, 20)
  .charColor(noise().pixelate(20, 20));
```

#### Inherited from

```ts
ISynthSource.pixelate
```

***

### repeat()

```ts
repeat(
   repeatX?, 
   repeatY?, 
   offsetX?, 
   offsetY?): this;
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
shape(3)
  .repeat(3, 3, 0, 0)
  .charColor(shape().repeat(3, 3, 0, 0));
```

#### Inherited from

```ts
ISynthSource.repeat
```

***

### repeatX()

```ts
repeatX(reps?, offset?): this;
```

Repeat coordinates in X direction.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `reps?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of repetitions (default: 3.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset between repetitions (default: 0.0) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.repeatX
```

***

### repeatY()

```ts
repeatY(reps?, offset?): this;
```

Repeat coordinates in Y direction.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `reps?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of repetitions (default: 3.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset between repetitions (default: 0.0) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.repeatY
```

***

### kaleid()

```ts
kaleid(nSides?): this;
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
osc(25, -0.1, 0.5)
  .kaleid(50)
  .charColor(osc(25, -0.1, 0.5).kaleid(50));
```

#### Inherited from

```ts
ISynthSource.kaleid
```

***

### brightness()

```ts
brightness(amount?): this;
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
osc(1)
  .charColor(
    osc(20, 0, 2).brightness(() => Math.sin(t.secs()))
  )
```

#### Inherited from

```ts
ISynthSource.brightness
```

***

### contrast()

```ts
contrast(amount?): this;
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
osc(1)
  .charColor(
    osc(20).contrast((ctx) => Math.sin(ctx.time) * 5)
  )
```

#### Inherited from

```ts
ISynthSource.contrast
```

***

### invert()

```ts
invert(amount?): this;
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
 solid(0.2, 0, 0, 1)
    .charColor(solid(1, 1, 1).invert([0, 1]))
    .cellColor(solid(1, 1, 1).invert([1, 0]))
```

#### Inherited from

```ts
ISynthSource.invert
```

***

### saturate()

```ts
saturate(amount?): this;
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
osc(10, 0, 1)
  .charColor(
    osc(10, 0, 1).saturate((ctx) => Math.sin(ctx.time) * 10)
  );
```

#### Inherited from

```ts
ISynthSource.saturate
```

***

### hue()

```ts
hue(hue?): this;
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
osc(1)
  .charColor(
    osc(30, 0.1, 1).hue((ctx) => Math.sin(ctx.time))
  )
```

#### Inherited from

```ts
ISynthSource.hue
```

***

### colorama()

```ts
colorama(amount?): this;
```

Apply colorama effect (hue rotation based on luminance).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Effect amount (default: 0.005) |

#### Returns

`this`

#### Example

```typescript
// Create color cycle effect on oscillator
noise(4).colorama(0.3)
```

#### Inherited from

```ts
ISynthSource.colorama
```

***

### posterize()

```ts
posterize(bins?, gamma?): this;
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
gradient(0, 16)
  .rotate(1.57)
  .charColor(
    gradient(0).posterize([1, 5, 15, 30], 0.5)
  );
```

#### Inherited from

```ts
ISynthSource.posterize
```

***

### luma()

```ts
luma(threshold?, tolerance?): this;
```

Apply threshold based on luminance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `threshold?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Threshold value (default: 0.5) |
| `tolerance?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Tolerance range (default: 0.1) |

#### Returns

`this`

#### Example

```typescript
// Apply threshold to oscillator
osc(10,0,1).luma(0.5,0.1)
```

#### Inherited from

```ts
ISynthSource.luma
```

***

### thresh()

```ts
thresh(threshold?, tolerance?): this;
```

Apply hard threshold.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `threshold?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Threshold value (default: 0.5) |
| `tolerance?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Tolerance range (default: 0.04) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.thresh
```

***

### color()

```ts
color(
   r?, 
   g?, 
   b?, 
   a?): this;
```

Colorize a grayscale source or multiply an existing color source.

This is the recommended way to add color to grayscale sources like `osc()`,
`noise()`, or `voronoi()`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel multiplier (default: 1.0) |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel multiplier (default: 1.0) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel multiplier (default: 1.0) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel multiplier (default: 1.0) |

#### Returns

`this`

#### Example

```typescript
// Create a blue oscillator
osc(10).color(0, 0.5, 1.0)

// Colorize noise with a red tint
noise(5).color(1, 0.2, 0.2)
```

#### Inherited from

```ts
ISynthSource.color
```

***

### r()

```ts
r(scale?, offset?): this;
```

Extract the red channel as a grayscale value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 0.0) |

#### Returns

`this`

#### Example

```typescript
// Extract red channel as grayscale
voronoi(5).hue(0.4).r()

// Convert red intensity to character indices
char(osc(10).hue(0.5).r())
```

#### Inherited from

```ts
ISynthSource.r
```

***

### g()

```ts
g(scale?, offset?): this;
```

Extract the green channel as a grayscale value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 0.0) |

#### Returns

`this`

#### Example

```typescript
osc(4,0.1,1.5).layer(gradient().g())
```

#### Inherited from

```ts
ISynthSource.g
```

***

### b()

```ts
b(scale?, offset?): this;
```

Extract the blue channel as a grayscale value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 0.0) |

#### Returns

`this`

#### Example

```typescript
osc(8,0.1,1.5).layer(gradient().colorama(1).b())
```

#### Inherited from

```ts
ISynthSource.b
```

***

### shift()

```ts
shift(
   r?, 
   g?, 
   b?, 
   a?): this;
```

Shift color channels by adding offset values.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel shift (default: 0.5) |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel shift (default: 0.0) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel shift (default: 0.0) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel shift (default: 0.0) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.shift
```

***

### gamma()

```ts
gamma(amount?): this;
```

Apply gamma correction for nonlinear brightness control.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Gamma value (default: 1.0, < 1.0 brightens, > 1.0 darkens) |

#### Returns

`this`

#### Example

```typescript
osc(1)
  .charColor(osc(5).gamma([1.0, 1.5, 2.0].smooth(4)))
```

#### Inherited from

```ts
ISynthSource.gamma
```

***

### levels()

```ts
levels(
   inMin?, 
   inMax?, 
   outMin?, 
   outMax?, 
   gamma?): this;
```

Adjust input/output levels and gamma for precise tonal control.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `inMin?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Input minimum (default: 0.0) |
| `inMax?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Input maximum (default: 1.0) |
| `outMin?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Output minimum (default: 0.0) |
| `outMax?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Output maximum (default: 1.0) |
| `gamma?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Gamma correction (default: 1.0) |

#### Returns

`this`

#### Example

```typescript
// Expand tonal range from 0.2-0.8 to 0-1
noise(10)
  .charColor(noise(5).levels(0.2, 0.8, 0.0, 1.0, 1.0))

// Compress highlights, boost shadows
voronoi(8)
  .charColor(voronoi(5).levels(0.0, 1.0, 0.2, 0.9, 0.8))
```

#### Inherited from

```ts
ISynthSource.levels
```

***

### clamp()

```ts
clamp(min?, max?): this;
```

Clamp color values to a specified range for stability.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `min?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Minimum value (default: 0.0) |
| `max?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Maximum value (default: 1.0) |

#### Returns

`this`

#### Example

```typescript
osc(5).add(osc(8), 0.8).add(osc(12), 0.6).clamp(0.2, 0.8)
```

#### Inherited from

```ts
ISynthSource.clamp
```

***

### add()

```ts
add(source, amount?): this;
```

Add another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Source to add |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

#### Example

```typescript
// Add two shapes with animated blend amount
shape(3)
  .scale(0.5)
  .add(shape(4).scale(2), [0, 0.25, 0.5, 0.75, 1])
```

#### Inherited from

```ts
ISynthSource.add
```

***

### sub()

```ts
sub(source, amount?): this;
```

Subtract another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Source to subtract |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.sub
```

***

### mult()

```ts
mult(source, amount?): this;
```

Multiply with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Source to multiply |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.mult
```

***

### blend()

```ts
blend(source, amount?): this;
```

Blend with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Source to blend |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

#### Example

```typescript
// Blend two shapes
shape(3)
  .scale(0.5)
  .blend(shape(4).scale(2), [0, 0.25, 0.5, 0.75, 1])
```

#### Inherited from

```ts
ISynthSource.blend
```

***

### diff()

```ts
diff(source): this;
```

Difference with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Source to compare |

#### Returns

`this`

#### Example

```typescript
osc(1, 0.1, 2).diff(osc(1, 0.5, 5))
```

#### Inherited from

```ts
ISynthSource.diff
```

***

### layer()

```ts
layer(source): this;
```

Layer another source on top.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Source to layer |

#### Returns

`this`

#### Example

```typescript
  osc(1)
  .charColor(osc(30).layer(osc(15).rotate(1).luma()))
  .cellColor(osc(30).layer(osc(15).rotate(1).luma()).invert())
```

#### Inherited from

```ts
ISynthSource.layer
```

***

### mask()

```ts
mask(source): this;
```

Mask using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Source to use as mask |

#### Returns

`this`

#### Example

```typescript
// Mask gradient with voronoi pattern
gradient(5).mask(voronoi()).invert([0, 1])
```

#### Inherited from

```ts
ISynthSource.mask
```

***

### modulate()

```ts
modulate(source, amount?): this;
```

Modulate coordinates using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Modulation source |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Modulation amount (default: 0.1) |

#### Returns

`this`

#### Example

```typescript
osc(3, 0, 2)
    .modulate(noise().add(gradient(), -1), 1)
```

#### Inherited from

```ts
ISynthSource.modulate
```

***

### modulateScale()

```ts
modulateScale(
   source, 
   multiple?, 
   offset?): this;
```

Modulate scale using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Modulation source |
| `multiple?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 1.0) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.modulateScale
```

***

### modulateRotate()

```ts
modulateRotate(
   source, 
   multiple?, 
   offset?): this;
```

Modulate rotation using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Modulation source |
| `multiple?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Rotation multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 0.0) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.modulateRotate
```

***

### modulatePixelate()

```ts
modulatePixelate(
   source, 
   multiple?, 
   offset?): this;
```

Modulate pixelation using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Modulation source |
| `multiple?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Pixelation multiplier (default: 10.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 3.0) |

#### Returns

`this`

#### Example

```typescript
noise(3).modulatePixelate(noise(1, 0).pixelate(8, 8), 1024, 8)
```

#### Inherited from

```ts
ISynthSource.modulatePixelate
```

***

### modulateKaleid()

```ts
modulateKaleid(source, nSides?): this;
```

Modulate kaleidoscope using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Modulation source |
| `nSides?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of sides (default: 4.0) |

#### Returns

`this`

#### Example

```typescript
osc(2, 0.1, 2)
    .modulateKaleid(osc(16).kaleid(999), 1)
```

#### Inherited from

```ts
ISynthSource.modulateKaleid
```

***

### modulateScrollX()

```ts
modulateScrollX(
   source, 
   scrollX?, 
   speed?): this;
```

Modulate X scroll using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Modulation source |
| `scrollX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X scroll amount (default: 0.5) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scroll speed (default: 0.0) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.modulateScrollX
```

***

### modulateScrollY()

```ts
modulateScrollY(
   source, 
   scrollY?, 
   speed?): this;
```

Modulate Y scroll using another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `ISynthSource` | Modulation source |
| `scrollY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y scroll amount (default: 0.5) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scroll speed (default: 0.0) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.modulateScrollY
```

***

### charMap()

```ts
charMap(chars): this;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chars` | `string` |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.charMap
```

***

### charColor()

```ts
charColor(source): this;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | `SynthSource` |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.charColor
```

***

### char()

```ts
char(source): this;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | `SynthSource` |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.char
```

***

### cellColor()

```ts
cellColor(source): this;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | `SynthSource` |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.cellColor
```

***

### paint()

```ts
paint(source): this;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | `SynthSource` |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.paint
```

***

### clone()

```ts
clone(): SynthSource;
```

#### Returns

`SynthSource`

#### Inherited from

```ts
ISynthSource.clone
```
