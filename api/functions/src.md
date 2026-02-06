[textmode.synth.js](../index.md) / src

# Function: src()

```ts
function src(source?): SynthSource;
```

Sample a source for synth compositions.

This is the core of feedback loops and source sampling - it reads from various sources,
enabling effects like trails, motion blur, image processing, and recursive patterns.

**Three modes of operation:**

1. **Self-feedback** (`src()` with no arguments): Samples from the previous frame
   - Context-aware: automatically samples the appropriate texture based on compilation context
   - Inside `char(...)` → samples previous frame's character data
   - Inside `charColor(...)` → samples previous frame's primary color
   - Inside `cellColor(...)` → samples previous frame's cell color

2. **Cross-layer sampling** (`src(layer)`): Samples from another layer's output
   - Enables hydra-style multi-output compositions
   - Context-aware based on current compilation target

3. **TextmodeSource sampling** (`src(image)` or `src(video)`): Samples from loaded media
   - Works with TextmodeImage and TextmodeVideo loaded via `t.loadImage()` or `t.loadVideo()`
   - Samples directly from the source texture

Equivalent to hydra's `src(o0)`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source?` | \| `TextmodeLayer` \| `TextmodeSource` \| () => `TextmodeLayer` \| `TextmodeSource` \| `undefined` | Optional source to sample from: TextmodeLayer for cross-layer, or TextmodeImage/TextmodeVideo for media |

## Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource that samples the specified source or self

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

// Classic hydra-style feedback loop with noise modulation
t.layers.base.synth(
  src().modulate(noise(3), 0.005).blend(shape(4), 0.01)
);

// Cross-layer sampling (hydra-style o0, o1, etc.)
const layer1 = t.layers.add();
layer1.synth(noise(10).mult(osc(20)));
t.layers.base.synth(src(layer1).invert());

// TextmodeImage/Video sampling
let img;
t.setup(async () => {
  img = await t.loadImage('https://example.com/image.jpg');
});
t.layers.base.synth(
  char(src(img))
    .charColor(src(img))
    .cellColor(src(img).invert())
);

// Lazy evaluation (allows global definition before load)
let video;
// This works even if video is currently undefined
t.layers.base.synth(src(() => video));

t.setup(async () => {
  video = await t.loadVideo('video.mp4');
});
```
