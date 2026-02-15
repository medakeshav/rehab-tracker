/**
 * app.js — Application orchestrator
 *
 * Entry point that wires everything together.
 * V2: Added time-block tab navigation, rest day banner, plan week display.
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
import {
    autoSaveDailyProgress,
    workoutData,
    weeklyData,
    monthlyData,
    activeTimeBlock,
    setActiveTimeBlock,
    getScheduleForDate,
    currentPhase,
} from './state.js';
import CONFIG from './config.js';
import {
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
import {
    saveWeeklyAssessment,
    saveMonthlyAssessment,
    showPreviousWeeklyValues,
    showPreviousMonthlyValues,
} from './assessments.js';
import { exportAllData, clearAllData } from './export.js';
import { initStreak, checkStreakReminder } from './streak.js';
import { initAnalytics, renderAllAnalytics, toggleAnalyticsSection } from './analytics.js';
import icons from './icons.js';

// ========== Wire Up Callbacks (avoid circular imports) ==========

setOnHistoryScreen(() => loadHistory('workouts'));
setOnAnalyticsScreen(() => renderAllAnalytics());
setReloadExercises(() => loadExercises());
setLoadExercises(() => loadExercises());

const QUICK_LOG_HASHES = new Set(['#quicklog', '#quick-log']);
let quickLogModeActive = false;

// ========== DOM Ready ==========

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
    initSwipeBack();
    applyDeepLinkFromUrl();
    updateStats();
    initStreak();
    checkStreakReminder();
});

// ========== Initialization ==========

function initializeApp() {
    // Set workout date input to today
    document.getElementById('workoutDate').valueAsDate = new Date();

    // Load current phase exercises
    updatePhaseInfo();

    // Set active time block tab from state
    setActiveTabUI(activeTimeBlock);

    // Load exercises for active tab
    loadExercises();

    // Show rest day banner if applicable
    updateRestDayBanner();

    // Update toggle button states
    updateSoundToggleBtn();
    updateProgressBarToggleBtn();
    applyDarkMode();
    updateDarkModeToggleBtn();

    // Init analytics date range buttons
    initAnalytics();

    // Render greeting banner
    renderGreetingBanner();
    updateQuickLogModeBadge();

    // Inject SVG icons into tab bar and menus
    injectIcons();

    // Update export preview
    updateExportPreview();
}

// ========== Time Block Tab Navigation ==========

/**
 * Switch the active time block tab and reload exercises.
 * @param {string} block - Time block key
 */
function switchTimeBlock(block) {
    // Auto-save current tab's data before switching
    autoSaveDailyProgress();

    setActiveTimeBlock(block);
    setActiveTabUI(block);
    loadExercises();
    updateRestDayBanner();

    if (quickLogModeActive && block !== 'throughout_day') {
        quickLogModeActive = false;
        updateQuickLogModeBadge();
    }
}

function isQuickLogHash(hashValue) {
    return QUICK_LOG_HASHES.has((hashValue || '').toLowerCase());
}

function navigateToQuickLog() {
    quickLogModeActive = true;
    updateQuickLogModeBadge();
    setActiveTimeBlock('throughout_day');
    showScreen('daily');
    setActiveTabUI('throughout_day');
    loadExercises();
    updateRestDayBanner();
}

function applyDeepLinkFromUrl() {
    if (isQuickLogHash(window.location.hash)) {
        navigateToQuickLog();
        return;
    }

    if (quickLogModeActive) {
        quickLogModeActive = false;
        updateQuickLogModeBadge();
    }
}

function updateQuickLogModeBadge() {
    const badge = document.getElementById('quickLogModeBadge');
    if (!badge) return;
    badge.style.display = quickLogModeActive ? 'inline-block' : 'none';
}

/**
 * Update the tab bar UI to show the active tab.
 * @param {string} block - Active time block key
 */
function setActiveTabUI(block) {
    const tabs = document.querySelectorAll('.time-block-tab');
    tabs.forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.block === block);
    });
}

// ========== Rest Day Banner ==========

/**
 * Show/hide the rest day banner based on workout date, phase, and active tab.
 * Uses phase-specific schedule config for Phase 2+, falls back to
 * CONFIG.REST_DAYS.SUGGESTED for Phase 1.
 */
function updateRestDayBanner() {
    const banner = document.getElementById('restDayBanner');
    if (!banner) return;

    const dateInput = document.getElementById('workoutDate');
    const dateStr = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    const scheduleInfo = getScheduleForDate(currentPhase, dateStr);

    const isRestDay = currentPhase >= 2
        ? scheduleInfo.isRestDay
        : CONFIG.REST_DAYS.SUGGESTED.includes(scheduleInfo.dayOfWeek);

    // Update banner text based on phase
    const textEl = banner.querySelector('.rest-day-text');
    if (textEl && currentPhase >= 2 && isRestDay) {
        textEl.textContent = `${scheduleInfo.dayName} — Active Recovery Day. Evening exercises are skipped.`;
    } else if (textEl) {
        textEl.textContent = 'Suggested rest day — evening workout is optional today';
    }

    // Show banner on rest days when viewing evening tab
    if (isRestDay && activeTimeBlock === 'evening') {
        banner.style.display = 'flex';
    } else {
        banner.style.display = 'none';
    }
}

// ========== Global Event Listeners ==========

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

    // Rest day banner dismiss
    const restDayDismiss = document.getElementById('restDayDismiss');
    if (restDayDismiss) {
        restDayDismiss.addEventListener('click', function () {
            document.getElementById('restDayBanner').style.display = 'none';
        });
    }

    // Reload exercises when date changes (schedule-aware filtering depends on date)
    const workoutDateInput = document.getElementById('workoutDate');
    if (workoutDateInput) {
        workoutDateInput.addEventListener('change', function () {
            loadExercises();
            updateRestDayBanner();
        });
    }

    // Scroll to top button
    setupScrollToTop();

    // Handle deep links when hash changes while app is open.
    window.addEventListener('hashchange', applyDeepLinkFromUrl);
}

// ========== Delegated Action Handler ==========

function setupDelegatedActions() {
    document.addEventListener('click', function (e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;

        switch (action) {
            case 'navigate': {
                const screen = target.dataset.screen;
                showScreen(screen);
                if (screen !== 'daily' && quickLogModeActive) {
                    quickLogModeActive = false;
                    updateQuickLogModeBadge();
                } else if (screen === 'daily' && !isQuickLogHash(window.location.hash)) {
                    quickLogModeActive = false;
                    updateQuickLogModeBadge();
                }
                if (screen === 'weekly') showPreviousWeeklyValues();
                if (screen === 'monthly') showPreviousMonthlyValues();
                if (screen === 'export') updateExportPreview();
                if (screen === 'daily') {
                    updateRestDayBanner();
                }
                break;
            }
            case 'tab-navigate':
                showScreen(target.dataset.screen, false, true);
                break;
            case 'select-phase':
                selectPhase(Number(target.dataset.phase));
                break;
            case 'switch-time-block':
                switchTimeBlock(target.dataset.block);
                break;
            case 'quick-log-navigate':
                navigateToQuickLog();
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
                updateExportPreview();
                break;
            case 'clear-all-data':
                clearAllData();
                break;
            case 'toggle-analytics-section':
                toggleAnalyticsSection(target.dataset.section);
                break;
            case 'toggle-instruction':
                target.closest('.instruction-card').classList.toggle('collapsed');
                break;
        }
    });

    // Keyboard activation on non-button elements
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;

        const target = e.target.closest('[data-action]');
        if (!target || target.tagName === 'BUTTON') return;

        e.preventDefault();
        target.click();
    });
}

// ========== Scroll to Top Button ==========

function setupScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (!scrollBtn) return;

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

    scrollBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });
}

// ========== Greeting Banner ==========

function renderGreetingBanner() {
    const textEl = document.getElementById('greetingText');
    const subEl = document.getElementById('greetingSub');
    if (!textEl || !subEl) return;

    const hour = new Date().getHours();
    let greeting, sub;
    if (hour < 12) {
        greeting = 'Good Morning';
        sub = 'Start your day with the morning routine!';
    } else if (hour < 17) {
        greeting = 'Good Afternoon';
        sub = "Don't forget your throughout-the-day exercises!";
    } else {
        greeting = 'Good Evening';
        sub = 'Time for your evening workout!';
    }

    textEl.textContent = greeting;
    subEl.textContent = sub;
}

// ========== SVG Icon Injection ==========

function injectIcons() {
    document.querySelectorAll('[data-icon]').forEach((el) => {
        const iconName = el.dataset.icon;
        const iconFn = icons[iconName];
        if (iconFn) {
            const size = el.classList.contains('bottom-tab-icon')
                ? 22
                : el.classList.contains('assess-hub-icon')
                  ? 24
                  : el.classList.contains('export-card-icon')
                    ? 32
                    : el.classList.contains('action-card-icon')
                      ? 28
                      : 18;
            el.innerHTML = iconFn(size);
        }
    });
}

// ========== Export Preview ==========

function updateExportPreview() {
    const preview = document.getElementById('exportDataPreview');
    if (!preview) return;

    const w = workoutData.length;
    const wk = weeklyData.length;
    const mo = monthlyData.length;
    const lastExport = localStorage.getItem('lastExportTimestamp');
    const lastExportStr = lastExport
        ? `Last exported: ${new Date(lastExport).toLocaleDateString()}`
        : 'Never exported';

    preview.innerHTML = `<strong>${w}</strong> workouts, <strong>${wk}</strong> weekly, <strong>${mo}</strong> monthly assessments available<br><span style="font-size:11px">${lastExportStr}</span>`;
}

// ========== Auto-Save on Page Close ==========

window.addEventListener('beforeunload', autoSaveDailyProgress);
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
        autoSaveDailyProgress();
    }
});
