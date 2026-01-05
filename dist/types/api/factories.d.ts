/**
 * Factory functions for creating specialized SynthSource instances.
 *
 * These are internal implementation details used to create the public
 * API exports like `char()`, `src()`, `cellColor()`, etc.
 *
 * @internal
 * @module
 */
import { SynthSource } from '../core/SynthSource';
import type { TextmodeLayer } from 'textmode.js';
/**
 * Create the char() factory function.
 * @internal
 */
export declare function createCharFunction(): (source: SynthSource, charCount?: number) => SynthSource;
/**
 * Create the src() factory function with optional layer parameter support.
 * @internal
 */
export declare function createSrcFunction(): (layer?: TextmodeLayer) => SynthSource;
/**
 * Create a SynthSource with cell background color defined.
 * @internal
 */
export declare function createCellColor(source: SynthSource): SynthSource;
/**
 * Create a SynthSource with character foreground color defined.
 * @internal
 */
export declare function createCharColor(source: SynthSource): SynthSource;
/**
 * Create a SynthSource with both character and cell colors defined.
 * @internal
 */
export declare function createPaint(source: SynthSource): SynthSource;
//# sourceMappingURL=factories.d.ts.map