/**
 * Synth render lifecycle callback.
 *
 * Handles rendering of synth sources with atomic parameter validation
 * to prevent WebGL errors from incomplete uniform state.
 */
import type { TextmodeLayer } from 'textmode.js/layering';
/**
 * Render synth source to layer framebuffers.
 *
 * Uses an atomic render pattern: all dynamic parameters are validated
 * BEFORE any WebGL operations. If any parameter fails, the entire frame
 * is skipped and the error propagates for the environment to handle.
 */
export declare function synthRender(layer: TextmodeLayer, textmodifier: any): Promise<void>;
//# sourceMappingURL=synthRender.d.ts.map