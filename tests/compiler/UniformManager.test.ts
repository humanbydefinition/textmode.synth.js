import { describe, it, expect, vi, beforeAll } from 'vitest';
import { UniformManager } from '../../src/compiler/UniformManager';
import { initArrayUtils } from '../../src/utils/ArrayUtils';
import type { TransformInput, SynthContext } from '../../src/core/types';

describe('UniformManager', () => {
    beforeAll(() => {
        initArrayUtils();
    });

    const mockContext = {
        time: 0,
        frameCount: 0,
        width: 100,
        height: 100,
        cols: 10,
        rows: 10,
        bpm: 120,
    } as SynthContext;

    it('should process modulated array', () => {
        const manager = new UniformManager();
        const input: TransformInput = { name: 'test', type: 'float', default: 0 };
        const value = [0, 1].fast(1);

        const result = manager.processArgument(value, input, 'prefix');

        expect(result.glslValue).toBe('prefix_test');
        expect(result.uniform).toBeDefined();
        expect(result.uniform?.isDynamic).toBe(true);
        expect(result.updater).toBeDefined();

        // Test updater
        const updateResult = result.updater!(mockContext);
        expect(updateResult).toBeDefined();
    });

    it('should process dynamic function', () => {
        const manager = new UniformManager();
        const input: TransformInput = { name: 'test', type: 'float', default: 0 };
        const value = () => 42;

        const result = manager.processArgument(value, input, 'prefix');

        expect(result.glslValue).toBe('prefix_test');
        expect(result.uniform).toBeDefined();
        expect(result.uniform?.isDynamic).toBe(true);
        expect(result.updater).toBeDefined();

        // Test updater
        const updateResult = result.updater!(mockContext);
        expect(updateResult).toBe(42);
    });

    it('should process static number', () => {
        const manager = new UniformManager();
        const input: TransformInput = { name: 'test', type: 'float', default: 0 };
        const value = 42;

        const result = manager.processArgument(value, input, 'prefix');

        expect(result.glslValue).toBe('42.0');
        expect(result.uniform).toBeUndefined();
        expect(result.updater).toBeUndefined();
    });
});
