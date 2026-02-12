import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

// Mock exercises.js
vi.mock('../exercises.js', () => ({
    getExercisesForPhase: vi.fn(() => [
        { id: 'ex1', name: 'Calf Raises' },
        { id: 'ex2', name: 'Quad Sets' },
        { id: 'ex3', name: 'Bridges' },
        { id: 'ex4', name: 'Heel Slides' },
    ]),
    getVisibleExercisesForPhase: vi.fn(() => [
        { id: 'ex1', name: 'Calf Raises' },
        { id: 'ex2', name: 'Quad Sets' },
        { id: 'ex3', name: 'Bridges' },
        { id: 'ex4', name: 'Heel Slides' },
    ]),
}));

// Mock state.js
const mockDailyProgress = {
    date: new Date().toISOString().split('T')[0],
    completedExercises: [],
    exerciseData: {},
    soundEnabled: true,
};

vi.mock('../js/state.js', () => ({
    currentPhase: 1,
    get dailyProgress() {
        return mockDailyProgress;
    },
    saveDailyProgress: vi.fn(),
    PROGRESS_BAR_VERSION: 'A',
    setProgressBarVersion: vi.fn(),
    darkMode: false,
    setDarkMode: vi.fn(),
}));

// Mock utils.js
vi.mock('../js/utils.js', () => ({
    safeSetItem: vi.fn(),
    showToast: vi.fn(),
    showConfirmDialog: vi.fn((title, msg, confirmText, onConfirm) => {
        if (onConfirm) onConfirm();
    }),
}));

import {
    updateProgressBar,
    scrollToExercise,
    clearDailyProgress,
    checkAllComplete,
    showCelebration,
    hideCelebration,
    getCompletionMessage,
    showCompletionToast,
    toggleSound,
    updateSoundToggleBtn,
    toggleProgressBar,
    updateProgressBarToggleBtn,
    toggleDarkMode,
    applyDarkMode,
    updateDarkModeToggleBtn,
    setReloadExercises,
} from '../js/progress.js';
import { showToast, safeSetItem, showConfirmDialog } from '../js/utils.js';
import { saveDailyProgress, setProgressBarVersion, setDarkMode } from '../js/state.js';
import confetti from 'canvas-confetti';

describe('Progress Integration', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
        // Reset daily progress state
        mockDailyProgress.completedExercises = [];
        mockDailyProgress.exerciseData = {};
        mockDailyProgress.soundEnabled = true;
    });

    // ========== updateProgressBar ==========
    describe('updateProgressBar()', () => {
        it('should not throw with minimal DOM', () => {
            expect(() => updateProgressBar()).not.toThrow();
        });

        it('should hide version A bar when no exercises completed', () => {
            document.body.innerHTML = `
                <div id="progressBarA" style="display:block">
                    <div class="progress-bar-fill"></div>
                    <div class="progress-bar-text"></div>
                </div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
            `;
            updateProgressBar();
            expect(document.getElementById('progressBarA').style.display).toBe('none');
        });

        it('should hide clear button when no exercises completed', () => {
            document.body.innerHTML = `
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn" style="display:block"></button>
            `;
            updateProgressBar();
            expect(document.getElementById('clearProgressBtn').style.display).toBe('none');
        });

        it('should show clear button when exercises are completed', () => {
            document.body.innerHTML = `
                <div id="progressBarA">
                    <div class="progress-bar-fill"></div>
                    <div class="progress-bar-text"></div>
                </div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
            `;
            mockDailyProgress.completedExercises = ['ex1'];
            updateProgressBar();
            expect(document.getElementById('clearProgressBtn').style.display).toBe('block');
        });
    });

    // ========== scrollToExercise ==========
    describe('scrollToExercise()', () => {
        it('should not throw for missing exercise', () => {
            expect(() => scrollToExercise('nonexistent')).not.toThrow();
        });

        it('should add highlight to found card', () => {
            const card = document.createElement('div');
            card.className = 'exercise-card';
            card.setAttribute('data-exercise-id', 'ex1');
            card.scrollIntoView = vi.fn();
            document.body.appendChild(card);

            scrollToExercise('ex1');
            expect(card.style.boxShadow).toContain('var(--primary-color)');
        });
    });

    // ========== checkAllComplete ==========
    describe('checkAllComplete()', () => {
        it('should not show celebration when incomplete', () => {
            mockDailyProgress.completedExercises = ['ex1'];
            document.body.innerHTML = '<div id="exerciseList"></div>';
            checkAllComplete();
            expect(document.getElementById('celebrationBanner')).toBeNull();
        });

        it('should show celebration when all complete', () => {
            mockDailyProgress.completedExercises = ['ex1', 'ex2', 'ex3', 'ex4'];
            document.body.innerHTML = '<div id="exerciseList"></div>';
            checkAllComplete();
            expect(confetti).toHaveBeenCalled();
        });
    });

    // ========== showCelebration ==========
    describe('showCelebration()', () => {
        it('should fire confetti', () => {
            document.body.innerHTML = '<div id="exerciseList"></div>';
            showCelebration();
            expect(confetti).toHaveBeenCalled();
        });

        it('should create celebration banner', () => {
            document.body.innerHTML = '<div><div id="exerciseList"></div></div>';
            showCelebration();
            const banner = document.getElementById('celebrationBanner');
            expect(banner).toBeTruthy();
            expect(banner.textContent).toContain('Workout Complete');
        });

        it('should not create duplicate banner', () => {
            document.body.innerHTML = '<div><div id="exerciseList"></div></div>';
            showCelebration();
            showCelebration();
            const banners = document.querySelectorAll('#celebrationBanner');
            expect(banners.length).toBe(1);
        });
    });

    // ========== hideCelebration ==========
    describe('hideCelebration()', () => {
        it('should remove celebration banner', () => {
            document.body.innerHTML = '<div id="celebrationBanner"></div>';
            hideCelebration();
            expect(document.getElementById('celebrationBanner')).toBeNull();
        });

        it('should not throw when no banner exists', () => {
            expect(() => hideCelebration()).not.toThrow();
        });
    });

    // ========== getCompletionMessage ==========
    describe('getCompletionMessage()', () => {
        it('should return a string', () => {
            const msg = getCompletionMessage();
            expect(typeof msg).toBe('string');
            expect(msg.length).toBeGreaterThan(0);
        });

        it('should return all-complete message when everything done', () => {
            mockDailyProgress.completedExercises = ['ex1', 'ex2', 'ex3', 'ex4'];
            const msg = getCompletionMessage();
            expect(msg).toMatch(/crushed|complete|done|sweep|Champion|Perfect/i);
        });

        it('should return first exercise message for first completion', () => {
            mockDailyProgress.completedExercises = ['ex1'];
            const msg = getCompletionMessage({ id: 'ex1', name: 'Calf Raises' });
            expect(msg.length).toBeGreaterThan(0);
        });

        it('should return high sets message for sets >= 4', () => {
            mockDailyProgress.completedExercises = ['ex1', 'ex2'];
            mockDailyProgress.exerciseData['ex2'] = { sets: 5 };
            const msg = getCompletionMessage({ id: 'ex2', name: 'Quad Sets' });
            expect(msg.length).toBeGreaterThan(0);
        });

        it('should generate non-empty messages at various completion levels', () => {
            // Halfway
            mockDailyProgress.completedExercises = ['ex1', 'ex2'];
            const halfwayMsg = getCompletionMessage({ id: 'ex2', name: 'Quad Sets' });
            expect(halfwayMsg.length).toBeGreaterThan(0);

            // Almost done
            mockDailyProgress.completedExercises = ['ex1', 'ex2', 'ex3'];
            const almostMsg = getCompletionMessage({ id: 'ex3', name: 'Bridges' });
            expect(almostMsg.length).toBeGreaterThan(0);
        });
    });

    // ========== showCompletionToast ==========
    describe('showCompletionToast()', () => {
        it('should create completion toast element', () => {
            showCompletionToast();
            const toast = document.querySelector('.completion-toast');
            expect(toast).toBeTruthy();
        });

        it('should remove existing toast before creating new one', () => {
            showCompletionToast();
            showCompletionToast();
            const toasts = document.querySelectorAll('.completion-toast');
            expect(toasts.length).toBe(1);
        });

        it('should display count in toast', () => {
            mockDailyProgress.completedExercises = ['ex1', 'ex2'];
            showCompletionToast({ id: 'ex2', name: 'Quad Sets' });
            const toast = document.querySelector('.completion-toast');
            expect(toast.textContent).toContain('2/4');
        });
    });

    // ========== toggleSound ==========
    describe('toggleSound()', () => {
        it('should toggle sound off when currently on', () => {
            mockDailyProgress.soundEnabled = true;
            toggleSound();
            expect(mockDailyProgress.soundEnabled).toBe(false);
        });

        it('should toggle sound on when currently off', () => {
            mockDailyProgress.soundEnabled = false;
            toggleSound();
            expect(mockDailyProgress.soundEnabled).toBe(true);
        });

        it('should save progress after toggle', () => {
            toggleSound();
            expect(saveDailyProgress).toHaveBeenCalled();
        });

        it('should show toast notification', () => {
            toggleSound();
            expect(showToast).toHaveBeenCalled();
        });
    });

    // ========== updateSoundToggleBtn ==========
    describe('updateSoundToggleBtn()', () => {
        it('should update button text for sound on', () => {
            document.body.innerHTML = '<button id="soundToggleBtn"></button>';
            mockDailyProgress.soundEnabled = true;
            updateSoundToggleBtn();
            expect(document.getElementById('soundToggleBtn').textContent).toContain('ON');
        });

        it('should update button text for sound off', () => {
            document.body.innerHTML = '<button id="soundToggleBtn"></button>';
            mockDailyProgress.soundEnabled = false;
            updateSoundToggleBtn();
            expect(document.getElementById('soundToggleBtn').textContent).toContain('OFF');
        });

        it('should not throw when button missing', () => {
            expect(() => updateSoundToggleBtn()).not.toThrow();
        });
    });

    // ========== toggleProgressBar ==========
    describe('toggleProgressBar()', () => {
        it('should call setProgressBarVersion', () => {
            document.body.innerHTML = `
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
                <button id="progressBarToggleBtn"></button>
            `;
            toggleProgressBar();
            expect(setProgressBarVersion).toHaveBeenCalled();
        });

        it('should persist to localStorage via safeSetItem', () => {
            document.body.innerHTML = `
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
                <button id="progressBarToggleBtn"></button>
            `;
            toggleProgressBar();
            expect(safeSetItem).toHaveBeenCalledWith('progressBarVersion', expect.any(String));
        });

        it('should show toast', () => {
            document.body.innerHTML = `
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
                <button id="progressBarToggleBtn"></button>
            `;
            toggleProgressBar();
            expect(showToast).toHaveBeenCalled();
        });
    });

    // ========== updateProgressBarToggleBtn ==========
    describe('updateProgressBarToggleBtn()', () => {
        it('should not throw when button is missing', () => {
            expect(() => updateProgressBarToggleBtn()).not.toThrow();
        });

        it('should update button text', () => {
            document.body.innerHTML = '<button id="progressBarToggleBtn"></button>';
            updateProgressBarToggleBtn();
            const btn = document.getElementById('progressBarToggleBtn');
            expect(btn.textContent).toContain('Progress');
        });
    });

    // ========== toggleDarkMode ==========
    describe('toggleDarkMode()', () => {
        it('should call setDarkMode', () => {
            document.body.innerHTML = '<meta name="theme-color" content="#4472C4">';
            toggleDarkMode();
            expect(setDarkMode).toHaveBeenCalled();
        });

        it('should persist to localStorage', () => {
            document.body.innerHTML = '<meta name="theme-color" content="#4472C4">';
            toggleDarkMode();
            expect(safeSetItem).toHaveBeenCalledWith('darkMode', expect.any(Boolean));
        });

        it('should show toast', () => {
            document.body.innerHTML = '<meta name="theme-color" content="#4472C4">';
            toggleDarkMode();
            expect(showToast).toHaveBeenCalled();
        });
    });

    // ========== applyDarkMode ==========
    describe('applyDarkMode()', () => {
        it('should not throw with meta element', () => {
            document.body.innerHTML = '';
            document.head.innerHTML = '<meta name="theme-color" content="#4472C4">';
            expect(() => applyDarkMode()).not.toThrow();
        });
    });

    // ========== updateDarkModeToggleBtn ==========
    describe('updateDarkModeToggleBtn()', () => {
        it('should not throw when button is missing', () => {
            expect(() => updateDarkModeToggleBtn()).not.toThrow();
        });

        it('should update button text', () => {
            document.body.innerHTML = '<button id="darkModeToggleBtn"></button>';
            updateDarkModeToggleBtn();
            const btn = document.getElementById('darkModeToggleBtn');
            expect(btn.textContent).toContain('Theme');
        });
    });

    // ========== clearDailyProgress ==========
    describe('clearDailyProgress()', () => {
        it('should call showConfirmDialog', () => {
            document.body.innerHTML = `
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
            `;
            clearDailyProgress();
            expect(showConfirmDialog).toHaveBeenCalled();
        });

        it('should clear completed exercises on confirm', () => {
            document.body.innerHTML = `
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
            `;
            mockDailyProgress.completedExercises = ['ex1', 'ex2'];
            clearDailyProgress();
            expect(mockDailyProgress.completedExercises).toEqual([]);
        });

        it('should clear exercise data on confirm', () => {
            document.body.innerHTML = `
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
            `;
            mockDailyProgress.exerciseData = { ex1: { left: 10 } };
            clearDailyProgress();
            expect(mockDailyProgress.exerciseData).toEqual({});
        });

        it('should show success toast after clearing', () => {
            document.body.innerHTML = `
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
            `;
            clearDailyProgress();
            expect(showToast).toHaveBeenCalledWith('Progress cleared', 'success');
        });
    });

    // ========== setReloadExercises ==========
    describe('setReloadExercises()', () => {
        it('should register callback without error', () => {
            expect(() => setReloadExercises(() => {})).not.toThrow();
        });
    });
});
