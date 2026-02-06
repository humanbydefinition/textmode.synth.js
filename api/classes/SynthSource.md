[textmode.synth.js](../index.md) / SynthSource

# Class: SynthSource

A chainable synthesis source that accumulates transforms to be compiled into a shader.

This is the core class that enables hydra-like method chaining for
generating procedural textmode visuals. Each method call adds a
transform to the chain, which is later compiled into a GLSL shader.

## Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

const synth = noise(10)
  .rotate(0.2)
  .scroll(0.1, 0)
  .charColor(osc(5, 0.1, 1.2).kaleid(4))
  .cellColor(osc(5, 0.1, 1.2).kaleid(4).invert())
  .charMap('@#%*+=-:. ');

t.layers.base.synth(synth);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .kaleid(5)
    .color(0.9, 0.2, 1.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise(10, 0.1)
    .color(0.2, 0.6, 1.0)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.noise
```

***

### plasma()

```ts
plasma(
   scale?, 
   speed?, 
   phase?, 
   contrast?): this;
```

Generate plasma-like sine field patterns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Spatial scale of the plasma (default: 10.0) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Animation speed (default: 0.5) |
| `phase?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Phase offset (default: 0.0) |
| `contrast?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Contrast adjustment (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  plasma(8, 0.6, 0.2, 1.3)
    .kaleid(4)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.plasma
```

***

### moire()

```ts
moire(
   freqA?, 
   freqB?, 
   angleA?, 
   angleB?, 
   speed?, 
   phase?): this;
```

Generate moire interference patterns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `freqA?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Frequency of first grating (default: 20.0) |
| `freqB?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Frequency of second grating (default: 21.0) |
| `angleA?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Angle of first grating in radians (default: 0.0) |
| `angleB?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Angle of second grating in radians (default: 1.5708) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Animation speed (default: 0.1) |
| `phase?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Phase offset (default: 0.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  moire(14, 15, 0.2, 1.2, 0.2, 0.1)
    .color(0.7, 0.5, 1.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.moire
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

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  voronoi(6, 0.4, 0.2)
    .color(0.8, 0.4, 1.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  gradient(0.2)
    .kaleid(5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(6, 0.35, 0.02)
    .rotate(() => t.secs)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.shape
```

***

### solid()

#### Call Signature

```ts
solid(gray): this;
```

Generate a solid grayscale color.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `gray` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Grayscale value (0-1) |

##### Returns

`this`

##### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  solid(0.4)
    .char(osc(6, 0.1, 1.2))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

##### Inherited from

```ts
ISynthSource.solid
```

#### Call Signature

```ts
solid(
   r?, 
   g?, 
   b?, 
   a?): this;
```

Generate a solid color.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel (0-1, default: 0.0) |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel (0-1, default: 0.0) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel (0-1, default: 0.0) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel (0-1, default: 1.0) |

##### Returns

`this`

##### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  solid(0.1, 0.2, 0.5, 1)
    .char(noise(8))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

##### Inherited from

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
| `layer?` | `TextmodeLayer` | Optional TextmodeLayer to sample from. If omitted, samples from self (feedback). |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  src()
    .scale(1.01)
    .blend(osc(6, 0.1, 1.2), 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .rotate(0.4, 0.1)
    .kaleid(5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.35)
    .scale(1.6, 1.2, 0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise(6, 0.1)
    .scroll(0.2, -0.1, 0.05, 0.02)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .scrollX(0.3, 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .rotate(0.5)
    .scrollY(-0.3, 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise(8, 0.1)
    .pixelate(12, 8)
    .color(0.9, 0.6, 0.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.25)
    .repeat(4, 3, 0.1, 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.25)
    .repeatX(6, 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.25)
    .repeatY(6, 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .kaleid(7)
    .color(0.9, 0.2, 1.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.kaleid
```

***

### polar()

```ts
polar(angle?, radius?): this;
```

Convert coordinates to polar space.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `angle?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Angle offset in radians (default: 0.0) |
| `radius?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Radius multiplier (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  gradient(0.2)
    .polar(0.2, 1.2)
    .kaleid(5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.polar
```

***

### twirl()

```ts
twirl(
   amount?, 
   radius?, 
   centerX?, 
   centerY?): this;
```

Twirl distortion with radial falloff.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Twirl strength (default: 2.0) |
| `radius?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Effect radius (default: 0.5) |
| `centerX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center X (default: 0.5) |
| `centerY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center Y (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(5, 0.35)
    .twirl(1.5, 0.4)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.twirl
```

***

### swirl()

```ts
swirl(
   amount?, 
   centerX?, 
   centerY?): this;
```

Swirl distortion around a center.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Swirl strength (default: 4.0) |
| `centerX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center X (default: 0.5) |
| `centerY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center Y (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise(4, 0.1)
    .swirl(3, 0.5, 0.5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.swirl
```

***

### mirror()

```ts
mirror(mirrorX?, mirrorY?): this;
```

Mirror coordinates across X and/or Y axes.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `mirrorX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Mirror X (0-1, default: 1.0) |
| `mirrorY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Mirror Y (0-1, default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .mirror(1, 0)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.mirror
```

***

### shear()

```ts
shear(
   x?, 
   y?, 
   centerX?, 
   centerY?): this;
```

Shear coordinates along X and Y axes.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X shear amount (default: 0.0) |
| `y?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y shear amount (default: 0.0) |
| `centerX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center X (default: 0.5) |
| `centerY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center Y (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.3)
    .shear(0.2, -0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.shear
```

***

### barrel()

```ts
barrel(
   amount?, 
   centerX?, 
   centerY?): this;
```

Barrel distortion (bulge outward).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Distortion amount (default: 0.5) |
| `centerX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center X (default: 0.5) |
| `centerY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center Y (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  gradient(0.2)
    .barrel(0.6)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.barrel
```

***

### pinch()

```ts
pinch(
   amount?, 
   centerX?, 
   centerY?): this;
```

Pinch distortion (pull inward).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Distortion amount (default: 0.5) |
| `centerX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center X (default: 0.5) |
| `centerY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center Y (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  gradient(0.2)
    .pinch(0.6)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.pinch
```

***

### fisheye()

```ts
fisheye(
   amount?, 
   centerX?, 
   centerY?): this;
```

Fisheye lens distortion.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Distortion amount (default: 1.0) |
| `centerX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center X (default: 0.5) |
| `centerY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Center Y (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .fisheye(0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.fisheye
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .brightness(0.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .contrast(1.6)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.35)
    .invert(1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .saturate(2.5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .hue(0.3)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise(4, 0.1)
    .colorama(0.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  gradient(0.2)
    .posterize(4, 0.7)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(10, 0.1, 1.2)
    .luma(0.5, 0.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise(6, 0.1)
    .thresh(0.4, 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.thresh
```

***

### color()

#### Call Signature

```ts
color(gray): this;
```

Multiply all channels by a scalar value (grayscale).

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `gray` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scalar multiplier |

##### Returns

`this`

##### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .color(0.6)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

##### Inherited from

```ts
ISynthSource.color
```

#### Call Signature

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

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `r?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Red channel multiplier (default: 1.0) |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Green channel multiplier (default: 1.0) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blue channel multiplier (default: 1.0) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Alpha channel multiplier (default: 1.0) |

##### Returns

`this`

##### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(10, 0.1, 1.2)
    .color(0.2, 0.6, 1.0)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

##### Inherited from

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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .hue(0.4)
    .r(1.2, 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  gradient(0.2)
    .g(1.2, 0.1)
    .kaleid(5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  gradient(0.2)
    .colorama(0.2)
    .b(1.2, 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .shift(0.2, -0.1, 0.1, 0)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(8, 0.1, 1.2)
    .gamma(1.4)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise(8, 0.1)
    .levels(0.1, 0.9, 0.0, 1.0, 1.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .add(osc(12, 0.1, 0.5), 0.6)
    .clamp(0.2, 0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.clamp
```

***

### seed()

```ts
seed(value): this;
```

Set a seed for deterministic randomness in this source chain.

When set, noise-based functions (noise, voronoi) will produce
reproducible patterns. Different seeds produce different patterns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Seed value (any number) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise(10, 0.1)
    .seed(42)
    .charMap('@#%*+=-:. ')
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.seed
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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to add |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(3, 0.3)
    .add(shape(4, 0.25).rotate(0.3), 0.5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to subtract |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(100, 0.5)
    .sub(shape(100, 0.3), 1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to multiply |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.4)
    .mult(noise(10, 0.1), 0.8)
    .color(1, 0.5, 0.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to blend |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(3, 0.3)
    .blend(shape(4, 0.4), 0.5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to compare |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .diff(osc(12, 0.2, 0.4))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to layer |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .layer(osc(12, 0.2, 0.4).rotate(0.5), 0.5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to use as mask |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  gradient(0.2)
    .mask(voronoi(6, 0.4, 0.2))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.mask
```

***

### screen()

```ts
screen(source, amount?): this;
```

Screen blend with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to screen |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .screen(osc(12, 0.2, 0.4), 0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.screen
```

***

### overlay()

```ts
overlay(source, amount?): this;
```

Overlay blend with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to overlay |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .overlay(osc(12, 0.2, 0.4), 0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.overlay
```

***

### softlight()

```ts
softlight(source, amount?): this;
```

Soft light blend with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to softlight |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .softlight(osc(12, 0.2, 0.4), 0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.softlight
```

***

### hardlight()

```ts
hardlight(source, amount?): this;
```

Hard light blend with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to hardlight |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .hardlight(osc(12, 0.2, 0.4), 0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.hardlight
```

***

### dodge()

```ts
dodge(source, amount?): this;
```

Color dodge blend with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to dodge |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .dodge(osc(12, 0.2, 0.4), 0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.dodge
```

***

### burn()

```ts
burn(source, amount?): this;
```

Color burn blend with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to burn |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .burn(osc(12, 0.2, 0.4), 0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.burn
```

***

### lighten()

```ts
lighten(source, amount?): this;
```

Lighten blend with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to lighten |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .lighten(osc(12, 0.2, 0.4), 0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.lighten
```

***

### darken()

```ts
darken(source, amount?): this;
```

Darken blend with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Source to darken |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Blend amount (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .darken(osc(12, 0.2, 0.4), 0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.darken
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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Modulation source |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Modulation amount (default: 0.1) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .modulate(noise(3, 0.1), 0.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Modulation source |
| `multiple?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scale multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.35)
    .modulateScale(osc(6, 0.1, 1.2), 1.5, 0.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Modulation source |
| `multiple?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Rotation multiplier (default: 1.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 0.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.35)
    .modulateRotate(noise(2, 0.1), 0.5, 0)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Modulation source |
| `multiple?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Pixelation multiplier (default: 10.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 3.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise(4, 0.1)
    .modulatePixelate(osc(8, 0.1, 1.2), 20, 5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Modulation source |
| `nSides?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of sides (default: 4.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .modulateKaleid(osc(12, 0.2, 0.4), 7)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Modulation source |
| `scrollX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X scroll amount (default: 0.5) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scroll speed (default: 0.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .modulateScrollX(noise(3, 0.1), 0.5, 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

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
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Modulation source |
| `scrollY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y scroll amount (default: 0.5) |
| `speed?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Scroll speed (default: 0.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc(6, 0.1, 1.2)
    .modulateScrollY(noise(3, 0.1), 0.5, 0.1)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.modulateScrollY
```

***

### modulateRepeat()

```ts
modulateRepeat(
   source, 
   repeatX?, 
   repeatY?, 
   offsetX?, 
   offsetY?): this;
```

Modulate repeat pattern with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Modulation source |
| `repeatX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X repetitions (default: 3.0) |
| `repeatY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y repetitions (default: 3.0) |
| `offsetX?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | X offset (default: 0.5) |
| `offsetY?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Y offset (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.25)
    .modulateRepeat(osc(6, 0.1, 1.2), 3, 3, 0.2, 0.2)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.modulateRepeat
```

***

### modulateRepeatX()

```ts
modulateRepeatX(
   source, 
   reps?, 
   offset?): this;
```

Modulate X repeat with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Modulation source |
| `reps?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of repetitions (default: 3.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.25)
    .modulateRepeatX(noise(3, 0.1), 3, 0.5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.modulateRepeatX
```

***

### modulateRepeatY()

```ts
modulateRepeatY(
   source, 
   reps?, 
   offset?): this;
```

Modulate Y repeat with another source.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Modulation source |
| `reps?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Number of repetitions (default: 3.0) |
| `offset?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Offset amount (default: 0.5) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4, 0.25)
    .modulateRepeatY(noise(3, 0.1), 3, 0.5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.modulateRepeatY
```

***

### modulateHue()

```ts
modulateHue(source, amount?): this;
```

Modulate coordinates based on hue differences.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` | Modulation source |
| `amount?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) | Modulation amount (default: 1.0) |

#### Returns

`this`

#### Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  src()
    .modulateHue(src().scale(1.01), 0.8)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### Inherited from

```ts
ISynthSource.modulateHue
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
charColor(
   rOrSource, 
   g?, 
   b?, 
   a?): this;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rOrSource` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) |

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
cellColor(
   rOrSource, 
   g?, 
   b?, 
   a?): this;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rOrSource` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) |

#### Returns

`this`

#### Inherited from

```ts
ISynthSource.cellColor
```

***

### paint()

```ts
paint(
   rOrSource, 
   g?, 
   b?, 
   a?): this;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rOrSource` | \| [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) \| `ISynthSource` |
| `g?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) |
| `b?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) |
| `a?` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md) |

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
