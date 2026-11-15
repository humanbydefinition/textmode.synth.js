import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

/**
 * Lightweight source double for running example sketches without WebGL.
 *
 * Channel methods record their target so the test can assert that glyph, ink,
 * and paper chains stay independent. Every other transform is chainable and
 * only records its call, so refresh of an example sketch does not require a
 * matching mock update.
 */
class MockSource {
	public charSource?: MockSource;
	public charColorSource?: MockSource;
	public cellColorSource?: MockSource;
	public operations: string[] = [];

	public char(source: MockSource): this {
		this.charSource = source;
		this.operations.push('char');
		return this;
	}

	public charMap(): this {
		this.operations.push('charMap');
		return this;
	}

	public charColor(source: MockSource | unknown): this {
		this.charColorSource = source instanceof MockSource ? source : createMockSource();
		this.operations.push('charColor');
		return this;
	}

	public cellColor(source: MockSource | unknown): this {
		this.cellColorSource = source instanceof MockSource ? source : createMockSource();
		this.operations.push('cellColor');
		return this;
	}

	public clone(): MockSource {
		const copy = createMockSource([...this.operations]);
		copy.charSource = this.charSource;
		copy.charColorSource = this.charColorSource;
		copy.cellColorSource = this.cellColorSource;
		return copy;
	}
}

function createMockSource(operations: string[] = []): MockSource {
	const source = new MockSource();
	source.operations = operations;
	return new Proxy(source, {
		get(target, property, receiver) {
			if (property in target || typeof property === 'symbol') {
				return Reflect.get(target, property, receiver);
			}
			return (...args: unknown[]) => {
				void args;
				target.operations.push(String(property));
				return receiver;
			};
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

	const layers: Array<Record<string, unknown>> = [];
	const createLayer = () => {
		const layer = {
			grid: { cols: 120, rows: 60 },
			bpm: () => undefined,
			clearSynth: () => undefined,
			draw: (draw: () => void) => draw(),
			fontSize: () => undefined,
			synth: capture,
		};
		layers.push(layer);
		return layer;
	};
	const baseLayer = createLayer();

	const baseContext = {
		bpm: () => undefined,
		cellColor: () => undefined,
		charColor: () => undefined,
		clear: () => undefined,
		fontSize: () => undefined,
		grid: { cols: 120, rows: 60 },
		layers: {
			add: () => createLayer(),
			all: layers,
			base: baseLayer,
		},
		mouseClicked: () => undefined,
		pop: () => undefined,
		print: () => undefined,
		printAlign: () => undefined,
		push: () => undefined,
		resizeCanvas: () => undefined,
		secs: 0,
		seed: () => undefined,
		synth: capture,
		windowResized: (resize: () => void) => resize(),
	};
	const t = new Proxy(baseContext, {
		get(target, property, receiver) {
			if (property in target || typeof property === 'symbol') {
				return Reflect.get(target, property, receiver);
			}
			return () => undefined;
		},
	});

	const source = () => createMockSource();
	const context = {
		SynthPlugin: {},
		textmode: { create: () => t },
		window: { innerWidth: 1280, innerHeight: 720 },
		char: (charSource: MockSource) => {
			const wrapped = createMockSource();
			return wrapped.char(charSource);
		},
		cellColor: source,
		gradient: source,
		moire: source,
		noise: source,
		osc: source,
		plasma: source,
		shape: source,
		solid: source,
		src: source,
		voronoi: source,
		setTimeout: () => 0,
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
		expect(output.operations).toEqual(expect.arrayContaining(['char', 'charColor', 'cellColor']));
		expect(output.charSource).toBeDefined();
		expect(output.charSource).not.toBe(output);
		expect(output.charColorSource).toBeDefined();
		expect(output.charColorSource).not.toBe(output);
		expect(output.cellColorSource).toBeDefined();
		expect(output.cellColorSource).not.toBe(output);
		expect(output.charColorSource).not.toBe(output.cellColorSource);
	});
});
