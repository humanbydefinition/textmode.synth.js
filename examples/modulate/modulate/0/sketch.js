import { textmode } from 'textmode.js';
import { SynthPlugin, osc, noise,  voronoi, } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	voronoi()
		.color(0.9, 0.25, 0.15)
		.rotate(() => (t.secs % 360) / 2)
		.modulate(osc(25, 0.1, 0.5)
			.kaleid(50)
			.scale(() => Math.sin(t.secs * 1) * 0.5 + 1)
			.modulate(noise(0.6, 0.5)),
			0.5)
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

