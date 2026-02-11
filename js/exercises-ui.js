/**
 * exercises-ui.js — Exercise card UI: creation, completion, expand/collapse, instructions
 *
 * The most complex UI module. Handles:
 * - Loading exercises for the current phase
 * - Creating full exercise cards with wheel pickers and pain sliders
 * - Collapsing cards on completion (with animation)
 * - Expanding completed cards back to full state
 * - Showing exercise instruction modals (bottom sheet)
 */

import { getExercisesForPhase } from '../exercises.js';
import { showToast } from './utils.js';
import { createWheelPicker, getPickerValue } from './wheel-picker.js';
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

// ========== Exercise Loading ==========

/**
 * Load all exercises for the current phase and render them.
 * Completed exercises render as collapsed cards; others render fully expanded.
 */
function loadExercises() {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';

    const phaseExercises = getExercisesForPhase(currentPhase);

    phaseExercises.forEach((exercise, index) => {
        const isCompleted = dailyProgress.completedExercises.includes(exercise.id);

        if (isCompleted) {
            const card = createCompletedCard(exercise);
            exerciseList.appendChild(card);
        } else {
            const card = createExerciseCard(exercise, index);
            exerciseList.appendChild(card);
            restoreExerciseData(exercise);
        }
    });

    updateProgressBar();
}

// ========== Completed (Collapsed) Card ==========

/**
 * Create a small collapsed card for a completed exercise.
 * Clicking it re-expands the card for editing.
 * @param {Object} exercise - Exercise definition object
 * @returns {HTMLElement} Collapsed card element
 */
function createCompletedCard(exercise) {
    const card = document.createElement('div');
    card.className = 'exercise-card exercise-card--completed';
    card.setAttribute('data-exercise-id', exercise.id);
    card.innerHTML = `
        <div class="completed-card-inner">
            <span class="completed-checkmark">&#10003;</span>
            <span class="completed-title">${exercise.name}</span>
            <span class="completed-expand-hint">tap to edit</span>
        </div>
    `;

    card.addEventListener('click', function (_e) {
        expandCard(card, exercise);
    });

    return card;
}

// ========== Full Exercise Card ==========

/**
 * Create a fully expanded exercise card with wheel pickers, pain slider,
 * info button, and mark-complete button.
 * @param {Object} exercise - Exercise definition object
 * @param {number} index - Position index in the exercise list
 * @returns {HTMLElement} Full exercise card element
 */
function createExerciseCard(exercise, _index) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.setAttribute('data-exercise-id', exercise.id);

    // Add progression note if applicable
    let progressionNote = '';
    if (exercise.progressionLevel) {
        const progressionTexts = {
            1: '🟢 Start here - easiest level',
            2: '🟡 Progress when Level 1 feels easy',
            3: '🟠 Intermediate - adds challenge',
            4: '🔴 Advanced - no support',
            5: '⚫ Expert - most challenging',
        };
        progressionNote = `<div style="background: var(--bg-light); padding: 8px 12px; border-radius: 6px; margin-bottom: 10px; font-size: 13px; color: var(--text-dark);">${progressionTexts[exercise.progressionLevel]}</div>`;
    }

    card.innerHTML = `
        ${progressionNote}
        <div class="exercise-header">
            <div class="exercise-name exercise-name--tappable" data-exercise-id="${exercise.id}">${exercise.name}</div>
            <div class="exercise-target">${exercise.targetReps} × ${exercise.sets}</div>
        </div>
        <div class="exercise-inputs">
            ${exercise.bilateral ? `
            <div class="input-group">
                <label>Reps:</label>
                <div id="picker_reps_${exercise.id}"></div>
            </div>
            ` : `
            <div class="input-group">
                <label>Left Leg Reps:</label>
                <div id="picker_left_${exercise.id}"></div>
            </div>
            <div class="input-group">
                <label>Right Leg Reps:</label>
                <div id="picker_right_${exercise.id}"></div>
            </div>
            `}
        </div>
        <div class="input-group">
            <label>Sets Completed:</label>
            <input type="hidden" id="sets_${exercise.id}" value="${exercise.sets}">
            <div class="sets-radio-group" data-sets-id="sets_${exercise.id}">
                ${[1,2,3,4,5].map(n => `<button type="button" class="sets-radio-btn${n === exercise.sets ? ' active' : ''}" data-value="${n}">${n}</button>`).join('')}
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

    // Insert wheel pickers into placeholder divs
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

    // Sets radio button click handler
    const setsGroup = card.querySelector(`[data-sets-id="sets_${exercise.id}"]`);
    if (setsGroup) {
        setsGroup.addEventListener('click', function (e) {
            const btn = e.target.closest('.sets-radio-btn');
            if (!btn) return;
            setsGroup.querySelectorAll('.sets-radio-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`sets_${exercise.id}`).value = btn.dataset.value;
        });
    }

    // Attach pain slider listeners (shared helper to avoid duplication)
    const painSlider = card.querySelector(`#pain_${exercise.id}`);
    const painValue = card.querySelector(`#pain_value_${exercise.id}`);
    attachPainSliderListeners(painSlider, painValue);

    // Exercise name tap → bottom sheet with instructions
    const exerciseName = card.querySelector('.exercise-name--tappable');
    if (exercise.instructions && exerciseName) {
        exerciseName.addEventListener('click', function (e) {
            e.preventDefault();
            showInstructionsBottomSheet(exercise);
        });
    }

    // Mark Complete button handler
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

// ========== Shared Pain Slider Listener Setup ==========

/**
 * Attach touch/mouse event listeners to a pain slider for proper
 * scroll-protection and value display. Extracted from duplicated code
 * in createExerciseCard() and reattachCardListeners().
 * @param {HTMLInputElement} slider - The range input element
 * @param {HTMLElement} display - The span element showing the current value
 */
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

// ========== Re-attach Listeners (after DOM rebuild) ==========

/**
 * Re-attach all interactive listeners to a rebuilt exercise card.
 * Used when expandCard() creates a fresh card via createExerciseCard().
 * @param {HTMLElement} card - The exercise card DOM element
 * @param {Object} exercise - Exercise definition object
 */
function reattachCardListeners(card, exercise) {
    const painSlider = card.querySelector(`#pain_${exercise.id}`);
    const painValue = card.querySelector(`#pain_value_${exercise.id}`);
    attachPainSliderListeners(painSlider, painValue);

    const exerciseNameEl = card.querySelector('.exercise-name--tappable');
    if (exercise.instructions && exerciseNameEl) {
        exerciseNameEl.addEventListener('click', function (e) {
            e.preventDefault();
            showInstructionsBottomSheet(exercise);
        });
    }

    const completeBtn = card.querySelector(`#complete_${exercise.id}`);
    if (completeBtn) {
        completeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            collapseCard(card, exercise);
        });
    }
}

// ========== Card Collapse (Mark Complete) ==========

/**
 * Animate an exercise card collapsing into a completed state.
 * Captures input data, marks complete, plays sound, and auto-scrolls.
 * @param {HTMLElement} card - The exercise card DOM element
 * @param {Object} exercise - Exercise definition object
 */
function collapseCard(card, exercise) {
    // Capture current input values
    captureExerciseData(exercise.id);

    // Mark as completed
    if (!dailyProgress.completedExercises.includes(exercise.id)) {
        dailyProgress.completedExercises.push(exercise.id);
    }
    saveDailyProgress();

    // Animate collapse
    card.classList.add('exercise-card--completing');

    setTimeout(() => {
        card.classList.remove('exercise-card--completing');
        card.classList.add('exercise-card--completed');

        const exerciseName = exercise.name;
        card.innerHTML = `
            <div class="completed-card-inner">
                <span class="completed-checkmark">&#10003;</span>
                <span class="completed-title">${exerciseName}</span>
                <span class="completed-expand-hint">tap to edit</span>
            </div>
        `;

        // Add click-to-expand handler on the collapsed card
        card.addEventListener('click', function onExpand(_e) {
            card.removeEventListener('click', onExpand);
            expandCard(card, exercise);
        });
    }, 300);

    // Play sound and show toast
    playCompletionSound();
    showCompletionToast();

    // Update progress bar
    updateProgressBar();

    // Check if all complete for celebration
    checkAllComplete();

    // Auto-scroll to next incomplete card
    setTimeout(() => {
        scrollToNextIncomplete(card);
    }, 450);
}

// ========== Card Expand (Undo Complete) ==========

/**
 * Re-expand a completed card back to full editing state.
 * Rebuilds the card from scratch and restores saved values.
 * @param {HTMLElement} card - The collapsed card DOM element
 * @param {Object} exercise - Exercise definition object
 */
function expandCard(card, exercise) {
    // Remove from completed
    dailyProgress.completedExercises = dailyProgress.completedExercises.filter(
        (id) => id !== exercise.id
    );
    saveDailyProgress();

    // Rebuild the card completely from scratch (guarantees pickers + listeners work)
    const newCard = createExerciseCard(exercise, 0);
    newCard.classList.add('exercise-card--expanding');
    card.replaceWith(newCard);

    setTimeout(() => {
        newCard.classList.remove('exercise-card--expanding');
    }, 300);

    // Restore saved input values (pickers, pain, notes)
    restoreExerciseData(exercise);

    // Update progress bar
    updateProgressBar();

    // Check celebration state (hide if no longer all complete)
    checkAllComplete();
}

// ========== Auto-Scroll to Next Incomplete ==========

/**
 * Scroll the viewport to the next incomplete exercise card after the given one.
 * Wraps around to the first incomplete card if none found after current.
 * @param {HTMLElement} currentCard - The card that was just completed
 */
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
    // Wrap around: find first incomplete
    for (const card of allCards) {
        if (!card.classList.contains('exercise-card--completed')) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }
}

// ========== Instructions Bottom Sheet ==========

/**
 * Dismiss a bottom sheet overlay with animation.
 * @param {HTMLElement} overlay - The overlay element to dismiss
 */
function dismissBottomSheet(overlay) {
    overlay.classList.remove('visible');
    setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
    }, 300);
}

/**
 * Show a bottom sheet with detailed exercise instructions.
 * Slides up from the bottom when exercise name is tapped.
 * @param {Object} exercise - Exercise object with .instructions property
 */
function showInstructionsBottomSheet(exercise) {
    if (!exercise.instructions) {
        showToast('No instructions available', 'info');
        return;
    }

    // Remove existing sheet if any
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

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Close on overlay tap
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) dismissBottomSheet(overlay);
    });

    // Close on handle tap
    const handle = overlay.querySelector('.bottom-sheet-handle');
    if (handle) {
        handle.addEventListener('click', function () {
            dismissBottomSheet(overlay);
        });
    }
}

// ========== Save Workout ==========

/**
 * Collect all exercise data and save the complete workout to localStorage.
 * Reads from both completed (collapsed) cards and expanded cards.
 */
function saveWorkout() {
    const date = document.getElementById('workoutDate').value;
    if (!date) {
        showToast('Please select a date', 'error');
        return;
    }

    // First, capture data from any still-expanded cards into dailyProgress
    autoSaveDailyProgress();

    const phaseExercises = getExercisesForPhase(currentPhase);
    const workout = {
        date: date,
        phase: currentPhase,
        exercises: [],
    };

    let hasData = false;
    phaseExercises.forEach((exercise) => {
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
            // Bilateral exercises use a single "reps" picker
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

        if (leftReps || rightReps || sets || pain > 0 || notes) {
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

    if (!hasData) {
        showToast('Please enter at least some data', 'error');
        return;
    }

    // Save to storage
    workoutData.push(workout);
    safeSetItem('workoutData', workoutData);

    showToast('✓ Workout saved successfully!', 'success');

    // Clear daily progress after save
    setDailyProgress(createFreshProgress());
    saveDailyProgress();

    // Hide celebration banner
    hideCelebration();

    // Clear form and reload
    setTimeout(() => {
        loadExercises();
        updateStats();
    }, 1000);
}

export {
    loadExercises,
    createExerciseCard,
    createCompletedCard,
    collapseCard,
    expandCard,
    scrollToNextIncomplete,
    attachPainSliderListeners,
    reattachCardListeners,
    dismissBottomSheet,
    showInstructionsBottomSheet,
    saveWorkout,
};
