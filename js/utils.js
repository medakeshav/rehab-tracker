/**
 * utils.js — General-purpose utility functions
 *
 * Pure helpers with no dependencies on other app modules.
 * Provides toast notifications, confirm dialogs, date formatting,
 * and statistical calculations.
 */

import { exercises, getExercisesForPhase } from '../exercises.js';
import {
    currentPhase,
    setCurrentPhase,
    workoutData,
    dailyProgress,
    saveDailyProgress,
    streakData,
} from './state.js';
import { showScreen } from './navigation.js';

/** @type {Function|null} Callback to reload exercises (set by app.js to avoid circular import) */
let reloadExercisesFromUtils = null;

/**
 * Register a callback to reload exercises after phase change.
 * @param {Function} fn
 */
function setLoadExercises(fn) {
    reloadExercisesFromUtils = fn;
}

// ========== Safe localStorage Helpers ==========

/**
 * Safely read a value from localStorage with JSON parsing.
 * Returns the fallback value if storage is unavailable, empty, or corrupt.
 * @param {string} key - localStorage key
 * @param {*} fallback - Value to return on failure
 * @returns {*} Parsed value or fallback
 */
function safeGetItem(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
    } catch (_e) {
        console.warn('localStorage read failed for key:', key);
        return fallback;
    }
}

/**
 * Safely write a JSON-serializable value to localStorage.
 * Shows a user-visible toast on failure (e.g. quota exceeded).
 * @param {string} key - localStorage key
 * @param {*} value - Value to serialize and store
 * @returns {boolean} true on success, false on failure
 */
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (_e) {
        console.error('localStorage write failed for key:', key);
        showToast('⚠️ Storage full — data may not be saved', 'error');
        return false;
    }
}

// ========== Toast Notifications ==========

/**
 * Display a temporary toast notification at the top of the screen.
 * @param {string} message - Text to display
 * @param {'success'|'error'|'info'} [type='success'] - Visual style
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ========== Custom Confirm Dialog ==========

/**
 * Show an iOS-style confirmation dialog (replaces window.confirm).
 * @param {string} title - Dialog heading
 * @param {string} message - Body text / warning
 * @param {string} confirmText - Label for the confirm button
 * @param {Function} onConfirm - Callback executed when user confirms
 * @param {boolean} [isDestructive=false] - If true, confirm button is styled red
 */
function showConfirmDialog(title, message, confirmText, onConfirm, isDestructive) {
    const dialog = document.getElementById('confirmDialog');
    dialog.querySelector('.confirm-dialog-title').textContent = title;
    dialog.querySelector('.confirm-dialog-message').textContent = message;

    const confirmBtn = dialog.querySelector('.confirm-dialog-confirm');
    confirmBtn.textContent = confirmText;
    confirmBtn.classList.toggle('destructive', !!isDestructive);

    // Clone to remove old listeners
    const newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.replaceWith(newConfirm);

    newConfirm.addEventListener('click', () => {
        dialog.close();
        if (onConfirm) onConfirm();
    });

    const cancelBtn = dialog.querySelector('.confirm-dialog-cancel');
    const newCancel = cancelBtn.cloneNode(true);
    cancelBtn.replaceWith(newCancel);
    newCancel.addEventListener('click', () => dialog.close());

    dialog.showModal();
}

// ========== Date & Stats Helpers ==========

/**
 * Format an ISO date string into a human-readable form (e.g. "Jan 15, 2025").
 * @param {string} dateString - ISO date string (e.g. "2025-01-15")
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Calculate the average pain level across a list of exercises.
 * @param {Array<{pain: number}>} exercisesList - Array of exercise objects with pain values
 * @returns {string} Average pain formatted as "X.X/10"
 */
function calculateAvgPain(exercisesList) {
    if (exercisesList.length === 0) return '0/10';
    const total = exercisesList.reduce((sum, ex) => sum + ex.pain, 0);
    const avg = (total / exercisesList.length).toFixed(1);
    return `${avg}/10`;
}

/**
 * Parse a YYYY-MM-DD date string into a Date at local midnight.
 * Avoids the timezone pitfall of `new Date("YYYY-MM-DD")` which creates UTC midnight.
 * @param {string} dateStr - ISO date string (e.g. "2025-01-15")
 * @returns {Date} Date at local midnight
 */
function normalizeDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

/**
 * Calculate the current workout streak.
 * Delegates to the streak module's streakData (rest-day-aware calculation).
 * @returns {number} Number of consecutive days
 */
function calculateStreak() {
    return streakData.current || 0;
}

/**
 * Calculate the current rehab week based on the first logged workout date.
 * @returns {number} Current week number (1-based)
 */
function calculateCurrentWeek() {
    if (workoutData.length === 0) return 1;

    const firstWorkout = normalizeDate(workoutData[0].date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysDiff = Math.round((today - firstWorkout) / (1000 * 60 * 60 * 24));
    return Math.floor(daysDiff / 7) + 1;
}

/**
 * Update the stats display on the home screen.
 */
function updateStats() {
    document.getElementById('totalWorkouts').textContent = workoutData.length;
    document.getElementById('currentStreak').textContent = calculateStreak();
    document.getElementById('currentWeek').textContent = calculateCurrentWeek();
}

// ========== Phase Management ==========

/**
 * Select a rehab phase, persist to localStorage, and navigate to daily screen.
 * @param {number} phase - Phase number (1, 2, or 3)
 */
function selectPhase(phase) {
    setCurrentPhase(phase);
    safeSetItem('currentPhase', phase);
    updatePhaseInfo();
    if (reloadExercisesFromUtils) reloadExercisesFromUtils();
    showScreen('daily');
    showToast('Phase ' + phase + ' selected!', 'success');
}

/**
 * Update the phase label text in the daily workout header.
 */
function updatePhaseInfo() {
    const phaseNames = {
        1: 'Phase 1: Foundation (Weeks 1-8)',
        2: 'Phase 2: Functional Strength (Weeks 9-20)',
        3: 'Phase 3: Advanced (Week 21+)',
    };
    document.getElementById('currentPhaseText').textContent = phaseNames[currentPhase];
}

/**
 * Wire up pain slider listeners on the weekly assessment form.
 */
function setupPainSliders() {
    const sliders = ['kneePain', 'backPain', 'footPain'];
    sliders.forEach((id) => {
        const slider = document.getElementById(id);
        const display = document.getElementById(id + 'Value');
        if (slider && display) {
            slider.addEventListener('input', function () {
                display.textContent = this.value;
            });
        }
    });
}

export {
    safeGetItem,
    safeSetItem,
    showToast,
    showConfirmDialog,
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
};
