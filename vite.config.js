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
    },
}));
