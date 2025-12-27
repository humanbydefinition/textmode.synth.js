import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, charSolid, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = osc().layer(osc(30, 0.1, 2).mult(shape(4)));

t.layers.base.synth(
	charOsc(8, 0.1, 0, 16)
		.charColor(colorChain)
		.cellColor(colorChain.clone().hue())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
