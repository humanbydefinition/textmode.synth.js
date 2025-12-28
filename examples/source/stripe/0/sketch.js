import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, fbm, stripe, radial, checker, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	stripe(4, 4)
    .scrollY(() => t.frameCount * 0.02)
    .rotate(() => t.frameCount * 0.01)
);

t.draw(() => {
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
