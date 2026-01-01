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

## Implements

- `ISynthSource`

## Methods

### cellColor()

```ts
cellColor(source): this;
```

Set the cell background colors using a color source chain.

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
noise(10).cellColor(solid(0, 0, 0, 0))

// Complement of character color
noise(10).charColor(osc(5)).cellColor(osc(5).invert())
```

#### Implementation of

```ts
ISynthSource.cellColor
```

***

### char()

```ts
char(source, charCount): this;
```

Set the character indices using a character source chain.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | A synth source producing character indices |
| `charCount` | `number` | Number of different characters to use from the character mapping |

#### Returns

`this`

The SynthSource for chaining

#### Example

```ts
// Use noise to select characters
char(noise(10), 16)

// Use oscillator to select characters
char(osc(5), 8)
```

#### Implementation of

```ts
ISynthSource.char
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
// Use oscillator for grayscale colors
noise(10).charColor(osc(5, 0.1))

// Use solid color
noise(10).charColor(solid(1, 0.5, 0))

// Use gradient
noise(10).charColor(gradient(0.5).hue(0.3))
```

#### Implementation of

```ts
ISynthSource.charColor
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
noise(10).charMap('@#%*+=-:. ')

// Use block characters
osc(1).charMap(' .:-=+*#%@')

// Use custom symbols
gradient().charMap('-<>^v')
```

#### Implementation of

```ts
ISynthSource.charMap
```

***

### clone()

```ts
clone(): SynthSource;
```

Create a deep clone of this SynthSource.
Useful when you want to create a modified version of an existing chain
without affecting the original.

#### Returns

`SynthSource`

A new SynthSource with the same transform chain

#### Example

```ts
// Create a color chain and use a modified clone for cell color
const colorChain = voronoi(10, 0.5).mult(osc(20));

noise(10)
  .paint(colorChain)
  .cellColor(colorChain.clone().invert())

// Or use it to create variations of a base pattern
const base = osc(10, 0.1);
const rotated = base.clone().rotate(0.5);
const scaled = base.clone().scale(2);
```

#### Implementation of

```ts
ISynthSource.clone
```

***

### paint()

```ts
paint(source): this;
```

Set both character foreground and cell background color using the same source chain.
This is a convenience method that combines `.charColor()` and `.cellColor()` in one call.

After calling `paint()`, you can still override the cell color separately using `.cellColor()`.

Otherwise useful for pixel art styles where both colors are the same, making the characters redundant.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `SynthSource` | A SynthSource producing color values |

#### Returns

`this`

The SynthSource for chaining

#### Example

```ts
// Apply same color to both character and cell background
noise(10).paint(osc(5, 0.1).kaleid(4))

// Apply color to both, then invert just the cell background
noise(10)
  .paint(voronoi(10, 0.5).mult(osc(20)))
  .cellColor(voronoi(10, 0.5).mult(osc(20)).invert())
```

#### Implementation of

```ts
ISynthSource.paint
```
