/**
 * @title SynthSource.src
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const fitX = ({ cols, rows }) => (cols > rows ? rows / cols : 1);
const fitY = ({ cols, rows }) => (rows > cols ? cols / rows : 1);

const orbiter = shape(32, 0.24, 0.14)
	.scale(1, fitX, fitY)
	.scroll(
		({ time }) => 0.26 * Math.cos(time * 1.4),
		({ time }) => 0.26 * Math.sin(time * 1.4)
	)
	.color(0.75, 1.0, 0.92)
	.luma(0.05, 0.05);

// Derive glyphs from luminance without cloning src() into .char(), because src() in
// the char channel samples packed glyph indices rather than continuous brightness.
const feedback = src().scale(0.975).rotate(0.025).color(0.97, 0.95, 0.99).layer(orbiter);

t.synth(feedback.charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.07));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor((cols - 1) / 2), -Math.floor(rows / 2)];
	const deg = Math.round(((t.secs * 1.4 * 180) / Math.PI) % 360);
	const status = `Orbit: ${deg} deg | Zoom: 0.975`;
	const width = Math.max(36, [...status].length) + 2;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (7 + 5) / 2);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.SRC', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: SELF FEEDBACK LOOP', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('src() samples the previous frame.', left + 3, top + 6);
	t.print('Each pass scales, turns, and fades.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(status, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
