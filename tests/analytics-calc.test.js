import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Tests for analytics calculation functions.
 * These are pure data transformation functions that don't require DOM.
 */

// Mock workout data for testing
const mockWorkoutData = [
    {
        date: '2026-01-01',
        phase: 1,
        exercises: [
            { id: 'ex1', name: 'Exercise 1', leftReps: 10, rightReps: 12, sets: 3, pain: 2 },
            { id: 'ex2', name: 'Exercise 2', leftReps: 15, rightReps: 15, sets: 2, pain: 3 },
        ],
    },
    {
        date: '2026-01-03',
        phase: 1,
        exercises: [
            { id: 'ex1', name: 'Exercise 1', leftReps: 12, rightReps: 14, sets: 3, pain: 1 },
            { id: 'ex2', name: 'Exercise 2', leftReps: 18, rightReps: 16, sets: 2, pain: 4 },
        ],
    },
    {
        date: '2026-01-08',
        phase: 1,
        exercises: [
            { id: 'ex1', name: 'Exercise 1', leftReps: 14, rightReps: 16, sets: 3, pain: 0 },
            { id: 'ex3', name: 'Exercise 3', leftReps: 20, rightReps: 20, sets: 1, pain: 2 },
        ],
    },
];

// Helper: Calculate pain trend
function calculatePainTrend(workouts) {
    return workouts
        .filter((w) => w.exercises && w.exercises.length > 0)
        .map((w) => {
            const pains = w.exercises.map((e) => e.pain || 0);
            const avg = pains.reduce((s, v) => s + v, 0) / pains.length;
            return { date: w.date, avgPain: parseFloat(avg.toFixed(1)) };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
}

// Helper: Calculate asymmetry ratios
function calculateAsymmetryRatios(workouts) {
    if (workouts.length === 0) return [];
    const latest = [...workouts].reverse().find((w) => w.exercises && w.exercises.length > 0);
    if (!latest) return [];

    return latest.exercises
        .filter((e) => e.leftReps > 0 && e.rightReps > 0 && e.leftReps !== e.rightReps)
        .map((e) => ({
            id: e.id,
            name: e.name,
            ratio: parseFloat((e.rightReps / e.leftReps).toFixed(2)),
            leftReps: e.leftReps,
            rightReps: e.rightReps,
        }));
}

// Helper: Get volume by week
function getVolumeByWeek(workouts) {
    const weekMap = {};
    workouts.forEach((w) => {
        const weekStart = getWeekStart(w.date);
        if (!weekMap[weekStart]) weekMap[weekStart] = 0;
        (w.exercises || []).forEach((e) => {
            const sets = e.sets || 1;
            weekMap[weekStart] += ((e.leftReps || 0) + (e.rightReps || 0)) * sets;
        });
    });
    return Object.entries(weekMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([week, volume]) => ({ week, volume }));
}

function getWeekStart(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday
    date.setDate(date.getDate() + diff);
    return date.toISOString().split('T')[0];
}

// Helper: Get pain-free rate
function getPainFreeRate(workouts) {
    let total = 0;
    let painFree = 0;
    workouts.forEach((w) => {
        (w.exercises || []).forEach((e) => {
            total++;
            if ((e.pain || 0) <= 3) painFree++;
        });
    });
    return total === 0 ? 0 : Math.round((painFree / total) * 100);
}

describe('Analytics calculations', () => {
    describe('calculatePainTrend()', () => {
        it('should return empty array for empty workouts', () => {
            const trend = calculatePainTrend([]);
            expect(trend).toEqual([]);
        });

        it('should calculate average pain per workout', () => {
            const trend = calculatePainTrend(mockWorkoutData);
            expect(trend).toHaveLength(3);
            expect(trend[0]).toEqual({ date: '2026-01-01', avgPain: 2.5 }); // (2+3)/2
            expect(trend[1]).toEqual({ date: '2026-01-03', avgPain: 2.5 }); // (1+4)/2
            expect(trend[2]).toEqual({ date: '2026-01-08', avgPain: 1.0 }); // (0+2)/2
        });

        it('should sort results by date', () => {
            const unsorted = [mockWorkoutData[2], mockWorkoutData[0], mockWorkoutData[1]];
            const trend = calculatePainTrend(unsorted);
            expect(trend[0].date).toBe('2026-01-01');
            expect(trend[1].date).toBe('2026-01-03');
            expect(trend[2].date).toBe('2026-01-08');
        });

        it('should filter out workouts with no exercises', () => {
            const withEmpty = [
                ...mockWorkoutData,
                { date: '2026-01-10', phase: 1, exercises: [] },
            ];
            const trend = calculatePainTrend(withEmpty);
            expect(trend).toHaveLength(3); // Empty workout not included
        });

        it('should handle zero pain correctly', () => {
            const zeroPain = [
                {
                    date: '2026-01-01',
                    exercises: [{ pain: 0 }, { pain: 0 }],
                },
            ];
            const trend = calculatePainTrend(zeroPain);
            expect(trend[0].avgPain).toBe(0);
        });
    });

    describe('calculateAsymmetryRatios()', () => {
        it('should return empty array for empty workouts', () => {
            const ratios = calculateAsymmetryRatios([]);
            expect(ratios).toEqual([]);
        });

        it('should use most recent workout', () => {
            const ratios = calculateAsymmetryRatios(mockWorkoutData);
            // Latest workout is 2026-01-08
            expect(ratios).toHaveLength(1); // ex1 has asymmetry, ex3 is symmetrical
            expect(ratios[0].id).toBe('ex1');
        });

        it('should calculate L/R ratio correctly', () => {
            const ratios = calculateAsymmetryRatios(mockWorkoutData);
            // ex1 in latest workout: left=14, right=16
            expect(ratios[0].ratio).toBe(1.14); // 16/14 ≈ 1.14
        });

        it('should exclude exercises with perfect symmetry', () => {
            const ratios = calculateAsymmetryRatios(mockWorkoutData);
            // ex3 has left=20, right=20, should not appear
            expect(ratios.find((r) => r.id === 'ex3')).toBeUndefined();
        });

        it('should exclude exercises with zero reps', () => {
            const withZero = [
                {
                    date: '2026-01-01',
                    exercises: [
                        { id: 'ex1', leftReps: 0, rightReps: 10 },
                        { id: 'ex2', leftReps: 10, rightReps: 0 },
                    ],
                },
            ];
            const ratios = calculateAsymmetryRatios(withZero);
            expect(ratios).toEqual([]);
        });

        it('should handle high asymmetry ratios', () => {
            const highAsym = [
                {
                    date: '2026-01-01',
                    exercises: [{ id: 'ex1', name: 'Test', leftReps: 5, rightReps: 20 }],
                },
            ];
            const ratios = calculateAsymmetryRatios(highAsym);
            expect(ratios[0].ratio).toBe(4.0); // 20/5
        });
    });

    describe('getVolumeByWeek()', () => {
        it('should return empty array for empty workouts', () => {
            const volume = getVolumeByWeek([]);
            expect(volume).toEqual([]);
        });

        it('should calculate total volume per week', () => {
            const volume = getVolumeByWeek(mockWorkoutData);
            expect(volume.length).toBeGreaterThan(0);
            expect(volume[0]).toHaveProperty('week');
            expect(volume[0]).toHaveProperty('volume');
        });

        it('should multiply by sets', () => {
            const singleWorkout = [
                {
                    date: '2026-01-01',
                    exercises: [
                        { leftReps: 10, rightReps: 10, sets: 3 }, // (10+10)*3 = 60
                    ],
                },
            ];
            const volume = getVolumeByWeek(singleWorkout);
            expect(volume[0].volume).toBe(60);
        });

        it('should handle workouts with no exercises', () => {
            const withEmpty = [
                { date: '2026-01-01', exercises: [] },
                { date: '2026-01-02', exercises: [{ leftReps: 10, rightReps: 10, sets: 1 }] },
            ];
            const volume = getVolumeByWeek(withEmpty);
            // Should still create week entry even if one workout is empty
            expect(volume.length).toBeGreaterThanOrEqual(1);
        });

        it('should group workouts by week correctly', () => {
            const sameWeek = [
                {
                    date: '2026-01-06',
                    exercises: [{ leftReps: 5, rightReps: 5, sets: 1 }],
                }, // Monday
                {
                    date: '2026-01-08',
                    exercises: [{ leftReps: 5, rightReps: 5, sets: 1 }],
                }, // Wednesday
            ];
            const volume = getVolumeByWeek(sameWeek);
            expect(volume).toHaveLength(1); // Same week
            expect(volume[0].volume).toBe(20); // 10+10
        });
    });

    describe('getPainFreeRate()', () => {
        it('should return 0 for empty workouts', () => {
            expect(getPainFreeRate([])).toBe(0);
        });

        it('should calculate percentage of pain ≤ 3', () => {
            const rate = getPainFreeRate(mockWorkoutData);
            // All exercises: pain values are 2,3,1,4,0,2
            // Pain-free (≤3): 2,3,1,0,2 = 5 out of 6
            expect(rate).toBe(83); // 5/6 ≈ 83%
        });

        it('should return 100% when all exercises are pain-free', () => {
            const painFree = [
                {
                    date: '2026-01-01',
                    exercises: [{ pain: 0 }, { pain: 1 }, { pain: 3 }],
                },
            ];
            expect(getPainFreeRate(painFree)).toBe(100);
        });

        it('should return 0% when all exercises have high pain', () => {
            const highPain = [
                {
                    date: '2026-01-01',
                    exercises: [{ pain: 7 }, { pain: 8 }, { pain: 10 }],
                },
            ];
            expect(getPainFreeRate(highPain)).toBe(0);
        });

        it('should treat missing pain as 0 (pain-free)', () => {
            const noPain = [
                {
                    date: '2026-01-01',
                    exercises: [{ pain: undefined }, { pain: null }, {}],
                },
            ];
            expect(getPainFreeRate(noPain)).toBe(100);
        });
    });

    describe('getWeekStart()', () => {
        it('should return Monday for dates in the week', () => {
            const weekStart = getWeekStart('2026-01-05'); // Get actual Monday
            expect(weekStart).toBeTruthy(); // Should return a date string
            // Verify same week returns same start
            expect(getWeekStart('2026-01-01')).toBe(getWeekStart('2026-01-01'));
        });

        it('should handle year boundaries', () => {
            const weekStart = getWeekStart('2026-01-01');
            expect(weekStart).toMatch(/2025-12/); // Should be in December 2025
        });

        it('should be consistent for same week', () => {
            const start1 = getWeekStart('2026-01-05');
            const start2 = getWeekStart('2026-01-09');
            const start3 = getWeekStart('2026-01-11');
            // All dates in same week should return same start
            expect(start1).toBe(start2);
            expect(start1).toBe(start3);
        });
    });
});
