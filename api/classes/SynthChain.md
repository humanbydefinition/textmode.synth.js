[textmode.synth.js](../index.md) / SynthChain

# Class: SynthChain

A mutable chain of transform records for the fluent API.
While the internal implementation is mutable for compatibility with the
existing fluent API, the returned readonly arrays provide a consistent view.

## Accessors

### isEmpty

#### Get Signature

```ts
get isEmpty(): boolean;
```

Check if the chain is empty.

##### Returns

`boolean`

***

### length

#### Get Signature

```ts
get length(): number;
```

Get the number of transforms in this chain.

##### Returns

`number`

***

### transforms

#### Get Signature

```ts
get transforms(): readonly TransformRecord[];
```

Get all transforms in this chain (readonly view).

##### Returns

readonly [`TransformRecord`](../interfaces/TransformRecord.md)[]

## Methods

### \[iterator\]()

```ts
iterator: Iterator<TransformRecord>;
```

Create an iterator over the transforms.

#### Returns

`Iterator`\<[`TransformRecord`](../interfaces/TransformRecord.md)\>

***

### $push()

```ts
$push(record): void;
```

**`Internal`**

Push a transform to this chain (internal mutation).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `record` | [`TransformRecord`](../interfaces/TransformRecord.md) |

#### Returns

`void`

***

### append()

```ts
append(record): SynthChain;
```

Append a transform to this chain, returning a new chain.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `record` | [`TransformRecord`](../interfaces/TransformRecord.md) |

#### Returns

`SynthChain`

***

### get()

```ts
get(index): TransformRecord | undefined;
```

Get a transform at a specific index.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `index` | `number` |

#### Returns

[`TransformRecord`](../interfaces/TransformRecord.md) \| `undefined`

***

### empty()

```ts
static empty(): SynthChain;
```

Create an empty chain.

#### Returns

`SynthChain`

***

### from()

```ts
static from(transforms): SynthChain;
```

Create a chain from existing transforms.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `transforms` | readonly [`TransformRecord`](../interfaces/TransformRecord.md)[] |

#### Returns

`SynthChain`
