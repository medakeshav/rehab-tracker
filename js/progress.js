/**
 * progress.js — Progress tracking, celebration effects, and completion feedback
 *
 * Manages the progress bar (Version A sticky bar / Version C thumbnail circles),
 * confetti celebrations, completion sounds, and toast messages.
 */

// ========== Progress Bar ==========

/**
 * Update the progress bar UI based on current completion state.
 * Supports two display modes controlled by PROGRESS_BAR_VERSION:
 *   'A' = sticky top bar with fill animation
 *   'C' = mini thumbnail circles for each exercise
 */
function updateProgressBar() {
    const phaseExercises = getExercisesForPhase(currentPhase);
    const total = phaseExercises.length;
    const done = dailyProgress.completedExercises.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    // Version A — Sticky Top Bar
    const barA = document.getElementById('progressBarA');
    if (barA) {
        if (done > 0 && PROGRESS_BAR_VERSION === 'A') {
            barA.style.display = 'block';
            const fill = barA.querySelector('.progress-bar-fill');
            const text = barA.querySelector('.progress-bar-text');
            if (fill) fill.style.width = pct + '%';
            if (text) {
                let msg = 'Keep going!';
                if (pct >= 100) msg = 'All done! 🎉';
                else if (pct >= 75) msg = 'Almost there!';
                else if (pct >= 50) msg = 'Halfway!';
                text.textContent = `${done}/${total} completed (${pct}%) — ${msg}`;
            }
        } else {
            barA.style.display = 'none';
        }
    }

    // Version C — Thumbnail Circles
    const barC = document.getElementById('progressBarC');
    if (barC) {
        if (PROGRESS_BAR_VERSION === 'C') {
            barC.style.display = 'flex';
            barC.innerHTML = '';
            phaseExercises.forEach((exercise, index) => {
                const isCompleted = dailyProgress.completedExercises.includes(exercise.id);
                const thumb = document.createElement('button');
                thumb.className = 'progress-thumb' + (isCompleted ? ' completed' : '');
                thumb.textContent = isCompleted ? '✓' : index + 1;
                thumb.title = exercise.name;
                thumb.addEventListener('click', function () {
                    scrollToExercise(exercise.id);
                });
                barC.appendChild(thumb);
            });
        } else {
            barC.style.display = 'none';
        }
    }

    // Show/hide clear button
    const clearBtn = document.getElementById('clearProgressBtn');
    if (clearBtn) {
        clearBtn.style.display = done > 0 ? 'block' : 'none';
    }
}

/**
 * Scroll the viewport to bring an exercise card into view with a highlight.
 * @param {string} exerciseId - The exercise ID to scroll to
 */
function scrollToExercise(exerciseId) {
    const card = document.querySelector(`.exercise-card[data-exercise-id="${exerciseId}"]`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Brief highlight effect
        card.style.boxShadow = '0 0 0 3px var(--primary-color)';
        setTimeout(() => {
            card.style.boxShadow = '';
        }, 1000);
    }
}

/**
 * Clear all daily progress after user confirmation.
 */
function clearDailyProgress() {
    showConfirmDialog(
        'Clear Progress',
        'Clear all progress for today? Your saved workouts are not affected.',
        'Clear',
        function () {
            dailyProgress.completedExercises = [];
            dailyProgress.exerciseData = {};
            saveDailyProgress();
            loadExercises();
            updateProgressBar();
            showToast('Progress cleared', 'success');
        }
    );
}

// ========== Completion Celebration ==========

/**
 * Check if all exercises are completed and trigger/hide celebration.
 */
function checkAllComplete() {
    const total = getExercisesForPhase(currentPhase).length;
    const done = dailyProgress.completedExercises.length;

    if (done >= total && total > 0) {
        showCelebration();
    } else {
        hideCelebration();
    }
}

/**
 * Fire confetti bursts and show a celebration banner.
 */
function showCelebration() {
    // Fire confetti if available
    if (typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 70, origin: { x: 0.2, y: 0.6 } });
        confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.6 } });

        setTimeout(() => {
            if (typeof confetti === 'function') {
                confetti({ particleCount: 50, spread: 100, origin: { x: 0.5, y: 0.4 } });
            }
        }, 500);
    }

    // Show celebration banner if not already visible
    let banner = document.getElementById('celebrationBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'celebrationBanner';
        banner.className = 'celebration-banner';
        banner.innerHTML = `
            <div class="celebration-text">
                <div class="celebration-emoji">🎉</div>
                <div class="celebration-title">Workout Complete!</div>
                <div class="celebration-subtitle">Amazing work! Don't forget to save.</div>
            </div>
        `;
        const exerciseList = document.getElementById('exerciseList');
        if (exerciseList) {
            exerciseList.parentNode.insertBefore(banner, exerciseList);
        }
    }
}

/**
 * Remove the celebration banner from the DOM.
 */
function hideCelebration() {
    const banner = document.getElementById('celebrationBanner');
    if (banner) {
        banner.remove();
    }
}

// ========== Completion Sound ==========

/**
 * Play a two-tone completion chime using the Web Audio API.
 * Silently does nothing if sound is disabled or Web Audio is unavailable.
 */
function playCompletionSound() {
    if (!dailyProgress.soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        // First tone (C5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.value = 523;
        gain1.gain.setValueAtTime(0.3, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.2);

        // Second tone (E5)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 659;
        gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.4);

        // Clean up after sound finishes
        setTimeout(() => ctx.close(), 500);
    } catch (_e) {
        // Web Audio not supported — silently ignore
    }
}

// ========== Completion Toast ==========

/**
 * Build a motivational message based on current completion percentage.
 * @returns {string} Encouraging message with emoji
 */
function getCompletionMessage() {
    const total = getExercisesForPhase(currentPhase).length;
    const done = dailyProgress.completedExercises.length;
    const pct = done / total;

    if (done === 1) return 'Great start! 💪';
    if (done === total) return 'All done! 🎉';
    if (pct >= 0.75) return 'Almost done! 🔥';
    if (pct >= 0.5) return 'Halfway there! ⚡';
    return 'Keep it up! 👊';
}

/**
 * Show a brief floating toast with the completion count and motivational message.
 */
function showCompletionToast() {
    // Remove any existing completion toast
    const existing = document.querySelector('.completion-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'completion-toast';

    const total = getExercisesForPhase(currentPhase).length;
    const done = dailyProgress.completedExercises.length;
    toast.innerHTML = `<span class="completion-toast-msg">${getCompletionMessage()}</span><span class="completion-toast-count">${done}/${total}</span>`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('completion-toast--hiding');
        setTimeout(() => toast.remove(), 300);
    }, 1200);
}

// ========== Sound Toggle ==========

/**
 * Toggle completion sound on/off and update the UI button.
 */
function toggleSound() {
    dailyProgress.soundEnabled = !dailyProgress.soundEnabled;
    saveDailyProgress();
    updateSoundToggleBtn();
    showToast(dailyProgress.soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF', 'success');
}

/**
 * Update the sound toggle button label to reflect current state.
 */
function updateSoundToggleBtn() {
    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
        btn.textContent = dailyProgress.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    }
}

// ========== Progress Bar Toggle ==========

/**
 * Toggle progress bar display between sticky bar (A) and thumbnail circles (C).
 * Persists the choice to localStorage.
 */
function toggleProgressBar() {
    PROGRESS_BAR_VERSION = PROGRESS_BAR_VERSION === 'C' ? 'A' : 'C';
    safeSetItem('progressBarVersion', PROGRESS_BAR_VERSION);
    updateProgressBar();
    updateProgressBarToggleBtn();
    const label = PROGRESS_BAR_VERSION === 'A' ? '📊 Progress Bar' : '⊙ Progress Circles';
    showToast(label, 'success');
}

/**
 * Update the progress bar toggle button label to reflect current version.
 */
function updateProgressBarToggleBtn() {
    const btn = document.getElementById('progressBarToggleBtn');
    if (btn) {
        btn.textContent =
            PROGRESS_BAR_VERSION === 'A' ? '📊 Progress: Bar' : '📊 Progress: Circles';
    }
}

// ========== Dark Mode Toggle ==========

/**
 * Toggle dark mode on/off, persist to localStorage, and update the UI.
 */
function toggleDarkMode() {
    darkMode = !darkMode;
    safeSetItem('darkMode', darkMode);
    applyDarkMode();
    updateDarkModeToggleBtn();
    showToast(darkMode ? '🌙 Dark Mode ON' : '☀️ Light Mode ON', 'success');
}

/**
 * Apply or remove the dark-mode class on the body element.
 * Also updates the meta theme-color for the browser chrome.
 */
function applyDarkMode() {
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#1a1a2e');
    } else {
        document.body.classList.remove('dark-mode');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#4472C4');
    }
}

/**
 * Update the dark mode toggle button label to reflect current state.
 */
function updateDarkModeToggleBtn() {
    const btn = document.getElementById('darkModeToggleBtn');
    if (btn) {
        btn.textContent = darkMode ? '☀️ Theme: Dark' : '🌙 Theme: Light';
    }
}
