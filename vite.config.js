import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/rehab-tracker/' : '/',
    plugins: [
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
            },
        }),
    ],
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
