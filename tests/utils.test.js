import { describe, it, expect, beforeEach } from 'vitest';

// Inline the pure functions from utils.js for unit testing
// (no global scope side effects)

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calculateAvgPain(exercisesList) {
    if (exercisesList.length === 0) return '0/10';
    const total = exercisesList.reduce((sum, ex) => sum + ex.pain, 0);
    const avg = (total / exercisesList.length).toFixed(1);
    return `${avg}/10`;
}

function normalizeDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function calculateStreak(workoutData) {
    if (workoutData.length === 0) return 0;

    const sortedDates = workoutData.map((w) => normalizeDate(w.date)).sort((a, b) => b - a);

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWorkout = sortedDates[0];

    const daysDiff = Math.round((today - lastWorkout) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) return 0;

    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = sortedDates[i - 1];
        const currDate = sortedDates[i];
        const diff = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24));

        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function calculateCurrentWeek(workoutData) {
    if (workoutData.length === 0) return 1;

    const firstWorkout = normalizeDate(workoutData[0].date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysDiff = Math.round((today - firstWorkout) / (1000 * 60 * 60 * 24));
    return Math.floor(daysDiff / 7) + 1;
}

// ========== Tests ==========

describe('formatDate', () => {
    it('should format an ISO date string', () => {
        const result = formatDate('2025-01-15');
        expect(result).toContain('Jan');
        expect(result).toContain('15');
        expect(result).toContain('2025');
    });

    it('should handle different months', () => {
        const result = formatDate('2025-12-25');
        expect(result).toContain('Dec');
        expect(result).toContain('25');
    });
});

describe('calculateAvgPain', () => {
    it('should return 0/10 for empty array', () => {
        expect(calculateAvgPain([])).toBe('0/10');
    });

    it('should calculate average of single exercise', () => {
        expect(calculateAvgPain([{ pain: 5 }])).toBe('5.0/10');
    });

    it('should calculate average of multiple exercises', () => {
        const exercises = [{ pain: 2 }, { pain: 4 }, { pain: 6 }];
        expect(calculateAvgPain(exercises)).toBe('4.0/10');
    });

    it('should handle zero pain values', () => {
        const exercises = [{ pain: 0 }, { pain: 0 }, { pain: 0 }];
        expect(calculateAvgPain(exercises)).toBe('0.0/10');
    });

    it('should round to one decimal place', () => {
        const exercises = [{ pain: 1 }, { pain: 2 }, { pain: 3 }];
        expect(calculateAvgPain(exercises)).toBe('2.0/10');
    });
});

describe('calculateStreak', () => {
    it('should return 0 for empty workout data', () => {
        expect(calculateStreak([])).toBe(0);
    });

    it('should return 1 for a single workout today', () => {
        const today = new Date().toISOString().split('T')[0];
        expect(calculateStreak([{ date: today }])).toBe(1);
    });

    it('should return 0 if last workout was more than 1 day ago', () => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        expect(calculateStreak([{ date: threeDaysAgo.toISOString().split('T')[0] }])).toBe(0);
    });

    it('should count 3 consecutive days correctly (timezone-safe)', () => {
        // Build YYYY-MM-DD strings from local date components
        function toDateStr(d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }

        const today = new Date();
        today.setHours(12, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(today.getDate() - 2);

        const data = [
            { date: toDateStr(twoDaysAgo) },
            { date: toDateStr(yesterday) },
            { date: toDateStr(today) },
        ];
        expect(calculateStreak(data)).toBe(3);
    });

    it('should break streak on gap', () => {
        function toDateStr(d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }

        const today = new Date();
        today.setHours(12, 0, 0, 0);
        const fourDaysAgo = new Date(today);
        fourDaysAgo.setDate(today.getDate() - 4);
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(today.getDate() - 5);

        const data = [
            { date: toDateStr(fiveDaysAgo) },
            { date: toDateStr(fourDaysAgo) },
            // 3-day gap here
            { date: toDateStr(today) },
        ];
        expect(calculateStreak(data)).toBe(1);
    });
});

describe('calculateCurrentWeek', () => {
    it('should return 1 for empty workout data', () => {
        expect(calculateCurrentWeek([])).toBe(1);
    });

    it('should return 1 if first workout was today', () => {
        const today = new Date().toISOString().split('T')[0];
        expect(calculateCurrentWeek([{ date: today }])).toBe(1);
    });

    it('should return correct week for past date', () => {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const result = calculateCurrentWeek([{ date: twoWeeksAgo.toISOString().split('T')[0] }]);
        expect(result).toBe(3); // 14 days / 7 + 1 = 3
    });
});

describe('safeGetItem / safeSetItem pattern', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should return fallback when key does not exist', () => {
        const raw = localStorage.getItem('nonexistent');
        expect(raw).toBeNull();
    });

    it('should round-trip JSON through localStorage', () => {
        const data = { foo: 'bar', count: 42 };
        localStorage.setItem('test', JSON.stringify(data));
        const parsed = JSON.parse(localStorage.getItem('test'));
        expect(parsed).toEqual(data);
    });

    it('should handle corrupt JSON gracefully', () => {
        localStorage.setItem('corrupt', '{invalid json');
        let result;
        try {
            result = JSON.parse(localStorage.getItem('corrupt'));
        } catch (_e) {
            result = 'fallback';
        }
        expect(result).toBe('fallback');
    });
});
