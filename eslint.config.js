import js from '@eslint/js';

export default [
    js.configs.recommended,
    // Config for all app scripts (js/*.js files share a global scope)
    {
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                localStorage: 'readonly',
                navigator: 'readonly',
                AudioContext: 'readonly',
                webkitAudioContext: 'readonly',
                URL: 'readonly',
                Blob: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                console: 'readonly',
                alert: 'readonly',
                confirm: 'readonly',
                performance: 'readonly',
                HTMLElement: 'readonly',
                Event: 'readonly',
                self: 'readonly',

                // CDN global
                confetti: 'readonly',

                // From exercises.js (loaded before app modules)
                exercises: 'readonly',
                getExercisesForPhase: 'readonly',

                // Cross-module globals (functions defined in other js/*.js files)
                // state.js
                currentPhase: 'writable',
                workoutData: 'writable',
                weeklyData: 'writable',
                monthlyData: 'writable',
                PROGRESS_BAR_VERSION: 'writable',
                dailyProgress: 'writable',
                loadDailyProgress: 'readonly',
                createFreshProgress: 'readonly',
                saveDailyProgress: 'readonly',
                captureExerciseData: 'readonly',
                restoreExerciseData: 'readonly',
                autoSaveDailyProgress: 'readonly',

                // utils.js
                normalizeDate: 'readonly',
                safeGetItem: 'readonly',
                safeSetItem: 'readonly',
                showToast: 'readonly',
                showConfirmDialog: 'readonly',
                formatDate: 'readonly',
                calculateAvgPain: 'readonly',
                calculateStreak: 'readonly',
                calculateCurrentWeek: 'readonly',
                updateStats: 'readonly',
                selectPhase: 'readonly',
                updatePhaseInfo: 'readonly',
                setupPainSliders: 'readonly',

                // wheel-picker.js
                WHEEL_PICKER_ITEM_HEIGHT: 'readonly',
                createWheelPicker: 'readonly',
                getPickerValue: 'readonly',
                setPickerValue: 'readonly',

                // navigation.js
                screenHistory: 'writable',
                openMenu: 'readonly',
                closeMenu: 'readonly',
                showScreen: 'readonly',
                goBack: 'readonly',
                initSwipeBack: 'readonly',

                // export.js
                exportAllData: 'readonly',
                exportWorkoutsCSV: 'readonly',
                exportWeeklyCSV: 'readonly',
                exportMonthlyCSV: 'readonly',
                downloadCSV: 'readonly',
                clearAllData: 'readonly',

                // history.js
                showHistoryTab: 'readonly',
                loadHistory: 'readonly',
                createHistoryCard: 'readonly',

                // progress.js
                updateProgressBar: 'readonly',
                scrollToExercise: 'readonly',
                clearDailyProgress: 'readonly',
                checkAllComplete: 'readonly',
                showCelebration: 'readonly',
                hideCelebration: 'readonly',
                playCompletionSound: 'readonly',
                getCompletionMessage: 'readonly',
                showCompletionToast: 'readonly',
                toggleSound: 'readonly',
                updateSoundToggleBtn: 'readonly',
                toggleProgressBar: 'readonly',
                updateProgressBarToggleBtn: 'readonly',

                // assessments.js
                saveWeeklyAssessment: 'readonly',
                saveMonthlyAssessment: 'readonly',

                // exercises-ui.js
                loadExercises: 'readonly',
                createCompletedCard: 'readonly',
                createExerciseCard: 'readonly',
                attachPainSliderListeners: 'readonly',
                updatePainColor: 'readonly',
                reattachCardListeners: 'readonly',
                collapseCard: 'readonly',
                expandCard: 'readonly',
                scrollToNextIncomplete: 'readonly',
                closeInstructionsModal: 'readonly',
                showInstructions: 'readonly',
                saveWorkout: 'readonly',
            },
        },
        rules: {
            // Disabled: in our multi-file global scope pattern, every file both
            // defines and consumes globals from other files — that's expected.
            'no-redeclare': 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'eqeqeq': 'warn',
            'no-var': 'warn',
            'prefer-const': 'warn',
        },
    },
    // Config for exercises.js (defines globals, uses module.exports)
    {
        files: ['exercises.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                module: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'eqeqeq': 'warn',
            'no-var': 'warn',
            'prefer-const': 'warn',
        },
    },
    {
        ignores: [
            'node_modules/',
            'sw.js',
            'app.js', // Old monolithic file — no longer used, kept for reference
            'eslint.config.js',
            'vitest.config.js',
            'tests/',
        ],
    },
];
