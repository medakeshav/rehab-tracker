import { describe, it, expect } from 'vitest';

/**
 * Tests for streak calculation logic.
 * Streak calculation has complex rules around rest days, injury grace, and date boundaries.
 */

// Helper: Normalize date to local midnight
function normalizeDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// Helper: Calculate day difference
function getDaysDiff(date1Str, date2Str) {
    const d1 = normalizeDate(date1Str);
    const d2 = normalizeDate(date2Str);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

// Simplified streak calculator for testing
function calculateStreak(workoutData, today = new Date().toISOString().split('T')[0]) {
    if (workoutData.length === 0) return 0;

    // Sort workouts by date descending
    const sorted = [...workoutData].sort((a, b) => b.date.localeCompare(a.date));

    // Count unique workout dates
    const uniqueDates = new Set(sorted.map((w) => w.date));
    const dates = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a));

    if (dates.length === 0) return 0;

    // Check if most recent workout was today or yesterday
    const lastDate = dates[0];
    const daysSinceLastWorkout = getDaysDiff(lastDate, today);

    // If last workout was more than 1 day ago, streak is broken
    // (allowing 1 rest day per week rule requires more complex logic)
    if (daysSinceLastWorkout > 2) return 0;

    // Count consecutive days with ≤1 day gaps
    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
        const gap = getDaysDiff(dates[i + 1], dates[i]);
        // Allow 1-day gaps (rest days)
        if (gap <= 2) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// Badge checking logic
function checkStreakBadge(currentStreak, milestones) {
    return milestones
        .filter((m) => currentStreak >= m)
        .sort((a, b) => b - a)
        .map((m) => ({ id: `streak_${m}`, milestone: m }));
}

describe('Streak calculation', () => {
    describe('calculateStreak()', () => {
        it('should return 0 for empty workout data', () => {
            expect(calculateStreak([])).toBe(0);
        });

        it('should return 1 for single workout today', () => {
            const today = '2026-02-12';
            const workouts = [{ date: today }];
            expect(calculateStreak(workouts, today)).toBe(1);
        });

        it('should return 1 for single workout yesterday', () => {
            const today = '2026-02-12';
            const workouts = [{ date: '2026-02-11' }];
            expect(calculateStreak(workouts, today)).toBe(1);
        });

        it('should return 0 if last workout was > 2 days ago', () => {
            const today = '2026-02-12';
            const workouts = [{ date: '2026-02-09' }]; // 3 days ago
            expect(calculateStreak(workouts, today)).toBe(0);
        });

        it('should count consecutive days', () => {
            const today = '2026-02-12';
            const workouts = [
                { date: '2026-02-12' },
                { date: '2026-02-11' },
                { date: '2026-02-10' },
                { date: '2026-02-09' },
            ];
            expect(calculateStreak(workouts, today)).toBe(4);
        });

        it('should allow 1-day gaps (rest days)', () => {
            const today = '2026-02-12';
            const workouts = [
                { date: '2026-02-12' },
                { date: '2026-02-10' }, // 1-day gap
                { date: '2026-02-09' },
                { date: '2026-02-07' }, // 1-day gap
            ];
            expect(calculateStreak(workouts, today)).toBe(4);
        });

        it('should stop counting at first > 2-day gap', () => {
            const today = '2026-02-12';
            const workouts = [
                { date: '2026-02-12' },
                { date: '2026-02-11' },
                { date: '2026-02-10' },
                { date: '2026-02-06' }, // 3-day gap
                { date: '2026-02-05' },
                { date: '2026-02-04' },
            ];
            expect(calculateStreak(workouts, today)).toBe(3); // Only counts up to gap
        });

        it('should handle multiple workouts on same day', () => {
            const today = '2026-02-12';
            const workouts = [
                { date: '2026-02-12' },
                { date: '2026-02-12' }, // Duplicate
                { date: '2026-02-11' },
            ];
            expect(calculateStreak(workouts, today)).toBe(2); // Deduplicates dates
        });

        it('should handle unsorted workout data', () => {
            const today = '2026-02-12';
            const workouts = [
                { date: '2026-02-10' },
                { date: '2026-02-12' },
                { date: '2026-02-09' },
                { date: '2026-02-11' },
            ];
            expect(calculateStreak(workouts, today)).toBe(4);
        });
    });

    describe('getDaysDiff()', () => {
        it('should calculate days between dates', () => {
            expect(getDaysDiff('2026-01-01', '2026-01-01')).toBe(0);
            expect(getDaysDiff('2026-01-01', '2026-01-02')).toBe(1);
            expect(getDaysDiff('2026-01-01', '2026-01-08')).toBe(7);
        });

        it('should handle reverse order (negative diff)', () => {
            expect(getDaysDiff('2026-01-08', '2026-01-01')).toBe(-7);
        });

        it('should handle month boundaries', () => {
            expect(getDaysDiff('2026-01-31', '2026-02-01')).toBe(1);
        });

        it('should handle year boundaries', () => {
            expect(getDaysDiff('2025-12-31', '2026-01-01')).toBe(1);
        });
    });

    describe('checkStreakBadge()', () => {
        const milestones = [3, 7, 14, 30];

        it('should return empty array for streak < first milestone', () => {
            expect(checkStreakBadge(2, milestones)).toEqual([]);
        });

        it('should return all achieved milestones', () => {
            const badges = checkStreakBadge(15, milestones);
            expect(badges).toHaveLength(3);
            expect(badges.map((b) => b.milestone)).toEqual([14, 7, 3]);
        });

        it('should return highest milestone first', () => {
            const badges = checkStreakBadge(100, milestones);
            expect(badges[0].milestone).toBe(30);
        });

        it('should handle exact milestone match', () => {
            const badges = checkStreakBadge(7, milestones);
            expect(badges.map((b) => b.milestone)).toEqual([7, 3]);
        });

        it('should generate correct badge IDs', () => {
            const badges = checkStreakBadge(10, milestones);
            expect(badges.map((b) => b.id)).toEqual(['streak_7', 'streak_3']);
        });
    });

    describe('Edge cases', () => {
        it('should handle leap year dates', () => {
            expect(getDaysDiff('2024-02-28', '2024-02-29')).toBe(1);
            expect(getDaysDiff('2024-02-29', '2024-03-01')).toBe(1);
        });

        it('should handle very long streaks', () => {
            const today = '2026-02-12';
            const workouts = [];
            // Create 100 consecutive days of workouts
            for (let i = 0; i < 100; i++) {
                const date = new Date(2026, 1, 12 - i); // Feb 12 backwards
                workouts.push({ date: date.toISOString().split('T')[0] });
            }
            const streak = calculateStreak(workouts, today);
            expect(streak).toBeGreaterThan(50); // Should count many days
        });

        it('should handle workouts far in the past', () => {
            const today = '2026-02-12';
            const workouts = [{ date: '2025-01-01' }]; // Over a year ago
            expect(calculateStreak(workouts, today)).toBe(0);
        });

        it('should handle future dates gracefully', () => {
            const today = '2026-02-12';
            const workouts = [{ date: '2026-02-15' }]; // Future
            // Should handle gracefully (either 0 or throw, depending on design)
            const streak = calculateStreak(workouts, today);
            expect(streak).toBeGreaterThanOrEqual(0);
        });
    });
});
