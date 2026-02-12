/**
 * assessments.js — Weekly and monthly assessment save logic
 *
 * Handles form submission for the weekly and monthly assessment screens,
 * persisting data to localStorage and resetting the forms.
 * Also shows previous assessment values for reference.
 */

import { safeSetItem, showToast, calculateCurrentWeek } from './utils.js';
import { weeklyData, monthlyData } from './state.js';
import { showScreen } from './navigation.js';

// ========== Previous Value Display ==========

/**
 * Show previous assessment values next to input fields for reference.
 * Called when navigating to the weekly/monthly assessment screens.
 */
function showPreviousWeeklyValues() {
    if (weeklyData.length === 0) return;
    const prev = weeklyData[weeklyData.length - 1];

    const fields = {
        standLeft: prev.standLeft ? `Previous: ${prev.standLeft}s` : '',
        standRight: prev.standRight ? `Previous: ${prev.standRight}s` : '',
        bridgeLeft: prev.bridgeLeft ? `Previous: ${prev.bridgeLeft}` : '',
        bridgeRight: prev.bridgeRight ? `Previous: ${prev.bridgeRight}` : '',
        reachLeft: prev.reachLeft ? `Previous: ${prev.reachLeft}s` : '',
        reachRight: prev.reachRight ? `Previous: ${prev.reachRight}s` : '',
    };

    Object.entries(fields).forEach(([id, text]) => {
        if (!text) return;
        const input = document.getElementById(id);
        if (!input) return;
        // Remove any existing previous-value span
        const existing = input.parentElement.querySelector('.previous-value');
        if (existing) existing.remove();
        const span = document.createElement('span');
        span.className = 'previous-value';
        span.textContent = text;
        input.parentElement.appendChild(span);
    });
}

function showPreviousMonthlyValues() {
    if (monthlyData.length === 0) return;
    const prev = monthlyData[monthlyData.length - 1];

    const fields = {
        calfRight: prev.calfRight ? `Previous: ${prev.calfRight}cm` : '',
        calfLeft: prev.calfLeft ? `Previous: ${prev.calfLeft}cm` : '',
        thighRight: prev.thighRight ? `Previous: ${prev.thighRight}cm` : '',
        thighLeft: prev.thighLeft ? `Previous: ${prev.thighLeft}cm` : '',
    };

    Object.entries(fields).forEach(([id, text]) => {
        if (!text) return;
        const input = document.getElementById(id);
        if (!input) return;
        const existing = input.parentElement.querySelector('.previous-value');
        if (existing) existing.remove();
        const span = document.createElement('span');
        span.className = 'previous-value';
        span.textContent = text;
        input.parentElement.appendChild(span);
    });
}

// ========== Weekly Assessment ==========

/**
 * Handle weekly assessment form submission.
 * Captures all form values, saves to weeklyData, resets the form,
 * and navigates back to the home screen.
 * @param {Event} e - Form submit event
 */
function saveWeeklyAssessment(e) {
    e.preventDefault();

    const assessment = {
        week: document.getElementById('weekNumber').value,
        date: document.getElementById('weeklyDate').value,
        standLeft: document.getElementById('standLeft').value,
        standRight: document.getElementById('standRight').value,
        bridgeLeft: document.getElementById('bridgeLeft').value,
        bridgeRight: document.getElementById('bridgeRight').value,
        reachLeft: document.getElementById('reachLeft').value,
        reachRight: document.getElementById('reachRight').value,
        kneePain: document.getElementById('kneePain').value,
        backPain: document.getElementById('backPain').value,
        footPain: document.getElementById('footPain').value,
        notes: document.getElementById('weeklyNotes').value,
    };

    weeklyData.push(assessment);
    safeSetItem('weeklyData', weeklyData);

    showToast('✓ Weekly assessment saved!', 'success');

    setTimeout(() => {
        document.getElementById('weeklyForm').reset();
        document.getElementById('weekNumber').value = calculateCurrentWeek() + 1;
        showScreen('home');
    }, 1500);
}

// ========== Monthly Assessment ==========

/**
 * Handle monthly assessment form submission.
 * Captures all form values, saves to monthlyData, resets the form,
 * and navigates back to the home screen.
 * @param {Event} e - Form submit event
 */
function saveMonthlyAssessment(e) {
    e.preventDefault();

    const assessment = {
        month: document.getElementById('monthNumber').value,
        date: document.getElementById('monthlyDate').value,
        calfRight: document.getElementById('calfRight').value,
        calfLeft: document.getElementById('calfLeft').value,
        thighRight: document.getElementById('thighRight').value,
        thighLeft: document.getElementById('thighLeft').value,
        photosTaken: document.getElementById('photosTaken').checked,
        videoTaken: document.getElementById('videoTaken').checked,
        phase: document.getElementById('monthlyPhase').value,
        readyNextPhase: document.getElementById('readyNextPhase').checked,
        notes: document.getElementById('monthlyNotes').value,
    };

    monthlyData.push(assessment);
    safeSetItem('monthlyData', monthlyData);

    showToast('✓ Monthly assessment saved!', 'success');

    setTimeout(() => {
        document.getElementById('monthlyForm').reset();
        document.getElementById('monthNumber').value = Math.ceil(calculateCurrentWeek() / 4) + 1;
        showScreen('home');
    }, 1500);
}

export { saveWeeklyAssessment, saveMonthlyAssessment, showPreviousWeeklyValues, showPreviousMonthlyValues };
