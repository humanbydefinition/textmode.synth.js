/**
 * @title SynthSource.shape
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const sideCounts = [3, 4, 5, 6, 8];
const sideNames = ['triangle', 'square', 'pentagon', 'hexagon', 'octagon'];

// Keep polygons geometrically regular across wide or tall grids.
const fitX = ({ cols, rows }) => (cols > rows ? rows / cols : 1);
const fitY = ({ cols, rows }) => (rows > cols ? cols / rows : 1);

const polygon = shape(sideCounts.fast(0.5), 0.48, 0.14).scale(1, fitX, fitY).rotate(0, 0.35);

t.synth(polygon.clone().color(1.0, 0.78, 0.3).char(polygon).charMap(' .:-=+*#%@').cellColor(0.05, 0.03, 0.02));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor((cols - 1) / 2), -Math.floor(rows / 2)];
	const step = Math.floor(t.secs * 0.5) % sideCounts.length;
	const status = `Sides: ${sideCounts[step]} (${sideNames[step]}) | Radius: 0.48`;
	const width = Math.max(36, [...status].length) + 2;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (7 + 5) / 2);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.SHAPE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: REGULAR POLYGON', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Steps sides through 3, 4, 5, 6, 8.', left + 3, top + 6);
	t.print('Smoothing softens the outer rim.', left + 3, top + 7);
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
