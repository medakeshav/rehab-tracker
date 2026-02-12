/**
 * app.js — Application orchestrator
 *
 * This is the entry point that wires everything together.
 * It initializes the app on DOMContentLoaded, sets up global event listeners,
 * and handles auto-save on page close.
 *
 * All functionality is implemented in the other js/*.js modules;
 * this file just calls into them.
 */

import {
    openMenu,
    closeMenu,
    showScreen,
    initSwipeBack,
    setOnHistoryScreen,
    setOnAnalyticsScreen,
} from './navigation.js';
import {
    updateStats,
    selectPhase,
    updatePhaseInfo,
    setupPainSliders,
    calculateCurrentWeek,
    setLoadExercises,
} from './utils.js';
import { autoSaveDailyProgress } from './state.js';
import {
    updateProgressBar,
    clearDailyProgress,
    toggleSound,
    updateSoundToggleBtn,
    toggleProgressBar,
    updateProgressBarToggleBtn,
    toggleDarkMode,
    applyDarkMode,
    updateDarkModeToggleBtn,
    setReloadExercises,
} from './progress.js';
import { loadExercises, saveWorkout } from './exercises-ui.js';
import { showHistoryTab, loadHistory } from './history.js';
import { saveWeeklyAssessment, saveMonthlyAssessment } from './assessments.js';
import { exportAllData, clearAllData } from './export.js';
import { initStreak, checkStreakReminder } from './streak.js';
import { initAnalytics, renderAllAnalytics, toggleAnalyticsSection } from './analytics.js';

// ========== Wire Up Callbacks (avoid circular imports) ==========

setOnHistoryScreen(() => loadHistory('workouts'));
setOnAnalyticsScreen(() => renderAllAnalytics());
setReloadExercises(() => loadExercises());
setLoadExercises(() => loadExercises());

// ========== DOM Ready ==========

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
    initSwipeBack();
    updateStats();
    initStreak();
    checkStreakReminder();
});

// ========== Initialization ==========

/**
 * Set up initial app state: display today's date, set form defaults,
 * load exercises, and update UI to reflect current state.
 */
function initializeApp() {
    // Set workout date input to today
    document.getElementById('workoutDate').valueAsDate = new Date();

    // Load current phase exercises
    updatePhaseInfo();
    loadExercises();

    // Update toggle button states
    updateSoundToggleBtn();
    updateProgressBarToggleBtn();
    applyDarkMode();
    updateDarkModeToggleBtn();

    // Init analytics date range buttons
    initAnalytics();
}

// ========== Global Event Listeners ==========

/**
 * Wire up all non-inline event listeners.
 * Menu buttons, form submissions, pain sliders, delegated actions, etc.
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

    // Delegated click handler for all data-action buttons
    setupDelegatedActions();

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

    // Scroll to top button
    setupScrollToTop();
}

// ========== Delegated Action Handler ==========

/**
 * Single delegated event listener for all [data-action] elements.
 * Replaces inline onclick handlers with a centralized action router.
 * Also handles keyboard activation (Enter/Space) on non-button elements.
 */
function setupDelegatedActions() {
    document.addEventListener('click', function (e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;

        switch (action) {
            case 'navigate':
                showScreen(target.dataset.screen);
                break;
            case 'select-phase':
                selectPhase(Number(target.dataset.phase));
                break;
            case 'toggle-sound':
                toggleSound();
                break;
            case 'toggle-progress-bar':
                toggleProgressBar();
                break;
            case 'toggle-dark-mode':
                toggleDarkMode();
                break;
            case 'clear-progress':
                clearDailyProgress();
                break;
            case 'save-workout':
                saveWorkout();
                break;
            case 'history-tab':
                showHistoryTab(target.dataset.tab);
                break;
            case 'export-data':
                exportAllData();
                break;
            case 'clear-all-data':
                clearAllData();
                break;
            case 'toggle-analytics-section':
                toggleAnalyticsSection(target.dataset.section);
                break;
        }
    });

    // Allow keyboard activation (Enter/Space) on non-button elements with data-action
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;

        const target = e.target.closest('[data-action]');
        if (!target || target.tagName === 'BUTTON') return;

        e.preventDefault();
        target.click();
    });
}

// ========== Scroll to Top Button ==========

/**
 * Set up scroll-to-top button that appears after scrolling 25% of page height.
 */
function setupScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (!scrollBtn) return;

    // Show/hide button based on scroll position (hidden on home screen)
    window.addEventListener('scroll', function () {
        const homeScreen = document.getElementById('homeScreen');
        if (homeScreen && homeScreen.classList.contains('active')) {
            scrollBtn.classList.remove('visible');
            return;
        }

        const scrollThreshold = document.documentElement.scrollHeight * 0.25;
        const scrollPosition = window.scrollY;

        if (scrollPosition > scrollThreshold) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    // Scroll to top on click
    scrollBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });
}

// ========== Auto-Save on Page Close ==========

window.addEventListener('beforeunload', autoSaveDailyProgress);
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
        autoSaveDailyProgress();
    }
});
