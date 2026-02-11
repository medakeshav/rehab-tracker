/**
 * history.js — History screen tab management and card rendering
 *
 * Handles switching between Workouts/Weekly/Monthly history tabs
 * and renders data cards for each record type.
 */

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
    // Find the button whose onclick contains this tab name and mark it active
    const activeBtn = document.querySelector(`.tab-btn[onclick*="${tab}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    loadHistory(tab);
}

// ========== History Loading ==========

/**
 * Load and render history data for a given type.
 * Displays records in reverse chronological order (newest first).
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
        historyContent.innerHTML =
            '<p style="text-align: center; color: var(--text-light); padding: 40px;">No data yet. Start tracking!</p>';
        return;
    }

    data.forEach((item) => {
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
        card.innerHTML = `
            <div class="history-item-header">
                <div class="history-date">${formatDate(item.date)}</div>
                <div class="history-phase">Phase ${item.phase}</div>
            </div>
            <div class="history-details">
                Exercises completed: ${item.exercises.length}<br>
                Average pain: ${calculateAvgPain(item.exercises)}
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
