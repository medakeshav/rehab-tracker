import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/rehab-tracker/' : '/',
    plugins: [tailwindcss()],
    build: {
        outDir: 'dist',
    },
    test: {
        environment: 'jsdom',
        globals: true,
        coverage: {
            provider: 'v8',
            include: ['js/**/*.js', 'exercises.js'],
            exclude: ['app.js', 'js/analytics.js', 'js/app.js'],
            reporter: ['text', 'text-summary'],
        },
    },
}));
