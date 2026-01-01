import { textmode } from 'textmode.js';
import { SynthPlugin, solid, osc, noise, char, gradient, voronoi, shape, cellColorSrc, cellColor, paint, charSrc, src, charColor } from 'textmode.synth.js';

// Create textmode instance with SynthPlugin
const t = textmode.create({
    width: 800,
    height: 600,
    fontSize: 8,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
  paint(gradient(0.5))
);

t.layers.base.draw(() => {

});