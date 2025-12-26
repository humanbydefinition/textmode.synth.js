import { textmode } from 'textmode.js';
import { SynthPlugin, charSolid, solid, shape } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

// Exact recreation of the Hydra example:
// shape(999).scrollY(.2).scrollX([-0.2,0.2])
//   .add(shape(4).scrollY(-.2).scrollX([-0.2,0.2].offset(0.5))).out(o0)
//
// The offset(0.5) creates a phase shift - the shapes are sometimes
// in the same column (both left or both right) and sometimes opposite.

// does not work as expected yet..
t.layers.base.synth(
	charSolid(219)
		.charColor(
			shape(999, 0.3, 0.01)
				.scrollY(0.2)
				.scrollX([-0.2, 0.2])
				.add(
					shape(4, 0.3, 0.01)
						.scrollY(-0.4)
						.scrollX([-0.4, 0.4].offset(0.5))
				)
		)
		.cellColor(
			solid(0, 0, 0, 1)
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
