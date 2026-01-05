import type { CompilationTarget } from './types';
/**
 * Feedback usage state returned by the tracker.
 */
export interface FeedbackUsage {
    /** Whether character color feedback (prevCharColorBuffer) is used */
    usesCharColorFeedback: boolean;
    /** Whether character feedback (prevCharBuffer) is used */
    usesCharFeedback: boolean;
    /** Whether cell color feedback (prevCellColorBuffer) is used */
    usesCellColorFeedback: boolean;
}
/**
 * Tracks which feedback textures are used during compilation.
 *
 * The synth system supports three separate feedback buffers:
 * - Character color (character foreground)
 * - Character data (character indices)
 * - Cell color (character background)
 *
 * Each `src()` call samples from a context-aware buffer based on
 * where it appears in the synth chain.
 */
export declare class FeedbackTracker {
    private _usesFeedback;
    private _usesCharFeedback;
    private _usesCellColorFeedback;
    /**
     * Track feedback usage for a given compilation target.
     * @param target - The current compilation target context
     */
    trackUsage(target: CompilationTarget): void;
    /**
     * Reset all feedback tracking state.
     * Should be called at the start of each compilation.
     */
    reset(): void;
    /**
     * Get the current feedback usage state.
     */
    getUsage(): FeedbackUsage;
    /**
     * Check if any feedback is used.
     */
    get usesAnyFeedback(): boolean;
    /** Whether character color feedback is used */
    get usesCharColorFeedback(): boolean;
    /** Whether character feedback is used */
    get usesCharFeedback(): boolean;
    /** Whether cell color feedback is used */
    get usesCellColorFeedback(): boolean;
}
//# sourceMappingURL=FeedbackTracker.d.ts.map