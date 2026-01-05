[textmode.synth.js](../index.md) / SynthContext

# Interface: SynthContext

Context passed to dynamic parameter functions during rendering.

## Example

```typescript
const t = textmode.create({
  width: 800,
  height: 600,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise((ctx) => Math.sin(ctx.time) * 10)
);
```

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="time"></a> `time` | `number` | Current time in seconds |
| <a id="framecount"></a> `frameCount` | `number` | Current frame count |
| <a id="width"></a> `width` | `number` | Grid width in pixels |
| <a id="height"></a> `height` | `number` | Grid height in pixels |
| <a id="cols"></a> `cols` | `number` | Grid columns |
| <a id="rows"></a> `rows` | `number` | Grid rows |
| <a id="bpm"></a> `bpm` | `number` | Current BPM (beats per minute) for array modulation timing |
