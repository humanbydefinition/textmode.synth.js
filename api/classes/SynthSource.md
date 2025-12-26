[textmode.synth.js](../index.md) / SynthSource

# Class: SynthSource

A chainable synthesis source that accumulates transforms to be compiled into a shader.

## Implements

- [`ISynthSource`](../interfaces/ISynthSource.md)

## Constructors

### Constructor

```ts
new SynthSource(options?): SynthSource;
```

**`Internal`**

Create a new SynthSource.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | `SynthSourceCreateOptions` | Optional initialization options Use generator functions like `osc()`, `noise()` instead |

#### Returns

`SynthSource`

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="add"></a> `add` | `public` | (`source`, `amount?`) => `this` |
| <a id="b"></a> `b` | `public` | (`scale?`, `offset?`) => `this` |
| <a id="blend"></a> `blend` | `public` | (`source`, `amount?`) => `this` |
| <a id="brightness"></a> `brightness` | `public` | (`amount?`) => `this` |
| <a id="cellcolorcomplement"></a> `cellColorComplement` | `public` | (`amount?`) => `this` |
| <a id="cellcolorfromchar"></a> `cellColorFromChar` | `public` | (`hueShift?`, `saturation?`, `brightness?`) => `this` |
| <a id="cellcolorsolid"></a> `cellColorSolid` | `public` | (`r?`, `g?`, `b?`, `a?`) => `this` |
| <a id="charcolorfromindex"></a> `charColorFromIndex` | `public` | (`hueOffset?`, `saturation?`, `brightness?`) => `this` |
| <a id="charcolorgradient"></a> `charColorGradient` | `public` | (`speed?`) => `this` |
| <a id="charcolorsolid"></a> `charColorSolid` | `public` | (`r?`, `g?`, `b?`, `a?`) => `this` |
| <a id="charflipx"></a> `charFlipX` | `public` | (`toggle?`) => `this` |
| <a id="charflipy"></a> `charFlipY` | `public` | (`toggle?`) => `this` |
| <a id="chargradient"></a> `charGradient` | `public` | (`charCount?`, `direction?`) => `this` |
| <a id="charinvert"></a> `charInvert` | `public` | (`toggle?`) => `this` |
| <a id="charnoise"></a> `charNoise` | `public` | (`scale?`, `speed?`, `charCount?`) => `this` |
| <a id="charosc"></a> `charOsc` | `public` | (`frequency?`, `sync?`, `charCount?`) => `this` |
| <a id="charrotate"></a> `charRotate` | `public` | (`angle?`, `speed?`) => `this` |
| <a id="charrotatefrom"></a> `charRotateFrom` | `public` | (`amount?`) => `this` |
| <a id="charshape"></a> `charShape` | `public` | (`sides?`, `innerChar?`, `outerChar?`, `radius?`) => `this` |
| <a id="charsolid"></a> `charSolid` | `public` | (`charIndex?`) => `this` |
| <a id="charvoronoi"></a> `charVoronoi` | `public` | (`scale?`, `speed?`, `charCount?`) => `this` |
| <a id="color"></a> `color` | `public` | (`r?`, `g?`, `b?`, `a?`) => `this` |
| <a id="colorama"></a> `colorama` | `public` | (`amount?`) => `this` |
| <a id="contrast"></a> `contrast` | `public` | (`amount?`) => `this` |
| <a id="diff"></a> `diff` | `public` | (`source`) => `this` |
| <a id="g"></a> `g` | `public` | (`scale?`, `offset?`) => `this` |
| <a id="gradient"></a> `gradient` | `public` | (`speed?`) => `this` |
| <a id="hue"></a> `hue` | `public` | (`hue?`) => `this` |
| <a id="invert"></a> `invert` | `public` | (`amount?`) => `this` |
| <a id="kaleid"></a> `kaleid` | `public` | (`nSides?`) => `this` |
| <a id="layer"></a> `layer` | `public` | (`source`) => `this` |
| <a id="luma"></a> `luma` | `public` | (`threshold?`, `tolerance?`) => `this` |
| <a id="mask"></a> `mask` | `public` | (`source`) => `this` |
| <a id="modulate"></a> `modulate` | `public` | (`source`, `amount?`) => `this` |
| <a id="modulatekaleid"></a> `modulateKaleid` | `public` | (`source`, `nSides?`) => `this` |
| <a id="modulatepixelate"></a> `modulatePixelate` | `public` | (`source`, `multiple?`, `offset?`) => `this` |
| <a id="modulaterotate"></a> `modulateRotate` | `public` | (`source`, `multiple?`, `offset?`) => `this` |
| <a id="modulatescale"></a> `modulateScale` | `public` | (`source`, `multiple?`, `offset?`) => `this` |
| <a id="modulatescrollx"></a> `modulateScrollX` | `public` | (`source`, `scrollX?`, `speed?`) => `this` |
| <a id="modulatescrolly"></a> `modulateScrollY` | `public` | (`source`, `scrollY?`, `speed?`) => `this` |
| <a id="mult"></a> `mult` | `public` | (`source`, `amount?`) => `this` |
| <a id="noise"></a> `noise` | `public` | (`scale?`, `speed?`) => `this` |
| <a id="osc"></a> `osc` | `public` | (`frequency?`, `sync?`, `offset?`) => `this` |
| <a id="pixelate"></a> `pixelate` | `public` | (`pixelX?`, `pixelY?`) => `this` |
| <a id="posterize"></a> `posterize` | `public` | (`bins?`, `gamma?`) => `this` |
| <a id="r"></a> `r` | `public` | (`scale?`, `offset?`) => `this` |
| <a id="repeat"></a> `repeat` | `public` | (`repeatX?`, `repeatY?`, `offsetX?`, `offsetY?`) => `this` |
| <a id="repeatx"></a> `repeatX` | `public` | (`reps?`, `offset?`) => `this` |
| <a id="repeaty"></a> `repeatY` | `public` | (`reps?`, `offset?`) => `this` |
| <a id="rotate"></a> `rotate` | `public` | (`angle?`, `speed?`) => `this` |
| <a id="saturate"></a> `saturate` | `public` | (`amount?`) => `this` |
| <a id="scale"></a> `scale` | `public` | (`amount?`, `xMult?`, `yMult?`, `offsetX?`, `offsetY?`) => `this` |
| <a id="scroll"></a> `scroll` | `public` | (`scrollX?`, `scrollY?`, `speedX?`, `speedY?`) => `this` |
| <a id="scrollx"></a> `scrollX` | `public` | (`scrollX?`, `speed?`) => `this` |
| <a id="scrolly"></a> `scrollY` | `public` | (`scrollY?`, `speed?`) => `this` |
| <a id="shape"></a> `shape` | `public` | (`sides?`, `radius?`, `smoothing?`) => `this` |
| <a id="solid"></a> `solid` | `public` | (`r?`, `g?`, `b?`, `a?`) => `this` |
| <a id="sub"></a> `sub` | `public` | (`source`, `amount?`) => `this` |
| <a id="thresh"></a> `thresh` | `public` | (`threshold?`, `tolerance?`) => `this` |
| <a id="voronoi"></a> `voronoi` | `public` | (`scale?`, `speed?`, `blending?`) => `this` |

## Accessors

### cellColorSource

#### Get Signature

```ts
get cellColorSource(): SynthSource | undefined;
```

**`Internal`**

Get the cell color source if defined.

##### Returns

`SynthSource` \| `undefined`

***

### charMapping

#### Get Signature

```ts
get charMapping(): CharacterMapping | undefined;
```

**`Internal`**

Get the character mapping if defined.

##### Returns

[`CharacterMapping`](../interfaces/CharacterMapping.md) \| `undefined`

***

### colorSource

#### Get Signature

```ts
get colorSource(): SynthSource | undefined;
```

**`Internal`**

Get the color source if defined.

##### Returns

`SynthSource` \| `undefined`

***

### nestedSources

#### Get Signature

```ts
get nestedSources(): Map<number, SynthSource>;
```

**`Internal`**

Get all nested sources for combine operations.

##### Returns

`Map`\<`number`, `SynthSource`\>

***

### transforms

#### Get Signature

```ts
get transforms(): readonly TransformRecord[];
```

**`Internal`**

Get the transform records.

##### Returns

readonly [`TransformRecord`](../interfaces/TransformRecord.md)[]

## Methods

### \_addCombineTransform()

```ts
_addCombineTransform(
   name, 
   source, 
   userArgs): this;
```

**`Internal`**

Add a combine transform that references another source.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `source` | `SynthSource` |
| `userArgs` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md)[] |

#### Returns

`this`

***

### \_addTransform()

```ts
_addTransform(name, userArgs): this;
```

**`Internal`**

Add a transform to the chain.
This method is called by dynamically injected transform methods.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `userArgs` | [`SynthParameterValue`](../type-aliases/SynthParameterValue.md)[] |

#### Returns

`this`

***

### cellColor()

#### Call Signature

```ts
cellColor(source): this;
```

Set the cell background color using a color source chain.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | A SynthSource producing color values, or RGBA values |

##### Returns

`this`

The SynthSource for chaining

##### Example

```ts
// Transparent background
charNoise(10).cellColor(solid(0, 0, 0, 0))

// Complement of character color
charNoise(10).charColor(osc(5)).cellColor(osc(5).invert())
```

#### Call Signature

```ts
cellColor(
   r, 
   g, 
   b, 
   a?): this;
```

Set the cell background color using a color source chain.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `r` | `number` |
| `g` | `number` |
| `b` | `number` |
| `a?` | `number` |

##### Returns

`this`

The SynthSource for chaining

##### Example

```ts
// Transparent background
charNoise(10).cellColor(solid(0, 0, 0, 0))

// Complement of character color
charNoise(10).charColor(osc(5)).cellColor(osc(5).invert())
```

***

### charColor()

#### Call Signature

```ts
charColor(source): this;
```

Set the character foreground color using a color source chain.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | A SynthSource producing color values, or RGBA values |

##### Returns

`this`

The SynthSource for chaining

##### Example

```ts
// Use oscillator for rainbow colors
charNoise(10).charColor(osc(5, 0.1))

// Use solid color
charNoise(10).charColor(solid(1, 0.5, 0))

// Use gradient
charNoise(10).charColor(gradient(0.5).hue(0.3))
```

#### Call Signature

```ts
charColor(
   r, 
   g, 
   b, 
   a?): this;
```

Set the character foreground color using a color source chain.

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `r` | `number` |
| `g` | `number` |
| `b` | `number` |
| `a?` | `number` |

##### Returns

`this`

The SynthSource for chaining

##### Example

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
charOsc(8).charMap('█▓▒░ ')

// Use custom symbols
charGradient().charMap('◆◇○●□■')
```
