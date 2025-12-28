import { textmode } from 'textmode.js';
import { SynthPlugin, charSolid, solid, shape } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	shape().scrollX([0, 1, 2, 3, 4].fit(-0.2, 0.2))
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
