import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock utils.js to prevent circular dependency
vi.mock('../js/utils.js', () => ({
    safeGetItem: vi.fn((key, fallback) => {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return fallback;
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    }),
    safeSetItem: vi.fn((key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }),
}));

// Mock wheel-picker.js
vi.mock('../js/wheel-picker.js', () => ({
    getPickerValue: vi.fn((id) => {
        const el = document.getElementById(id);
        return el ? parseInt(el.value) || 0 : 0;
    }),
    setPickerValue: vi.fn((id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }),
}));

import {
    createFreshProgress,
    loadDailyProgress,
    saveDailyProgress,
    captureExerciseData,
    restoreExerciseData,
    updatePainColor,
    setCurrentPhase,
    setWorkoutData,
    setWeeklyData,
    setMonthlyData,
    setProgressBarVersion,
    setDarkMode,
    setBalanceLevel,
    setStreakData,
    setDailyProgress,
    dailyProgress,
} from '../js/state.js';
import { safeSetItem } from '../js/utils.js';

describe('State Integration', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    // ========== createFreshProgress ==========
    describe('createFreshProgress()', () => {
        it('should return object with today\'s date', () => {
            const progress = createFreshProgress();
            const today = new Date().toISOString().split('T')[0];
            expect(progress.date).toBe(today);
        });

        it('should have empty completedExercises', () => {
            const progress = createFreshProgress();
            expect(progress.completedExercises).toEqual([]);
        });

        it('should have empty exerciseData', () => {
            const progress = createFreshProgress();
            expect(progress.exerciseData).toEqual({});
        });

        it('should have soundEnabled true', () => {
            const progress = createFreshProgress();
            expect(progress.soundEnabled).toBe(true);
        });

        it('should return a new object each time', () => {
            const a = createFreshProgress();
            const b = createFreshProgress();
            expect(a).not.toBe(b);
            expect(a).toEqual(b);
        });
    });

    // ========== loadDailyProgress ==========
    describe('loadDailyProgress()', () => {
        it('should return fresh progress when nothing stored', () => {
            const progress = loadDailyProgress();
            expect(progress.completedExercises).toEqual([]);
        });

        it('should return stored progress for today', () => {
            const today = new Date().toISOString().split('T')[0];
            const stored = {
                date: today,
                completedExercises: ['ex1', 'ex2'],
                exerciseData: {},
                soundEnabled: false,
            };
            localStorage.setItem('rehabDailyProgress', JSON.stringify(stored));
            const progress = loadDailyProgress();
            expect(progress.completedExercises).toEqual(['ex1', 'ex2']);
        });

        it('should return fresh progress for old date', () => {
            const stored = {
                date: '2020-01-01',
                completedExercises: ['old'],
                exerciseData: {},
                soundEnabled: true,
            };
            localStorage.setItem('rehabDailyProgress', JSON.stringify(stored));
            const progress = loadDailyProgress();
            expect(progress.completedExercises).toEqual([]);
        });
    });

    // ========== saveDailyProgress ==========
    describe('saveDailyProgress()', () => {
        it('should call safeSetItem with dailyProgress', () => {
            saveDailyProgress();
            expect(safeSetItem).toHaveBeenCalledWith('rehabDailyProgress', expect.any(Object));
        });
    });

    // ========== captureExerciseData ==========
    describe('captureExerciseData()', () => {
        it('should capture bilateral exercise data from DOM', () => {
            // Setup bilateral exercise (single reps picker)
            document.body.innerHTML = `
                <input type="hidden" id="reps_ex1" value="15">
                <input type="hidden" id="sets_ex1" value="3">
                <input id="pain_ex1" value="2">
                <textarea id="notes_ex1">Test note</textarea>
            `;
            captureExerciseData('ex1');
            expect(dailyProgress.exerciseData['ex1']).toBeDefined();
            expect(dailyProgress.exerciseData['ex1'].left).toBe(15);
            expect(dailyProgress.exerciseData['ex1'].right).toBe(15);
            expect(dailyProgress.exerciseData['ex1'].pain).toBe(2);
            expect(dailyProgress.exerciseData['ex1'].notes).toBe('Test note');
        });

        it('should capture unilateral exercise data (left/right pickers)', () => {
            document.body.innerHTML = `
                <input type="hidden" id="left_ex2" value="10">
                <input type="hidden" id="right_ex2" value="12">
                <input type="hidden" id="sets_ex2" value="3">
                <input id="pain_ex2" value="4">
                <textarea id="notes_ex2"></textarea>
            `;
            captureExerciseData('ex2');
            expect(dailyProgress.exerciseData['ex2'].left).toBe(10);
            expect(dailyProgress.exerciseData['ex2'].right).toBe(12);
        });

        it('should handle missing pain and notes elements', () => {
            document.body.innerHTML = `
                <input type="hidden" id="reps_ex3" value="10">
                <input type="hidden" id="sets_ex3" value="2">
            `;
            captureExerciseData('ex3');
            expect(dailyProgress.exerciseData['ex3'].pain).toBe(0);
            expect(dailyProgress.exerciseData['ex3'].notes).toBe('');
        });

        it('should call saveDailyProgress after capture', () => {
            document.body.innerHTML = `
                <input type="hidden" id="reps_ex4" value="5">
                <input type="hidden" id="sets_ex4" value="1">
            `;
            captureExerciseData('ex4');
            expect(safeSetItem).toHaveBeenCalled();
        });
    });

    // ========== restoreExerciseData ==========
    describe('restoreExerciseData()', () => {
        it('should do nothing if no saved data exists', () => {
            const exercise = { id: 'unknown', bilateral: false };
            expect(() => restoreExerciseData(exercise)).not.toThrow();
        });

        it('should restore bilateral exercise data', () => {
            // First capture some data
            document.body.innerHTML = `
                <input type="hidden" id="reps_ex5" value="15">
                <input type="hidden" id="sets_ex5" value="3">
                <input id="pain_ex5" value="2">
                <textarea id="notes_ex5">Note</textarea>
            `;
            captureExerciseData('ex5');

            // Now set up DOM for restore
            document.body.innerHTML = `
                <input type="hidden" id="reps_ex5" value="0">
                <input type="hidden" id="sets_ex5" value="0">
                <div data-sets-id="sets_ex5">
                    <button class="sets-radio-btn" data-value="1">1</button>
                    <button class="sets-radio-btn" data-value="2">2</button>
                    <button class="sets-radio-btn" data-value="3">3</button>
                </div>
                <input id="pain_ex5" value="0">
                <span id="pain_value_ex5">0</span>
                <textarea id="notes_ex5"></textarea>
            `;

            restoreExerciseData({ id: 'ex5', bilateral: true });
            // Pain should be restored
            expect(document.getElementById('pain_ex5').value).toBe('2');
            expect(document.getElementById('notes_ex5').value).toBe('Note');
        });

        it('should restore unilateral exercise data', () => {
            // Manually set exercise data
            dailyProgress.exerciseData['ex6'] = {
                left: 10,
                right: 12,
                sets: 2,
                pain: 3,
                notes: 'Rehab note',
            };

            document.body.innerHTML = `
                <input type="hidden" id="left_ex6" value="0">
                <input type="hidden" id="right_ex6" value="0">
                <input type="hidden" id="sets_ex6" value="0">
                <input id="pain_ex6" value="0">
                <span id="pain_value_ex6">0</span>
                <textarea id="notes_ex6"></textarea>
            `;

            restoreExerciseData({ id: 'ex6', bilateral: false });
            expect(document.getElementById('pain_ex6').value).toBe('3');
            expect(document.getElementById('notes_ex6').value).toBe('Rehab note');
        });

        it('should update pain color on restore', () => {
            dailyProgress.exerciseData['ex7'] = {
                left: 10,
                right: 10,
                sets: 3,
                pain: 8,
                notes: '',
            };

            document.body.innerHTML = `
                <input type="hidden" id="reps_ex7" value="0">
                <input id="pain_ex7" value="0">
                <span id="pain_value_ex7">0</span>
            `;

            restoreExerciseData({ id: 'ex7', bilateral: true });
            const painValue = document.getElementById('pain_value_ex7');
            expect(painValue.textContent).toBe('8');
            expect(painValue.style.background).toBe('var(--danger-color)');
        });
    });

    // ========== updatePainColor ==========
    describe('updatePainColor()', () => {
        it('should set danger color for pain >= 7', () => {
            const el = document.createElement('span');
            updatePainColor(el, 7);
            expect(el.style.background).toBe('var(--danger-color)');
        });

        it('should set danger color for pain 10', () => {
            const el = document.createElement('span');
            updatePainColor(el, 10);
            expect(el.style.background).toBe('var(--danger-color)');
        });

        it('should set warning color for pain 4-6', () => {
            const el = document.createElement('span');
            updatePainColor(el, 4);
            expect(el.style.background).toBe('var(--warning-color)');
        });

        it('should set warning color for pain 6', () => {
            const el = document.createElement('span');
            updatePainColor(el, 6);
            expect(el.style.background).toBe('var(--warning-color)');
        });

        it('should set green color for pain 0-3', () => {
            const el = document.createElement('span');
            updatePainColor(el, 0);
            // jsdom converts hex to rgb
            expect(el.style.background).toBe('rgb(76, 175, 80)');
        });

        it('should set green color for pain 3', () => {
            const el = document.createElement('span');
            updatePainColor(el, 3);
            expect(el.style.background).toBe('rgb(76, 175, 80)');
        });

        it('should handle string values', () => {
            const el = document.createElement('span');
            updatePainColor(el, '8');
            expect(el.style.background).toBe('var(--danger-color)');
        });
    });

    // ========== State Setters ==========
    describe('State setters', () => {
        it('setCurrentPhase should not throw', () => {
            expect(() => setCurrentPhase(2)).not.toThrow();
        });

        it('setWorkoutData should not throw', () => {
            expect(() => setWorkoutData([])).not.toThrow();
        });

        it('setWeeklyData should not throw', () => {
            expect(() => setWeeklyData([])).not.toThrow();
        });

        it('setMonthlyData should not throw', () => {
            expect(() => setMonthlyData([])).not.toThrow();
        });

        it('setProgressBarVersion should not throw', () => {
            expect(() => setProgressBarVersion('A')).not.toThrow();
        });

        it('setDarkMode should not throw', () => {
            expect(() => setDarkMode(true)).not.toThrow();
        });

        it('setBalanceLevel should not throw', () => {
            expect(() => setBalanceLevel(3)).not.toThrow();
        });

        it('setStreakData should not throw', () => {
            expect(() => setStreakData({ current: 5 })).not.toThrow();
        });

        it('setDailyProgress should not throw', () => {
            expect(() => setDailyProgress(createFreshProgress())).not.toThrow();
        });
    });
});
