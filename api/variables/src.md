[textmode.synth.js](../index.md) / src

# Variable: src()

```ts
const src: (layer?) => SynthSource;
```

Sample the previous frame's primary color output for feedback effects.
This is the core of feedback loops - it reads from the previous frame's
character foreground color, enabling effects like trails, motion blur, 
and recursive patterns.

**Context-aware behavior:** When called without arguments, `src()` automatically 
samples the appropriate texture based on where it's used in the synth chain:
- Inside `char(...)` → samples previous frame's character data
- Inside `charColor(...)` → samples previous frame's primary color
- Inside `cellColor(...)` → samples previous frame's cell color

**Cross-layer sampling:** When called with a layer argument, `src(layer)` samples 
from another layer's output, enabling hydra-style multi-output compositions:
- The sampled texture is still context-aware based on the current compilation target

Equivalent to hydra's `src(o0)`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `layer?` | \{ `id?`: `string`; \} | Optional TextmodeLayer to sample from. If omitted, samples from self (feedback). |
| `layer.id?` | `string` | - |

## Returns

[`SynthSource`](../classes/SynthSource.md)

A new SynthSource that samples the specified layer or self

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
const layer2 = t.layers.add();

layer1.synth(noise(10).mult(osc(20)));

layer2.synth(
  char(voronoi(5).diff(src(layer1)))  // Sample layer1's char texture
    .charColor(osc(10).blend(src(layer1), 0.5))  // Sample layer1's primary color
);

// Complex multi-layer composition
t.layers.base.synth(
  noise(3, 0.3).thresh(0.3).diff(src(layer2), 0.3)
);
```
