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
export class FeedbackTracker {
	private _usesFeedback = false;
	private _usesCharFeedback = false;
	private _usesCellColorFeedback = false;

	/**
	 * Track feedback usage for a given compilation target.
	 * @param target - The current compilation target context
	 */
	public trackUsage(target: CompilationTarget): void {
		switch (target) {
			case 'char':
				this._usesCharFeedback = true;
				break;
			case 'cellColor':
				this._usesCellColorFeedback = true;
				break;
			case 'charColor':
			case 'main':
			default:
				this._usesFeedback = true;
				break;
		}
	}

	/**
	 * Reset all feedback tracking state.
	 * Should be called at the start of each compilation.
	 */
	public reset(): void {
		this._usesFeedback = false;
		this._usesCharFeedback = false;
		this._usesCellColorFeedback = false;
	}

	/**
	 * Get the current feedback usage state.
	 */
	public getUsage(): FeedbackUsage {
		return {
			usesCharColorFeedback: this._usesFeedback,
			usesCharFeedback: this._usesCharFeedback,
			usesCellColorFeedback: this._usesCellColorFeedback,
		};
	}

	/**
	 * Check if any feedback is used.
	 */
	public get usesAnyFeedback(): boolean {
		return this._usesFeedback || this._usesCharFeedback || this._usesCellColorFeedback;
	}

	/** Whether character color feedback is used */
	public get usesCharColorFeedback(): boolean {
		return this._usesFeedback;
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
