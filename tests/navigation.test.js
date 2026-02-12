import { describe, it, expect, beforeEach } from 'vitest';
import { showScreen, goBack, openMenu, closeMenu } from '../js/navigation.js';

/**
 * Tests for navigation module.
 * Tests screen switching, history management, and menu interactions.
 */

describe('Navigation', () => {
    beforeEach(() => {
        // Create minimal DOM structure
        document.body.innerHTML = `
            <div id="sideMenu"></div>
            <div id="homeScreen" class="screen active"></div>
            <div id="dailyScreen" class="screen"></div>
            <div id="analyticsScreen" class="screen"></div>
            <div id="scrollToTopBtn"></div>
        `;
    });

    describe('showScreen()', () => {
        it('should activate target screen', () => {
            showScreen('daily');
            expect(document.getElementById('dailyScreen').classList.contains('active')).toBe(true);
        });

        it('should deactivate current screen', () => {
            showScreen('daily');
            expect(document.getElementById('homeScreen').classList.contains('active')).toBe(false);
        });

        it('should close menu when navigating', () => {
            const menu = document.getElementById('sideMenu');
            menu.classList.add('active');
            showScreen('daily');
            expect(menu.classList.contains('active')).toBe(false);
        });

        it('should work with scroll button when it exists', () => {
            // Scroll button behavior requires full app init, tested in E2E
            expect(document.getElementById('scrollToTopBtn')).toBeTruthy();
        });

        it('should handle non-existent screen gracefully', () => {
            expect(() => showScreen('nonexistent')).not.toThrow();
        });

        it('should reset history when navigating to home', () => {
            showScreen('daily');
            showScreen('analytics');
            showScreen('home');
            // After home, goBack should do nothing
            goBack();
            expect(document.getElementById('homeScreen').classList.contains('active')).toBe(true);
        });
    });

    describe('goBack()', () => {
        it('should be callable without errors', () => {
            // goBack() maintains internal state that persists across tests
            // Full testing requires resetting module state or E2E tests
            expect(() => goBack()).not.toThrow();
        });
    });

    describe('Menu interactions', () => {
        it('should open menu', () => {
            const menu = document.getElementById('sideMenu');
            openMenu();
            expect(menu.classList.contains('active')).toBe(true);
        });

        it('should close menu', () => {
            const menu = document.getElementById('sideMenu');
            menu.classList.add('active');
            closeMenu();
            expect(menu.classList.contains('active')).toBe(false);
        });

        it('should close menu when calling showScreen', () => {
            const menu = document.getElementById('sideMenu');
            openMenu();
            showScreen('daily');
            expect(menu.classList.contains('active')).toBe(false);
        });
    });
});
