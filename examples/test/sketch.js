import { textmode } from 'textmode.js';
import { SynthPlugin, gradient, paint, osc, src, shape, voronoi, char } from 'textmode.synth.js';

// Create textmode instance with SynthPlugin
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  fontSize: 8,
  plugins: [SynthPlugin]
});

const layer1 = t.layers.add({ blendMode: 'difference'})

const charChain = osc(7, -0.125).modulate(voronoi(1)).diff(voronoi(1).mult(gradient(-1).luma(0.125)))
  .luma(0.125)
  .add(shape(7, 0.5)
    .mult(voronoi(10, 2).blend(src()).diff(gradient(1)).modulate(voronoi())))
  .scrollY(-0.1)
  .scrollX(0.125)
  .blend(src())
  .blend(src());

const colorChain = osc(7, -0.125).modulate(voronoi(1)).diff(voronoi(1).mult(gradient(-1).luma(0.125)))
  .luma(0.125)
  .add(shape(7, 0.5)
    .mult(voronoi(10, 2).blend(src()).diff(gradient(1)).modulate(voronoi())))
  .scrollY(-0.1)
  .scrollX(0.125)
  .blend(src())
  .blend(src());

t.layers.base.synth(
  char(charChain)
    .charColor(colorChain)
);

layer1.synth(
  paint(
    colorChain.clone().hue(0.5)
  )
)

t.layers.base.draw(() => {

});
