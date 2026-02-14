import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock exercises.js
const mockExercisesList = [
    {
        id: 'calf_raises',
        name: 'Calf Raises',
        targetReps: '15',
        leftTarget: 15,
        rightTarget: 15,
        sets: 3,
        category: 'Foot & Ankle',
        bilateral: true,
        instructions: {
            title: 'Calf Raises',
            steps: ['Stand on one leg', 'Rise up on toes'],
            reps: '15 each leg',
            sets: '3 sets',
            why: 'Builds calf strength',
            tips: ['Go slowly'],
        },
    },
    {
        id: 'quad_sets',
        name: 'Quad Sets',
        targetReps: '10',
        leftTarget: 10,
        rightTarget: 10,
        sets: 3,
        category: 'Core',
        bilateral: false,
    },
];

vi.mock('../exercises.js', () => ({
    getExercisesForPhase: vi.fn(() => mockExercisesList),
    getExercisesForTimeBlock: vi.fn(() => mockExercisesList),
    getScheduledExercises: vi.fn(() => mockExercisesList),
    getVisibleExercisesForPhase: vi.fn(() => mockExercisesList),
}));

// Mock utils.js
vi.mock('../js/utils.js', () => ({
    showToast: vi.fn(),
    updateStats: vi.fn(),
    safeSetItem: vi.fn(),
}));

// Mock wheel-picker.js
vi.mock('../js/wheel-picker.js', () => ({
    createWheelPicker: vi.fn((id, min, max, step, defaultValue) => {
        const container = document.createElement('div');
        container.className = 'wheel-picker-container';
        container.setAttribute('data-picker-id', id);
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.id = id;
        hidden.value = defaultValue;
        container.appendChild(hidden);
        return container;
    }),
    getPickerValue: vi.fn((id) => {
        const el = document.getElementById(id);
        return el ? parseInt(el.value) || 0 : 0;
    }),
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
    captureExerciseData: vi.fn(),
    restoreExerciseData: vi.fn(),
    autoSaveDailyProgress: vi.fn(),
    updatePainColor: vi.fn(),
    workoutData: [],
    createFreshProgress: vi.fn(() => ({
        date: new Date().toISOString().split('T')[0],
        completedExercises: [],
        exerciseData: {},
        soundEnabled: true,
    })),
    setDailyProgress: vi.fn(),
    balanceLevel: 1,
    setBalanceLevel: vi.fn(),
    activeTimeBlock: 'morning',
    planStartDate: null,
    setPlanStartDate: vi.fn(),
    incrementQuickLog: vi.fn(),
    decrementQuickLog: vi.fn(),
    updateDailyMetric: vi.fn(),
    getProgressionTargets: vi.fn(() => null),
    getScheduleForDate: vi.fn(() => ({
        isRestDay: false,
        isMaintenanceDay: false,
        isWorkoutDay: true,
        dayOfWeek: 1,
        dayName: 'Monday',
    })),
}));

// Mock progress.js
vi.mock('../js/progress.js', () => ({
    updateProgressBar: vi.fn(),
    checkAllComplete: vi.fn(),
    playCompletionSound: vi.fn(),
    showCompletionToast: vi.fn(),
    hideCelebration: vi.fn(),
}));

// Mock streak.js
vi.mock('../js/streak.js', () => ({
    onWorkoutSaved: vi.fn(),
}));

import {
    loadExercises,
    createExerciseCard,
    createCompletedCard,
    createTimedExerciseCard,
    createTimedHoldsCard,
    createQuickLogCard,
    collapseCard,
    expandCard,
    scrollToNextIncomplete,
    attachPainSliderListeners,
    dismissBottomSheet,
    showInstructionsBottomSheet,
    saveWorkout,
    renderDailyMetrics,
} from '../js/exercises-ui.js';
import { showToast } from '../js/utils.js';
import { updateProgressBar } from '../js/progress.js';
import { restoreExerciseData } from '../js/state.js';

describe('Exercises UI Integration', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
        mockDailyProgress.completedExercises = [];
        mockDailyProgress.exerciseData = {};
    });

    // ========== loadExercises ==========
    describe('loadExercises()', () => {
        it('should render exercise cards into exerciseList', () => {
            document.body.innerHTML = `
                <input id="workoutDate" value="2025-02-10">
                <div id="exerciseList"></div>
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
            `;
            loadExercises();
            const list = document.getElementById('exerciseList');
            expect(list.children.length).toBe(2);
        });

        it('should call updateProgressBar', () => {
            document.body.innerHTML = `
                <input id="workoutDate" value="2025-02-10">
                <div id="exerciseList"></div>
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
            `;
            loadExercises();
            expect(updateProgressBar).toHaveBeenCalled();
        });

        it('should restore exercise data for non-completed exercises', () => {
            document.body.innerHTML = `
                <input id="workoutDate" value="2025-02-10">
                <div id="exerciseList"></div>
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
            `;
            loadExercises();
            expect(restoreExerciseData).toHaveBeenCalled();
        });

        it('should render completed cards for completed exercises', () => {
            mockDailyProgress.completedExercises = ['calf_raises'];
            document.body.innerHTML = `
                <input id="workoutDate" value="2025-02-10">
                <div id="exerciseList"></div>
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
            `;
            loadExercises();
            const completed = document.querySelectorAll('.exercise-card--completed');
            expect(completed.length).toBe(1);
        });
    });

    // ========== createExerciseCard ==========
    describe('createExerciseCard()', () => {
        const mockExercise = {
            id: 'test_ex',
            name: 'Test Exercise',
            targetReps: '15',
            leftTarget: 15,
            rightTarget: 15,
            sets: 3,
            bilateral: true,
        };

        it('should return a DOM element', () => {
            const card = createExerciseCard(mockExercise, 0);
            expect(card).toBeInstanceOf(HTMLElement);
        });

        it('should have exercise-card class', () => {
            const card = createExerciseCard(mockExercise, 0);
            expect(card.classList.contains('exercise-card')).toBe(true);
        });

        it('should set data-exercise-id', () => {
            const card = createExerciseCard(mockExercise, 0);
            expect(card.getAttribute('data-exercise-id')).toBe('test_ex');
        });

        it('should display exercise name', () => {
            const card = createExerciseCard(mockExercise, 0);
            expect(card.innerHTML).toContain('Test Exercise');
        });

        it('should include mark complete button', () => {
            const card = createExerciseCard(mockExercise, 0);
            const btn = card.querySelector('.mark-complete-btn');
            expect(btn).toBeTruthy();
            expect(btn.textContent).toContain('Mark Complete');
        });

        it('should include pain slider', () => {
            const card = createExerciseCard(mockExercise, 0);
            const slider = card.querySelector('.pain-slider');
            expect(slider).toBeTruthy();
        });

        it('should include sets radio buttons', () => {
            const card = createExerciseCard(mockExercise, 0);
            const btns = card.querySelectorAll('.sets-radio-btn');
            expect(btns.length).toBe(5);
        });

        it('should create bilateral picker for bilateral exercise', () => {
            const card = createExerciseCard(mockExercise, 0);
            expect(card.innerHTML).toContain('Reps:');
        });

        it('should create left/right pickers for unilateral exercise', () => {
            const uniExercise = {
                id: 'uni_ex',
                name: 'Unilateral',
                targetReps: '10',
                leftTarget: 10,
                rightTarget: 10,
                sets: 3,
                bilateral: false,
            };
            const card = createExerciseCard(uniExercise, 0);
            expect(card.innerHTML).toContain('Left Leg Reps');
            expect(card.innerHTML).toContain('Right Leg Reps');
        });

        it('should create card with exercise header', () => {
            const exercise = {
                id: 'test_ex',
                name: 'Test Exercise',
                targetReps: '10',
                leftTarget: 10,
                rightTarget: 10,
                sets: 3,
                bilateral: false,
            };
            const card = createExerciseCard(exercise, 0);
            expect(card.innerHTML).toContain('Test Exercise');
            expect(card.innerHTML).toContain('exercise-header');
        });
    });

    // ========== createCompletedCard ==========
    describe('createCompletedCard()', () => {
        const mockExercise = { id: 'comp_ex', name: 'Completed Exercise' };

        it('should return a DOM element', () => {
            const card = createCompletedCard(mockExercise);
            expect(card).toBeInstanceOf(HTMLElement);
        });

        it('should have completed class', () => {
            const card = createCompletedCard(mockExercise);
            expect(card.classList.contains('exercise-card--completed')).toBe(true);
        });

        it('should display exercise name', () => {
            const card = createCompletedCard(mockExercise);
            expect(card.innerHTML).toContain('Completed Exercise');
        });

        it('should show checkmark', () => {
            const card = createCompletedCard(mockExercise);
            expect(card.innerHTML).toContain('completed-checkmark');
        });

        it('should show tap to edit hint', () => {
            const card = createCompletedCard(mockExercise);
            expect(card.innerHTML).toContain('tap to edit');
        });

        it('should set data-exercise-id', () => {
            const card = createCompletedCard(mockExercise);
            expect(card.getAttribute('data-exercise-id')).toBe('comp_ex');
        });
    });

    // ========== attachPainSliderListeners ==========
    describe('attachPainSliderListeners()', () => {
        it('should not throw with null elements', () => {
            expect(() => attachPainSliderListeners(null, null)).not.toThrow();
        });

        it('should update display on slider change', () => {
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '0';
            slider.max = '10';
            slider.value = '0';
            const display = document.createElement('span');
            display.textContent = '0';

            attachPainSliderListeners(slider, display);

            slider.value = '5';
            slider.dispatchEvent(new Event('change'));
            expect(display.textContent).toBe('5');
        });
    });

    // ========== scrollToNextIncomplete ==========
    describe('scrollToNextIncomplete()', () => {
        it('should not throw with empty DOM', () => {
            expect(() => scrollToNextIncomplete(document.createElement('div'))).not.toThrow();
        });

        it('should scroll to first incomplete card after current', () => {
            const completedCard = document.createElement('div');
            completedCard.className = 'exercise-card exercise-card--completed';

            const nextCard = document.createElement('div');
            nextCard.className = 'exercise-card';
            nextCard.scrollIntoView = vi.fn();

            document.body.appendChild(completedCard);
            document.body.appendChild(nextCard);

            scrollToNextIncomplete(completedCard);
            expect(nextCard.scrollIntoView).toHaveBeenCalled();
        });
    });

    // ========== dismissBottomSheet ==========
    describe('dismissBottomSheet()', () => {
        it('should remove visible class', () => {
            vi.useFakeTimers();
            const overlay = document.createElement('div');
            overlay.className = 'bottom-sheet-overlay visible';
            document.body.appendChild(overlay);

            dismissBottomSheet(overlay);
            expect(overlay.classList.contains('visible')).toBe(false);
            vi.advanceTimersByTime(300);
            expect(document.querySelector('.bottom-sheet-overlay')).toBeNull();
            vi.useRealTimers();
        });
    });

    // ========== showInstructionsBottomSheet ==========
    describe('showInstructionsBottomSheet()', () => {
        it('should show toast when no instructions', () => {
            showInstructionsBottomSheet({ id: 'no_instr', name: 'No Instructions' });
            expect(showToast).toHaveBeenCalledWith('No instructions available', 'info');
        });

        it('should create bottom sheet overlay', () => {
            const exercise = {
                id: 'instr_ex',
                name: 'Exercise',
                instructions: {
                    title: 'Exercise Instructions',
                    steps: ['Step 1', 'Step 2'],
                    reps: '10 each',
                    sets: '3 sets',
                    why: 'Because it helps',
                    tips: ['Tip 1', 'Tip 2'],
                },
            };
            showInstructionsBottomSheet(exercise);
            const overlay = document.querySelector('.bottom-sheet-overlay');
            expect(overlay).toBeTruthy();
        });

        it('should display exercise title', () => {
            const exercise = {
                id: 'title_ex',
                name: 'Title Exercise',
                instructions: {
                    title: 'My Exercise Title',
                    steps: ['Do it'],
                    reps: '10',
                    sets: '3',
                    why: 'Good',
                    tips: ['Be careful'],
                },
            };
            showInstructionsBottomSheet(exercise);
            const overlay = document.querySelector('.bottom-sheet-overlay');
            expect(overlay.innerHTML).toContain('My Exercise Title');
        });

        it('should display steps', () => {
            const exercise = {
                id: 'steps_ex',
                name: 'Steps Exercise',
                instructions: {
                    title: 'Steps Test',
                    steps: ['First step', 'Second step', 'Third step'],
                    reps: '10',
                    sets: '3',
                    why: 'Good for you',
                    tips: ['Be slow'],
                },
            };
            showInstructionsBottomSheet(exercise);
            const overlay = document.querySelector('.bottom-sheet-overlay');
            expect(overlay.innerHTML).toContain('First step');
            expect(overlay.innerHTML).toContain('Third step');
        });

        it('should display pro tips', () => {
            const exercise = {
                id: 'tips_ex',
                name: 'Tips Exercise',
                instructions: {
                    title: 'Tips Test',
                    steps: ['Step 1'],
                    reps: '10',
                    sets: '3',
                    why: 'Why',
                    tips: ['Pro tip 1', 'Pro tip 2'],
                },
            };
            showInstructionsBottomSheet(exercise);
            const overlay = document.querySelector('.bottom-sheet-overlay');
            expect(overlay.innerHTML).toContain('Pro tip 1');
        });

        it('should remove existing sheet before creating new one', () => {
            const exercise = {
                id: 'dup_ex',
                name: 'Duplicate',
                instructions: {
                    title: 'Dup',
                    steps: ['Step'],
                    reps: '10',
                    sets: '3',
                    why: 'Why',
                    tips: ['Tip'],
                },
            };
            showInstructionsBottomSheet(exercise);
            showInstructionsBottomSheet(exercise);
            const overlays = document.querySelectorAll('.bottom-sheet-overlay');
            expect(overlays.length).toBe(1);
        });
    });

    // ========== collapseCard ==========
    describe('collapseCard()', () => {
        it('should mark exercise as completed', () => {
            vi.useFakeTimers();
            const exercise = { id: 'collapse_ex', name: 'Collapse Test' };
            const card = document.createElement('div');
            card.className = 'exercise-card';
            card.setAttribute('data-exercise-id', 'collapse_ex');
            document.body.appendChild(card);

            collapseCard(card, exercise);
            expect(mockDailyProgress.completedExercises).toContain('collapse_ex');
            vi.useRealTimers();
        });
    });

    // ========== expandCard ==========
    describe('expandCard()', () => {
        it('should remove exercise from completed list', () => {
            mockDailyProgress.completedExercises = ['expand_ex'];
            const exercise = {
                id: 'expand_ex',
                name: 'Expand Test',
                targetReps: '10',
                leftTarget: 10,
                rightTarget: 10,
                sets: 3,
                bilateral: true,
            };
            const card = document.createElement('div');
            card.className = 'exercise-card exercise-card--completed';
            card.setAttribute('data-exercise-id', 'expand_ex');
            document.body.appendChild(card);

            expandCard(card, exercise);
            expect(mockDailyProgress.completedExercises).not.toContain('expand_ex');
        });
    });

    // ========== saveWorkout ==========
    describe('saveWorkout()', () => {
        it('should show error when no date selected', () => {
            document.body.innerHTML = '<input id="workoutDate" value="">';
            saveWorkout();
            expect(showToast).toHaveBeenCalledWith('Please select a date', 'error');
        });

        it('should show error when no data entered', () => {
            document.body.innerHTML = '<input id="workoutDate" value="2025-01-15">';
            saveWorkout();
            expect(showToast).toHaveBeenCalledWith('Please enter at least some data', 'error');
        });

        it('should save workout when data exists', () => {
            vi.useFakeTimers();
            document.body.innerHTML = `
                <input id="workoutDate" value="2025-01-15">
                <div id="exerciseList"></div>
                <div id="progressBarA"></div>
                <div id="progressBarC"></div>
                <button id="clearProgressBtn"></button>
            `;
            mockDailyProgress.completedExercises = ['calf_raises'];
            mockDailyProgress.exerciseData = {
                calf_raises: { left: 15, right: 15, sets: 3, pain: 2, notes: '' },
            };
            saveWorkout();
            expect(showToast).toHaveBeenCalledWith('Workout saved successfully!', 'success');
            vi.useRealTimers();
        });
    });
});
