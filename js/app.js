/**
 * app.js — Application orchestrator
 *
 * This is the entry point that wires everything together.
 * It initializes the app on DOMContentLoaded, sets up global event listeners,
 * registers the service worker, and handles auto-save on page close.
 *
 * All functionality is implemented in the other js/*.js modules;
 * this file just calls into them.
 */

// ========== DOM Ready ==========

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
    initSwipeBack();
    updateStats();
});

// ========== Initialization ==========

/**
 * Set up initial app state: display today's date, set form defaults,
 * load exercises, and update UI to reflect current state.
 */
function initializeApp() {
    // Set current date display on home screen
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    document.getElementById('currentDate').textContent = today;

    // Set workout date input to today
    document.getElementById('workoutDate').valueAsDate = new Date();

    // Load current phase exercises
    updatePhaseInfo();
    loadExercises();

    // Update sound toggle button state
    updateSoundToggleBtn();
}

// ========== Global Event Listeners ==========

/**
 * Wire up all non-inline event listeners.
 * Menu buttons, form submissions, pain sliders, etc.
 */
function setupEventListeners() {
    // Menu functionality
    document.getElementById('menuBtn').addEventListener('click', openMenu);
    document.getElementById('closeMenuBtn').addEventListener('click', closeMenu);

    // Close menu on outside click
    document.addEventListener('click', function (e) {
        const sideMenu = document.getElementById('sideMenu');
        const menuBtn = document.getElementById('menuBtn');
        if (!sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMenu();
        }
    });

    // Pain slider listeners for assessment forms
    setupPainSliders();

    // Form submissions
    document.getElementById('weeklyForm').addEventListener('submit', saveWeeklyAssessment);
    document.getElementById('monthlyForm').addEventListener('submit', saveMonthlyAssessment);

    // Set default week and month numbers
    const currentWeek = calculateCurrentWeek();
    document.getElementById('weekNumber').value = currentWeek;
    document.getElementById('monthNumber').value = Math.ceil(currentWeek / 4);

    // Set today's date for assessments
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('weeklyDate').value = today;
    document.getElementById('monthlyDate').value = today;
}

// ========== Auto-Save on Page Close ==========

window.addEventListener('beforeunload', autoSaveDailyProgress);
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
        autoSaveDailyProgress();
    }
});

// ========== Service Worker Registration ==========

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('sw.js')
            .then((_reg) => console.log('Service Worker registered'))
            .catch((_err) => console.log('Service Worker registration failed'));
    });
}
