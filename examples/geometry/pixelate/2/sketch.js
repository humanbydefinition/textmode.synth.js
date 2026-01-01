import { textmode } from 'textmode.js';
import { SynthPlugin, src, charSrc, cellColorSrc,  osc, noise, char, } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

// INDEPENDENT FEEDBACK EXAMPLE
// Each output uses its own feedback source, so they don't influence each other

t.layers.base.synth(
	// Character pattern - uses charSrc() for character-specific feedback
	char(noise(0.1, 0)
		.mult(osc(0.1, 0.25, 1))
		.scrollY(1, 0.25)
		.pixelate([100, 40, 20, 70].fast(0.25))
		.modulateRotate(charSrc().scale(0.5), 0.125)  // charSrc instead of src
		.diff(charSrc().rotate([-0.05, 0.05].fast(0.125))))  // charSrc instead of src

		// Cell background - uses cellColorSrc() for cell-specific feedback
		.cellColor(
			noise()
				.mult(osc(10, 0.25, 1))
				.scrollY(1, 0.25)
				.pixelate([100, 40, 20, 70].fast(0.25))
				.modulateRotate(cellColorSrc().scale(0.5), 0.125)  // cellColorSrc instead of src
				.diff(cellColorSrc().rotate([-0.05, 0.05].fast(0.125)))  // cellColorSrc instead of src
		)

		// Character foreground color - uses src() for primaryColor feedback
		.charColor(
			noise()
				.mult(osc(10, 0.25, 1))
				.scrollY(1, 0.25)
				.pixelate([100, 40, 20, 70].fast(0.25))
				.modulateRotate(src().scale(0.5), 0.125)  // src() for primary color feedback
				.diff(src().rotate([-0.05, 0.05].fast(0.125)))
				.hue(0.5)
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
