[textmode.synth.js](../index.md) / ModulatedArray

# Interface: ModulatedArray

Extended array interface with modulation methods.

## Extends

- `Array`\<`number`\>

## Indexable

```ts
[n: number]: number
```

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="_ease"></a> `_ease?` | (`t`) => `number` | Easing function for interpolation |
| <a id="_offset"></a> `_offset?` | `number` | Time offset for array cycling |
| <a id="_smooth"></a> `_smooth?` | `number` | Smoothing amount (0-1) for interpolation |
| <a id="_speed"></a> `_speed?` | `number` | Speed multiplier for array cycling |

## Methods

### ease()

```ts
ease(ease): this;
```

Set easing function

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ease` | [`EasingFunction`](../type-aliases/EasingFunction.md) |

#### Returns

`this`

***

### fast()

```ts
fast(speed): this;
```

Set speed multiplier

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `speed` | `number` |

#### Returns

`this`

***

### fit()

```ts
fit(low, high): ModulatedArray;
```

Fit values to a new range

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `low` | `number` |
| `high` | `number` |

#### Returns

`ModulatedArray`

***

### offset()

```ts
offset(offset): this;
```

Set time offset

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `offset` | `number` |

#### Returns

`this`

***

### smooth()

```ts
smooth(amount?): this;
```

Set smoothing for interpolation

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `amount?` | `number` |

#### Returns

`this`
