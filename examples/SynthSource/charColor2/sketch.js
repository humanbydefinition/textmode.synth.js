/**
 * @title SynthSource.charColor2
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
let rgb = [0.6, 0.9, 0.4];

function channelAt(time, phase) {
	return 0.62 + 0.36 * Math.sin(time * 1.4 + phase);
}

// Animated noise field supplies glyphs; 4-arg charColor() tints the ink.
const field = noise(4.2, 0.35).contrast(1.35);
const glyphs = field.clone();

t.synth(
	field
		.char(glyphs)
		.charMap(' .:-=+*#%@')
		.charColor(
			(ctx) => {
				rgb = [channelAt(ctx.time, 0), channelAt(ctx.time, 2.1), channelAt(ctx.time, 4.2)];
				return rgb[0];
			},
			(ctx) => channelAt(ctx.time, 2.1),
			(ctx) => channelAt(ctx.time, 4.2),
			1.0
		)
		.cellColor(0.05, 0.03, 0.06)
);

labelLayer.draw(() => {
	const left = -Math.floor(labelLayer.grid.cols / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.push();
	t.translate(left + 2 + 38 / 2, top + 2 + 9 / 2);
	t.char(' ');
	t.cellColor(6, 10, 22);
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.CHARCOLOR2', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: RGBA FOREGROUND INK', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Four numbers animate R, G, B, A ink.', left + 3, top + 6);
	t.print('Background stays dark for contrast.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`RGBA: ${rgb[0].toFixed(2)} ${rgb[1].toFixed(2)} ${rgb[2].toFixed(2)} 1.00`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
