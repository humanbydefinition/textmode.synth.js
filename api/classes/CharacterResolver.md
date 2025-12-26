[textmode.synth.js](../index.md) / CharacterResolver

# Class: CharacterResolver

Resolver for character indices using font data.

## Constructors

### Constructor

```ts
new CharacterResolver(): CharacterResolver;
```

#### Returns

`CharacterResolver`

## Methods

### invalidate()

```ts
invalidate(): void;
```

Invalidate the cache.

#### Returns

`void`

***

### resolve()

```ts
resolve(chars, font): Int32Array;
```

Resolve character indices using the font's character map.
Caches the result to avoid repeated lookups.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `chars` | `string` | The character string to resolve |
| `font` | `TextmodeFont` | The font to use for resolution |

#### Returns

`Int32Array`

Array of resolved font indices
