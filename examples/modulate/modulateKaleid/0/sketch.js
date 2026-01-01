import { textmode } from 'textmode.js';
import { SynthPlugin,  osc, noise, solid } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	osc(1, -0.01, 0.01)
		.modulateKaleid(osc(1, -0.01, 0.01), 50)
		.scale(0.1, 0.3)
		.modulate(noise(5, 0.1))
		.mult(solid(1, 1, 0.3))
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

