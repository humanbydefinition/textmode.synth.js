[textmode.synth.js](../index.md) / SynthPlugin

# Variable: SynthPlugin

```ts
const SynthPlugin: TextmodePlugin;
```

The textmode-synth plugin.

Install this plugin to enable `.synth()` on TextmodeLayer instances.

## Example

```typescript
import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, osc } from 'textmode.synth.js';

const t = textmode.create({ plugins: [SynthPlugin] });

const layer = t.layers.add();

// Can be called globally, before setup()
layer.synth(
  charNoise(10)
    .charMap('@#%*+=-:. ')
    .charColor(osc(5).kaleid(4))
);
```
