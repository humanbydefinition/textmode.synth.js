import { describe, it, expect, beforeEach } from 'vitest';
import { FeedbackTracker } from '../../src/compiler/FeedbackTracker';

describe('FeedbackTracker', () => {
	let tracker: FeedbackTracker;

	beforeEach(() => {
		tracker = new FeedbackTracker();
	});

	it('should initialize with no feedback usage', () => {
		expect(tracker.getUsage()).toEqual({
			usesCharFeedback: false,
			usesCharColorFeedback: false,
			usesCellColorFeedback: false,
		});
	});

	describe('trackUsage', () => {
		it('should track character feedback usage', () => {
			tracker.trackUsage('char');
			expect(tracker.getUsage()).toEqual({
				usesCharFeedback: true,
				usesCharColorFeedback: false,
				usesCellColorFeedback: false,
			});
		});

		it('should track cell color feedback usage', () => {
			tracker.trackUsage('cellColor');
			expect(tracker.getUsage()).toEqual({
				usesCharFeedback: false,
				usesCharColorFeedback: false,
				usesCellColorFeedback: true,
			});
		});

		it('should track char color feedback usage (explicit)', () => {
			tracker.trackUsage('charColor');
			expect(tracker.getUsage()).toEqual({
				usesCharFeedback: false,
				usesCharColorFeedback: true,
				usesCellColorFeedback: false,
			});
		});

		it('should track char color feedback usage (implicit via main)', () => {
			tracker.trackUsage('main');
			expect(tracker.getUsage()).toEqual({
				usesCharFeedback: false,
				usesCharColorFeedback: true,
				usesCellColorFeedback: false,
			});
		});

		it('should accumulate usage flags', () => {
			tracker.trackUsage('char');
			tracker.trackUsage('cellColor');
			expect(tracker.getUsage()).toEqual({
				usesCharFeedback: true,
				usesCharColorFeedback: false,
				usesCellColorFeedback: true,
			});
		});
	});

	describe('reset', () => {
		it('should clear all usage flags', () => {
			tracker.trackUsage('char');
			tracker.trackUsage('cellColor');
			tracker.trackUsage('main');

			expect(tracker.getUsage().usesCharColorFeedback).toBe(true);

			tracker.reset();

			expect(tracker.getUsage()).toEqual({
				usesCharFeedback: false,
				usesCharColorFeedback: false,
				usesCellColorFeedback: false,
			});
		});
	});

	describe('getUsage', () => {
		it('should return a snapshot of current usage', () => {
			tracker.trackUsage('char');

			const usage1 = tracker.getUsage();
			expect(usage1).toEqual({
				usesCharFeedback: true,
				usesCharColorFeedback: false,
				usesCellColorFeedback: false,
			});

			tracker.trackUsage('cellColor');
			const usage2 = tracker.getUsage();
			expect(usage2).toEqual({
				usesCharFeedback: true,
				usesCharColorFeedback: false,
				usesCellColorFeedback: true,
			});
		});
	});
});
