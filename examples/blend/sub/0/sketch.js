import { textmode } from 'textmode.js';
import { SynthPlugin,  osc } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

// does not produce expected result yet
// certain framebuffers in textmode.js need to be FLOAT for this..
t.layers.base.synth(
	osc().sub(osc(6))
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
