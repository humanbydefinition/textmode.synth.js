import { textmode } from 'textmode.js';
import { SynthPlugin, gradient, paint, osc, src, shape, voronoi, char, noise } from 'textmode.synth.js';

// Create textmode instance with SynthPlugin
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  fontSize: 8,
  plugins: [SynthPlugin]
});

const layer1 = t.layers.add({ blendMode: 'normal', fontSize: 8 });
const layer2 = t.layers.add({ blendMode: 'normal', fontSize: 8 });
const layer3 = t.layers.add({ blendMode: 'normal', fontSize: 8 });

// voronoi(33,3,30).rotate(3,0.3,0).modulateScale(o2,0.3).color(-3,3,0).brightness(3).out(o0)
// noise(3,0.3,3).thresh(0.3,0.03).diff(o3,0.3).out(o1)
// shape(30,0.3,1).invert(({time})=>Math.sin(time)*3).out(o2)
// gradient([0.3,0.3,3]).diff(o0).blend(o1).out(o3)

t.layers.base.synth(
  paint(voronoi(33, 3, 30).rotate(3, 0.3, 0).modulateScale(src(layer2), 0.3).color(-3, 3, 0).brightness(3))
);

layer1.synth(
  paint(noise(3, 0.3, 3).thresh(0.3, 0.03).diff(src(layer3), 0.3))

);

layer2.synth(
  paint(shape(30, 0.3, 1).invert(({ time }) => Math.sin(time) * 3))
);

layer3.synth(
  paint(gradient([0.3, 0.3, 3]).diff(src(t.layers.base)).blend(src(layer1)))
);
