/**
 * @title TextmodeLayer.clearSynth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add();

let synthActive = true;

// Activate a synth on base layer
t.layers.base.synth(osc(15, 0.1).color(0.2, 0.5, 0.9).charMap(' .:-=+*#%@').cellColor(0.05, 0.05, 0.1));

// Clear the synth after 6 seconds
setTimeout(() => {
	t.layers.base.clearSynth();
	synthActive = false;
}, 6000);

function drawText(text, x, y, r = 220, g = 230, b = 255) {
	t.push();
	t.printAlign('left', 'top');
	t.charColor(r, g, b);
	t.print(text, x, y);
	t.pop();
}

labelLayer.draw(() => {
	t.clear();
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	let y = top + 3;
	const x = left + 3;

	drawText('TEXTMODELAYER.CLEARSYNTH', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: DISABLING LAYER SYNTHESIS', x, y++, 100, 220, 255);
	drawText('Removes procedural engine from layer.', x, y++, 140, 160, 190);
	drawText('Reverts to standard textmode drawing.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);

	if (synthActive) {
		const elapsed = Math.floor(t.secs);
		const remaining = Math.max(0, 6 - elapsed);
		drawText(`SYNTH ACTIVE: Clears in ${remaining}s...`, x, y++, 255, 100, 100);
	} else {
		drawText('SYNTH CLEARED: Standard layer active', x, y++, 100, 255, 100);
	}
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
