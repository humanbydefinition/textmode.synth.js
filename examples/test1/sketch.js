import { textmode } from 'textmode.js';
import { SynthPlugin, gradient, paint, osc, src, shape, voronoi, char, noise, cellColor, solid, charColor} from 'textmode.synth.js';

// Create textmode instance with SynthPlugin
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  fontSize: 16,
  plugins: [SynthPlugin]
});

t.layers.base.synth(
  shape(4)
    .rotate([-3.14, 3.14].ease('easeInOutCubic'))
);


t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});