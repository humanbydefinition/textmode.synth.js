/**
 * @title SynthSource.pixelate
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const RESOLUTIONS = [8, 16, 32, 6];
let gridSize = RESOLUTIONS[0];

// Step across fine and coarse block resolutions so grid quantization is clear.
function stepResolution(ctx) {
	gridSize = RESOLUTIONS[Math.floor(ctx.time * 0.65) % RESOLUTIONS.length];
	return gridSize;
}

// High-contrast diagonal wave + radial gradient quantized into crisp macro-blocks.
const spectrum = osc(5, 0.12, 1.4).rotate(0.75).blend(gradient(0.35), 0.55).contrast(1.25);
const quantized = spectrum.pixelate(stepResolution, stepResolution);

t.synth(quantized.char(quantized.clone()).charMap(' .:-=+*#%@').cellColor(0.04, 0.05, 0.09));

labelLayer.draw(() => {
	const left = -Math.floor(labelLayer.grid.cols / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	const tier = gridSize <= 8 ? 'COARSE' : gridSize <= 16 ? 'MEDIUM' : 'FINE';
	t.clear();
	t.push();
	t.translate(left + 2 + 38 / 2, top + 2 + 9 / 2);
	t.char(' ');
	t.cellColor(6, 10, 22);
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.PIXELATE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: RESOLUTION PIXELATION', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Snaps UV coordinates into blocks.', left + 3, top + 6);
	t.print('Lower counts create larger tiles.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(
		`GRID: ${String(gridSize).padStart(2, ' ')}x${String(gridSize).padStart(2, ' ')} BLOCKS (${tier})`,
		left + 3,
		top + 9
	);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
