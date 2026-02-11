/**
 * exercises-ui.js — Exercise card UI: creation, completion, expand/collapse, instructions
 *
 * The most complex UI module. Handles:
 * - Loading exercises for the current phase
 * - Creating full exercise cards with wheel pickers and pain sliders
 * - Collapsing cards on completion (with animation)
 * - Expanding completed cards back to full state
 * - Showing exercise instruction modals
 */

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
            <div class="exercise-name">${exercise.name}</div>
            <div class="exercise-actions">
                <button class="info-btn" id="info_${exercise.id}" title="View Instructions">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
                        <path d="M10 14V10M10 6H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
                <div class="exercise-target">${exercise.targetReps} × ${exercise.sets}</div>
            </div>
        </div>
        <div class="exercise-inputs">
            <div class="input-group">
                <label>Left Leg Reps:</label>
                <div id="picker_left_${exercise.id}"></div>
            </div>
            <div class="input-group">
                <label>Right Leg Reps:</label>
                <div id="picker_right_${exercise.id}"></div>
            </div>
        </div>
        <div class="input-group">
            <label>Sets Completed:</label>
            <div id="picker_sets_${exercise.id}"></div>
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
    const leftPickerContainer = card.querySelector(`#picker_left_${exercise.id}`);
    const rightPickerContainer = card.querySelector(`#picker_right_${exercise.id}`);
    const setsPickerContainer = card.querySelector(`#picker_sets_${exercise.id}`);

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
    if (setsPickerContainer) {
        setsPickerContainer.replaceWith(
            createWheelPicker(`sets_${exercise.id}`, 1, 5, 1, exercise.sets)
        );
    }

    // Attach pain slider listeners (shared helper to avoid duplication)
    const painSlider = card.querySelector(`#pain_${exercise.id}`);
    const painValue = card.querySelector(`#pain_value_${exercise.id}`);
    attachPainSliderListeners(painSlider, painValue);

    // Add info button listener
    const infoBtn = card.querySelector(`#info_${exercise.id}`);
    if (exercise.instructions && infoBtn) {
        infoBtn.addEventListener('click', function (e) {
            e.preventDefault();
            showInstructions(exercise);
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

// ========== Pain Color Indicator ==========

/**
 * Update the background color of a pain value display based on severity.
 * @param {HTMLElement} element - The pain value span
 * @param {number|string} value - Pain level (0-10)
 */
function updatePainColor(element, value) {
    if (value >= 7) {
        element.style.background = 'var(--danger-color)';
    } else if (value >= 4) {
        element.style.background = 'var(--warning-color)';
    } else {
        element.style.background = 'var(--primary-color)';
    }
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

    const infoBtn = card.querySelector(`#info_${exercise.id}`);
    if (exercise.instructions && infoBtn) {
        infoBtn.addEventListener('click', function (e) {
            e.preventDefault();
            showInstructions(exercise);
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

// ========== Instructions Modal ==========

/**
 * Close an open instructions modal and restore background scrolling.
 * @param {HTMLElement} el - Any element inside the modal (used to find parent)
 */
function closeInstructionsModal(el) {
    const modal = el.closest('.instructions-modal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = '';
}

/**
 * Show a full-screen modal with detailed exercise instructions.
 * @param {Object} exercise - Exercise object with .instructions property
 */
function showInstructions(exercise) {
    if (!exercise.instructions) {
        showToast('No instructions available', 'info');
        return;
    }

    const instr = exercise.instructions;

    const modal = document.createElement('div');
    modal.className = 'instructions-modal';
    modal.innerHTML = `
        <div class="instructions-modal-content">
            <div class="instructions-header">
                <h2>${instr.title}</h2>
                <button class="modal-close-btn" data-action="close-modal" aria-label="Close instructions">×</button>
            </div>
            <div class="instructions-body">
                <div class="instructions-section">
                    <h3>📋 How to Perform:</h3>
                    <ol class="steps-list">
                        ${instr.steps.map((step) => `<li>${step}</li>`).join('')}
                    </ol>
                </div>

                <div class="instructions-section">
                    <h3>🎯 Target:</h3>
                    <p><strong>Reps:</strong> ${instr.reps}</p>
                    <p><strong>Sets:</strong> ${instr.sets}</p>
                </div>

                <div class="instructions-section why-section">
                    <h3>💡 Why This Exercise:</h3>
                    <p>${instr.why}</p>
                </div>

                <div class="instructions-section tips-section">
                    <h3>✅ Pro Tips:</h3>
                    <ul class="tips-list">
                        ${instr.tips.map((tip) => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="instructions-footer">
                <button class="btn btn-primary" data-action="close-modal">Got It!</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Prevent background scroll
    document.body.style.overflow = 'hidden';

    // Close on backdrop click or close button click
    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.closest('[data-action="close-modal"]')) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
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
            leftReps = getPickerValue(`left_${exercise.id}`);
            rightReps = getPickerValue(`right_${exercise.id}`);
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
    dailyProgress = createFreshProgress();
    saveDailyProgress();

    // Hide celebration banner
    hideCelebration();

    // Clear form and reload
    setTimeout(() => {
        loadExercises();
        updateStats();
    }, 1000);
}
