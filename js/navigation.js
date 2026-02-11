/**
 * navigation.js — Screen navigation, side menu, and swipe-back gesture
 *
 * Manages screen transitions (with optional slide-back animation),
 * the hamburger side menu, and iOS-style edge swipe to go back.
 */

// ========== Navigation State ==========

/** @type {string[]} Stack of visited screen names for back navigation */
let screenHistory = ['home'];

/** @type {Function|null} Callback to load history screen data (set by app.js to avoid circular import) */
let onHistoryScreen = null;

/**
 * Register a callback to be called when navigating to the history screen.
 * @param {Function} fn - callback that receives no arguments
 */
function setOnHistoryScreen(fn) {
    onHistoryScreen = fn;
}

// ========== Side Menu ==========

/** Open the side navigation menu. */
function openMenu() {
    document.getElementById('sideMenu').classList.add('active');
}

/** Close the side navigation menu. */
function closeMenu() {
    document.getElementById('sideMenu').classList.remove('active');
}

// ========== Screen Switching ==========

/**
 * Navigate to a screen by name.
 *
 * @param {string} screenName - Screen identifier (matches `id` without "Screen" suffix)
 * @param {boolean} [useSlideBack=false] - If true, use iOS-style slide-back animation
 */
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
    if (screenName === 'history' && onHistoryScreen) {
        onHistoryScreen();
    }

    closeMenu();
}

/**
 * Navigate back to the previous screen using slide-back animation.
 */
function goBack() {
    if (screenHistory.length > 1) {
        screenHistory.pop();
    }
    const prevScreen = screenHistory[screenHistory.length - 1] || 'home';
    showScreen(prevScreen, true);
}

// ========== Swipe-Back Gesture (iOS-style) ==========

/**
 * Initialize edge-swipe-to-go-back gesture on the main container.
 * Detects a right-swipe starting near the left edge of the screen
 * and triggers goBack() when the swipe exceeds a threshold.
 */
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
        function (_e) {
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

export { openMenu, closeMenu, showScreen, goBack, initSwipeBack, setOnHistoryScreen };
