/**
 * progress.js — Progress tracking, celebration effects, and completion feedback
 *
 * Manages the progress bar (Version A sticky bar / Version C thumbnail circles),
 * confetti celebrations, completion sounds, and toast messages.
 */

import confetti from 'canvas-confetti';
import CONFIG from './config.js';
import { getExercisesForTimeBlock } from '../exercises.js';
import { safeSetItem, showToast, showConfirmDialog } from './utils.js';
import {
    currentPhase,
    dailyProgress,
    saveDailyProgress,
    PROGRESS_BAR_VERSION,
    setProgressBarVersion,
    darkMode,
    setDarkMode,
    activeTimeBlock,
} from './state.js';

/** @type {Function|null} Callback to reload exercises (set by app.js to avoid circular import) */
let reloadExercises = null;

/**
 * Register a callback to reload exercises after clearing progress.
 * @param {Function} fn
 */
function setReloadExercises(fn) {
    reloadExercises = fn;
}

// ========== Progress Counting (group-aware) ==========

/**
 * Count completed vs total exercises for the active time block.
 * Quick-log exercises count based on whether they have any logs.
 * @returns {{ total: number, done: number }}
 */
function getCompletionCount() {
    const exercises = getExercisesForTimeBlock(currentPhase, activeTimeBlock);

    let total = 0;
    let done = 0;

    exercises.forEach((exercise) => {
        if (exercise.exerciseType === 'quick_log') {
            total++;
            const count =
                (dailyProgress.quickLogCounts && dailyProgress.quickLogCounts[exercise.id]) || 0;
            if (count > 0) done++;
        } else {
            total++;
            if (dailyProgress.completedExercises.includes(exercise.id)) {
                done++;
            }
        }
    });

    return { total, done };
}

// ========== Progress Bar ==========

/**
 * Update the progress bar UI based on current completion state.
 * Supports two display modes controlled by PROGRESS_BAR_VERSION:
 *   'A' = sticky top bar with fill animation
 *   'C' = mini thumbnail circles for each exercise
 */
function updateProgressBar() {
    const { total, done } = getCompletionCount();
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

    // Version C — Thumbnail Circles (time-block-aware)
    const blockExercises = getExercisesForTimeBlock(currentPhase, activeTimeBlock);
    const barC = document.getElementById('progressBarC');
    if (barC) {
        if (PROGRESS_BAR_VERSION === 'C') {
            barC.style.display = 'flex';
            barC.innerHTML = '';
            blockExercises.forEach((exercise, index) => {
                let isCompleted;

                if (exercise.exerciseType === 'quick_log') {
                    const count =
                        (dailyProgress.quickLogCounts &&
                            dailyProgress.quickLogCounts[exercise.id]) ||
                        0;
                    isCompleted = count > 0;
                } else {
                    isCompleted = dailyProgress.completedExercises.includes(exercise.id);
                }

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
            dailyProgress.quickLogCounts = {
                hip_flexor_quick: 0,
                glute_activation_quick: 0,
                standing_posture_quick: 0,
                seated_clamshells_quick: 0,
            };
            dailyProgress.dailyMetrics = {
                morningStiffness: null,
                hipFlexorTightness: null,
                standingTolerance: null,
                backPain: null,
            };
            saveDailyProgress();
            if (reloadExercises) reloadExercises();
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
    const { total, done } = getCompletionCount();

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
    // Fire confetti
    confetti({
        particleCount: CONFIG.CONFETTI.PARTICLE_COUNT_SIDE,
        spread: CONFIG.CONFETTI.SPREAD_SIDE,
        origin: CONFIG.CONFETTI.ORIGIN_LEFT,
    });
    confetti({
        particleCount: CONFIG.CONFETTI.PARTICLE_COUNT_SIDE,
        spread: CONFIG.CONFETTI.SPREAD_SIDE,
        origin: CONFIG.CONFETTI.ORIGIN_RIGHT,
    });

    setTimeout(() => {
        confetti({
            particleCount: CONFIG.CONFETTI.PARTICLE_COUNT_CENTER,
            spread: CONFIG.CONFETTI.SPREAD_CENTER,
            origin: CONFIG.CONFETTI.ORIGIN_CENTER,
        });
    }, CONFIG.TIMEOUTS.CONFETTI_SEQUENCE);

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
        osc1.frequency.value = CONFIG.AUDIO.FREQUENCY_HIGH;
        gain1.gain.setValueAtTime(CONFIG.AUDIO.GAIN, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(CONFIG.AUDIO.GAIN_RAMP_DOWN, ctx.currentTime + 0.2);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.2);

        // Second tone (E5)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = CONFIG.AUDIO.FREQUENCY_LOW;
        gain2.gain.setValueAtTime(CONFIG.AUDIO.GAIN, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(CONFIG.AUDIO.GAIN_RAMP_DOWN, ctx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.4);

        // Clean up after sound finishes
        setTimeout(() => ctx.close(), CONFIG.TIMEOUTS.CONFETTI_SEQUENCE);
    } catch (_e) {
        // Web Audio not supported — silently ignore
    }
}

// ========== Completion Toast ==========

/** @type {number[]} Indices of recently used messages to avoid repeats */
let usedMessageIndices = [];

/**
 * Pick a random item from an array, avoiding recently used indices.
 * Resets the used pool when all options have been exhausted.
 * @param {string[]} pool - Array of messages to choose from
 * @returns {string} A message that hasn't been shown recently
 */
function pickFreshMessage(pool) {
    // Reset if we've used them all
    if (usedMessageIndices.length >= pool.length) {
        usedMessageIndices = [];
    }
    const available = pool
        .map((msg, i) => ({ msg, i }))
        .filter(({ i }) => !usedMessageIndices.includes(i));
    const pick = available[Math.floor(Math.random() * available.length)];
    usedMessageIndices.push(pick.i);
    return pick.msg;
}

/**
 * Build a contextual motivational message based on the exercise just completed,
 * the number of sets done, exercises remaining, and overall progress.
 * Messages don't repeat until the full pool for a category is exhausted.
 *
 * @param {Object} [exercise] - The exercise that was just completed
 * @returns {string} Encouraging message with emoji
 */
function getCompletionMessage(exercise) {
    const { total, done } = getCompletionCount();
    const remaining = total - done;
    const pct = done / total;
    const data = exercise ? dailyProgress.exerciseData[exercise.id] : null;
    const sets = data ? data.sets : 0;
    const name = exercise ? exercise.name : '';

    // All exercises complete
    if (done === total) {
        return pickFreshMessage([
            'Every single one — crushed it! 🎉',
            "Full session complete! You're unstoppable! 🏆",
            'All done! Your knees thank you! 🦵✨',
            'Perfect session — nothing left behind! 💯',
            "That's the whole list! Champion effort! 🥇",
            'Complete sweep! Recovery is happening! 🌟',
        ]);
    }

    // First exercise of the day
    if (done === 1) {
        const firstMsgs = [
            `${name} done — great way to start! 💪`,
            'First one in the books! Momentum is building! 🚀',
            `Starting strong with ${name}! 💥`,
            "And we're off! The hardest part is starting! 🏁",
            `${name} complete — ${remaining} more to go! 👊`,
            'Day started right! Keep that energy! ⚡',
        ];
        return pickFreshMessage(firstMsgs);
    }

    // High sets (4-5) — acknowledge the effort
    if (sets >= 4) {
        return pickFreshMessage([
            `${sets} sets of ${name}! That's serious work! 🔥`,
            `Maxing out at ${sets} sets — beast mode! 💪`,
            `${sets} sets done! Your dedication shows! 🏋️`,
            `Pushing through ${sets} sets — incredible effort! ⚡`,
            `${name} with ${sets} sets — you mean business! 🎯`,
        ]);
    }

    // Almost done (75%+)
    if (pct >= 0.75) {
        return pickFreshMessage([
            `Only ${remaining} left — you can taste the finish! 🔥`,
            "Home stretch! Don't let up now! 🏃",
            `Just ${remaining} more — the end is in sight! 👀`,
            'So close to a full session! Push through! 💫',
            `Nearly there! ${remaining} to go — finish strong! 🎯`,
            'The final few — this is where champions are made! 🏆',
        ]);
    }

    // Halfway (50%+)
    if (pct >= 0.5) {
        return pickFreshMessage([
            `Past halfway! ${remaining} left — downhill from here! ⚡`,
            "More done than left — you're rolling! 🎢",
            `Over the hump! Just ${remaining} more! 💪`,
            `${done} down, ${remaining} to go — solid pace! 👊`,
            'Halfway hero! Keep this rhythm going! 🥁',
            "The back half begins — you've got this! 🌊",
        ]);
    }

    // Early progress (general)
    return pickFreshMessage([
        `${name} — checked off! ${remaining} remaining! ✅`,
        `Nice work on ${name}! Keep the chain going! 🔗`,
        `${done} done already — building momentum! 🚂`,
        `${name} complete! Every rep counts! 💪`,
        `That's ${done} in the bag — stay locked in! 🎯`,
        'Steady progress! One at a time! 🪜',
        `${remaining} left — you're making it happen! 👊`,
        `Another one down! ${name} is history! 📝`,
    ]);
}

/**
 * Show a brief floating toast with the completion count and motivational message.
 * @param {Object} [exercise] - The exercise that was just completed
 */
function showCompletionToast(exercise) {
    // Remove any existing completion toast
    const existing = document.querySelector('.completion-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'completion-toast';

    const { total, done } = getCompletionCount();
    toast.innerHTML = `<span class="completion-toast-msg">${getCompletionMessage(exercise)}</span><span class="completion-toast-count">${done}/${total}</span>`;

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
    const newVersion = PROGRESS_BAR_VERSION === 'C' ? 'A' : 'C';
    setProgressBarVersion(newVersion);
    safeSetItem('progressBarVersion', newVersion);
    updateProgressBar();
    updateProgressBarToggleBtn();
    const label = newVersion === 'A' ? '📊 Progress Bar' : '⊙ Progress Circles';
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
    const newMode = !darkMode;
    setDarkMode(newMode);
    safeSetItem('darkMode', newMode);
    applyDarkMode();
    updateDarkModeToggleBtn();
    showToast(newMode ? '🌙 Dark Mode ON' : '☀️ Light Mode ON', 'success');
}

/**
 * Apply or remove the dark-mode class on the body element.
 * Also updates the meta theme-color for the browser chrome.
 */
function applyDarkMode() {
    if (darkMode) {
        document.body.classList.add('dark');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#1a1a2e');
    } else {
        document.body.classList.remove('dark');
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

export {
    updateProgressBar,
    scrollToExercise,
    clearDailyProgress,
    checkAllComplete,
    showCelebration,
    hideCelebration,
    playCompletionSound,
    getCompletionMessage,
    showCompletionToast,
    toggleSound,
    updateSoundToggleBtn,
    toggleProgressBar,
    updateProgressBarToggleBtn,
    toggleDarkMode,
    applyDarkMode,
    updateDarkModeToggleBtn,
    setReloadExercises,
};
