import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, fbm, radial, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	radial(0.5, () => Math.cos(t.frameCount * 0.02), 0.5, 0.5),
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

