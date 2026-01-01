import { textmode } from 'textmode.js';
import { SynthPlugin,  noise } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

const colorChain = noise(3).modulatePixelate(noise(3).pixelate(8, 8), 1024, 8);

t.layers.base.synth(
	noise(3, 0.5)
		.modulatePixelate(noise(3).pixelate(8, 8), 1024, 8)

		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
c