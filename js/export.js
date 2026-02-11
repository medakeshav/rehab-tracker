/**
 * export.js — CSV data export and data clearing
 *
 * Provides functions to export workout, weekly, and monthly data
 * as downloadable CSV files, and to clear all stored data.
 */

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

    if (workoutData.length > 0) {
        exportWorkoutsCSV();
    }
    if (weeklyData.length > 0) {
        exportWeeklyCSV();
    }
    if (monthlyData.length > 0) {
        exportMonthlyCSV();
    }

    showToast('✓ Data exported successfully!', 'success');
}

// ========== Individual CSV Exporters ==========

/** Export daily workout data as a CSV file. */
function exportWorkoutsCSV() {
    let csv = 'Date,Phase,Exercise,Left Reps,Right Reps,Sets,Pain Level,Notes\n';

    workoutData.forEach((workout) => {
        workout.exercises.forEach((ex) => {
            csv += `${workout.date},${workout.phase},"${ex.name}",${ex.leftReps},${ex.rightReps},${ex.sets},${ex.pain},"${ex.notes}"\n`;
        });
    });

    downloadCSV(csv, 'rehab_workouts.csv');
}

/** Export weekly assessment data as a CSV file. */
function exportWeeklyCSV() {
    let csv =
        'Week,Date,Stand Left,Stand Right,Bridge Left,Bridge Right,Reach Left,Reach Right,Knee Pain,Back Pain,Foot Pain,Notes\n';

    weeklyData.forEach((week) => {
        csv += `${week.week},${week.date},${week.standLeft},${week.standRight},${week.bridgeLeft},${week.bridgeRight},${week.reachLeft},${week.reachRight},${week.kneePain},${week.backPain},${week.footPain},"${week.notes}"\n`;
    });

    downloadCSV(csv, 'rehab_weekly_assessments.csv');
}

/** Export monthly assessment data as a CSV file. */
function exportMonthlyCSV() {
    let csv =
        'Month,Date,Calf Right,Calf Left,Thigh Right,Thigh Left,Photos,Video,Phase,Ready Next Phase,Notes\n';

    monthlyData.forEach((month) => {
        csv += `${month.month},${month.date},${month.calfRight},${month.calfLeft},${month.thighRight},${month.thighLeft},${month.photosTaken},${month.videoTaken},${month.phase},${month.readyNextPhase},"${month.notes}"\n`;
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
            localStorage.clear();
            workoutData = [];
            weeklyData = [];
            monthlyData = [];
            currentPhase = 1;
            showToast('All data cleared', 'success');
            updateStats();
            showScreen('home');
        },
        true // destructive
    );
}
