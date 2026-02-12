import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock state.js
const mockStreakData = {
    current: 0,
    longest: 0,
    lastWorkoutDate: '',
    lastWorkoutAvgPain: 0,
    isInjuryGrace: false,
    achievements: [],
    achievementDates: {},
};

const mockWorkoutData = [];

vi.mock('../js/state.js', () => ({
    get workoutData() {
        return mockWorkoutData;
    },
    get streakData() {
        return mockStreakData;
    },
    setStreakData: vi.fn((v) => {
        Object.assign(mockStreakData, v);
    }),
}));

// Mock utils.js
vi.mock('../js/utils.js', () => ({
    safeSetItem: vi.fn(),
    normalizeDate: vi.fn((dateStr) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    }),
}));

// Mock exercises.js
vi.mock('../exercises.js', () => ({
    getCategoryByExerciseId: vi.fn((id) => {
        if (id.startsWith('calf') || id.startsWith('heel')) return 'Foot & Ankle';
        if (id.startsWith('bridge') || id.startsWith('glute')) return 'Hip & Glute';
        if (id.startsWith('plank') || id.startsWith('dead')) return 'Core';
        if (id.startsWith('balance')) return 'Balance';
        return 'Mobility';
    }),
}));

import {
    initStreak,
    onWorkoutSaved,
    checkStreakReminder,
    getCurrentStreak,
    renderStreakCard,
    renderWarningBanner,
    getStreakWarning,
    BADGES,
} from '../js/streak.js';
import { setStreakData } from '../js/state.js';
import { safeSetItem } from '../js/utils.js';

describe('Streak Integration', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
        // Reset mock state
        mockStreakData.current = 0;
        mockStreakData.longest = 0;
        mockStreakData.lastWorkoutDate = '';
        mockStreakData.lastWorkoutAvgPain = 0;
        mockStreakData.isInjuryGrace = false;
        mockStreakData.achievements = [];
        mockStreakData.achievementDates = {};
        mockWorkoutData.length = 0;
    });

    // ========== BADGES constant ==========
    describe('BADGES', () => {
        it('should be a non-empty array', () => {
            expect(Array.isArray(BADGES)).toBe(true);
            expect(BADGES.length).toBeGreaterThan(0);
        });

        it('should have unique IDs', () => {
            const ids = BADGES.map((b) => b.id);
            expect(new Set(ids).size).toBe(ids.length);
        });

        it('should have consistency badges', () => {
            const consistency = BADGES.filter((b) => b.section === 'consistency');
            expect(consistency.length).toBeGreaterThan(0);
        });

        it('should have volume badges', () => {
            const volume = BADGES.filter((b) => b.section === 'volume');
            expect(volume.length).toBeGreaterThan(0);
        });

        it('should have muscle badges', () => {
            const muscle = BADGES.filter((b) => b.section === 'muscle');
            expect(muscle.length).toBeGreaterThan(0);
        });

        it('should have first_workout badge', () => {
            const first = BADGES.find((b) => b.id === 'first_workout');
            expect(first).toBeTruthy();
            expect(first.condition).toBe('first');
        });

        it('should have streak badges (3, 7, 14, 30)', () => {
            const streakBadges = BADGES.filter((b) => b.streakRequired);
            const required = streakBadges.map((b) => b.streakRequired);
            expect(required).toContain(3);
            expect(required).toContain(7);
            expect(required).toContain(14);
            expect(required).toContain(30);
        });

        it('should have total exercise badges', () => {
            const totalBadges = BADGES.filter((b) => b.totalRequired);
            expect(totalBadges.length).toBe(5);
        });

        it('should have all required fields', () => {
            BADGES.forEach((badge) => {
                expect(badge.id).toBeTruthy();
                expect(badge.name).toBeTruthy();
                expect(badge.icon).toBeTruthy();
                expect(badge.section).toBeTruthy();
            });
        });
    });

    // ========== getCurrentStreak ==========
    describe('getCurrentStreak()', () => {
        it('should return 0 initially', () => {
            expect(getCurrentStreak()).toBe(0);
        });

        it('should return current streak value', () => {
            mockStreakData.current = 7;
            expect(getCurrentStreak()).toBe(7);
        });
    });

    // ========== getStreakWarning ==========
    describe('getStreakWarning()', () => {
        it('should return null when streak is 0', () => {
            mockStreakData.current = 0;
            expect(getStreakWarning()).toBeNull();
        });

        it('should return recovery message for high pain', () => {
            mockStreakData.current = 5;
            mockStreakData.lastWorkoutAvgPain = 7;
            const warning = getStreakWarning();
            expect(warning).toBeTruthy();
            expect(warning.urgency).toBe('recovery');
            expect(warning.message).toContain('Recovery');
        });

        it('should return null when already worked out today', () => {
            mockStreakData.current = 5;
            mockStreakData.lastWorkoutAvgPain = 2;
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            mockWorkoutData.push({ date: todayStr, exercises: [] });
            const warning = getStreakWarning();
            expect(warning).toBeNull();
        });
    });

    // ========== renderStreakCard ==========
    describe('renderStreakCard()', () => {
        it('should not throw when #streakCard is missing', () => {
            expect(() => renderStreakCard()).not.toThrow();
        });

        it('should render streak card HTML', () => {
            document.body.innerHTML = '<div id="streakCard"></div>';
            mockStreakData.current = 5;
            mockStreakData.longest = 10;
            renderStreakCard();
            const card = document.getElementById('streakCard');
            expect(card.innerHTML).toContain('5-Day Streak');
            expect(card.innerHTML).toContain('Best: 10 days');
        });

        it('should render zero streak', () => {
            document.body.innerHTML = '<div id="streakCard"></div>';
            mockStreakData.current = 0;
            mockStreakData.longest = 0;
            renderStreakCard();
            const card = document.getElementById('streakCard');
            expect(card.innerHTML).toContain('0-Day Streak');
        });

        it('should show earned badges', () => {
            document.body.innerHTML = '<div id="streakCard"></div>';
            mockStreakData.current = 3;
            mockStreakData.longest = 3;
            mockStreakData.achievements = ['first_workout', 'three_day'];
            renderStreakCard();
            const card = document.getElementById('streakCard');
            expect(card.innerHTML).toContain('First Step');
        });

        it('should render week row with day labels', () => {
            document.body.innerHTML = '<div id="streakCard"></div>';
            renderStreakCard();
            const card = document.getElementById('streakCard');
            expect(card.innerHTML).toContain('Mon');
            expect(card.innerHTML).toContain('Sun');
        });

        it('should render progress bar for next badge', () => {
            document.body.innerHTML = '<div id="streakCard"></div>';
            mockStreakData.current = 2;
            mockStreakData.longest = 2;
            mockStreakData.achievements = [];
            renderStreakCard();
            const card = document.getElementById('streakCard');
            // Should show progress toward "Momentum" (3-day streak)
            expect(card.innerHTML).toContain('streak-progress');
        });
    });

    // ========== renderWarningBanner ==========
    describe('renderWarningBanner()', () => {
        it('should not throw when #streakWarning is missing', () => {
            expect(() => renderWarningBanner()).not.toThrow();
        });

        it('should hide banner when no warning', () => {
            document.body.innerHTML = '<div id="streakWarning" style="display:flex"></div>';
            mockStreakData.current = 0;
            renderWarningBanner();
            expect(document.getElementById('streakWarning').style.display).toBe('none');
        });

        it('should show recovery banner for high pain', () => {
            document.body.innerHTML = '<div id="streakWarning"></div>';
            mockStreakData.current = 5;
            mockStreakData.lastWorkoutAvgPain = 8;
            renderWarningBanner();
            const banner = document.getElementById('streakWarning');
            expect(banner.style.display).toBe('flex');
            expect(banner.innerHTML).toContain('Recovery');
        });

        it('should include dismiss button', () => {
            document.body.innerHTML = '<div id="streakWarning"></div>';
            mockStreakData.current = 5;
            mockStreakData.lastWorkoutAvgPain = 8;
            renderWarningBanner();
            const dismiss = document.querySelector('.streak-warning-dismiss');
            expect(dismiss).toBeTruthy();
        });
    });

    // ========== initStreak ==========
    describe('initStreak()', () => {
        it('should not throw with empty workout data', () => {
            document.body.innerHTML = `
                <div id="streakCard"></div>
                <div id="streakWarning"></div>
            `;
            expect(() => initStreak()).not.toThrow();
        });

        it('should call setStreakData', () => {
            document.body.innerHTML = `
                <div id="streakCard"></div>
                <div id="streakWarning"></div>
            `;
            initStreak();
            expect(setStreakData).toHaveBeenCalled();
        });

        it('should persist streak data', () => {
            document.body.innerHTML = `
                <div id="streakCard"></div>
                <div id="streakWarning"></div>
            `;
            initStreak();
            expect(safeSetItem).toHaveBeenCalledWith('streakData', expect.any(Object));
        });

        it('should set current streak to 0 with no workouts', () => {
            document.body.innerHTML = `
                <div id="streakCard"></div>
                <div id="streakWarning"></div>
            `;
            initStreak();
            expect(setStreakData).toHaveBeenCalledWith(
                expect.objectContaining({ current: 0 })
            );
        });

        it('should calculate streak from workout data', () => {
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            mockWorkoutData.push({
                date: todayStr,
                exercises: [{ id: 'calf1', name: 'Calf Raises', pain: 2 }],
            });
            document.body.innerHTML = `
                <div id="streakCard"></div>
                <div id="streakWarning"></div>
            `;
            initStreak();
            expect(setStreakData).toHaveBeenCalledWith(
                expect.objectContaining({ current: expect.any(Number) })
            );
        });

        it('should award first_workout badge when workout exists', () => {
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            mockWorkoutData.push({
                date: todayStr,
                exercises: [{ id: 'calf1', name: 'Calf Raises', pain: 2 }],
            });
            document.body.innerHTML = `
                <div id="streakCard"></div>
                <div id="streakWarning"></div>
            `;
            initStreak();
            const updatedData = setStreakData.mock.calls[0][0];
            expect(updatedData.achievements).toContain('first_workout');
        });
    });

    // ========== onWorkoutSaved ==========
    describe('onWorkoutSaved()', () => {
        it('should not throw with empty data', () => {
            document.body.innerHTML = `
                <div id="streakCard"></div>
                <div id="streakWarning"></div>
            `;
            expect(() => onWorkoutSaved()).not.toThrow();
        });

        it('should recalculate and persist streak', () => {
            document.body.innerHTML = `
                <div id="streakCard"></div>
                <div id="streakWarning"></div>
            `;
            onWorkoutSaved();
            expect(setStreakData).toHaveBeenCalled();
            expect(safeSetItem).toHaveBeenCalledWith('streakData', expect.any(Object));
        });
    });

    // ========== checkStreakReminder ==========
    describe('checkStreakReminder()', () => {
        it('should not throw', () => {
            document.body.innerHTML = '<div id="streakWarning"></div>';
            expect(() => checkStreakReminder()).not.toThrow();
        });
    });

    // ========== Streak with workout data ==========
    describe('Streak calculation with workout data', () => {
        function todayStr() {
            const today = new Date();
            return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }

        function daysAgo(n) {
            const d = new Date();
            d.setDate(d.getDate() - n);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }

        it('should calculate streak from consecutive workout days', () => {
            mockWorkoutData.push(
                { date: daysAgo(2), exercises: [{ id: 'calf1', pain: 1 }] },
                { date: daysAgo(1), exercises: [{ id: 'calf1', pain: 1 }] },
                { date: todayStr(), exercises: [{ id: 'calf1', pain: 1 }] }
            );
            document.body.innerHTML = `
                <div id="streakCard"></div>
                <div id="streakWarning"></div>
            `;
            initStreak();
            const data = setStreakData.mock.calls[0][0];
            expect(data.current).toBeGreaterThanOrEqual(1);
        });

        it('should award volume badges for enough exercises', () => {
            // Add 11 workouts with 1 exercise each = 11 total exercises
            for (let i = 0; i < 11; i++) {
                mockWorkoutData.push({
                    date: daysAgo(i),
                    exercises: [{ id: 'calf1', name: 'Calf Raises', pain: 1 }],
                });
            }
            document.body.innerHTML = `
                <div id="streakCard"></div>
                <div id="streakWarning"></div>
            `;
            initStreak();
            const data = setStreakData.mock.calls[0][0];
            expect(data.achievements).toContain('first_workout');
            expect(data.achievements).toContain('total_10');
        });

        it('should render streak card with multiple badges', () => {
            mockWorkoutData.push(
                { date: todayStr(), exercises: [{ id: 'calf1', pain: 0 }] }
            );
            document.body.innerHTML = `
                <div id="streakCard"></div>
                <div id="streakWarning"></div>
            `;
            mockStreakData.achievements = ['first_workout', 'three_day', 'week_warrior'];
            mockStreakData.current = 7;
            mockStreakData.longest = 7;
            renderStreakCard();
            const card = document.getElementById('streakCard');
            expect(card.innerHTML).toContain('7-Day Streak');
            expect(card.innerHTML).toContain('Week Warrior');
        });

        it('should show badge view button when no badges earned', () => {
            document.body.innerHTML = '<div id="streakCard"></div>';
            mockStreakData.achievements = [];
            mockStreakData.current = 0;
            renderStreakCard();
            const card = document.getElementById('streakCard');
            expect(card.innerHTML).toContain('View Badges');
        });

        it('should show +N more when many badges earned', () => {
            document.body.innerHTML = '<div id="streakCard"></div>';
            mockStreakData.achievements = [
                'first_workout',
                'three_day',
                'week_warrior',
                'two_week',
                'total_10',
            ];
            mockStreakData.current = 14;
            mockStreakData.longest = 14;
            renderStreakCard();
            const card = document.getElementById('streakCard');
            expect(card.innerHTML).toContain('+2 more');
        });

        it('should render warning banner with dismiss button that works', () => {
            document.body.innerHTML = '<div id="streakWarning"></div>';
            mockStreakData.current = 5;
            mockStreakData.lastWorkoutAvgPain = 8;
            renderWarningBanner();
            const dismiss = document.querySelector('.streak-warning-dismiss');
            dismiss.click();
            expect(document.getElementById('streakWarning').style.display).toBe('none');
        });

        it('should handle "all streak badges earned" progress message', () => {
            document.body.innerHTML = '<div id="streakCard"></div>';
            // Mark all streak badges as earned
            mockStreakData.achievements = [
                'first_workout',
                'three_day',
                'week_warrior',
                'two_week',
                'monthly_master',
            ];
            mockStreakData.current = 35;
            mockStreakData.longest = 35;
            renderStreakCard();
            const card = document.getElementById('streakCard');
            expect(card.innerHTML).toContain('All streak badges earned');
        });

        it('should show week row with workout days marked', () => {
            mockWorkoutData.push(
                { date: todayStr(), exercises: [{ id: 'calf1', pain: 0 }] }
            );
            document.body.innerHTML = '<div id="streakCard"></div>';
            mockStreakData.current = 1;
            renderStreakCard();
            const card = document.getElementById('streakCard');
            expect(card.innerHTML).toContain('✅');
        });
    });
});
