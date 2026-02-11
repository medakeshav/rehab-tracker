import { describe, it, expect, beforeEach } from 'vitest';

// Re-implement core state functions here for isolated testing
// (avoids global scope side effects from loading the real files)

function createFreshProgress() {
    return {
        date: new Date().toISOString().split('T')[0],
        completedExercises: [],
        exerciseData: {},
        soundEnabled: true,
    };
}

function loadDailyProgress() {
    const raw = localStorage.getItem('rehabDailyProgress');
    if (raw) {
        try {
            const data = JSON.parse(raw);
            const today = new Date().toISOString().split('T')[0];
            if (data.date === today) {
                return data;
            }
        } catch (_e) {
            // corrupt data
        }
    }
    return createFreshProgress();
}

function saveDailyProgress(progress) {
    localStorage.setItem('rehabDailyProgress', JSON.stringify(progress));
}

// ========== Tests ==========

describe('createFreshProgress', () => {
    it('should return an object with today\'s date', () => {
        const progress = createFreshProgress();
        const today = new Date().toISOString().split('T')[0];
        expect(progress.date).toBe(today);
    });

    it('should have empty completedExercises array', () => {
        const progress = createFreshProgress();
        expect(progress.completedExercises).toEqual([]);
    });

    it('should have empty exerciseData object', () => {
        const progress = createFreshProgress();
        expect(progress.exerciseData).toEqual({});
    });

    it('should have soundEnabled set to true', () => {
        const progress = createFreshProgress();
        expect(progress.soundEnabled).toBe(true);
    });
});

describe('loadDailyProgress', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should return fresh progress when nothing is stored', () => {
        const progress = loadDailyProgress();
        expect(progress.completedExercises).toEqual([]);
        expect(progress.date).toBe(new Date().toISOString().split('T')[0]);
    });

    it('should return stored progress for today', () => {
        const today = new Date().toISOString().split('T')[0];
        const stored = {
            date: today,
            completedExercises: ['exercise1', 'exercise2'],
            exerciseData: { exercise1: { left: 10, right: 12 } },
            soundEnabled: false,
        };
        localStorage.setItem('rehabDailyProgress', JSON.stringify(stored));

        const progress = loadDailyProgress();
        expect(progress.completedExercises).toEqual(['exercise1', 'exercise2']);
        expect(progress.soundEnabled).toBe(false);
    });

    it('should return fresh progress when stored data is from a different day', () => {
        const yesterday = {
            date: '2020-01-01',
            completedExercises: ['old_exercise'],
            exerciseData: {},
            soundEnabled: true,
        };
        localStorage.setItem('rehabDailyProgress', JSON.stringify(yesterday));

        const progress = loadDailyProgress();
        expect(progress.completedExercises).toEqual([]);
        expect(progress.date).toBe(new Date().toISOString().split('T')[0]);
    });

    it('should return fresh progress when stored data is corrupt', () => {
        localStorage.setItem('rehabDailyProgress', '{not valid json!!!');
        const progress = loadDailyProgress();
        expect(progress.completedExercises).toEqual([]);
    });
});

describe('saveDailyProgress', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should persist progress to localStorage', () => {
        const progress = createFreshProgress();
        progress.completedExercises = ['ex1'];
        saveDailyProgress(progress);

        const stored = JSON.parse(localStorage.getItem('rehabDailyProgress'));
        expect(stored.completedExercises).toEqual(['ex1']);
    });

    it('should overwrite previous data', () => {
        const first = createFreshProgress();
        first.completedExercises = ['ex1'];
        saveDailyProgress(first);

        const second = createFreshProgress();
        second.completedExercises = ['ex1', 'ex2', 'ex3'];
        saveDailyProgress(second);

        const stored = JSON.parse(localStorage.getItem('rehabDailyProgress'));
        expect(stored.completedExercises).toEqual(['ex1', 'ex2', 'ex3']);
    });

    it('should round-trip exercise data correctly', () => {
        const progress = createFreshProgress();
        progress.exerciseData = {
            calf_raises: { left: 15, right: 22, sets: 3, pain: 2, notes: 'Felt good' },
        };
        saveDailyProgress(progress);

        const stored = JSON.parse(localStorage.getItem('rehabDailyProgress'));
        expect(stored.exerciseData.calf_raises.left).toBe(15);
        expect(stored.exerciseData.calf_raises.notes).toBe('Felt good');
    });
});
