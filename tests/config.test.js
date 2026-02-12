import { describe, it, expect } from 'vitest';
import CONFIG from '../js/config.js';

/**
 * Tests for centralized configuration constants.
 * Ensures all config values are present and have correct types.
 */

describe('CONFIG', () => {
    describe('TIMEOUTS', () => {
        it('should have all timeout values defined', () => {
            expect(CONFIG.TIMEOUTS.SCREEN_TRANSITION).toBe(300);
            expect(CONFIG.TIMEOUTS.TOAST).toBe(3000);
            expect(CONFIG.TIMEOUTS.NAVIGATION_DELAY).toBe(1500);
        });

        it('should have positive numeric values', () => {
            Object.values(CONFIG.TIMEOUTS).forEach((val) => {
                expect(typeof val).toBe('number');
                expect(val).toBeGreaterThan(0);
            });
        });
    });

    describe('PAIN', () => {
        it('should have correct pain thresholds', () => {
            expect(CONFIG.PAIN.MIN).toBe(0);
            expect(CONFIG.PAIN.MAX).toBe(10);
            expect(CONFIG.PAIN.PAIN_FREE_THRESHOLD).toBe(3);
            expect(CONFIG.PAIN.MODERATE_THRESHOLD).toBe(4);
            expect(CONFIG.PAIN.HIGH_THRESHOLD).toBe(7);
        });

        it('should have thresholds in ascending order', () => {
            expect(CONFIG.PAIN.PAIN_FREE_THRESHOLD).toBeLessThan(
                CONFIG.PAIN.MODERATE_THRESHOLD
            );
            expect(CONFIG.PAIN.MODERATE_THRESHOLD).toBeLessThan(CONFIG.PAIN.HIGH_THRESHOLD);
            expect(CONFIG.PAIN.HIGH_THRESHOLD).toBeLessThanOrEqual(CONFIG.PAIN.MAX);
        });
    });

    describe('STREAK', () => {
        it('should have streak configuration', () => {
            expect(CONFIG.STREAK.MAX_REST_DAYS_PER_WEEK).toBe(2);
            expect(CONFIG.STREAK.MAX_GAP_DAYS).toBe(2);
            expect(CONFIG.STREAK.DAYS_IN_WEEK).toBe(7);
        });

        it('should have milestone array', () => {
            expect(Array.isArray(CONFIG.STREAK.MILESTONES)).toBe(true);
            expect(CONFIG.STREAK.MILESTONES).toContain(3);
            expect(CONFIG.STREAK.MILESTONES).toContain(7);
            expect(CONFIG.STREAK.MILESTONES).toContain(30);
        });
    });

    describe('UI', () => {
        it('should have UI measurements', () => {
            expect(CONFIG.UI.PICKER_ITEM_HEIGHT).toBe(36);
            expect(CONFIG.UI.SWIPE_THRESHOLD).toBe(100);
            expect(CONFIG.UI.SCROLL_THRESHOLD_PERCENT).toBe(0.25);
        });

        it('should have sets options', () => {
            expect(CONFIG.UI.SETS_OPTIONS).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe('DEFAULTS', () => {
        it('should have default values', () => {
            expect(CONFIG.DEFAULTS.PHASE).toBe(1);
            expect(CONFIG.DEFAULTS.PROGRESS_BAR_VERSION).toBe('C');
            expect(CONFIG.DEFAULTS.DARK_MODE).toBe(false);
            expect(CONFIG.DEFAULTS.BALANCE_LEVEL).toBe(1);
        });
    });

    describe('CSV', () => {
        it('should have CSV filenames', () => {
            expect(CONFIG.CSV.FILENAMES.WORKOUTS).toBe('rehab_workouts.csv');
            expect(CONFIG.CSV.FILENAMES.WEEKLY).toBe('rehab_weekly_assessments.csv');
            expect(CONFIG.CSV.FILENAMES.MONTHLY).toBe('rehab_monthly_assessments.csv');
        });
    });

    describe('DATE', () => {
        it('should have date formatting config', () => {
            expect(CONFIG.DATE.LOCALE).toBe('en-US');
            expect(Array.isArray(CONFIG.DATE.MONTHS_SHORT)).toBe(true);
            expect(CONFIG.DATE.MONTHS_SHORT).toHaveLength(12);
            expect(CONFIG.DATE.MONTHS_SHORT[0]).toBe('Jan');
            expect(CONFIG.DATE.MONTHS_SHORT[11]).toBe('Dec');
        });
    });

    describe('Module exports', () => {
        it('should export CONFIG as default', () => {
            expect(CONFIG).toBeDefined();
            expect(typeof CONFIG).toBe('object');
        });

        it('should have all top-level sections', () => {
            expect(CONFIG.TIMEOUTS).toBeDefined();
            expect(CONFIG.AUDIO).toBeDefined();
            expect(CONFIG.PAIN).toBeDefined();
            expect(CONFIG.STREAK).toBeDefined();
            expect(CONFIG.BADGES).toBeDefined();
            expect(CONFIG.UI).toBeDefined();
            expect(CONFIG.CONFETTI).toBeDefined();
            expect(CONFIG.PROGRESS).toBeDefined();
            expect(CONFIG.ANALYTICS).toBeDefined();
            expect(CONFIG.DEFAULTS).toBeDefined();
            expect(CONFIG.CSV).toBeDefined();
            expect(CONFIG.DATE).toBeDefined();
        });
    });
});
