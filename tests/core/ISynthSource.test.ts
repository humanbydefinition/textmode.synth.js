import { describe, it, expect } from 'vitest';
import '../../src/bootstrap'; // Ensure transforms are injected
import { SynthSource } from '../../src/core/SynthSource';
import { osc } from '../../src/api/sources';

describe('ISynthSource', () => {
	describe('Missing Modulation Methods', () => {
		it('should have modulateRepeat method', () => {
			const source = new SynthSource();
			expect(typeof source.modulateRepeat).toBe('function');
			expect(source.modulateRepeat(osc())).toBe(source);
			expect(source.transforms.some((t) => t.name === 'modulateRepeat')).toBe(true);
		});

		it('should have modulateRepeatX method', () => {
			const source = new SynthSource();
			expect(typeof source.modulateRepeatX).toBe('function');
			expect(source.modulateRepeatX(osc())).toBe(source);
			expect(source.transforms.some((t) => t.name === 'modulateRepeatX')).toBe(true);
		});

		it('should have modulateRepeatY method', () => {
			const source = new SynthSource();
			expect(typeof source.modulateRepeatY).toBe('function');
			expect(source.modulateRepeatY(osc())).toBe(source);
			expect(source.transforms.some((t) => t.name === 'modulateRepeatY')).toBe(true);
		});

		it('should have modulateHue method', () => {
			const source = new SynthSource();
			expect(typeof source.modulateHue).toBe('function');
			expect(source.modulateHue(osc())).toBe(source);
			expect(source.transforms.some((t) => t.name === 'modulateHue')).toBe(true);
		});
	});
});
