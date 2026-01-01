import { textmode } from 'textmode.js';
import { SynthPlugin, solid } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	solid(1, 1, 1).invert([0, 1])
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

