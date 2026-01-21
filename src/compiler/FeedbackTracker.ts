import type { CompilationTarget } from './types';
import { getTextureChannel } from './channels';

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
export class FeedbackTracker {
	private _usesCharColorFeedback = false;
	private _usesCharFeedback = false;
	private _usesCellColorFeedback = false;

	/**
	 * Track feedback usage for a given compilation target.
	 * @param target - The current compilation target context
	 */
	public trackUsage(target: CompilationTarget): void {
		const channel = getTextureChannel(target);
		if (channel === 'char') {
			this._usesCharFeedback = true;
		} else if (channel === 'cellColor') {
			this._usesCellColorFeedback = true;
		} else {
			this._usesCharColorFeedback = true;
		}
	}

	/**
	 * Reset all feedback tracking state.
	 * Should be called at the start of each compilation.
	 */
	public reset(): void {
		this._usesCharColorFeedback = false;
		this._usesCharFeedback = false;
		this._usesCellColorFeedback = false;
	}

	/**
	 * Get the current feedback usage state.
	 */
	public getUsage(): FeedbackUsage {
		return {
			usesCharColorFeedback: this._usesCharColorFeedback,
			usesCharFeedback: this._usesCharFeedback,
			usesCellColorFeedback: this._usesCellColorFeedback,
		};
	}

	/**
	 * Check if any feedback is used.
	 */
	public get usesAnyFeedback(): boolean {
		return this._usesCharColorFeedback || this._usesCharFeedback || this._usesCellColorFeedback;
	}

	/** Whether character color feedback is used */
	public get usesCharColorFeedback(): boolean {
		return this._usesCharColorFeedback;
	}

	/** Whether character feedback is used */
	public get usesCharFeedback(): boolean {
		return this._usesCharFeedback;
	}

	/** Whether cell color feedback is used */
	public get usesCellColorFeedback(): boolean {
		return this._usesCellColorFeedback;
	}
}
