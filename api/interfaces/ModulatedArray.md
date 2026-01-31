[textmode.synth.js](../index.md) / ModulatedArray

# Interface: ModulatedArray

Extended array interface with modulation methods.

Arrays in textmode.synth.js behave like hydra - they cycle through values over time,
creating dynamic, time-varying parameters. This enables complex animations without
manually tracking time or state.

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Rotating shape with eased animation
t.layers.base.synth(
  shape(4)
    .rotate([-3.14, 3.14].ease('easeInOutCubic'))
);
```

## Extends

- `Array`\<`number`\>

## Indexable

```ts
[n: number]: number
```

## Methods

### fast()

```ts
fast(speed): this;
```

Set speed multiplier for array cycling.

Controls how fast the array cycles through its values over time.
A speed of 1 is the default rate. Values > 1 cycle faster, values < 1 cycle slower.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `speed` | `number` | Speed multiplier (default: 1) |

#### Returns

`this`

The array for chaining

#### Example

```typescript
// Fast cycling through frequencies
osc([1, 2, 4].fast(2), 0.1, 1.5)

// Slow cycling through scroll positions
shape(4).scrollX([-0.5, 0.5].fast(0.3))

// Use same array for multiple parameters
const speeds = [1, 3, 6].fast(2);
osc(speeds, 0.1, 1.5, 16)
  .charColor(osc(speeds, 0.1, 1.5))
```

***

### smooth()

```ts
smooth(amount?): this;
```

Enable smooth interpolation between array values.

Instead of jumping from one value to the next, smooth() creates gradual
transitions. The amount parameter controls the smoothing duration.
When amount is 1 (default), smoothing is applied across the full transition.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount?` | `number` | Smoothing amount 0-1 (default: 1) |

#### Returns

`this`

The array for chaining

#### Example

```typescript
// Smooth scrolling between positions
shape(999).scrollX([-0.2, 0.2].smooth())

// Gentle rotation animation
shape(4).rotate([-3.14, 0, 3.14].smooth(0.8))

// Smooth color transitions
solid([0, 0.5, 1].smooth(), 0, 0)
```

***

### ease()

```ts
ease(ease): this;
```

Apply easing function to interpolation between array values.

Easing controls the acceleration curve of transitions between values.
Automatically enables smoothing when applied. Use built-in easing names
or provide a custom function that takes a value 0-1 and returns 0-1.

Available easing functions: `'linear'`, `'easeInQuad'`, `'easeOutQuad'`,
`'easeInOutQuad'`, `'easeInCubic'`, `'easeOutCubic'`, `'easeInOutCubic'`,
`'easeInQuart'`, `'easeOutQuart'`, `'easeInOutQuart'`, `'easeInQuint'`,
`'easeOutQuint'`, `'easeInOutQuint'`, `'sin'`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ease` | [`EasingFunction`](../type-aliases/EasingFunction.md) | Easing function name or custom function (default: 'linear') |

#### Returns

`this`

The array for chaining

#### Example

```typescript
// Smooth rotation with cubic easing
shape(4).rotate([-3.14, 3.14].ease('easeInOutCubic'))

// Sine wave easing for natural motion
shape(3).scale([0.5, 1.5].ease('sin'))

// Custom easing function (bounce effect)
const bounce = (t) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};
shape(5).scale([0.8, 1.2].ease(bounce))
```

***

### offset()

```ts
offset(offset): this;
```

Set time offset for array cycling.

Shifts when the array starts cycling through its values.
Useful for creating phase-shifted animations where multiple arrays
cycle with the same speed but at different times.

The offset wraps around at 1.0, so offset(0.5) starts halfway through
the cycle, and offset(1.5) is equivalent to offset(0.5).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `offset` | `number` | Time offset 0-1, wraps at 1.0 (default: 0) |

#### Returns

`this`

The array for chaining

#### Example

```typescript
// Two shapes scrolling in opposite phase
shape(999).scrollX([-0.2, 0.2])
  .add(shape(4).scrollX([-0.2, 0.2].offset(0.5)))

// Create layered animations with phase shifts
const positions = [-0.3, 0.3];
shape(3).scroll(positions, positions.offset(0.25))

// Three oscillators with 120° phase difference
osc([5, 10].offset(0)).add(
  osc([5, 10].offset(0.33)), 0.5
).add(
  osc([5, 10].offset(0.66)), 0.5
)
```

***

### fit()

```ts
fit(low, high): ModulatedArray;
```

Fit (remap) array values to a new range.

Takes the minimum and maximum values in the array and linearly maps them
to the specified low and high values. All intermediate values are scaled
proportionally. The original array is not modified.

Preserves any modulation settings (speed, smooth, ease, offset) from the
original array.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `low` | `number` | New minimum value |
| `high` | `number` | New maximum value |

#### Returns

`ModulatedArray`

A new ModulatedArray with remapped values

#### Example

```typescript
// Remap 0-4 range to -0.2 to 0.2 for subtle scrolling
shape(999).scrollX([0, 1, 2, 3, 4].fit(-0.2, 0.2))

// Normalize arbitrary values to 0-1 range
const values = [50, 100, 75, 125].fit(0, 1);
solid(values, 0, 0)

// Combine with other modulation
shape(3).scale([0, 100].fit(0.5, 1.5).smooth().fast(0.5))
```
