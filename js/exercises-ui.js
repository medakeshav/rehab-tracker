/**
 * exercises-ui.js — Exercise card UI: creation, completion, expand/collapse, instructions
 *
 * V2 rewrite: supports time-block tabs, timed exercises with countdown timer,
 * timed holds, quick-log cards for throughout-day exercises, and daily metrics.
 */

import { getExercisesForPhase, getScheduledExercises } from '../exercises.js';
import { showToast } from './utils.js';
import { createWheelPicker, getPickerValue } from './wheel-picker.js';
import CONFIG from './config.js';
import {
    currentPhase,
    dailyProgress,
    saveDailyProgress,
    captureExerciseData,
    restoreExerciseData,
    autoSaveDailyProgress,
    updatePainColor,
    workoutData,
    createFreshProgress,
    setDailyProgress,
    activeTimeBlock,
    incrementQuickLog,
    decrementQuickLog,
    updateDailyMetric,
    getProgressionTargets,
    getScheduleForDate,
    setPlanStartDate,
    planStartDate,
} from './state.js';
import {
    updateProgressBar,
    checkAllComplete,
    playCompletionSound,
    showCompletionToast,
    hideCelebration,
} from './progress.js';
import { updateStats } from './utils.js';
import { safeSetItem } from './utils.js';
import { onWorkoutSaved } from './streak.js';

// ========== Exercise Loading ==========

/**
 * Load exercises for the currently active time block and render them.
 * Uses schedule-aware filtering for Phase 2+ (rest days, maintenance days).
 */
function loadExercises() {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';

    // Get schedule info for the selected workout date
    const dateInput = document.getElementById('workoutDate');
    const dateStr = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    const scheduleConfig = CONFIG.SCHEDULE[currentPhase] || CONFIG.SCHEDULE[1];
    const scheduleInfo = getScheduleForDate(currentPhase, dateStr);

    // Use schedule-aware filtering
    const exercises = getScheduledExercises(currentPhase, activeTimeBlock, scheduleInfo, scheduleConfig);

    // Render daily metrics form if applicable
    renderDailyMetrics();

    // Show rest day card for evening block on rest days (Phase 2+)
    if (activeTimeBlock === 'evening' && scheduleInfo.isRestDay && currentPhase >= 2) {
        const restCard = document.createElement('div');
        restCard.className = 'rest-day-card';
        restCard.innerHTML = `
            <div class="rest-day-card-icon">🧘</div>
            <div class="rest-day-card-title">Active Recovery Day</div>
            <div class="rest-day-card-text">
                No evening workout today. Focus on:
            </div>
            <ul class="rest-day-card-list">
                <li>Morning routine (all exercises)</li>
                <li>Throughout-day micro-routines</li>
                <li>Light walking (20-30 min)</li>
                <li>Foam rolling &amp; stretching</li>
                <li>Yoga or swimming (optional)</li>
            </ul>
        `;
        exerciseList.appendChild(restCard);
        updateProgressBar();
        return;
    }

    // Show schedule indicator for evening block on maintenance days (Phase 2+)
    if (activeTimeBlock === 'evening' && currentPhase >= 2 && scheduleInfo.isWorkoutDay) {
        const indicator = document.createElement('div');
        indicator.className = 'schedule-indicator';
        if (scheduleInfo.isMaintenanceDay) {
            indicator.innerHTML = `<span class="schedule-badge schedule-badge--full">Full Workout</span> Phase 2 exercises + Phase 1 maintenance`;
        } else {
            indicator.innerHTML = `<span class="schedule-badge schedule-badge--p2">Phase 2 Only</span> No maintenance exercises today`;
        }
        exerciseList.appendChild(indicator);
    }

    if (activeTimeBlock === 'throughout_day') {
        // Throughout-day header
        const header = document.createElement('div');
        header.className = 'throughout-day-header';
        header.innerHTML = '<strong>Micro-Routines</strong>Tap the + button each time you complete an exercise';
        exerciseList.appendChild(header);
    }

    exercises.forEach((exercise, index) => {
        let card;
        if (exercise.exerciseType === 'quick_log') {
            card = createQuickLogCard(exercise);
        } else if (exercise.exerciseType === 'timed') {
            const isCompleted = dailyProgress.completedExercises.includes(exercise.id);
            if (isCompleted) {
                card = createCompletedCard(exercise, index, exercises.length);
            } else {
                card = createTimedExerciseCard(exercise, index, exercises.length);
                restoreExerciseData(exercise);
            }
        } else if (exercise.exerciseType === 'timed_holds') {
            const isCompleted = dailyProgress.completedExercises.includes(exercise.id);
            if (isCompleted) {
                card = createCompletedCard(exercise, index, exercises.length);
            } else {
                card = createTimedHoldsCard(exercise, index, exercises.length);
                restoreExerciseData(exercise);
            }
        } else {
            // Standard reps exercise
            const isCompleted = dailyProgress.completedExercises.includes(exercise.id);
            if (isCompleted) {
                card = createCompletedCard(exercise, index, exercises.length);
            } else {
                card = createExerciseCard(exercise, index, exercises.length);
                restoreExerciseData(exercise);
            }
        }
        exerciseList.appendChild(card);
    });

    updateProgressBar();
}

// ========== Daily Metrics ==========

/**
 * Render AM or PM daily metrics form based on active time block.
 */
function renderDailyMetrics() {
    const container = document.getElementById('dailyMetricsContainer');
    if (!container) return;
    container.innerHTML = '';

    let metricsConfig = null;
    let title = '';

    if (activeTimeBlock === 'morning') {
        metricsConfig = CONFIG.METRICS.MORNING;
        title = '📋 Morning Check-in';
    } else if (activeTimeBlock === 'evening') {
        metricsConfig = CONFIG.METRICS.EVENING;
        title = '📋 Evening Check-in';
    }

    if (!metricsConfig) return;

    const section = document.createElement('div');
    section.className = 'daily-metrics-section';

    let rowsHTML = '';
    metricsConfig.forEach((metric) => {
        const currentVal =
            dailyProgress.dailyMetrics && dailyProgress.dailyMetrics[metric.key] !== null && dailyProgress.dailyMetrics[metric.key] !== undefined
                ? dailyProgress.dailyMetrics[metric.key]
                : metric.key === 'standingTolerance'
                  ? 0
                  : 0;
        rowsHTML += `
            <div class="metric-row">
                <span class="metric-label">${metric.label}</span>
                <div class="metric-slider-wrap">
                    <input type="range" class="metric-slider" id="metric_${metric.key}"
                           min="${metric.min}" max="${metric.max}" value="${currentVal}" step="1">
                    <span class="metric-value" id="metric_val_${metric.key}">${currentVal}${metric.unit}</span>
                </div>
            </div>
        `;
    });

    section.innerHTML = `
        <div class="daily-metrics-title">${title}</div>
        ${rowsHTML}
    `;

    container.appendChild(section);

    // Attach slider listeners
    metricsConfig.forEach((metric) => {
        const slider = document.getElementById(`metric_${metric.key}`);
        const display = document.getElementById(`metric_val_${metric.key}`);
        if (slider && display) {
            slider.addEventListener('input', function () {
                display.textContent = this.value + metric.unit;
                updateDailyMetric(metric.key, parseInt(this.value));
            });
        }
    });
}

// ========== Completed (Collapsed) Card ==========

/**
 * Create a small collapsed card for a completed exercise.
 */
function createCompletedCard(exercise, _index, _total) {
    const card = document.createElement('div');
    card.className = 'exercise-card exercise-card--completed';
    card.setAttribute('data-exercise-id', exercise.id);
    if (exercise.category) card.setAttribute('data-category', exercise.category);

    const data = dailyProgress.exerciseData[exercise.id];
    let repSummary = '';
    if (data) {
        if (exercise.bilateral) {
            repSummary = `<span class="exercise-rep-summary">${data.left || 0} reps</span>`;
        } else if (exercise.exerciseType === 'timed' || exercise.exerciseType === 'timed_holds') {
            repSummary = `<span class="exercise-rep-summary">Done</span>`;
        } else {
            repSummary = `<span class="exercise-rep-summary">${data.left || 0}L/${data.right || 0}R</span>`;
        }
    }

    card.innerHTML = `
        <div class="completed-card-inner">
            <span class="completed-checkmark check-draw"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
            <span class="completed-title">${exercise.name}</span>
            ${repSummary}
            <span class="completed-expand-hint">tap to edit</span>
        </div>
    `;

    card.addEventListener('click', function () {
        expandCard(card, exercise);
    });

    return card;
}

// ========== Quick-Log Card (Throughout Day) ==========

/**
 * Create a quick-log card for throughout-the-day exercises.
 */
function createQuickLogCard(exercise) {
    const card = document.createElement('div');
    card.className = 'quick-log-card';
    card.setAttribute('data-exercise-id', exercise.id);

    const count =
        (dailyProgress.quickLogCounts && dailyProgress.quickLogCounts[exercise.id]) || 0;
    const target = exercise.quickLogTarget || 10;

    card.innerHTML = `
        <div class="quick-log-info">
            <div class="quick-log-name quick-log-name-link" data-exercise-id="${exercise.id}">${exercise.name}</div>
            <div class="quick-log-reminder">${exercise.quickLogReminder || ''}</div>
            <div class="quick-log-target">${count}/${target} ${exercise.quickLogUnit || 'times'} today</div>
        </div>
        <div class="quick-log-controls">
            <button class="quick-log-btn minus" data-ql-minus="${exercise.id}">−</button>
            <span class="quick-log-count" id="ql_count_${exercise.id}">${count}</span>
            <button class="quick-log-btn" data-ql-plus="${exercise.id}">+</button>
        </div>
    `;

    // Plus button
    const plusBtn = card.querySelector(`[data-ql-plus="${exercise.id}"]`);
    if (plusBtn) {
        plusBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            incrementQuickLog(exercise.id);
            const newCount = dailyProgress.quickLogCounts[exercise.id] || 0;
            const countEl = card.querySelector(`#ql_count_${exercise.id}`);
            const targetEl = card.querySelector('.quick-log-target');
            if (countEl) countEl.textContent = newCount;
            if (targetEl)
                targetEl.textContent = `${newCount}/${target} ${exercise.quickLogUnit || 'times'} today`;

            // Pulse animation
            plusBtn.style.transform = 'scale(1.2)';
            setTimeout(() => (plusBtn.style.transform = ''), 150);
        });
    }

    // Minus button
    const minusBtn = card.querySelector(`[data-ql-minus="${exercise.id}"]`);
    if (minusBtn) {
        minusBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            decrementQuickLog(exercise.id);
            const newCount = dailyProgress.quickLogCounts[exercise.id] || 0;
            const countEl = card.querySelector(`#ql_count_${exercise.id}`);
            const targetEl = card.querySelector('.quick-log-target');
            if (countEl) countEl.textContent = newCount;
            if (targetEl)
                targetEl.textContent = `${newCount}/${target} ${exercise.quickLogUnit || 'times'} today`;
        });
    }

    // Name tap -> instructions
    const nameEl = card.querySelector('.quick-log-name-link');
    if (nameEl && exercise.instructions) {
        nameEl.addEventListener('click', function (e) {
            e.preventDefault();
            showInstructionsBottomSheet(exercise);
        });
    }

    return card;
}

// ========== Timed Exercise Card ==========

/**
 * Create a card for a timed exercise with countdown timer.
 */
function createTimedExerciseCard(exercise, _index, _total) {
    const card = document.createElement('div');
    card.className = 'exercise-card exercise-card--timed';
    card.setAttribute('data-exercise-id', exercise.id);
    if (exercise.category) card.setAttribute('data-category', exercise.category);

    // Get progression targets if available
    const progression = getProgressionTargets(exercise);
    const leftDuration = progression ? progression.left : exercise.timerDuration.left;
    const rightDuration = progression ? progression.right : exercise.timerDuration.right;
    const progressionNote = progression && progression.note ? `<div class="hold-duration-badge"><span class="hold-icon">📈</span>${progression.note}</div>` : '';

    const isBilateral = exercise.bilateral;
    const timerLabel = isBilateral ? '' : 'LEFT SIDE';
    const duration = isBilateral ? leftDuration : leftDuration;

    const circumference = 2 * Math.PI * 50;

    card.innerHTML = `
        ${progressionNote}
        <div class="exercise-header">
            <div class="exercise-name exercise-name--tappable" data-exercise-id="${exercise.id}">${exercise.name}</div>
            <div class="exercise-target">${exercise.targetReps}</div>
        </div>
        <div class="timer-section">
            <div class="timer-display">
                <div class="timer-side-label" id="timer_label_${exercise.id}">${timerLabel}</div>
                <div class="timer-circle">
                    <svg viewBox="0 0 112 112">
                        <circle class="timer-bg" cx="56" cy="56" r="50"/>
                        <circle class="timer-progress" id="timer_ring_${exercise.id}" cx="56" cy="56" r="50"
                                stroke-dasharray="${circumference}" stroke-dashoffset="0"/>
                    </svg>
                    <span class="timer-time" id="timer_time_${exercise.id}">${formatTime(duration)}</span>
                </div>
                <div class="timer-controls">
                    <button class="timer-start-btn" id="timer_btn_${exercise.id}">Start</button>
                </div>
            </div>
        </div>
        <div class="pain-section">
            <label>
                Pain Level (0-10):
                <span class="pain-value" id="pain_value_${exercise.id}">0</span>
            </label>
            <div style="padding: 15px 5px;">
                <input type="range" class="pain-slider" id="pain_${exercise.id}"
                       min="0" max="10" value="0" step="1">
            </div>
        </div>
        <button class="mark-complete-btn" id="complete_${exercise.id}">✓ Mark Complete</button>
    `;

    // Timer logic
    const timerState = {
        running: false,
        intervalId: null,
        currentSide: isBilateral ? 'both' : 'left',
        secondsRemaining: duration,
        leftDuration,
        rightDuration,
    };

    const timerBtn = card.querySelector(`#timer_btn_${exercise.id}`);
    const timerTime = card.querySelector(`#timer_time_${exercise.id}`);
    const timerRing = card.querySelector(`#timer_ring_${exercise.id}`);
    const timerLabel2 = card.querySelector(`#timer_label_${exercise.id}`);

    if (timerBtn) {
        timerBtn.addEventListener('click', function () {
            if (timerState.running) {
                // Pause
                clearInterval(timerState.intervalId);
                timerState.running = false;
                timerBtn.textContent = 'Resume';
                timerBtn.classList.remove('running');
            } else {
                // Start / Resume
                timerState.running = true;
                timerBtn.textContent = 'Pause';
                timerBtn.classList.add('running');

                const totalDuration =
                    timerState.currentSide === 'right'
                        ? timerState.rightDuration
                        : timerState.leftDuration;

                timerState.intervalId = setInterval(function () {
                    timerState.secondsRemaining--;

                    if (timerState.secondsRemaining <= 0) {
                        clearInterval(timerState.intervalId);
                        timerState.running = false;

                        // Play completion beep
                        playTimerBeep();

                        if (!isBilateral && timerState.currentSide === 'left') {
                            // Switch to right side
                            timerState.currentSide = 'right';
                            timerState.secondsRemaining = timerState.rightDuration;
                            if (timerLabel2) timerLabel2.textContent = 'RIGHT SIDE';
                            timerBtn.textContent = 'Start';
                            timerBtn.classList.remove('running', 'done');
                            updateTimerDisplay(
                                timerTime,
                                timerRing,
                                timerState.secondsRemaining,
                                timerState.rightDuration,
                                circumference
                            );
                        } else {
                            // All done
                            timerBtn.textContent = 'Done!';
                            timerBtn.classList.remove('running');
                            timerBtn.classList.add('done');
                            timerBtn.disabled = true;
                            updateTimerDisplay(timerTime, timerRing, 0, totalDuration, circumference);
                        }
                        return;
                    }

                    updateTimerDisplay(
                        timerTime,
                        timerRing,
                        timerState.secondsRemaining,
                        totalDuration,
                        circumference
                    );

                    // Warning animation at 5 seconds
                    if (timerState.secondsRemaining <= CONFIG.TIMER.WARNING_THRESHOLD) {
                        timerTime.classList.add('timer-warning');
                    }
                }, CONFIG.TIMER.COUNTDOWN_INTERVAL);
            }
        });
    }

    // Pain slider
    const painSlider = card.querySelector(`#pain_${exercise.id}`);
    const painValue = card.querySelector(`#pain_value_${exercise.id}`);
    attachPainSliderListeners(painSlider, painValue);

    // Exercise name tap -> instructions
    const exerciseName = card.querySelector('.exercise-name--tappable');
    if (exercise.instructions && exerciseName) {
        exerciseName.addEventListener('click', function (e) {
            e.preventDefault();
            showInstructionsBottomSheet(exercise);
        });
    }

    // Mark Complete
    const completeBtn = card.querySelector(`#complete_${exercise.id}`);
    if (completeBtn) {
        completeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            // Clean up timer
            if (timerState.intervalId) clearInterval(timerState.intervalId);
            collapseCard(card, exercise);
        });
    }

    return card;
}

// ========== Timed Holds Card ==========

/**
 * Create a card for timed-holds exercises (Dead Bug, Bird Dog).
 * Uses reps picker for number of holds completed, displays target hold duration as guidance.
 */
function createTimedHoldsCard(exercise, _index, _total) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.setAttribute('data-exercise-id', exercise.id);
    if (exercise.category) card.setAttribute('data-category', exercise.category);

    // Get progression targets for hold durations
    const progression = getProgressionTargets(exercise);
    const leftHoldTime = progression ? progression.left : exercise.timerDuration.left;
    const rightHoldTime = progression ? progression.right : exercise.timerDuration.right;
    const progressionNote = progression && progression.note ? `<div class="hold-duration-badge"><span class="hold-icon">📈</span>${progression.note}</div>` : '';

    card.innerHTML = `
        ${progressionNote}
        <div class="exercise-header">
            <div class="exercise-name exercise-name--tappable" data-exercise-id="${exercise.id}">${exercise.name}</div>
            <div class="exercise-target">${exercise.targetReps} × ${exercise.sets}</div>
        </div>
        <div class="hold-duration-badge">
            <span class="hold-icon">⏱</span>
            Hold: ${leftHoldTime}s (left) / ${rightHoldTime}s (right)
        </div>
        <div class="exercise-inputs">
            <div class="input-group">
                <label>Left Holds Completed:</label>
                <div id="picker_left_${exercise.id}"></div>
            </div>
            <div class="input-group">
                <label>Right Holds Completed:</label>
                <div id="picker_right_${exercise.id}"></div>
            </div>
        </div>
        <div class="input-group">
            <label>Sets Completed:</label>
            <input type="hidden" id="sets_${exercise.id}" value="${exercise.sets}">
            <div class="sets-radio-group" data-sets-id="sets_${exercise.id}">
                ${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="sets-radio-btn${n === exercise.sets ? ' active' : ''}" data-value="${n}">${n}</button>`).join('')}
            </div>
        </div>
        <div class="pain-section">
            <label>
                Pain Level (0-10):
                <span class="pain-value" id="pain_value_${exercise.id}">0</span>
            </label>
            <div style="padding: 15px 5px;">
                <input type="range" class="pain-slider" id="pain_${exercise.id}"
                       min="0" max="10" value="0" step="1">
            </div>
        </div>
        <button class="mark-complete-btn" id="complete_${exercise.id}">✓ Mark Complete</button>
    `;

    // Insert wheel pickers
    const leftPickerContainer = card.querySelector(`#picker_left_${exercise.id}`);
    const rightPickerContainer = card.querySelector(`#picker_right_${exercise.id}`);
    if (leftPickerContainer) {
        leftPickerContainer.replaceWith(
            createWheelPicker(`left_${exercise.id}`, 0, 20, 1, exercise.leftTarget)
        );
    }
    if (rightPickerContainer) {
        rightPickerContainer.replaceWith(
            createWheelPicker(`right_${exercise.id}`, 0, 20, 1, exercise.rightTarget)
        );
    }

    // Sets radio button handler
    const setsGroup = card.querySelector(`[data-sets-id="sets_${exercise.id}"]`);
    if (setsGroup) {
        setsGroup.addEventListener('click', function (e) {
            const btn = e.target.closest('.sets-radio-btn');
            if (!btn) return;
            setsGroup.querySelectorAll('.sets-radio-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`sets_${exercise.id}`).value = btn.dataset.value;
        });
    }

    // Pain slider
    const painSlider = card.querySelector(`#pain_${exercise.id}`);
    const painValue = card.querySelector(`#pain_value_${exercise.id}`);
    attachPainSliderListeners(painSlider, painValue);

    // Exercise name tap -> instructions
    const exerciseName = card.querySelector('.exercise-name--tappable');
    if (exercise.instructions && exerciseName) {
        exerciseName.addEventListener('click', function (e) {
            e.preventDefault();
            showInstructionsBottomSheet(exercise);
        });
    }

    // Mark Complete
    const completeBtn = card.querySelector(`#complete_${exercise.id}`);
    if (completeBtn) {
        completeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            collapseCard(card, exercise);
        });
    }

    return card;
}

// ========== Standard Reps Exercise Card ==========

/**
 * Create a fully expanded exercise card with wheel pickers, pain slider, and mark-complete.
 */
function createExerciseCard(exercise, _index, _total) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.setAttribute('data-exercise-id', exercise.id);
    if (exercise.category) card.setAttribute('data-category', exercise.category);

    card.innerHTML = `
        <div class="exercise-header">
            <div class="exercise-name exercise-name--tappable" data-exercise-id="${exercise.id}">${exercise.name}</div>
            <div class="exercise-target">${exercise.targetReps} × ${exercise.sets}</div>
        </div>
        <div class="exercise-inputs">
            ${
                exercise.bilateral
                    ? `
            <div class="input-group">
                <label>Reps:</label>
                <div id="picker_reps_${exercise.id}"></div>
            </div>
            `
                    : `
            <div class="input-group">
                <label>Left Leg Reps:</label>
                <div id="picker_left_${exercise.id}"></div>
            </div>
            <div class="input-group">
                <label>Right Leg Reps:</label>
                <div id="picker_right_${exercise.id}"></div>
            </div>
            `
            }
        </div>
        <div class="input-group">
            <label>Sets Completed:</label>
            <input type="hidden" id="sets_${exercise.id}" value="${exercise.sets}">
            <div class="sets-radio-group" data-sets-id="sets_${exercise.id}">
                ${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="sets-radio-btn${n === exercise.sets ? ' active' : ''}" data-value="${n}">${n}</button>`).join('')}
            </div>
        </div>
        <div class="pain-section">
            <label>
                Pain Level (0-10):
                <span class="pain-value" id="pain_value_${exercise.id}">0</span>
            </label>
            <div style="padding: 15px 5px;">
                <input type="range" class="pain-slider" id="pain_${exercise.id}"
                       min="0" max="10" value="0" step="1">
            </div>
        </div>
        <button class="mark-complete-btn" id="complete_${exercise.id}">✓ Mark Complete</button>
    `;

    // Insert wheel pickers
    const repsPickerContainer = card.querySelector(`#picker_reps_${exercise.id}`);
    const leftPickerContainer = card.querySelector(`#picker_left_${exercise.id}`);
    const rightPickerContainer = card.querySelector(`#picker_right_${exercise.id}`);
    if (repsPickerContainer) {
        repsPickerContainer.replaceWith(
            createWheelPicker(`reps_${exercise.id}`, 0, 30, 1, exercise.leftTarget)
        );
    }
    if (leftPickerContainer) {
        leftPickerContainer.replaceWith(
            createWheelPicker(`left_${exercise.id}`, 0, 30, 1, exercise.leftTarget)
        );
    }
    if (rightPickerContainer) {
        rightPickerContainer.replaceWith(
            createWheelPicker(`right_${exercise.id}`, 0, 30, 1, exercise.rightTarget)
        );
    }

    // Sets radio button handler
    const setsGroup = card.querySelector(`[data-sets-id="sets_${exercise.id}"]`);
    if (setsGroup) {
        setsGroup.addEventListener('click', function (e) {
            const btn = e.target.closest('.sets-radio-btn');
            if (!btn) return;
            setsGroup.querySelectorAll('.sets-radio-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`sets_${exercise.id}`).value = btn.dataset.value;
        });
    }

    // Pain slider
    const painSlider = card.querySelector(`#pain_${exercise.id}`);
    const painValue = card.querySelector(`#pain_value_${exercise.id}`);
    attachPainSliderListeners(painSlider, painValue);

    // Exercise name tap -> instructions
    const exerciseName = card.querySelector('.exercise-name--tappable');
    if (exercise.instructions && exerciseName) {
        exerciseName.addEventListener('click', function (e) {
            e.preventDefault();
            showInstructionsBottomSheet(exercise);
        });
    }

    // Mark Complete
    const completeBtn = card.querySelector(`#complete_${exercise.id}`);
    if (completeBtn) {
        completeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            collapseCard(card, exercise);
        });
    }

    return card;
}

// ========== Timer Helpers ==========

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}`;
}

function updateTimerDisplay(timeEl, ringEl, remaining, total, circumference) {
    if (timeEl) {
        timeEl.textContent = formatTime(remaining);
        if (remaining > CONFIG.TIMER.WARNING_THRESHOLD) {
            timeEl.classList.remove('timer-warning');
        }
    }
    if (ringEl) {
        const progress = total > 0 ? (total - remaining) / total : 0;
        ringEl.style.strokeDashoffset = circumference * (1 - progress);
    }
}

function playTimerBeep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = CONFIG.TIMER.BEEP_FREQUENCY;
        gain.gain.setValueAtTime(CONFIG.TIMER.BEEP_GAIN, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + CONFIG.TIMER.BEEP_DURATION);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + CONFIG.TIMER.BEEP_DURATION);
        setTimeout(() => ctx.close(), 500);
    } catch (_e) {
        // Web Audio not supported
    }

    // Vibrate
    if (navigator.vibrate) {
        navigator.vibrate(CONFIG.TIMER.VIBRATION_PATTERN);
    }
}

// ========== Pain Slider Listener ==========

function attachPainSliderListeners(slider, display) {
    if (!slider || !display) return;

    let isSliding = false;

    slider.addEventListener(
        'touchstart',
        function (e) {
            isSliding = true;
            e.stopPropagation();
        },
        { passive: false }
    );

    slider.addEventListener('mousedown', function (e) {
        isSliding = true;
        e.stopPropagation();
    });

    slider.addEventListener('input', function () {
        if (isSliding) {
            display.textContent = this.value;
            updatePainColor(display, this.value);
        }
    });

    slider.addEventListener('change', function () {
        display.textContent = this.value;
        updatePainColor(display, this.value);
        isSliding = false;
    });

    slider.addEventListener('touchend', function () {
        isSliding = false;
    });
    slider.addEventListener('mouseup', function () {
        isSliding = false;
    });
}

// ========== Card Collapse (Mark Complete) ==========

function collapseCard(card, exercise) {
    captureExerciseData(exercise.id);

    if (!dailyProgress.completedExercises.includes(exercise.id)) {
        dailyProgress.completedExercises.push(exercise.id);
    }
    saveDailyProgress();

    const startHeight = card.offsetHeight;
    card.style.height = startHeight + 'px';
    card.classList.add('exercise-card--completing-flash');

    requestAnimationFrame(() => {
        card.classList.add('exercise-card--collapsing');

        setTimeout(() => {
            const data = dailyProgress.exerciseData[exercise.id];
            let repSummary = '';
            if (data) {
                if (exercise.bilateral) {
                    repSummary = `<span class="exercise-rep-summary">${data.left || 0} reps</span>`;
                } else if (exercise.exerciseType === 'timed' || exercise.exerciseType === 'timed_holds') {
                    repSummary = `<span class="exercise-rep-summary">Done</span>`;
                } else {
                    repSummary = `<span class="exercise-rep-summary">${data.left || 0}L/${data.right || 0}R</span>`;
                }
            }

            card.innerHTML = `
                <div class="completed-card-inner">
                    <span class="completed-checkmark check-draw"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                    <span class="completed-title">${exercise.name}</span>
                    ${repSummary}
                    <span class="completed-expand-hint">tap to edit</span>
                </div>
            `;

            card.style.height = '50px';
            card.style.padding = '0 var(--space-xl)';
            card.style.borderLeft = '4px solid var(--success-color)';
            card.style.background = '#f0faf0';
        }, 200);

        setTimeout(() => {
            card.classList.remove('exercise-card--collapsing', 'exercise-card--completing-flash');
            card.classList.add('exercise-card--completed');
            card.style.height = '';
            card.style.padding = '';
            card.style.borderLeft = '';
            card.style.background = '';

            card.addEventListener('click', function onExpand() {
                card.removeEventListener('click', onExpand);
                expandCard(card, exercise);
            });
        }, 700);
    });

    playCompletionSound();
    showCompletionToast(exercise);
    updateProgressBar();
    checkAllComplete();

    setTimeout(() => {
        scrollToNextIncomplete(card);
    }, 800);
}

// ========== Card Expand (Undo Complete) ==========

function expandCard(card, exercise) {
    dailyProgress.completedExercises = dailyProgress.completedExercises.filter(
        (id) => id !== exercise.id
    );
    saveDailyProgress();

    const collapsedHeight = card.offsetHeight;
    card.style.height = collapsedHeight + 'px';
    card.style.overflow = 'hidden';

    // Create appropriate card type based on exercise type
    let newCardFn;
    if (exercise.exerciseType === 'timed') {
        newCardFn = createTimedExerciseCard;
    } else if (exercise.exerciseType === 'timed_holds') {
        newCardFn = createTimedHoldsCard;
    } else {
        newCardFn = createExerciseCard;
    }

    // Measure target
    const measureCard = newCardFn(exercise, 0, 0);
    measureCard.style.position = 'absolute';
    measureCard.style.visibility = 'hidden';
    measureCard.style.width = card.offsetWidth + 'px';
    document.body.appendChild(measureCard);
    const targetHeight = measureCard.offsetHeight;
    document.body.removeChild(measureCard);

    const fullCard = newCardFn(exercise, 0, 0);
    fullCard.classList.add('exercise-card--expanding');
    fullCard.style.height = collapsedHeight + 'px';
    fullCard.style.overflow = 'hidden';
    card.replaceWith(fullCard);

    requestAnimationFrame(() => {
        fullCard.style.height = targetHeight + 'px';
        fullCard.classList.add('exercise-card--expand-reveal');
    });

    setTimeout(() => {
        fullCard.classList.remove('exercise-card--expanding', 'exercise-card--expand-reveal');
        fullCard.style.height = '';
        fullCard.style.overflow = '';
    }, 500);

    restoreExerciseData(exercise);
    updateProgressBar();
    checkAllComplete();
}

// ========== Auto-Scroll to Next Incomplete ==========

function scrollToNextIncomplete(currentCard) {
    const allCards = document.querySelectorAll('.exercise-card');
    let foundCurrent = false;
    for (const card of allCards) {
        if (card === currentCard) {
            foundCurrent = true;
            continue;
        }
        if (foundCurrent && !card.classList.contains('exercise-card--completed')) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }
    for (const card of allCards) {
        if (!card.classList.contains('exercise-card--completed')) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }
}

// ========== Instructions Bottom Sheet ==========

function dismissBottomSheet(overlay) {
    overlay.classList.remove('visible');
    setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
    }, 300);
}

function showInstructionsBottomSheet(exercise) {
    if (!exercise.instructions) {
        showToast('No instructions available', 'info');
        return;
    }

    const existing = document.querySelector('.bottom-sheet-overlay');
    if (existing) existing.remove();

    const instr = exercise.instructions;
    const overlay = document.createElement('div');
    overlay.className = 'bottom-sheet-overlay';

    overlay.innerHTML = `
        <div class="bottom-sheet">
            <div class="bottom-sheet-handle"></div>
            <div class="bottom-sheet-header">
                <h3>${instr.title}</h3>
            </div>
            <div class="bottom-sheet-body">
                <div class="instructions-section">
                    <h3>How to Perform</h3>
                    <ol class="steps-list">
                        ${instr.steps.map((step) => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                <div class="instructions-section">
                    <h3>Target</h3>
                    <p><strong>Reps:</strong> ${instr.reps} &middot; <strong>Sets:</strong> ${instr.sets}</p>
                </div>
                <div class="instructions-section why-section">
                    <h3>Why This Exercise</h3>
                    <p>${instr.why}</p>
                </div>
                <div class="instructions-section tips-section">
                    <h3>Pro Tips</h3>
                    <ul class="tips-list">
                        ${instr.tips.map((tip) => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => overlay.classList.add('visible'));

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) dismissBottomSheet(overlay);
    });

    const handle = overlay.querySelector('.bottom-sheet-handle');
    if (handle) {
        handle.addEventListener('click', function () {
            dismissBottomSheet(overlay);
        });
    }
}

// ========== Save Workout ==========

function saveWorkout() {
    const date = document.getElementById('workoutDate').value;
    if (!date) {
        showToast('Please select a date', 'error');
        return;
    }

    autoSaveDailyProgress();

    const allExercises = getExercisesForPhase(currentPhase);
    const workout = {
        date: date,
        phase: currentPhase,
        exercises: [],
        quickLogCounts: { ...(dailyProgress.quickLogCounts || {}) },
        dailyMetrics: { ...(dailyProgress.dailyMetrics || {}) },
    };

    let hasData = false;

    allExercises.forEach((exercise) => {
        // Skip quick-log exercises (saved separately)
        if (exercise.exerciseType === 'quick_log') return;

        const isCompleted = dailyProgress.completedExercises.includes(exercise.id);
        const savedData = dailyProgress.exerciseData[exercise.id];

        let leftReps, rightReps, sets, pain, notes;

        if (isCompleted && savedData) {
            leftReps = savedData.left;
            rightReps = savedData.right;
            sets = savedData.sets;
            pain = savedData.pain;
            notes = savedData.notes;
        } else if (savedData) {
            leftReps = savedData.left;
            rightReps = savedData.right;
            sets = savedData.sets;
            pain = savedData.pain;
            notes = savedData.notes;
        } else {
            const repsPicker = document.getElementById(`reps_${exercise.id}`);
            if (repsPicker) {
                const reps = getPickerValue(`reps_${exercise.id}`);
                leftReps = reps;
                rightReps = reps;
            } else {
                leftReps = getPickerValue(`left_${exercise.id}`);
                rightReps = getPickerValue(`right_${exercise.id}`);
            }
            sets = getPickerValue(`sets_${exercise.id}`);
            const painEl = document.getElementById(`pain_${exercise.id}`);
            const notesEl = document.getElementById(`notes_${exercise.id}`);
            pain = painEl ? parseInt(painEl.value) || 0 : 0;
            notes = notesEl ? notesEl.value || '' : '';
        }

        if (leftReps || rightReps || sets || pain > 0 || notes || isCompleted) {
            hasData = true;
            workout.exercises.push({
                id: exercise.id,
                name: exercise.name,
                leftReps: leftReps,
                rightReps: rightReps,
                sets: sets,
                pain: pain,
                notes: notes,
            });
        }
    });

    // Check quick log data
    const quickLogHasData = Object.values(dailyProgress.quickLogCounts || {}).some((v) => v > 0);
    if (quickLogHasData) hasData = true;

    if (!hasData) {
        showToast('Please enter at least some data', 'error');
        return;
    }

    // Set plan start date on first workout
    if (!planStartDate) {
        setPlanStartDate(date);
    }

    workoutData.push(workout);
    safeSetItem('workoutData', workoutData);

    showToast('Workout saved successfully!', 'success');

    onWorkoutSaved();

    setDailyProgress(createFreshProgress());
    saveDailyProgress();

    hideCelebration();

    setTimeout(() => {
        loadExercises();
        updateStats();
    }, 1000);
}

export {
    loadExercises,
    createExerciseCard,
    createCompletedCard,
    createTimedExerciseCard,
    createTimedHoldsCard,
    createQuickLogCard,
    collapseCard,
    expandCard,
    scrollToNextIncomplete,
    attachPainSliderListeners,
    dismissBottomSheet,
    showInstructionsBottomSheet,
    saveWorkout,
    renderDailyMetrics,
};
