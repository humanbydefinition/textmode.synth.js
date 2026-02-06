[textmode.synth.js](../index.md) / SynthContext

# Interface: SynthContext

Context passed to dynamic parameter functions during rendering.

## Example

```ts
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  noise((ctx) => 6 + Math.sin(ctx.time) * 4)
    .kaleid(5)
);

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
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
| <a id="onerror"></a> `onError?` | (`error`, `uniformName`) => `void` | Optional callback for handling dynamic parameter evaluation errors |
