[textmode.synth.js](../index.md) / ModulatedArray

# Interface: ModulatedArray

Extended array interface with modulation methods.

Arrays in textmode.synth.js behave like hydra - they cycle through values over time,
creating dynamic, time-varying parameters. This enables complex animations without
manually tracking time or state.

## Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc([4, 8, 12].fast(1.5), 0.1, 1.2)
    .kaleid(5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  osc([4, 8, 12].fast(2), 0.1, 1.2)
    .kaleid(5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(5, 0.4)
    .scale([0.6, 1.2].smooth(0.8))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4)
    .rotate([-1.5, 1.5].ease('sin'))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

const base = [6, 12, 18].fast(1.5);

t.layers.base.synth(
  osc(base, 0.1, 1.2)
    .layer(osc(base.offset(0.5), 0.1, 1.2), 0.5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(6)
    .scale([2, 6].fit(0.5, 1.5))
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```
