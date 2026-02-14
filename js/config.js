/**
 * config.js — Application configuration constants
 *
 * Centralized configuration for magic numbers, thresholds, and settings
 * used throughout the application.
 */

export const CONFIG = {
    // ========== Timeouts & Durations ==========
    TIMEOUTS: {
        /** Animation duration for screen transitions */
        SCREEN_TRANSITION: 300,
        /** Delay before hiding celebration banner */
        CELEBRATION_BANNER: 450,
        /** Delay for confetti burst sequence */
        CONFETTI_SEQUENCE: 500,
        /** Toast notification display duration */
        TOAST: 3000,
        /** Navigation delay after save */
        NAVIGATION_DELAY: 1500,
        /** Scroll animation duration */
        SCROLL_ANIMATION: 1000,
        /** Short feedback delay */
        SHORT_FEEDBACK: 1200,
        /** Badge toast duration */
        BADGE_TOAST: 3500,
    },

    // ========== Audio Settings ==========
    AUDIO: {
        /** First note frequency (Hz) */
        FREQUENCY_HIGH: 523,
        /** Second note frequency (Hz) */
        FREQUENCY_LOW: 659,
        /** Audio gain (volume) */
        GAIN: 0.3,
        /** Gain ramp-down target */
        GAIN_RAMP_DOWN: 0.01,
        /** Note duration (ms) */
        NOTE_DURATION: 400,
    },

    // ========== Timer Settings ==========
    TIMER: {
        /** Timer completion beep frequency (Hz) */
        BEEP_FREQUENCY: 880,
        /** Timer beep duration (seconds) */
        BEEP_DURATION: 0.3,
        /** Timer beep gain */
        BEEP_GAIN: 0.4,
        /** Vibration pattern on timer complete (ms) */
        VIBRATION_PATTERN: [200, 100, 200],
        /** Countdown interval (ms) */
        COUNTDOWN_INTERVAL: 1000,
        /** Warning threshold (seconds remaining) */
        WARNING_THRESHOLD: 5,
    },

    // ========== Pain Thresholds ==========
    PAIN: {
        /** Pain scale minimum */
        MIN: 0,
        /** Pain scale maximum */
        MAX: 10,
        /** Pain-free threshold (0-3 is normal discomfort) */
        PAIN_FREE_THRESHOLD: 3,
        /** Moderate pain threshold (4-6 requires caution) */
        MODERATE_THRESHOLD: 4,
        /** High pain threshold (7+ requires stopping) */
        HIGH_THRESHOLD: 7,
        /** Injury grace threshold */
        INJURY_GRACE_THRESHOLD: 6,
        /** Recovery grace threshold */
        RECOVERY_THRESHOLD: 2,
    },

    // ========== Streak Thresholds ==========
    STREAK: {
        /** Maximum rest days per week before streak breaks */
        MAX_REST_DAYS_PER_WEEK: 2,
        /** Maximum gap days allowed (injury grace) */
        MAX_GAP_DAYS: 2,
        /** Days in a week */
        DAYS_IN_WEEK: 7,
        /** Milestone thresholds for badges */
        MILESTONES: [3, 7, 14, 30, 60, 100],
    },

    // ========== Rest Days ==========
    REST_DAYS: {
        /** Suggested rest days (JS day-of-week: 0=Sun, 3=Wed) */
        SUGGESTED: [0, 3],
        /** Labels for suggested rest days */
        LABELS: { 0: 'Sunday', 3: 'Wednesday' },
    },

    // ========== Badge Thresholds ==========
    BADGES: {
        /** Total exercise count thresholds */
        EXERCISE_TOTALS: [10, 50, 100, 200, 300],
        /** Muscle group exercise thresholds */
        MUSCLE_GROUP_TIERS: [10, 50, 100],
    },

    // ========== UI Measurements ==========
    UI: {
        /** Wheel picker item height (px) */
        PICKER_ITEM_HEIGHT: 36,
        /** Swipe threshold distance (px) */
        SWIPE_THRESHOLD: 100,
        /** Swipe angle threshold (degrees) */
        SWIPE_ANGLE_THRESHOLD: 35,
        /** Minimum movement to detect swipe (px) */
        SWIPE_MIN_MOVEMENT: 15,
        /** Scroll threshold for scroll-to-top button (%) */
        SCROLL_THRESHOLD_PERCENT: 0.25,
        /** Sets options for radio buttons */
        SETS_OPTIONS: [1, 2, 3, 4, 5],
    },

    // ========== Confetti Settings ==========
    CONFETTI: {
        /** Particle count for side bursts */
        PARTICLE_COUNT_SIDE: 80,
        /** Particle count for center burst */
        PARTICLE_COUNT_CENTER: 50,
        /** Spread angle for side bursts */
        SPREAD_SIDE: 70,
        /** Spread angle for center burst */
        SPREAD_CENTER: 100,
        /** Origin positions */
        ORIGIN_LEFT: { x: 0.2, y: 0.6 },
        ORIGIN_RIGHT: { x: 0.8, y: 0.6 },
        ORIGIN_CENTER: { x: 0.5, y: 0.4 },
    },

    // ========== Progress Thresholds ==========
    PROGRESS: {
        /** Threshold for "almost done" messages */
        ALMOST_DONE_THRESHOLD: 0.75,
        /** Threshold for "halfway" messages */
        HALFWAY_THRESHOLD: 0.5,
    },

    // ========== Analytics ==========
    ANALYTICS: {
        /** Default date range (days) */
        DEFAULT_RANGE: 30,
        /** Available date ranges */
        RANGES: [30, 90, Infinity],
    },

    // ========== Default Values ==========
    DEFAULTS: {
        /** Default phase */
        PHASE: 1,
        /** Default progress bar version */
        PROGRESS_BAR_VERSION: 'C',
        /** Default dark mode state */
        DARK_MODE: false,
        /** Default balance level */
        BALANCE_LEVEL: 1,
    },

    // ========== Daily Metrics ==========
    METRICS: {
        /** Metric definitions */
        MORNING: [
            { key: 'morningStiffness', label: 'Morning Stiffness', min: 0, max: 10, unit: '/10' },
            {
                key: 'hipFlexorTightness',
                label: 'Hip Flexor Tightness',
                min: 0,
                max: 10,
                unit: '/10',
            },
        ],
        EVENING: [
            {
                key: 'standingTolerance',
                label: 'Standing Tolerance',
                min: 0,
                max: 60,
                unit: ' min',
            },
            { key: 'backPain', label: 'Back Pain (End of Day)', min: 0, max: 10, unit: '/10' },
        ],
    },

    // ========== CSV Export ==========
    CSV: {
        /** CSV file names */
        FILENAMES: {
            WORKOUTS: 'rehab_workouts.csv',
            WEEKLY: 'rehab_weekly_assessments.csv',
            MONTHLY: 'rehab_monthly_assessments.csv',
        },
    },

    // ========== Date Formats ==========
    DATE: {
        /** Locale for date formatting */
        LOCALE: 'en-US',
        /** Month names for short formatting */
        MONTHS_SHORT: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ],
    },
};

/**
 * Category color mapping for exercise cards.
 * Updated for v2 time-block-based categories.
 */
export const CATEGORY_COLORS = {
    'Foot & Ankle': '#4472c4',
    'Hip & Glute': '#e67e22',
    'Hip Flexor': '#e74c3c',
    'Glute Med': '#e67e22',
    Hamstring: '#d35400',
    Core: '#8e44ad',
    Mobility: '#3498db',
    Balance: '#f1c40f',
    Decompression: '#1abc9c',
    Posture: '#2ecc71',
    Strength: '#e74c3c',
    Power: '#ff6b6b',
    'Single-Leg Strength': '#e74c3c',
    'Dynamic Stability': '#f39c12',
    'Controlled Loading': '#c0392b',
    'Power & Plyometrics': '#ff6b6b',
};

/**
 * Time block colors for tab bar and section accents.
 */
export const TIME_BLOCK_COLORS = {
    morning: '#f0a500',
    throughout_day: '#3498db',
    evening: '#8e44ad',
    before_bed: '#2c3e50',
    bonus: '#95a5a6',
};

export default CONFIG;
