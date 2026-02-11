// Rehab Tracker App - Main JavaScript

// State Management
let currentPhase = parseInt(localStorage.getItem('currentPhase')) || 1;
let workoutData = JSON.parse(localStorage.getItem('workoutData')) || [];
let weeklyData = JSON.parse(localStorage.getItem('weeklyData')) || [];
let monthlyData = JSON.parse(localStorage.getItem('monthlyData')) || [];

// Progress Bar Version: 'A' = sticky top bar, 'C' = mini thumbnail circles
const PROGRESS_BAR_VERSION = 'C';

// Daily Progress State (completion tracking + input values)
let dailyProgress = loadDailyProgress();

function loadDailyProgress() {
    const stored = localStorage.getItem('rehabDailyProgress');
    if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        if (data.date === today) {
            return data;
        }
    }
    return createFreshProgress();
}

function createFreshProgress() {
    return {
        date: new Date().toISOString().split('T')[0],
        completedExercises: [],
        exerciseData: {},
        soundEnabled: true,
    };
}

function saveDailyProgress() {
    localStorage.setItem('rehabDailyProgress', JSON.stringify(dailyProgress));
}

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
    initSwipeBack();
    updateStats();
});

function initializeApp() {
    // Set current date
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    document.getElementById('currentDate').textContent = today;

    // Set workout date to today
    document.getElementById('workoutDate').valueAsDate = new Date();

    // Load current phase
    updatePhaseInfo();
    loadExercises();

    // Update sound toggle button state
    updateSoundToggleBtn();
}

function setupEventListeners() {
    // Menu functionality
    document.getElementById('menuBtn').addEventListener('click', openMenu);
    document.getElementById('closeMenuBtn').addEventListener('click', closeMenu);

    // Overlay click
    document.addEventListener('click', function (e) {
        const sideMenu = document.getElementById('sideMenu');
        const menuBtn = document.getElementById('menuBtn');
        if (!sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMenu();
        }
    });

    // Pain slider listeners
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

// Navigation Functions
let screenHistory = ['home'];

function openMenu() {
    document.getElementById('sideMenu').classList.add('active');
}

function closeMenu() {
    document.getElementById('sideMenu').classList.remove('active');
}

function showScreen(screenName, useSlideBack) {
    const currentScreen = document.querySelector('.screen.active');
    const targetScreen = document.getElementById(screenName + 'Screen');
    if (!targetScreen || targetScreen === currentScreen) return;

    if (useSlideBack && currentScreen) {
        // iOS-style slide-back animation
        currentScreen.classList.remove('active');
        currentScreen.classList.add('swipe-leaving');
        targetScreen.classList.add('swipe-entering');

        // After animation completes, clean up classes
        setTimeout(() => {
            currentScreen.classList.remove('swipe-leaving');
            targetScreen.classList.remove('swipe-entering');
            targetScreen.classList.add('active');
        }, 300);
    } else {
        // Normal instant switch
        document.querySelectorAll('.screen').forEach((screen) => {
            screen.classList.remove('active', 'swipe-leaving', 'swipe-entering');
        });
        targetScreen.classList.add('active');
    }

    // Track navigation history
    if (screenName === 'home') {
        screenHistory = ['home'];
    } else {
        screenHistory.push(screenName);
    }

    // Special actions for certain screens
    if (screenName === 'history') {
        loadHistory('workouts');
    }

    closeMenu();
}

function goBack() {
    // Pop current screen, go to previous (or home)
    if (screenHistory.length > 1) {
        screenHistory.pop();
    }
    const prevScreen = screenHistory[screenHistory.length - 1] || 'home';
    showScreen(prevScreen, true);
}

// ========== Swipe-Back Gesture (iOS-style) ==========

function initSwipeBack() {
    const container = document.getElementById('mainContainer');
    if (!container) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchCurrentX = 0;
    let isSwiping = false;
    let swipeLocked = false; // once we decide swipe vs scroll, lock it

    const EDGE_ZONE = 40; // px from left edge to start swipe
    const SWIPE_THRESHOLD = 80; // px to trigger back navigation
    const ANGLE_THRESHOLD = 30; // max degrees from horizontal

    container.addEventListener(
        'touchstart',
        function (e) {
            const touch = e.touches[0];
            // Only start if touch begins near left edge
            if (touch.clientX > EDGE_ZONE) return;

            // Don't swipe on home screen
            const activeScreen = document.querySelector('.screen.active');
            if (!activeScreen || activeScreen.id === 'homeScreen') return;

            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchCurrentX = touch.clientX;
            isSwiping = false;
            swipeLocked = false;
        },
        { passive: true }
    );

    container.addEventListener(
        'touchmove',
        function (e) {
            if (touchStartX === 0 && !isSwiping) return;

            const touch = e.touches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;

            // Once locked, don't re-evaluate
            if (!swipeLocked) {
                // Need some movement before deciding
                if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

                const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
                if (angle > ANGLE_THRESHOLD && angle < 180 - ANGLE_THRESHOLD) {
                    // Vertical scroll — abort swipe
                    touchStartX = 0;
                    swipeLocked = true;
                    return;
                }
                // Horizontal and going right — it's a swipe
                if (dx > 0) {
                    isSwiping = true;
                    swipeLocked = true;
                } else {
                    touchStartX = 0;
                    swipeLocked = true;
                    return;
                }
            }

            if (!isSwiping) return;

            touchCurrentX = touch.clientX;
            const offset = Math.max(0, touchCurrentX - touchStartX);

            // Live drag the active screen
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen) {
                activeScreen.style.transform = `translateX(${offset}px)`;
                activeScreen.style.transition = 'none';
                // Dim slightly as it drags
                activeScreen.style.opacity = Math.max(0.5, 1 - (offset / window.innerWidth) * 0.5);
            }
        },
        { passive: true }
    );

    container.addEventListener(
        'touchend',
        function (e) {
            if (!isSwiping) {
                touchStartX = 0;
                return;
            }

            const offset = touchCurrentX - touchStartX;
            const activeScreen = document.querySelector('.screen.active');

            if (activeScreen) {
                // Reset inline styles
                activeScreen.style.transform = '';
                activeScreen.style.transition = '';
                activeScreen.style.opacity = '';
            }

            if (offset >= SWIPE_THRESHOLD) {
                // Trigger back navigation with slide animation
                goBack();
            }

            // Reset state
            touchStartX = 0;
            touchCurrentX = 0;
            isSwiping = false;
            swipeLocked = false;
        },
        { passive: true }
    );

    container.addEventListener(
        'touchcancel',
        function () {
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen) {
                activeScreen.style.transform = '';
                activeScreen.style.transition = '';
                activeScreen.style.opacity = '';
            }
            touchStartX = 0;
            touchCurrentX = 0;
            isSwiping = false;
            swipeLocked = false;
        },
        { passive: true }
    );
}

// Phase Management
function selectPhase(phase) {
    currentPhase = phase;
    localStorage.setItem('currentPhase', phase);
    updatePhaseInfo();
    loadExercises();
    showScreen('daily');
    showToast('Phase ' + phase + ' selected!', 'success');
}

function updatePhaseInfo() {
    const phaseNames = {
        1: 'Phase 1: Foundation (Weeks 1-8)',
        2: 'Phase 2: Functional Strength (Weeks 9-20)',
        3: 'Phase 3: Advanced (Week 21+)',
    };
    document.getElementById('currentPhaseText').textContent = phaseNames[currentPhase];
}

// Exercise Loading
function loadExercises() {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';

    const phaseExercises = getExercisesForPhase(currentPhase);

    phaseExercises.forEach((exercise, index) => {
        const isCompleted = dailyProgress.completedExercises.includes(exercise.id);

        if (isCompleted) {
            // Render shrunken completed card directly
            const card = createCompletedCard(exercise);
            exerciseList.appendChild(card);
        } else {
            const card = createExerciseCard(exercise, index);
            exerciseList.appendChild(card);
            // Restore saved input values
            restoreExerciseData(exercise);
        }
    });

    // Update progress bar after loading exercises
    updateProgressBar();
}

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

    // Click to expand — expandCard rebuilds the full card from scratch
    card.addEventListener('click', function (e) {
        expandCard(card, exercise);
    });

    return card;
}

function createExerciseCard(exercise, index) {
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

    // Add pain slider listener with scroll protection
    const painSlider = card.querySelector(`#pain_${exercise.id}`);
    const painValue = card.querySelector(`#pain_value_${exercise.id}`);

    let isSliding = false;

    // Start sliding only on deliberate touch/click
    painSlider.addEventListener(
        'touchstart',
        function (e) {
            isSliding = true;
            e.stopPropagation();
        },
        { passive: false }
    );

    painSlider.addEventListener('mousedown', function (e) {
        isSliding = true;
        e.stopPropagation();
    });

    // Update value during slide
    painSlider.addEventListener('input', function () {
        if (isSliding) {
            painValue.textContent = this.value;
            updatePainColor(painValue, this.value);
        }
    });

    // Change event for final value
    painSlider.addEventListener('change', function () {
        painValue.textContent = this.value;
        updatePainColor(painValue, this.value);
        isSliding = false;
    });

    // Reset sliding state
    painSlider.addEventListener('touchend', function () {
        isSliding = false;
    });

    painSlider.addEventListener('mouseup', function () {
        isSliding = false;
    });

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

function updatePainColor(element, value) {
    if (value >= 7) {
        element.style.background = 'var(--danger-color)';
    } else if (value >= 4) {
        element.style.background = 'var(--warning-color)';
    } else {
        element.style.background = 'var(--primary-color)';
    }
}

// ========== Completion Feedback (Sound + Toast) ==========

function playCompletionSound() {
    if (!dailyProgress.soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        // First tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.value = 523; // C5
        gain1.gain.setValueAtTime(0.3, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.2);

        // Second tone (higher)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 659; // E5
        gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.4);

        // Clean up after sound finishes
        setTimeout(() => ctx.close(), 500);
    } catch (e) {
        // Web Audio not supported — silently ignore
    }
}

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

function toggleSound() {
    dailyProgress.soundEnabled = !dailyProgress.soundEnabled;
    saveDailyProgress();
    updateSoundToggleBtn();
    showToast(dailyProgress.soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF', 'success');
}

function updateSoundToggleBtn() {
    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
        btn.textContent = dailyProgress.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    }
}

// ========== Apple-Style Wheel Picker ==========

function createWheelPicker(id, min, max, step, defaultValue) {
    const ITEM_HEIGHT = 36;

    const container = document.createElement('div');
    container.className = 'wheel-picker-container';
    container.setAttribute('data-picker-id', id);

    const scroll = document.createElement('div');
    scroll.className = 'wheel-picker-scroll';

    // Top spacer — allows first item to scroll to center
    const topSpacer = document.createElement('div');
    topSpacer.className = 'wheel-picker-spacer';
    scroll.appendChild(topSpacer);

    const values = [];
    const valueItems = [];
    for (let v = min; v <= max; v += step) {
        values.push(v);
        const item = document.createElement('div');
        item.className = 'wheel-picker-item';
        item.setAttribute('data-value', v);
        item.textContent = v;
        scroll.appendChild(item);
        valueItems.push(item);
    }

    // Bottom spacer — allows last item to scroll to center
    const bottomSpacer = document.createElement('div');
    bottomSpacer.className = 'wheel-picker-spacer';
    scroll.appendChild(bottomSpacer);

    container.appendChild(scroll);

    // Highlight band (iOS-style separator lines around center row)
    const highlight = document.createElement('div');
    highlight.className = 'wheel-picker-highlight';
    container.appendChild(highlight);

    // Hidden input to store the value
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = id;
    hidden.value = defaultValue;
    container.appendChild(hidden);

    // Apply visual classes based on proximity to center
    function updateVisualState() {
        // scrollTop 0 = first item centered (because of 72px spacer element)
        const centerIndex = Math.round(scroll.scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(centerIndex, values.length - 1));
        hidden.value = values[clampedIndex];

        valueItems.forEach((item, i) => {
            const dist = Math.abs(i - clampedIndex);
            item.classList.toggle('selected', dist === 0);
            item.classList.toggle('near', dist === 1);
        });
    }

    // Scroll to default value after render (double rAF ensures layout is complete)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const targetIndex = values.indexOf(defaultValue);
            if (targetIndex >= 0) {
                scroll.scrollTop = targetIndex * ITEM_HEIGHT;
            }
            updateVisualState();
        });
    });

    // Real-time scroll handler for smooth opacity transitions
    let rafId = null;
    scroll.addEventListener('scroll', function () {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateVisualState);
    });

    // Allow clicking an item to scroll it to center
    scroll.addEventListener('click', function (e) {
        const item = e.target.closest('.wheel-picker-item');
        if (item && item.hasAttribute('data-value')) {
            const val = parseInt(item.getAttribute('data-value'));
            const targetIndex = values.indexOf(val);
            if (targetIndex >= 0) {
                scroll.scrollTo({ top: targetIndex * ITEM_HEIGHT, behavior: 'smooth' });
            }
        }
    });

    return container;
}

function getPickerValue(id) {
    const hidden = document.getElementById(id);
    return hidden ? parseInt(hidden.value) || 0 : 0;
}

function setPickerValue(id, value) {
    const container = document.querySelector(`[data-picker-id="${id}"]`);
    if (!container) return;
    const hidden = container.querySelector('input[type="hidden"]');
    const scroll = container.querySelector('.wheel-picker-scroll');
    if (hidden) hidden.value = value;
    if (scroll) {
        const ITEM_HEIGHT = 36;
        const items = scroll.querySelectorAll('.wheel-picker-item');
        items.forEach((item, i) => {
            const itemVal = parseInt(item.getAttribute('data-value'));
            item.classList.remove('selected', 'near');
            if (itemVal === value) {
                scroll.scrollTop = i * ITEM_HEIGHT;
                item.classList.add('selected');
            }
        });
    }
}

// ========== Progress Bar & Clear Progress ==========

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

function checkAllComplete() {
    const total = getExercisesForPhase(currentPhase).length;
    const done = dailyProgress.completedExercises.length;

    if (done >= total && total > 0) {
        showCelebration();
    } else {
        hideCelebration();
    }
}

function showCelebration() {
    // Fire confetti if available
    if (typeof confetti === 'function') {
        // Burst from both sides
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { x: 0.2, y: 0.6 },
        });
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { x: 0.8, y: 0.6 },
        });

        // Second wave after a short delay
        setTimeout(() => {
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 50,
                    spread: 100,
                    origin: { x: 0.5, y: 0.4 },
                });
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

function hideCelebration() {
    const banner = document.getElementById('celebrationBanner');
    if (banner) {
        banner.remove();
    }
}

// ========== Exercise Completion System ==========

function captureExerciseData(exerciseId) {
    const left = getPickerValue(`left_${exerciseId}`);
    const right = getPickerValue(`right_${exerciseId}`);
    const sets = getPickerValue(`sets_${exerciseId}`);
    const painEl = document.getElementById(`pain_${exerciseId}`);
    const notesEl = document.getElementById(`notes_${exerciseId}`);

    dailyProgress.exerciseData[exerciseId] = {
        left: left,
        right: right,
        sets: sets,
        pain: painEl ? parseInt(painEl.value) || 0 : 0,
        notes: notesEl ? notesEl.value || '' : '',
    };
    saveDailyProgress();
}

function restoreExerciseData(exercise) {
    const data = dailyProgress.exerciseData[exercise.id];
    if (!data) return;

    if (data.left) setPickerValue(`left_${exercise.id}`, data.left);
    if (data.right) setPickerValue(`right_${exercise.id}`, data.right);
    if (data.sets) setPickerValue(`sets_${exercise.id}`, data.sets);

    const painEl = document.getElementById(`pain_${exercise.id}`);
    const painValue = document.getElementById(`pain_value_${exercise.id}`);
    if (painEl && data.pain !== undefined) {
        painEl.value = data.pain;
        if (painValue) {
            painValue.textContent = data.pain;
            updatePainColor(painValue, data.pain);
        }
    }

    const notesEl = document.getElementById(`notes_${exercise.id}`);
    if (notesEl && data.notes) notesEl.value = data.notes;
}

function reattachCardListeners(card, exercise) {
    const painSlider = card.querySelector(`#pain_${exercise.id}`);
    const painValue = card.querySelector(`#pain_value_${exercise.id}`);

    if (painSlider && painValue) {
        let isSliding = false;

        painSlider.addEventListener(
            'touchstart',
            function (e) {
                isSliding = true;
                e.stopPropagation();
            },
            { passive: false }
        );

        painSlider.addEventListener('mousedown', function (e) {
            isSliding = true;
            e.stopPropagation();
        });

        painSlider.addEventListener('input', function () {
            if (isSliding) {
                painValue.textContent = this.value;
                updatePainColor(painValue, this.value);
            }
        });

        painSlider.addEventListener('change', function () {
            painValue.textContent = this.value;
            updatePainColor(painValue, this.value);
            isSliding = false;
        });

        painSlider.addEventListener('touchend', function () {
            isSliding = false;
        });
        painSlider.addEventListener('mouseup', function () {
            isSliding = false;
        });
    }

    const infoBtn = card.querySelector(`#info_${exercise.id}`);
    if (exercise.instructions && infoBtn) {
        infoBtn.addEventListener('click', function (e) {
            e.preventDefault();
            showInstructions(exercise);
        });
    }

    // Re-attach Mark Complete button handler
    const completeBtn = card.querySelector(`#complete_${exercise.id}`);
    if (completeBtn) {
        completeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            collapseCard(card, exercise);
        });
    }
}

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
        card.addEventListener('click', function onExpand(e) {
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

// Close instructions modal and restore scroll
function closeInstructionsModal(el) {
    const modal = el.closest('.instructions-modal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = '';
}

// Show Exercise Instructions Modal
function showInstructions(exercise) {
    if (!exercise.instructions) {
        showToast('No instructions available', 'info');
        return;
    }

    const instr = exercise.instructions;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'instructions-modal';
    modal.innerHTML = `
        <div class="instructions-content">
            <div class="instructions-header">
                <h2>${instr.title}</h2>
                <button class="close-btn" onclick="closeInstructionsModal(this)">×</button>
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
                <button class="btn btn-primary" onclick="closeInstructionsModal(this)">Got It!</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Prevent background scroll
    document.body.style.overflow = 'hidden';

    // Close on backdrop click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}

// Save Workout
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
            // Card is collapsed — read from dailyProgress
            leftReps = savedData.left;
            rightReps = savedData.right;
            sets = savedData.sets;
            pain = savedData.pain;
            notes = savedData.notes;
        } else if (savedData) {
            // Card expanded but has auto-saved data
            leftReps = savedData.left;
            rightReps = savedData.right;
            sets = savedData.sets;
            pain = savedData.pain;
            notes = savedData.notes;
        } else {
            // Card is still expanded — read from picker/DOM
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
    localStorage.setItem('workoutData', JSON.stringify(workoutData));

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

// Weekly Assessment
function saveWeeklyAssessment(e) {
    e.preventDefault();

    const assessment = {
        week: document.getElementById('weekNumber').value,
        date: document.getElementById('weeklyDate').value,
        standLeft: document.getElementById('standLeft').value,
        standRight: document.getElementById('standRight').value,
        bridgeLeft: document.getElementById('bridgeLeft').value,
        bridgeRight: document.getElementById('bridgeRight').value,
        reachLeft: document.getElementById('reachLeft').value,
        reachRight: document.getElementById('reachRight').value,
        kneePain: document.getElementById('kneePain').value,
        backPain: document.getElementById('backPain').value,
        footPain: document.getElementById('footPain').value,
        notes: document.getElementById('weeklyNotes').value,
    };

    weeklyData.push(assessment);
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));

    showToast('✓ Weekly assessment saved!', 'success');

    setTimeout(() => {
        document.getElementById('weeklyForm').reset();
        document.getElementById('weekNumber').value = calculateCurrentWeek() + 1;
        showScreen('home');
    }, 1500);
}

// Monthly Assessment
function saveMonthlyAssessment(e) {
    e.preventDefault();

    const assessment = {
        month: document.getElementById('monthNumber').value,
        date: document.getElementById('monthlyDate').value,
        calfRight: document.getElementById('calfRight').value,
        calfLeft: document.getElementById('calfLeft').value,
        thighRight: document.getElementById('thighRight').value,
        thighLeft: document.getElementById('thighLeft').value,
        photosTaken: document.getElementById('photosTaken').checked,
        videoTaken: document.getElementById('videoTaken').checked,
        phase: document.getElementById('monthlyPhase').value,
        readyNextPhase: document.getElementById('readyNextPhase').checked,
        notes: document.getElementById('monthlyNotes').value,
    };

    monthlyData.push(assessment);
    localStorage.setItem('monthlyData', JSON.stringify(monthlyData));

    showToast('✓ Monthly assessment saved!', 'success');

    setTimeout(() => {
        document.getElementById('monthlyForm').reset();
        document.getElementById('monthNumber').value = Math.ceil(calculateCurrentWeek() / 4) + 1;
        showScreen('home');
    }, 1500);
}

// History Management
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

// Export Data
function exportAllData() {
    if (workoutData.length === 0 && weeklyData.length === 0 && monthlyData.length === 0) {
        showToast('No data to export', 'error');
        return;
    }

    // Export workouts
    if (workoutData.length > 0) {
        exportWorkoutsCSV();
    }

    // Export weekly assessments
    if (weeklyData.length > 0) {
        exportWeeklyCSV();
    }

    // Export monthly assessments
    if (monthlyData.length > 0) {
        exportMonthlyCSV();
    }

    showToast('✓ Data exported successfully!', 'success');
}

function exportWorkoutsCSV() {
    let csv = 'Date,Phase,Exercise,Left Reps,Right Reps,Sets,Pain Level,Notes\n';

    workoutData.forEach((workout) => {
        workout.exercises.forEach((ex) => {
            csv += `${workout.date},${workout.phase},"${ex.name}",${ex.leftReps},${ex.rightReps},${ex.sets},${ex.pain},"${ex.notes}"\n`;
        });
    });

    downloadCSV(csv, 'rehab_workouts.csv');
}

function exportWeeklyCSV() {
    let csv =
        'Week,Date,Stand Left,Stand Right,Bridge Left,Bridge Right,Reach Left,Reach Right,Knee Pain,Back Pain,Foot Pain,Notes\n';

    weeklyData.forEach((week) => {
        csv += `${week.week},${week.date},${week.standLeft},${week.standRight},${week.bridgeLeft},${week.bridgeRight},${week.reachLeft},${week.reachRight},${week.kneePain},${week.backPain},${week.footPain},"${week.notes}"\n`;
    });

    downloadCSV(csv, 'rehab_weekly_assessments.csv');
}

function exportMonthlyCSV() {
    let csv =
        'Month,Date,Calf Right,Calf Left,Thigh Right,Thigh Left,Photos,Video,Phase,Ready Next Phase,Notes\n';

    monthlyData.forEach((month) => {
        csv += `${month.month},${month.date},${month.calfRight},${month.calfLeft},${month.thighRight},${month.thighLeft},${month.photosTaken},${month.videoTaken},${month.phase},${month.readyNextPhase},"${month.notes}"\n`;
    });

    downloadCSV(csv, 'rehab_monthly_assessments.csv');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Clear Data
function clearAllData() {
    showConfirmDialog(
        'Delete All Data',
        '⚠️ This will permanently delete all workouts, assessments, and progress. This cannot be undone.',
        'Delete Everything',
        function () {
            localStorage.clear();
            workoutData = [];
            weeklyData = [];
            monthlyData = [];
            currentPhase = 1;
            showToast('All data cleared', 'success');
            updateStats();
            showScreen('home');
        },
        true // destructive
    );
}

// Statistics
function updateStats() {
    document.getElementById('totalWorkouts').textContent = workoutData.length;
    document.getElementById('currentStreak').textContent = calculateStreak();
    document.getElementById('currentWeek').textContent = calculateCurrentWeek();
}

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

function calculateCurrentWeek() {
    if (workoutData.length === 0) return 1;

    const firstWorkout = new Date(workoutData[0].date);
    const today = new Date();
    const daysDiff = Math.floor((today - firstWorkout) / (1000 * 60 * 60 * 24));
    return Math.floor(daysDiff / 7) + 1;
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calculateAvgPain(exercises) {
    if (exercises.length === 0) return '0/10';
    const total = exercises.reduce((sum, ex) => sum + ex.pain, 0);
    const avg = (total / exercises.length).toFixed(1);
    return `${avg}/10`;
}

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

// Auto-save daily progress on page close/tab switch
function autoSaveDailyProgress() {
    const phaseExercises = getExercisesForPhase(currentPhase);
    phaseExercises.forEach((exercise) => {
        // Only capture from DOM if the card is expanded (not collapsed)
        if (!dailyProgress.completedExercises.includes(exercise.id)) {
            const left = getPickerValue(`left_${exercise.id}`);
            const right = getPickerValue(`right_${exercise.id}`);
            const sets = getPickerValue(`sets_${exercise.id}`);
            const painEl = document.getElementById(`pain_${exercise.id}`);
            const notesEl = document.getElementById(`notes_${exercise.id}`);

            // Only save if picker exists (card is in DOM)
            if (document.getElementById(`left_${exercise.id}`)) {
                dailyProgress.exerciseData[exercise.id] = {
                    left: left,
                    right: right,
                    sets: sets,
                    pain: painEl ? parseInt(painEl.value) || 0 : 0,
                    notes: notesEl ? notesEl.value || '' : '',
                };
            }
        }
    });
    saveDailyProgress();
}

window.addEventListener('beforeunload', autoSaveDailyProgress);
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
        autoSaveDailyProgress();
    }
});

// Service Worker Registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('sw.js')
            .then((reg) => console.log('Service Worker registered'))
            .catch((err) => console.log('Service Worker registration failed'));
    });
}
