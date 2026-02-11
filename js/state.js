/**
 * state.js — Global state management and localStorage persistence
 *
 * Owns all mutable application state (phase, workout data, daily progress)
 * and provides functions to load, save, capture, and restore exercise data.
 */

// ========== Global State Variables ==========

/** @type {number} Currently selected rehab phase (1, 2, or 3) */
let currentPhase = safeGetItem('currentPhase', 1);
if (typeof currentPhase === 'string') currentPhase = parseInt(currentPhase) || 1;

/** @type {Array<Object>} All saved daily workout records */
let workoutData = safeGetItem('workoutData', []);

/** @type {Array<Object>} All saved weekly assessment records */
let weeklyData = safeGetItem('weeklyData', []);

/** @type {Array<Object>} All saved monthly assessment records */
let monthlyData = safeGetItem('monthlyData', []);

/** Progress Bar Version: 'A' = sticky top bar, 'C' = mini thumbnail circles */
let PROGRESS_BAR_VERSION = safeGetItem('progressBarVersion', 'C');

// ========== Daily Progress (completion tracking + input values) ==========

/** @type {Object} Today's progress — resets automatically on new day */
let dailyProgress = loadDailyProgress();

/**
 * Load today's daily progress from localStorage.
 * If the stored data is from a previous day, returns a fresh progress object.
 * @returns {Object} Daily progress data
 */
function loadDailyProgress() {
    const data = safeGetItem('rehabDailyProgress', null);
    if (data) {
        const today = new Date().toISOString().split('T')[0];
        if (data.date === today) {
            return data;
        }
    }
    return createFreshProgress();
}

/**
 * Create a blank daily progress object for today.
 * @returns {Object} Fresh progress with today's date
 */
function createFreshProgress() {
    return {
        date: new Date().toISOString().split('T')[0],
        completedExercises: [],
        exerciseData: {},
        soundEnabled: true,
    };
}

/**
 * Persist the current dailyProgress object to localStorage.
 */
function saveDailyProgress() {
    safeSetItem('rehabDailyProgress', dailyProgress);
}

// ========== Exercise Data Capture & Restore ==========

/**
 * Read current values from an expanded exercise card's DOM inputs
 * and save them into dailyProgress.exerciseData.
 * @param {string} exerciseId - The exercise ID to capture data for
 */
function captureExerciseData(exerciseId) {
    // Bilateral exercises use a single "reps" picker instead of left/right
    const repsPicker = document.getElementById(`reps_${exerciseId}`);
    let left, right;
    if (repsPicker) {
        const reps = getPickerValue(`reps_${exerciseId}`);
        left = reps;
        right = reps;
    } else {
        left = getPickerValue(`left_${exerciseId}`);
        right = getPickerValue(`right_${exerciseId}`);
    }
    const sets = getPickerValue(`sets_${exerciseId}`);
    const painEl = document.getElementById(`pain_${exerciseId}`);
    const notesEl = document.getElementById(`notes_${exerciseId}`);

    dailyProgress.exerciseData[exerciseId] = {
        left: left,
        right: right,
        sets: sets,
        pain: painEl ? parseInt(painEl.value) || 0 : 0,
        notes: notesEl ? notesEl.value || '' : '',
    };
    saveDailyProgress();
}

/**
 * Restore previously saved input values into an expanded exercise card.
 * Called when exercises are loaded or a completed card is re-expanded.
 * @param {Object} exercise - Exercise definition object (must have .id)
 */
function restoreExerciseData(exercise) {
    const data = dailyProgress.exerciseData[exercise.id];
    if (!data) return;

    // Bilateral exercises use a single "reps" picker
    if (exercise.bilateral) {
        if (data.left) setPickerValue(`reps_${exercise.id}`, data.left);
    } else {
        if (data.left) setPickerValue(`left_${exercise.id}`, data.left);
        if (data.right) setPickerValue(`right_${exercise.id}`, data.right);
    }
    if (data.sets) setPickerValue(`sets_${exercise.id}`, data.sets);

    const painEl = document.getElementById(`pain_${exercise.id}`);
    const painValue = document.getElementById(`pain_value_${exercise.id}`);
    if (painEl && data.pain !== undefined) {
        painEl.value = data.pain;
        if (painValue) {
            painValue.textContent = data.pain;
            updatePainColor(painValue, data.pain);
        }
    }

    const notesEl = document.getElementById(`notes_${exercise.id}`);
    if (notesEl && data.notes) notesEl.value = data.notes;
}

/**
 * Auto-save all expanded exercise card data on page close or tab switch.
 * Iterates through all phase exercises and captures DOM values for
 * any card that is still expanded (not yet marked complete).
 */
function autoSaveDailyProgress() {
    const phaseExercises = getExercisesForPhase(currentPhase);
    phaseExercises.forEach((exercise) => {
        // Only capture from DOM if the card is expanded (not collapsed)
        if (!dailyProgress.completedExercises.includes(exercise.id)) {
            // Bilateral exercises use a single "reps" picker
            const repsPicker = document.getElementById(`reps_${exercise.id}`);
            let left, right;
            if (repsPicker) {
                const reps = getPickerValue(`reps_${exercise.id}`);
                left = reps;
                right = reps;
            } else {
                left = getPickerValue(`left_${exercise.id}`);
                right = getPickerValue(`right_${exercise.id}`);
            }
            const sets = getPickerValue(`sets_${exercise.id}`);
            const painEl = document.getElementById(`pain_${exercise.id}`);
            const notesEl = document.getElementById(`notes_${exercise.id}`);

            // Only save if picker exists (card is in DOM)
            if (repsPicker || document.getElementById(`left_${exercise.id}`)) {
                dailyProgress.exerciseData[exercise.id] = {
                    left: left,
                    right: right,
                    sets: sets,
                    pain: painEl ? parseInt(painEl.value) || 0 : 0,
                    notes: notesEl ? notesEl.value || '' : '',
                };
            }
        }
    });
    saveDailyProgress();
}
