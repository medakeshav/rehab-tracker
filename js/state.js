/**
 * state.js — Global state management and localStorage persistence
 *
 * Owns all mutable application state (phase, workout data, daily progress)
 * and provides functions to load, save, capture, and restore exercise data.
 */

import CONFIG from './config.js';
import { safeGetItem, safeSetItem } from './utils.js';
import { getExercisesForTimeBlock } from '../exercises.js';
import { getPickerValue, setPickerValue } from './wheel-picker.js';

// ========== V2 Data Migration ==========
// Clear all old data on first load of v2 (user chose "start fresh")
const APP_VERSION_KEY = 'rehabAppVersion';
const CURRENT_VERSION = '2.0';

if (safeGetItem(APP_VERSION_KEY, null) !== CURRENT_VERSION) {
    // Clear all previous data
    localStorage.removeItem('workoutData');
    localStorage.removeItem('weeklyData');
    localStorage.removeItem('monthlyData');
    localStorage.removeItem('rehabDailyProgress');
    localStorage.removeItem('streakData');
    localStorage.removeItem('currentPhase');
    localStorage.removeItem('balanceLevel');
    safeSetItem(APP_VERSION_KEY, CURRENT_VERSION);
}

// ========== Global State Variables ==========

/** @type {number} Currently selected rehab phase (1, 2, or 3) */
let currentPhase = safeGetItem('currentPhase', CONFIG.DEFAULTS.PHASE);
if (typeof currentPhase === 'string')
    currentPhase = parseInt(currentPhase) || CONFIG.DEFAULTS.PHASE;

/** @type {Array<Object>} All saved daily workout records */
let workoutData = safeGetItem('workoutData', []);

/** @type {Array<Object>} All saved weekly assessment records */
let weeklyData = safeGetItem('weeklyData', []);

/** @type {Array<Object>} All saved monthly assessment records */
let monthlyData = safeGetItem('monthlyData', []);

/** Progress Bar Version: 'A' = sticky top bar, 'C' = mini thumbnail circles */
let PROGRESS_BAR_VERSION = safeGetItem('progressBarVersion', CONFIG.DEFAULTS.PROGRESS_BAR_VERSION);

/** Dark mode state: true = dark, false = light (default) */
let darkMode = safeGetItem('darkMode', CONFIG.DEFAULTS.DARK_MODE);

/** @type {number} Currently selected balance progression level (1-5) */
let balanceLevel = safeGetItem('balanceLevel', CONFIG.DEFAULTS.BALANCE_LEVEL);
if (typeof balanceLevel === 'string')
    balanceLevel = parseInt(balanceLevel) || CONFIG.DEFAULTS.BALANCE_LEVEL;

/** @type {Object} Streak tracking data (recalculated from workoutData on init) */
let streakData = safeGetItem('streakData', {
    current: 0,
    longest: 0,
    lastWorkoutDate: '',
    lastWorkoutAvgPain: 0,
    isInjuryGrace: false,
    achievements: [],
    achievementDates: {},
});

/** @type {string} Currently active time block tab */
let activeTimeBlock = safeGetItem('activeTimeBlock', 'morning');

/** @type {string|null} Date of first workout with v2 plan (for auto-progression) */
let planStartDate = safeGetItem('planStartDate', null);

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
            // Ensure new fields exist (migration safety)
            if (!data.dailyMetrics) data.dailyMetrics = createDefaultMetrics();
            if (!data.quickLogCounts) data.quickLogCounts = createDefaultQuickLogCounts();
            return data;
        }
    }
    return createFreshProgress();
}

/**
 * Create default daily metrics object.
 * @returns {Object}
 */
function createDefaultMetrics() {
    return {
        morningStiffness: null,
        hipFlexorTightness: null,
        standingTolerance: null,
        backPain: null,
    };
}

/**
 * Create default quick log counts.
 * @returns {Object}
 */
function createDefaultQuickLogCounts() {
    return {
        hip_flexor_quick: 0,
        glute_activation_quick: 0,
        standing_posture_quick: 0,
        seated_clamshells_quick: 0,
    };
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
        dailyMetrics: createDefaultMetrics(),
        quickLogCounts: createDefaultQuickLogCounts(),
    };
}

/**
 * Persist the current dailyProgress object to localStorage.
 */
function saveDailyProgress() {
    safeSetItem('rehabDailyProgress', dailyProgress);
}

// ========== Plan Start Date & Week Calculation ==========

/**
 * Set the plan start date (called on first workout save).
 * @param {string} dateStr - YYYY-MM-DD
 */
function setPlanStartDate(dateStr) {
    planStartDate = dateStr;
    safeSetItem('planStartDate', planStartDate);
}

/**
 * Get the current week number since plan start.
 * @returns {number} Week number (1-based), or 1 if no start date
 */
function getCurrentPlanWeek() {
    if (!planStartDate) return 1;
    const start = new Date(planStartDate + 'T00:00:00');
    const now = new Date();
    const diffMs = now - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.floor(diffDays / 7) + 1);
}

/**
 * Get the progression targets for an exercise based on current week.
 * Returns the timer duration (for timed exercises) based on the progression table.
 * @param {Object} exercise - Exercise definition
 * @returns {{ left: number, right: number, note?: string }|null} Progression targets or null
 */
function getProgressionTargets(exercise) {
    if (!exercise.progression) return null;
    const week = getCurrentPlanWeek();

    // Find the highest week key that is <= current week
    const weekKeys = Object.keys(exercise.progression)
        .map(Number)
        .sort((a, b) => a - b);

    let targetKey = weekKeys[0];
    for (const key of weekKeys) {
        if (key <= week) targetKey = key;
    }

    return exercise.progression[targetKey] || null;
}

// ========== Quick Log ==========

/**
 * Increment a quick-log exercise count.
 * @param {string} exerciseId - Quick-log exercise ID
 */
function incrementQuickLog(exerciseId) {
    if (!dailyProgress.quickLogCounts) {
        dailyProgress.quickLogCounts = createDefaultQuickLogCounts();
    }
    dailyProgress.quickLogCounts[exerciseId] =
        (dailyProgress.quickLogCounts[exerciseId] || 0) + 1;
    saveDailyProgress();
}

/**
 * Decrement a quick-log exercise count (minimum 0).
 * @param {string} exerciseId
 */
function decrementQuickLog(exerciseId) {
    if (!dailyProgress.quickLogCounts) {
        dailyProgress.quickLogCounts = createDefaultQuickLogCounts();
    }
    dailyProgress.quickLogCounts[exerciseId] = Math.max(
        0,
        (dailyProgress.quickLogCounts[exerciseId] || 0) - 1
    );
    saveDailyProgress();
}

// ========== Daily Metrics ==========

/**
 * Update a daily metric value.
 * @param {string} key - Metric key (morningStiffness, hipFlexorTightness, standingTolerance, backPain)
 * @param {number} value - Metric value
 */
function updateDailyMetric(key, value) {
    if (!dailyProgress.dailyMetrics) {
        dailyProgress.dailyMetrics = createDefaultMetrics();
    }
    dailyProgress.dailyMetrics[key] = value;
    saveDailyProgress();
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
    // Restore sets via radio buttons (hidden input + active class)
    if (data.sets) {
        const setsHidden = document.getElementById(`sets_${exercise.id}`);
        if (setsHidden) setsHidden.value = data.sets;
        const setsGroup = document.querySelector(`[data-sets-id="sets_${exercise.id}"]`);
        if (setsGroup) {
            setsGroup.querySelectorAll('.sets-radio-btn').forEach((btn) => {
                btn.classList.toggle('active', parseInt(btn.dataset.value) === data.sets);
            });
        }
    }

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
    const phaseExercises = getExercisesForTimeBlock(currentPhase, activeTimeBlock);
    phaseExercises.forEach((exercise) => {
        // Skip quick-log and pure-timed exercises (no DOM pickers)
        if (exercise.exerciseType === 'quick_log') return;
        if (exercise.exerciseType === 'timed' && exercise.bilateral) return;

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

// ========== Pain Color Helper ==========

/**
 * Update the background color of a pain value display based on severity.
 * @param {HTMLElement} element - The pain value span
 * @param {number|string} value - Pain level (0-10)
 */
function updatePainColor(element, value) {
    if (value >= 7) {
        element.style.background = 'var(--danger-color)';
    } else if (value >= 4) {
        element.style.background = 'var(--warning-color)';
    } else {
        element.style.background = '#4CAF50';
    }
}

// ========== State Setters (for ES module live binding) ==========

function setCurrentPhase(v) {
    currentPhase = v;
}
function setWorkoutData(v) {
    workoutData = v;
}
function setWeeklyData(v) {
    weeklyData = v;
}
function setMonthlyData(v) {
    monthlyData = v;
}
function setProgressBarVersion(v) {
    PROGRESS_BAR_VERSION = v;
}
function setDarkMode(v) {
    darkMode = v;
}
function setBalanceLevel(v) {
    balanceLevel = v;
}
function setStreakData(v) {
    streakData = v;
}
function setDailyProgress(v) {
    dailyProgress = v;
}
function setActiveTimeBlock(v) {
    activeTimeBlock = v;
    safeSetItem('activeTimeBlock', v);
}

export {
    currentPhase,
    workoutData,
    weeklyData,
    monthlyData,
    PROGRESS_BAR_VERSION,
    darkMode,
    balanceLevel,
    streakData,
    dailyProgress,
    activeTimeBlock,
    planStartDate,
    loadDailyProgress,
    createFreshProgress,
    createDefaultMetrics,
    createDefaultQuickLogCounts,
    saveDailyProgress,
    captureExerciseData,
    restoreExerciseData,
    autoSaveDailyProgress,
    updatePainColor,
    setPlanStartDate,
    getCurrentPlanWeek,
    getProgressionTargets,
    incrementQuickLog,
    decrementQuickLog,
    updateDailyMetric,
    setCurrentPhase,
    setWorkoutData,
    setWeeklyData,
    setMonthlyData,
    setProgressBarVersion,
    setDarkMode,
    setBalanceLevel,
    setStreakData,
    setDailyProgress,
    setActiveTimeBlock,
};
