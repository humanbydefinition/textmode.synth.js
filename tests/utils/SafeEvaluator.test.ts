import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createDynamicUpdater,
  setGlobalErrorCallback,
  getGlobalErrorCallback,
} from '../../src/utils/SafeEvaluator';
import type { SynthContext } from '../../src/core/types';

describe('SafeEvaluator', () => {
  let mockContext: SynthContext;

  beforeEach(() => {
    mockContext = {
      time: 0,
      frameCount: 0,
      width: 100,
      height: 100,
      cols: 10,
      rows: 10,
      bpm: 120,
    } as SynthContext;
    setGlobalErrorCallback(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createDynamicUpdater', () => {
    it('should return valid numeric values', () => {
      const updater = createDynamicUpdater(() => 42, 'testUniform', 0);
      const result = updater(mockContext);
      expect(result).toBe(42);
    });

    it('should return valid array values', () => {
      const updater = createDynamicUpdater(() => [1, 2, 3], 'testUniform', [0]);
      const result = updater(mockContext);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle errors thrown in updater and return fallback', () => {
      const onError = vi.fn();
      mockContext.onError = onError;

      const error = new Error('Updater failed');
      const updater = createDynamicUpdater(() => {
        throw error;
      }, 'testUniform', 100);

      const result = updater(mockContext);

      expect(result).toBe(100);
      expect(onError).toHaveBeenCalledWith(error, 'testUniform');
    });

    it('should handle invalid numeric return values (NaN) and return fallback', () => {
        const onError = vi.fn();
        mockContext.onError = onError;

        const updater = createDynamicUpdater(() => NaN, 'testUniform', 0);
        const result = updater(mockContext);

        expect(result).toBe(0);
        expect(onError).toHaveBeenCalled();
        expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
        expect((onError.mock.calls[0][0] as Error).message).toContain('Invalid dynamic parameter value');
    });

    it('should handle invalid numeric return values (Infinity) and return fallback', () => {
        const onError = vi.fn();
        mockContext.onError = onError;

        const updater = createDynamicUpdater(() => Infinity, 'testUniform', 0);
        const result = updater(mockContext);

        expect(result).toBe(0);
        expect(onError).toHaveBeenCalled();
    });

    it('should handle invalid array return values (NaN inside array) and return fallback', () => {
        const onError = vi.fn();
        mockContext.onError = onError;

        const updater = createDynamicUpdater(() => [1, NaN, 3], 'testUniform', [0]);
        const result = updater(mockContext);

        expect(result).toEqual([0]);
        expect(onError).toHaveBeenCalled();
    });

    it('should handle undefined return value and return fallback', () => {
        const onError = vi.fn();
        mockContext.onError = onError;

        // @ts-expect-error Testing invalid return type
        const updater = createDynamicUpdater(() => undefined, 'testUniform', 0);
        const result = updater(mockContext);

        expect(result).toBe(0);
        expect(onError).toHaveBeenCalled();
    });
  });

  describe('Global Error Callback', () => {
      it('should allow setting and getting global error callback', () => {
          const callback = vi.fn();
          setGlobalErrorCallback(callback);
          expect(getGlobalErrorCallback()).toBe(callback);
      });

      it('should invoke global callback if local callback is missing', () => {
          const globalCallback = vi.fn();
          setGlobalErrorCallback(globalCallback);

          const error = new Error('Fail');
          const updater = createDynamicUpdater(() => { throw error; }, 'testUniform', 0);

          updater(mockContext); // mockContext has no onError

          expect(globalCallback).toHaveBeenCalledWith(error, 'testUniform');
      });

      it('should prefer local callback over global callback', () => {
          const globalCallback = vi.fn();
          setGlobalErrorCallback(globalCallback);

          const localCallback = vi.fn();
          mockContext.onError = localCallback;

          const error = new Error('Fail');
          const updater = createDynamicUpdater(() => { throw error; }, 'testUniform', 0);

          updater(mockContext);

          expect(localCallback).toHaveBeenCalledWith(error, 'testUniform');
          expect(globalCallback).not.toHaveBeenCalled();
      });

      it('should handle errors inside the callback itself gracefully', () => {
          const throwingCallback = () => { throw new Error('Callback error'); };
          setGlobalErrorCallback(throwingCallback);

          const updater = createDynamicUpdater(() => { throw new Error('Original error'); }, 'testUniform', 0);

          expect(() => updater(mockContext)).not.toThrow();
      });
  });
});
