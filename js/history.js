/**
 * history.js — History screen tab management and card rendering
 *
 * Handles switching between Workouts/Weekly/Monthly history tabs
 * and renders data cards for each record type with date grouping.
 */

import { formatDate, calculateAvgPain, normalizeDate } from './utils.js';
import { workoutData, weeklyData, monthlyData } from './state.js';
import icons from './icons.js';

// ========== Tab Switching ==========

/**
 * Switch the active history tab and reload its data.
 * @param {string} tab - Tab identifier: 'workouts', 'weekly', or 'monthly'
 */
function showHistoryTab(tab) {
    // Update tab buttons — highlight the one matching the selected tab
    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.classList.remove('active');
    });
    // Find the button whose data-tab matches the selected tab and mark it active
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    loadHistory(tab);
}

// ========== Date Grouping Helpers ==========

/**
 * Get a group label for a date relative to today.
 * @param {string} dateStr - ISO date string
 * @returns {string} Group label ("This Week", "Last Week", "January 2026", etc.)
 */
function getDateGroupLabel(dateStr) {
    const date = normalizeDate(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return 'This Week';
    if (diffDays < 14) return 'Last Week';

    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ========== Phase Color Helper ==========

const PHASE_COLORS = { 1: '#4472c4', 2: '#4472c4', 3: '#4472c4' };

// ========== History Loading ==========

/**
 * Load and render history data for a given type.
 * Displays records in reverse chronological order (newest first) with date grouping.
 * @param {'workouts'|'weekly'|'monthly'} type - Which data set to display
 */
function loadHistory(type) {
    const historyContent = document.getElementById('historyContent');
    historyContent.innerHTML = '';

    let data = [];
    switch (type) {
        case 'workouts':
            data = workoutData.slice().reverse();
            break;
        case 'weekly':
            data = weeklyData.slice().reverse();
            break;
        case 'monthly':
            data = monthlyData.slice().reverse();
            break;
    }

    if (data.length === 0) {
        historyContent.innerHTML = `
            <div class="history-empty-state">
                ${icons.clipboard(80)}
                <p>No data yet</p>
                <span>Start tracking to see your history here!</span>
            </div>
        `;
        return;
    }

    // Summary stats
    if (type === 'workouts' && data.length > 0) {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const monthCount = data.filter((w) => {
            const d = normalizeDate(w.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;

        const summary = document.createElement('div');
        summary.className = 'history-summary-stats';
        summary.innerHTML = `<span><strong>${monthCount}</strong> workouts this month</span> · <span><strong>${data.length}</strong> total</span>`;
        historyContent.appendChild(summary);
    }

    // Group by date
    let currentGroup = '';
    data.forEach((item) => {
        const group = getDateGroupLabel(item.date);
        if (group !== currentGroup) {
            currentGroup = group;
            const header = document.createElement('div');
            header.className = 'history-date-header';
            header.textContent = group;
            historyContent.appendChild(header);
        }

        const card = createHistoryCard(item, type);
        historyContent.appendChild(card);
    });
}

// ========== History Card Creation ==========

/**
 * Create a DOM element representing a single history record.
 * @param {Object} item - The data record to display
 * @param {'workouts'|'weekly'|'monthly'} type - The record type
 * @returns {HTMLElement} A history card element
 */
function createHistoryCard(item, type) {
    const card = document.createElement('div');
    card.className = 'history-item';

    if (type === 'workouts') {
        const phaseColor = PHASE_COLORS[item.phase] || '#999';
        const avgPain = calculateAvgPain(item.exercises);
        const painNum = parseFloat(avgPain);
        const painClass = painNum >= 7 ? 'danger' : painNum >= 4 ? 'warning' : 'ok';

        card.innerHTML = `
            <div class="history-item-header">
                <div class="history-date">
                    <span class="history-phase-dot" style="background:${phaseColor}"></span>
                    ${formatDate(item.date)}
                </div>
                <div class="history-phase">Phase ${item.phase}</div>
            </div>
            <div class="history-details">
                Exercises completed: ${item.exercises.length}<br>
                Average pain: ${avgPain}
            </div>
        `;
    } else if (type === 'weekly') {
        card.innerHTML = `
            <div class="history-item-header">
                <div class="history-date">Week ${item.week} - ${formatDate(item.date)}</div>
            </div>
            <div class="history-details">
                Balance: L ${item.standLeft}s / R ${item.standRight}s<br>
                Bridges: L ${item.bridgeLeft} / R ${item.bridgeRight}<br>
                Pain: Knee ${item.kneePain}, Back ${item.backPain}, Foot ${item.footPain}
            </div>
        `;
    } else if (type === 'monthly') {
        card.innerHTML = `
            <div class="history-item-header">
                <div class="history-date">Month ${item.month} - ${formatDate(item.date)}</div>
            </div>
            <div class="history-details">
                Calf: L ${item.calfLeft}cm / R ${item.calfRight}cm<br>
                Thigh: L ${item.thighLeft}cm / R ${item.thighRight}cm<br>
                Phase: ${item.phase} ${item.readyNextPhase ? '✓ Ready for next' : ''}
            </div>
        `;
    }

    return card;
}

export { showHistoryTab, loadHistory, createHistoryCard };
