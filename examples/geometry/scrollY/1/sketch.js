import { textmode } from 'textmode.js';
import { SynthPlugin, osc } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	osc(10,0,1).scrollY([0,0.25,0.5,0.75,1].fast(4),0)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
