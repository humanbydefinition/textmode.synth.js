import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

class MockSource {
	public charSource?: MockSource;
	public charColorSource?: MockSource;
	public cellColorSource?: MockSource;
	public operations: string[] = [];

	public charMap(): this {
		return this;
	}

	public charColor(source: MockSource): this {
		this.charColorSource = source;
		return this;
	}

	public cellColor(source: MockSource | number): this {
		this.cellColorSource = source instanceof MockSource ? source : new MockSource();
		return this;
	}
}

for (const method of [
	'add',
	'brightness',
	'color',
	'contrast',
	'kaleid',
	'mask',
	'modulate',
	'repeat',
	'rotate',
	'scale',
	'screen',
	'softlight',
] as const) {
	Object.assign(MockSource.prototype, {
		[method]: function (this: MockSource) {
			this.operations.push(method);
			return this;
		},
	});
}

const arraySketches = [
	'examples/ModulatedArray/arrays/sketch.js',
	'examples/EasingFunction/easingFunction/sketch.js',
	'examples/ModulatedArray/fast/sketch.js',
	'examples/ModulatedArray/smooth/sketch.js',
	'examples/ModulatedArray/ease/sketch.js',
	'examples/ModulatedArray/offset/sketch.js',
	'examples/ModulatedArray/fit/sketch.js',
];

const extensionSketches = [
	'examples/TextmodeLayer/synth/sketch.js',
	'examples/TextmodeLayer/clearSynth/sketch.js',
	'examples/TextmodeLayer/bpm/sketch.js',
	'examples/Textmodifier/bpm/sketch.js',
	'examples/Textmodifier/seed/sketch.js',
	'examples/Textmodifier/synth/sketch.js',
];

function runSketch(file: string): MockSource {
	let output: MockSource | undefined;
	const capture = (source: MockSource) => {
		output = source;
	};
	const t = {
		grid: { cols: 120, rows: 60 },
		layers: {
			add: () => ({ draw: (draw: () => void) => draw() }),
			base: { bpm: () => undefined, clearSynth: () => undefined, synth: capture },
		},
		bpm: () => undefined,
		cellColor: () => undefined,
		charColor: () => undefined,
		clear: () => undefined,
		pop: () => undefined,
		print: () => undefined,
		printAlign: () => undefined,
		push: () => undefined,
		resizeCanvas: () => undefined,
		seed: () => undefined,
		synth: capture,
		windowResized: () => undefined,
	};
	const source = () => new MockSource();
	const context = {
		SynthPlugin: {},
		textmode: { create: () => t },
		window: { innerWidth: 1280, innerHeight: 720 },
		moire: source,
		noise: source,
		osc: source,
		plasma: source,
		shape: source,
		voronoi: source,
		setTimeout: () => 0,
		char: (charSource: MockSource) => {
			const output = new MockSource();
			output.charSource = charSource;
			return output;
		},
	};

	vm.runInNewContext(
		`Array.prototype.fast = function () { return this; };
Array.prototype.smooth = function () { return this; };
Array.prototype.ease = function () { return this; };
Array.prototype.offset = function () { return this; };
Array.prototype.fit = function () { return this; };`,
		context
	);
	vm.runInNewContext(readFileSync(resolve(process.cwd(), file), 'utf8'), context, { filename: file });
	if (!output) throw new Error(`${file} did not call t.synth()`);
	return output;
}

describe('Arrays example render targets', () => {
	it.each([...arraySketches, ...extensionSketches])('%s keeps glyph, ink, and paper chains independent', (file) => {
		const output = runSketch(file);
		expect(output.charSource).toBeDefined();
		expect(output.charSource).not.toBe(output);
		expect(output.charColorSource).toBeDefined();
		expect(output.charColorSource).not.toBe(output);
		expect(output.cellColorSource).toBeDefined();
		expect(output.cellColorSource).not.toBe(output);
		expect(output.cellColorSource?.operations).toContain('brightness');
	});
});
