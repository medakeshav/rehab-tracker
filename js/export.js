/**
 * export.js — CSV data export and data clearing
 *
 * Provides functions to export workout, weekly, and monthly data
 * as downloadable CSV files, and to clear all stored data.
 */

import { showToast, showConfirmDialog, updateStats } from './utils.js';
import {
    workoutData,
    weeklyData,
    monthlyData,
    setWorkoutData,
    setWeeklyData,
    setMonthlyData,
    setCurrentPhase,
} from './state.js';
import { showScreen } from './navigation.js';

// ========== CSV Escaping Helper ==========

/**
 * Properly escape a value for CSV format.
 * Rules:
 * - Doubles any quotes in the value (e.g., My "Best" Day -> My ""Best"" Day)
 * - Wraps in quotes if value contains comma, quote, or newline
 * - Returns empty string for null/undefined
 *
 * @param {*} value - Value to escape
 * @returns {string} Escaped CSV value
 */
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // If value contains comma, quote, or newline, it must be quoted
    if (/[",\n\r]/.test(str)) {
        // Double any quotes and wrap in quotes
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// ========== Export All Data ==========

/**
 * Export all available data (workouts, weekly, monthly) as separate CSV files.
 * Shows an error toast if no data exists.
 */
function exportAllData() {
    if (workoutData.length === 0 && weeklyData.length === 0 && monthlyData.length === 0) {
        showToast('No data to export', 'error');
        return;
    }

    try {
        if (workoutData.length > 0) {
            exportWorkoutsCSV();
        }
        if (weeklyData.length > 0) {
            exportWeeklyCSV();
        }
        if (monthlyData.length > 0) {
            exportMonthlyCSV();
        }

        // Store export timestamp
        localStorage.setItem('lastExportTimestamp', new Date().toISOString());

        showToast('✓ Data exported successfully!', 'success');
    } catch (_e) {
        console.error('CSV export failed:', _e);
        showToast('⚠️ Export failed — please try again', 'error');
    }
}

// ========== Individual CSV Exporters ==========

/** Export daily workout data as a CSV file. */
function exportWorkoutsCSV() {
    let csv = 'Date,Phase,Exercise,Left Reps,Right Reps,Sets,Pain Level,Notes\n';

    workoutData.forEach((workout) => {
        workout.exercises.forEach((ex) => {
            csv += `${escapeCSV(workout.date)},${escapeCSV(workout.phase)},${escapeCSV(ex.name)},${escapeCSV(ex.leftReps)},${escapeCSV(ex.rightReps)},${escapeCSV(ex.sets)},${escapeCSV(ex.pain)},${escapeCSV(ex.notes)}\n`;
        });
    });

    downloadCSV(csv, 'rehab_workouts.csv');
}

/** Export weekly assessment data as a CSV file. */
function exportWeeklyCSV() {
    let csv =
        'Week,Date,Stand Left,Stand Right,Bridge Left,Bridge Right,Reach Left,Reach Right,Knee Pain,Back Pain,Foot Pain,Notes\n';

    weeklyData.forEach((week) => {
        csv += `${escapeCSV(week.week)},${escapeCSV(week.date)},${escapeCSV(week.standLeft)},${escapeCSV(week.standRight)},${escapeCSV(week.bridgeLeft)},${escapeCSV(week.bridgeRight)},${escapeCSV(week.reachLeft)},${escapeCSV(week.reachRight)},${escapeCSV(week.kneePain)},${escapeCSV(week.backPain)},${escapeCSV(week.footPain)},${escapeCSV(week.notes)}\n`;
    });

    downloadCSV(csv, 'rehab_weekly_assessments.csv');
}

/** Export monthly assessment data as a CSV file. */
function exportMonthlyCSV() {
    let csv =
        'Month,Date,Calf Right,Calf Left,Thigh Right,Thigh Left,Photos,Video,Phase,Ready Next Phase,Notes\n';

    monthlyData.forEach((month) => {
        csv += `${escapeCSV(month.month)},${escapeCSV(month.date)},${escapeCSV(month.calfRight)},${escapeCSV(month.calfLeft)},${escapeCSV(month.thighRight)},${escapeCSV(month.thighLeft)},${escapeCSV(month.photosTaken)},${escapeCSV(month.videoTaken)},${escapeCSV(month.phase)},${escapeCSV(month.readyNextPhase)},${escapeCSV(month.notes)}\n`;
    });

    downloadCSV(csv, 'rehab_monthly_assessments.csv');
}

// ========== Download Helper ==========

/**
 * Trigger a CSV file download in the browser.
 * @param {string} content - CSV string content
 * @param {string} filename - Desired download filename
 */
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ========== Clear All Data ==========

/**
 * Show a destructive confirmation dialog, then clear all localStorage data
 * and reset all in-memory state.
 */
function clearAllData() {
    showConfirmDialog(
        'Delete All Data',
        '⚠️ This will permanently delete all workouts, assessments, and progress. This cannot be undone.',
        'Delete Everything',
        function () {
            try {
                localStorage.clear();
            } catch (_e) {
                console.error('localStorage.clear() failed:', _e);
            }
            setWorkoutData([]);
            setWeeklyData([]);
            setMonthlyData([]);
            setCurrentPhase(1);
            showToast('All data cleared', 'success');
            updateStats();
            showScreen('home');
        },
        true // destructive
    );
}

export { exportAllData, clearAllData };
