import type {
    TextmodeFramebuffer,
    TextmodeShader,
} from 'textmode.js';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { SynthSource } from './SynthSource';
import type { CompiledSynthShader } from '../compiler/types';
import type { CharacterResolver } from '../utils/CharacterResolver';

/**
 * Per-layer synth state stored via plugin state API.
 */
export interface LayerSynthState {
    /** The original SynthSource */
    source: SynthSource;
    /** Compiled shader data */
    compiled?: CompiledSynthShader;
    /** The compiled GLShader instance */
    shader?: TextmodeShader;
    /** Character resolver for this layer's synth */
    characterResolver: CharacterResolver;
    /** Time when synth was set */
    startTime: number;
    /** Whether the shader needs to be recompiled */
    needsCompile: boolean;
    /**
     * Ping-pong framebuffers for feedback loops.
     * pingPongBuffers[0] = buffer A, pingPongBuffers[1] = buffer B
     */
    pingPongBuffers?: [TextmodeFramebuffer, TextmodeFramebuffer];
    /**
     * Current ping-pong index.
     * READ from pingPongBuffers[pingPongIndex], WRITE to pingPongBuffers[1 - pingPongIndex].
     */
    pingPongIndex: number;
    /**
     * External layer references mapped to their layer objects.
     * Populated during compilation from the source's external layer refs.
     */
    externalLayerMap?: Map<string, TextmodeLayer>;
    /**
     * Layer-specific BPM override.
     * If set, this overrides the global BPM for this layer's array modulation.
     */
    bpm?: number;
}
