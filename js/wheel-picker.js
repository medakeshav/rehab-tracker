/**
 * wheel-picker.js — Apple-style scroll wheel picker component
 *
 * Self-contained component with zero dependencies on other app modules.
 * Creates a vertically-scrolling number picker with scroll-snap behavior,
 * iOS-style highlight band, and fade gradients.
 *
 * Tap-to-activate guard: pickers start locked (no scroll) to prevent
 * accidental value changes during page scroll. Tap the picker to unlock,
 * then scroll to select a value. Tapping outside or scrolling the page
 * re-locks the picker.
 */

/** @constant {number} Height of each picker row in pixels */
const WHEEL_PICKER_ITEM_HEIGHT = 36;

/** @type {HTMLElement|null} Currently active (unlocked) picker container */
let activePicker = null;

/**
 * Lock a picker — disable scrolling and show the locked overlay.
 * @param {HTMLElement} container - The picker container element
 */
function lockPicker(container) {
    container.classList.remove('wheel-picker--active');
    const scroll = container.querySelector('.wheel-picker-scroll');
    if (scroll) scroll.style.overflowY = 'hidden';
    if (activePicker === container) activePicker = null;
}

/**
 * Unlock a picker — enable scrolling and hide the locked overlay.
 * Locks any previously active picker first.
 * @param {HTMLElement} container - The picker container element
 */
function unlockPicker(container) {
    // Lock the previously active picker if different
    if (activePicker && activePicker !== container) {
        lockPicker(activePicker);
    }
    container.classList.add('wheel-picker--active');
    const scroll = container.querySelector('.wheel-picker-scroll');
    if (scroll) scroll.style.overflowY = 'scroll';
    activePicker = container;
}

// Global listener: lock active picker when user taps outside
document.addEventListener('pointerdown', function (e) {
    if (activePicker && !activePicker.contains(e.target)) {
        lockPicker(activePicker);
    }
});

// Lock active picker on page-level scroll only (not picker-internal scroll).
// Use capture phase but check that the scroll target is not inside a picker.
window.addEventListener('scroll', function (e) {
    if (!activePicker) return;
    // Ignore scroll events from within any picker's scroll area
    if (e.target && e.target.closest && e.target.closest('.wheel-picker-container')) return;
    lockPicker(activePicker);
}, true);

/**
 * Create a new wheel picker DOM element.
 *
 * The picker uses CSS scroll-snap for detent behavior and DOM spacer
 * elements (not CSS padding) to allow the first/last items to center
 * in the highlight band.
 *
 * @param {string} id - Unique identifier (used for the hidden input)
 * @param {number} min - Minimum selectable value
 * @param {number} max - Maximum selectable value
 * @param {number} step - Increment between values
 * @param {number} defaultValue - Initial value to scroll to
 * @returns {HTMLElement} The complete picker container element
 */
function createWheelPicker(id, min, max, step, defaultValue) {
    const container = document.createElement('div');
    container.className = 'wheel-picker-container';
    container.setAttribute('data-picker-id', id);

    const scroll = document.createElement('div');
    scroll.className = 'wheel-picker-scroll';
    // Start locked — no scrolling until tapped
    scroll.style.overflowY = 'hidden';

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

    // Invisible tap-guard — covers the picker when locked to intercept taps
    const tapGuard = document.createElement('div');
    tapGuard.className = 'wheel-picker-tap-guard';
    container.appendChild(tapGuard);

    // Hidden input to store the selected value
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = id;
    hidden.value = defaultValue;
    container.appendChild(hidden);

    /**
     * Update visual state of picker items based on scroll position.
     * Calculates which item is centered and applies selected/near classes.
     */
    function updateVisualState() {
        // scrollTop 0 = first item centered (because of 72px spacer element)
        const centerIndex = Math.round(scroll.scrollTop / WHEEL_PICKER_ITEM_HEIGHT);
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
            // Temporarily enable scroll to position, then re-lock
            scroll.style.overflowY = 'scroll';
            const targetIndex = values.indexOf(defaultValue);
            if (targetIndex >= 0) {
                scroll.scrollTop = targetIndex * WHEEL_PICKER_ITEM_HEIGHT;
            }
            updateVisualState();
            scroll.style.overflowY = 'hidden';
        });
    });

    // Real-time scroll handler for smooth opacity transitions
    let rafId = null;
    scroll.addEventListener('scroll', function () {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateVisualState);
    });

    // Tap anywhere on the picker to activate it (guard intercepts when locked)
    tapGuard.addEventListener('pointerdown', function (e) {
        e.stopPropagation();
        unlockPicker(container);
    });

    // Tap the scroll area to toggle: if active, re-lock it (freeze the value)
    let didScroll = false;
    scroll.addEventListener('scroll', function () {
        didScroll = true;
    }, { passive: true });

    scroll.addEventListener('pointerdown', function (e) {
        if (!container.classList.contains('wheel-picker--active')) return;
        didScroll = false;
        // On pointerup, if user tapped without scrolling, lock the picker
        function onUp() {
            scroll.removeEventListener('pointerup', onUp);
            scroll.removeEventListener('pointercancel', onUp);
            if (!didScroll) {
                e.stopPropagation();
                lockPicker(container);
            }
        }
        scroll.addEventListener('pointerup', onUp);
        scroll.addEventListener('pointercancel', onUp);
    });

    // Allow clicking an item to scroll it to center (only when active)
    scroll.addEventListener('click', function (e) {
        if (!container.classList.contains('wheel-picker--active')) return;
        const item = e.target.closest('.wheel-picker-item');
        if (item && item.hasAttribute('data-value')) {
            const val = parseInt(item.getAttribute('data-value'));
            const targetIndex = values.indexOf(val);
            if (targetIndex >= 0) {
                scroll.scrollTo({ top: targetIndex * WHEEL_PICKER_ITEM_HEIGHT, behavior: 'smooth' });
            }
        }
    });

    return container;
}

/**
 * Read the current value from a wheel picker by its hidden input ID.
 * @param {string} id - The picker's hidden input ID
 * @returns {number} Current selected value, or 0 if not found
 */
function getPickerValue(id) {
    const hidden = document.getElementById(id);
    return hidden ? parseInt(hidden.value) || 0 : 0;
}

/**
 * Programmatically set a wheel picker's value and scroll to it.
 * @param {string} id - The picker's hidden input ID
 * @param {number} value - The value to select
 */
function setPickerValue(id, value) {
    const container = document.querySelector(`[data-picker-id="${id}"]`);
    if (!container) return;
    const hidden = container.querySelector('input[type="hidden"]');
    const scroll = container.querySelector('.wheel-picker-scroll');
    if (hidden) hidden.value = value;
    if (scroll) {
        // Temporarily enable scroll to set position (picker may be locked)
        const wasLocked = scroll.style.overflowY === 'hidden';
        if (wasLocked) scroll.style.overflowY = 'scroll';
        const items = scroll.querySelectorAll('.wheel-picker-item');
        items.forEach((item, i) => {
            const itemVal = parseInt(item.getAttribute('data-value'));
            item.classList.remove('selected', 'near');
            if (itemVal === value) {
                scroll.scrollTop = i * WHEEL_PICKER_ITEM_HEIGHT;
                item.classList.add('selected');
            }
        });
        if (wasLocked) scroll.style.overflowY = 'hidden';
    }
}

export { WHEEL_PICKER_ITEM_HEIGHT, createWheelPicker, getPickerValue, setPickerValue };
