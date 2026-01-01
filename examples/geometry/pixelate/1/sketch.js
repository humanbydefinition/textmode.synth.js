import { textmode } from 'textmode.js';
import { SynthPlugin, noise } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 8,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	noise().pixelate(2000,1)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
