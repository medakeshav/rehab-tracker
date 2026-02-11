/**
 * utils.js — General-purpose utility functions
 *
 * Pure helpers with no dependencies on other app modules.
 * Provides toast notifications, confirm dialogs, date formatting,
 * and statistical calculations.
 */

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
    // Remove any existing dialog
    const existing = document.querySelector('.confirm-dialog-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'confirm-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
        <div class="confirm-dialog-title">${title}</div>
        <div class="confirm-dialog-message">${message}</div>
        <div class="confirm-dialog-actions">
            <button class="confirm-dialog-btn confirm-dialog-cancel">Cancel</button>
            <button class="confirm-dialog-btn confirm-dialog-confirm ${isDestructive ? 'destructive' : ''}">${confirmText}</button>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('visible');
    });

    function dismiss() {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 200);
    }

    // Cancel
    dialog.querySelector('.confirm-dialog-cancel').addEventListener('click', dismiss);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) dismiss();
    });

    // Confirm
    dialog.querySelector('.confirm-dialog-confirm').addEventListener('click', function () {
        dismiss();
        if (onConfirm) onConfirm();
    });
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
 * Calculate the current workout streak (consecutive days with a logged workout).
 * @returns {number} Number of consecutive days
 */
function calculateStreak() {
    if (workoutData.length === 0) return 0;

    const sortedDates = workoutData.map((w) => new Date(w.date)).sort((a, b) => b - a);

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWorkout = sortedDates[0];
    lastWorkout.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) return 0;

    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = sortedDates[i - 1];
        const currDate = sortedDates[i];
        const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Calculate the current rehab week based on the first logged workout date.
 * @returns {number} Current week number (1-based)
 */
function calculateCurrentWeek() {
    if (workoutData.length === 0) return 1;

    const firstWorkout = new Date(workoutData[0].date);
    const today = new Date();
    const daysDiff = Math.floor((today - firstWorkout) / (1000 * 60 * 60 * 24));
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
    currentPhase = phase;
    localStorage.setItem('currentPhase', phase);
    updatePhaseInfo();
    loadExercises();
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
