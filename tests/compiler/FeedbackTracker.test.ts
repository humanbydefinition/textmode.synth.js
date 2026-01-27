import { describe, it, expect, beforeEach } from 'vitest';
import { FeedbackTracker } from '../../src/compiler/FeedbackTracker';

describe('FeedbackTracker', () => {
	let tracker: FeedbackTracker;

	beforeEach(() => {
		tracker = new FeedbackTracker();
	});

	it('should initialize with no feedback usage', () => {
		expect(tracker.usesAnyFeedback).toBe(false);
		expect(tracker.usesCharFeedback).toBe(false);
		expect(tracker.usesCharColorFeedback).toBe(false);
		expect(tracker.usesCellColorFeedback).toBe(false);

		const usage = tracker.getUsage();
		expect(usage.usesCharFeedback).toBe(false);
		expect(usage.usesCharColorFeedback).toBe(false);
		expect(usage.usesCellColorFeedback).toBe(false);
	});

	describe('trackUsage', () => {
		it('should track character feedback usage', () => {
			tracker.trackUsage('char');
			expect(tracker.usesCharFeedback).toBe(true);
			expect(tracker.usesAnyFeedback).toBe(true);
			// Others should remain false
			expect(tracker.usesCharColorFeedback).toBe(false);
			expect(tracker.usesCellColorFeedback).toBe(false);
		});

		it('should track cell color feedback usage', () => {
			tracker.trackUsage('cellColor');
			expect(tracker.usesCellColorFeedback).toBe(true);
			expect(tracker.usesAnyFeedback).toBe(true);
			// Others should remain false
			expect(tracker.usesCharFeedback).toBe(false);
			expect(tracker.usesCharColorFeedback).toBe(false);
		});

		it('should track char color feedback usage (explicit)', () => {
			tracker.trackUsage('charColor');
			expect(tracker.usesCharColorFeedback).toBe(true);
			expect(tracker.usesAnyFeedback).toBe(true);
			// Others should remain false
			expect(tracker.usesCharFeedback).toBe(false);
			expect(tracker.usesCellColorFeedback).toBe(false);
		});

		it('should track char color feedback usage (implicit via main)', () => {
			tracker.trackUsage('main');
			expect(tracker.usesCharColorFeedback).toBe(true);
			expect(tracker.usesAnyFeedback).toBe(true);
		});

		it('should accumulate usage flags', () => {
			tracker.trackUsage('char');
			tracker.trackUsage('cellColor');

			expect(tracker.usesCharFeedback).toBe(true);
			expect(tracker.usesCellColorFeedback).toBe(true);
			expect(tracker.usesCharColorFeedback).toBe(false);
		});
	});

	describe('reset', () => {
		it('should clear all usage flags', () => {
			// Setup some state
			tracker.trackUsage('char');
			tracker.trackUsage('cellColor');
			tracker.trackUsage('main');

			expect(tracker.usesAnyFeedback).toBe(true);

			// Act
			tracker.reset();

			// Assert
			expect(tracker.usesAnyFeedback).toBe(false);
			expect(tracker.usesCharFeedback).toBe(false);
			expect(tracker.usesCharColorFeedback).toBe(false);
			expect(tracker.usesCellColorFeedback).toBe(false);
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

			// Verify immutability of returned object effectively (by checking it doesn't change previous snapshot)
			// Although getUsage creates a new object, so this is implicitly tested.
			expect(usage1).toEqual({
				usesCharFeedback: true,
				usesCharColorFeedback: false,
				usesCellColorFeedback: false,
			});
		});
	});
});
