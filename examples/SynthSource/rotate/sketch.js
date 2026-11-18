/**
 * @title SynthSource.rotate
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const spinSpeed = 0.7;
const startAngle = 0.4;
let angleDeg = 23;

// Track live angle in degrees so the readout matches the spinning beacon.
function readStartAngle(ctx) {
	const totalRad = startAngle + spinSpeed * ctx.time;
	angleDeg = ((Math.round((totalRad * 180) / Math.PI) % 360) + 360) % 360;
	return startAngle;
}

// Asymmetric rotor: striped gold triangle plus an orbiting cyan beacon dot.
const blade = shape(3, 0.28, 0.02).mult(osc(16, 0).thresh(0.45, 0.03)).color(1.0, 0.68, 0.22);
const beacon = shape(24, 0.09, 0.02).scroll(0, -0.18).color(0.2, 0.95, 0.85);
const rotor = blade.add(beacon).rotate(readStartAngle, spinSpeed);
const glyphs = rotor.clone();

t.synth(rotor.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.03, 0.05, 0.11));

labelLayer.draw(() => {
	const left = -Math.floor((labelLayer.grid.cols - 1) / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + 37 / 2, top + 2 + 8 / 2);
	t.char(' ');
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.ROTATE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: COORDINATE ROTATION', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Turns UV space around the center.', left + 3, top + 6);
	t.print('Angle offsets; speed drives spin.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`ANGLE: ${String(angleDeg).padStart(3, ' ')} DEG | SPEED: 0.70/S`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
