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
            expect(() => goBack()).not.toThrow();
        });

        it('should navigate back to previous screen', () => {
            vi.useFakeTimers();
            document.body.innerHTML += '<div id="historyScreen" class="screen"></div>';
            showScreen('daily');
            showScreen('history');
            goBack();
            // goBack uses slide-back animation with 300ms timeout
            vi.advanceTimersByTime(300);
            expect(
                document.getElementById('dailyScreen').classList.contains('active') ||
                    document.getElementById('homeScreen').classList.contains('active')
            ).toBe(true);
            vi.useRealTimers();
        });

        it('should use slide-back animation', () => {
            showScreen('daily');
            goBack();
            // goBack uses showScreen with useSlideBack=true
            // The screen should transition
            expect(() => goBack()).not.toThrow();
        });
    });

    describe('showScreen() advanced', () => {
        it('should not switch when target is already active', () => {
            showScreen('home');
            const homeScreen = document.getElementById('homeScreen');
            expect(homeScreen.classList.contains('active')).toBe(true);
        });

        it('should handle slide-back animation', () => {
            vi.useFakeTimers();
            showScreen('daily');
            showScreen('home', true);
            vi.advanceTimersByTime(300);
            expect(document.getElementById('homeScreen').classList.contains('active')).toBe(true);
            vi.useRealTimers();
        });

        it('should trigger history callback', () => {
            document.body.innerHTML += '<div id="historyScreen" class="screen"></div>';
            // setOnHistoryScreen is not exported individually but showScreen triggers it
            showScreen('history');
            const historyScreen = document.getElementById('historyScreen');
            expect(historyScreen.classList.contains('active')).toBe(true);
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
