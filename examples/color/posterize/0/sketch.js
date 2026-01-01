import { textmode } from 'textmode.js';
import { SynthPlugin, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	gradient(0).posterize([5, 15, 30, 60], 0.5)
	.charMap('.:-=+*#%@')
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
