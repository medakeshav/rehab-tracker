import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock state.js to avoid circular dependency side effects
vi.mock('../js/state.js', () => ({
    currentPhase: 1,
    setCurrentPhase: vi.fn(),
    workoutData: [],
    dailyProgress: {
        date: new Date().toISOString().split('T')[0],
        completedExercises: [],
        exerciseData: {},
        soundEnabled: true,
    },
    saveDailyProgress: vi.fn(),
    streakData: { current: 5, longest: 10 },
}));

// Mock navigation.js
vi.mock('../js/navigation.js', () => ({
    showScreen: vi.fn(),
}));

import {
    safeGetItem,
    safeSetItem,
    showToast,
    formatDate,
    calculateAvgPain,
    normalizeDate,
    calculateStreak,
    calculateCurrentWeek,
    updateStats,
    selectPhase,
    updatePhaseInfo,
    setupPainSliders,
    setLoadExercises,
} from '../js/utils.js';

import { setCurrentPhase } from '../js/state.js';
import { showScreen } from '../js/navigation.js';

describe('Utils Integration', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    // ========== safeGetItem ==========
    describe('safeGetItem()', () => {
        it('should return fallback when key does not exist', () => {
            expect(safeGetItem('nonexistent', 'default')).toBe('default');
        });

        it('should return parsed JSON when key exists', () => {
            localStorage.setItem('test', JSON.stringify({ foo: 'bar' }));
            expect(safeGetItem('test', null)).toEqual({ foo: 'bar' });
        });

        it('should return fallback for corrupt JSON', () => {
            localStorage.setItem('corrupt', '{invalid json!!!');
            expect(safeGetItem('corrupt', 'fallback')).toBe('fallback');
        });

        it('should return parsed arrays', () => {
            localStorage.setItem('arr', JSON.stringify([1, 2, 3]));
            expect(safeGetItem('arr', [])).toEqual([1, 2, 3]);
        });

        it('should return parsed numbers', () => {
            localStorage.setItem('num', JSON.stringify(42));
            expect(safeGetItem('num', 0)).toBe(42);
        });

        it('should return parsed booleans', () => {
            localStorage.setItem('bool', JSON.stringify(true));
            expect(safeGetItem('bool', false)).toBe(true);
        });

        it('should return parsed null correctly', () => {
            localStorage.setItem('nullVal', JSON.stringify(null));
            expect(safeGetItem('nullVal', 'fallback')).toBeNull();
        });

        it('should return parsed string', () => {
            localStorage.setItem('str', JSON.stringify('hello'));
            expect(safeGetItem('str', '')).toBe('hello');
        });
    });

    // ========== safeSetItem ==========
    describe('safeSetItem()', () => {
        it('should return true on success', () => {
            expect(safeSetItem('key', { test: true })).toBe(true);
        });

        it('should persist data to localStorage', () => {
            safeSetItem('key', { test: true });
            expect(JSON.parse(localStorage.getItem('key'))).toEqual({ test: true });
        });

        it('should serialize arrays', () => {
            safeSetItem('arr', [1, 2, 3]);
            expect(JSON.parse(localStorage.getItem('arr'))).toEqual([1, 2, 3]);
        });

        it('should serialize numbers', () => {
            safeSetItem('num', 42);
            expect(JSON.parse(localStorage.getItem('num'))).toBe(42);
        });

        it('should serialize strings', () => {
            safeSetItem('str', 'hello');
            expect(JSON.parse(localStorage.getItem('str'))).toBe('hello');
        });

        it('should overwrite existing keys', () => {
            safeSetItem('key', 'first');
            safeSetItem('key', 'second');
            expect(JSON.parse(localStorage.getItem('key'))).toBe('second');
        });
    });

    // ========== showToast ==========
    describe('showToast()', () => {
        it('should create a toast element in the DOM', () => {
            showToast('Test message', 'success');
            const toast = document.querySelector('.toast');
            expect(toast).toBeTruthy();
            expect(toast.textContent).toBe('Test message');
        });

        it('should apply success class by default', () => {
            showToast('Success!');
            const toast = document.querySelector('.toast');
            expect(toast.classList.contains('success')).toBe(true);
        });

        it('should apply error class', () => {
            showToast('Error!', 'error');
            const toast = document.querySelector('.toast');
            expect(toast.classList.contains('error')).toBe(true);
        });

        it('should apply info class', () => {
            showToast('Info!', 'info');
            const toast = document.querySelector('.toast');
            expect(toast.classList.contains('info')).toBe(true);
        });

        it('should auto-remove after timeout', async () => {
            vi.useFakeTimers();
            showToast('Temporary');
            expect(document.querySelector('.toast')).toBeTruthy();
            vi.advanceTimersByTime(3000);
            expect(document.querySelector('.toast')).toBeNull();
            vi.useRealTimers();
        });
    });

    // ========== formatDate ==========
    describe('formatDate()', () => {
        it('should format ISO date to human-readable form', () => {
            const result = formatDate('2025-01-15');
            expect(result).toContain('Jan');
            expect(result).toContain('15');
            expect(result).toContain('2025');
        });

        it('should handle different months', () => {
            expect(formatDate('2025-06-01')).toContain('Jun');
            expect(formatDate('2025-12-25')).toContain('Dec');
        });

        it('should handle year boundaries', () => {
            const result = formatDate('2026-01-01');
            expect(result).toContain('2026');
        });
    });

    // ========== calculateAvgPain ==========
    describe('calculateAvgPain()', () => {
        it('should return 0/10 for empty list', () => {
            expect(calculateAvgPain([])).toBe('0/10');
        });

        it('should calculate single exercise pain', () => {
            expect(calculateAvgPain([{ pain: 5 }])).toBe('5.0/10');
        });

        it('should calculate average of multiple exercises', () => {
            expect(calculateAvgPain([{ pain: 2 }, { pain: 4 }, { pain: 6 }])).toBe('4.0/10');
        });

        it('should handle all zeros', () => {
            expect(calculateAvgPain([{ pain: 0 }, { pain: 0 }])).toBe('0.0/10');
        });

        it('should handle max pain', () => {
            expect(calculateAvgPain([{ pain: 10 }])).toBe('10.0/10');
        });
    });

    // ========== normalizeDate ==========
    describe('normalizeDate()', () => {
        it('should parse YYYY-MM-DD to local midnight', () => {
            const date = normalizeDate('2025-06-15');
            expect(date.getFullYear()).toBe(2025);
            expect(date.getMonth()).toBe(5); // 0-indexed
            expect(date.getDate()).toBe(15);
            expect(date.getHours()).toBe(0);
        });

        it('should handle January 1st', () => {
            const date = normalizeDate('2026-01-01');
            expect(date.getMonth()).toBe(0);
            expect(date.getDate()).toBe(1);
        });

        it('should handle December 31st', () => {
            const date = normalizeDate('2025-12-31');
            expect(date.getMonth()).toBe(11);
            expect(date.getDate()).toBe(31);
        });
    });

    // ========== calculateStreak ==========
    describe('calculateStreak()', () => {
        it('should return streak from streakData', () => {
            // streakData.current is mocked as 5
            expect(calculateStreak()).toBe(5);
        });
    });

    // ========== calculateCurrentWeek ==========
    describe('calculateCurrentWeek()', () => {
        it('should return 1 for empty workoutData', () => {
            // workoutData is mocked as empty array
            expect(calculateCurrentWeek()).toBe(1);
        });
    });

    // ========== updateStats ==========
    describe('updateStats()', () => {
        it('should update DOM stats elements', () => {
            document.body.innerHTML = `
                <span id="totalWorkouts"></span>
                <span id="currentStreak"></span>
                <span id="currentWeek"></span>
            `;
            updateStats();
            expect(document.getElementById('totalWorkouts').textContent).toBe('0');
            expect(document.getElementById('currentStreak').textContent).toBe('5');
            expect(document.getElementById('currentWeek').textContent).toBe('1');
        });
    });

    // ========== selectPhase ==========
    describe('selectPhase()', () => {
        it('should call setCurrentPhase with the phase number', () => {
            document.body.innerHTML = '<span id="currentPhaseText"></span>';
            selectPhase(2);
            expect(setCurrentPhase).toHaveBeenCalledWith(2);
        });

        it('should persist to localStorage', () => {
            document.body.innerHTML = '<span id="currentPhaseText"></span>';
            selectPhase(3);
            expect(JSON.parse(localStorage.getItem('currentPhase'))).toBe(3);
        });

        it('should navigate to daily screen', () => {
            document.body.innerHTML = '<span id="currentPhaseText"></span>';
            selectPhase(1);
            expect(showScreen).toHaveBeenCalledWith('daily');
        });

        it('should show success toast', () => {
            document.body.innerHTML = '<span id="currentPhaseText"></span>';
            selectPhase(2);
            const toast = document.querySelector('.toast');
            expect(toast.textContent).toContain('Phase 2');
        });
    });

    // ========== updatePhaseInfo ==========
    describe('updatePhaseInfo()', () => {
        it('should update phase text element', () => {
            document.body.innerHTML = '<span id="currentPhaseText"></span>';
            updatePhaseInfo();
            const text = document.getElementById('currentPhaseText').textContent;
            expect(text).toContain('Phase 1');
        });
    });

    // ========== setupPainSliders ==========
    describe('setupPainSliders()', () => {
        it('should wire up slider input events', () => {
            document.body.innerHTML = `
                <input id="kneePain" type="range" min="0" max="10" value="0">
                <span id="kneePainValue">0</span>
                <input id="backPain" type="range" min="0" max="10" value="0">
                <span id="backPainValue">0</span>
                <input id="footPain" type="range" min="0" max="10" value="0">
                <span id="footPainValue">0</span>
            `;
            setupPainSliders();

            const slider = document.getElementById('kneePain');
            slider.value = '7';
            slider.dispatchEvent(new Event('input'));
            expect(document.getElementById('kneePainValue').textContent).toBe('7');
        });

        it('should handle missing sliders gracefully', () => {
            document.body.innerHTML = '';
            expect(() => setupPainSliders()).not.toThrow();
        });
    });

    // ========== setLoadExercises ==========
    describe('setLoadExercises()', () => {
        it('should register callback without error', () => {
            expect(() => setLoadExercises(() => {})).not.toThrow();
        });
    });
});
