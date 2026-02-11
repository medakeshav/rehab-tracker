import js from '@eslint/js';

export default [
    js.configs.recommended,
    // Default config for app.js (consumes globals from exercises.js)
    {
        files: ['app.js', 'js/**/*.js'],
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
                // App globals (from exercises.js loaded before app.js)
                exercises: 'readonly',
                getExercisesForPhase: 'readonly',
                // CDN global
                confetti: 'readonly',
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
            'eslint.config.js',
            'vitest.config.js',
            'tests/',
        ],
    },
];
