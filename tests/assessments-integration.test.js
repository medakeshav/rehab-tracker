import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock utils.js
vi.mock('../js/utils.js', () => ({
    safeSetItem: vi.fn(),
    showToast: vi.fn(),
    calculateCurrentWeek: vi.fn(() => 4),
}));

// Mock state.js
const mockWeeklyData = [];
const mockMonthlyData = [];

vi.mock('../js/state.js', () => ({
    get weeklyData() {
        return mockWeeklyData;
    },
    get monthlyData() {
        return mockMonthlyData;
    },
}));

// Mock navigation.js
vi.mock('../js/navigation.js', () => ({
    showScreen: vi.fn(),
}));

import { saveWeeklyAssessment, saveMonthlyAssessment } from '../js/assessments.js';
import { safeSetItem, showToast } from '../js/utils.js';
import { showScreen } from '../js/navigation.js';

describe('Assessments Integration', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
        vi.useFakeTimers();
        // Clear arrays
        mockWeeklyData.length = 0;
        mockMonthlyData.length = 0;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ========== saveWeeklyAssessment ==========
    describe('saveWeeklyAssessment()', () => {
        function setupWeeklyForm() {
            document.body.innerHTML = `
                <form id="weeklyForm">
                    <input id="weekNumber" value="4">
                    <input id="weeklyDate" value="2025-01-26">
                    <input id="standLeft" value="25">
                    <input id="standRight" value="30">
                    <input id="bridgeLeft" value="12">
                    <input id="bridgeRight" value="15">
                    <input id="reachLeft" value="8">
                    <input id="reachRight" value="10">
                    <input id="kneePain" value="2">
                    <input id="backPain" value="1">
                    <input id="footPain" value="0">
                    <textarea id="weeklyNotes">Good progress</textarea>
                </form>
            `;
        }

        it('should prevent default form submission', () => {
            setupWeeklyForm();
            const event = { preventDefault: vi.fn() };
            saveWeeklyAssessment(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should capture form data correctly', () => {
            setupWeeklyForm();
            const event = { preventDefault: vi.fn() };
            saveWeeklyAssessment(event);
            expect(mockWeeklyData.length).toBe(1);
            expect(mockWeeklyData[0].week).toBe('4');
            expect(mockWeeklyData[0].date).toBe('2025-01-26');
            expect(mockWeeklyData[0].standLeft).toBe('25');
            expect(mockWeeklyData[0].standRight).toBe('30');
            expect(mockWeeklyData[0].kneePain).toBe('2');
            expect(mockWeeklyData[0].notes).toBe('Good progress');
        });

        it('should persist to localStorage', () => {
            setupWeeklyForm();
            saveWeeklyAssessment({ preventDefault: vi.fn() });
            expect(safeSetItem).toHaveBeenCalledWith('weeklyData', expect.any(Array));
        });

        it('should show success toast', () => {
            setupWeeklyForm();
            saveWeeklyAssessment({ preventDefault: vi.fn() });
            expect(showToast).toHaveBeenCalledWith('✓ Weekly assessment saved!', 'success');
        });

        it('should navigate to home after delay', () => {
            setupWeeklyForm();
            saveWeeklyAssessment({ preventDefault: vi.fn() });
            vi.advanceTimersByTime(1500);
            expect(showScreen).toHaveBeenCalledWith('home');
        });

        it('should reset form after delay', () => {
            setupWeeklyForm();
            const form = document.getElementById('weeklyForm');
            const resetSpy = vi.spyOn(form, 'reset');
            saveWeeklyAssessment({ preventDefault: vi.fn() });
            vi.advanceTimersByTime(1500);
            expect(resetSpy).toHaveBeenCalled();
        });

        it('should accumulate multiple assessments', () => {
            setupWeeklyForm();
            saveWeeklyAssessment({ preventDefault: vi.fn() });
            setupWeeklyForm();
            document.getElementById('weekNumber').value = '5';
            saveWeeklyAssessment({ preventDefault: vi.fn() });
            expect(mockWeeklyData.length).toBe(2);
        });
    });

    // ========== saveMonthlyAssessment ==========
    describe('saveMonthlyAssessment()', () => {
        function setupMonthlyForm() {
            document.body.innerHTML = `
                <form id="monthlyForm">
                    <input id="monthNumber" value="2">
                    <input id="monthlyDate" value="2025-02-28">
                    <input id="calfRight" value="36.5">
                    <input id="calfLeft" value="35.0">
                    <input id="thighRight" value="52.0">
                    <input id="thighLeft" value="51.5">
                    <input id="photosTaken" type="checkbox" checked>
                    <input id="videoTaken" type="checkbox">
                    <input id="monthlyPhase" value="1">
                    <input id="readyNextPhase" type="checkbox">
                    <textarea id="monthlyNotes">Good progress</textarea>
                </form>
            `;
        }

        it('should prevent default form submission', () => {
            setupMonthlyForm();
            const event = { preventDefault: vi.fn() };
            saveMonthlyAssessment(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should capture form data correctly', () => {
            setupMonthlyForm();
            saveMonthlyAssessment({ preventDefault: vi.fn() });
            expect(mockMonthlyData.length).toBe(1);
            expect(mockMonthlyData[0].month).toBe('2');
            expect(mockMonthlyData[0].date).toBe('2025-02-28');
            expect(mockMonthlyData[0].calfRight).toBe('36.5');
            expect(mockMonthlyData[0].photosTaken).toBe(true);
            expect(mockMonthlyData[0].videoTaken).toBe(false);
            expect(mockMonthlyData[0].readyNextPhase).toBe(false);
            expect(mockMonthlyData[0].notes).toBe('Good progress');
        });

        it('should persist to localStorage', () => {
            setupMonthlyForm();
            saveMonthlyAssessment({ preventDefault: vi.fn() });
            expect(safeSetItem).toHaveBeenCalledWith('monthlyData', expect.any(Array));
        });

        it('should show success toast', () => {
            setupMonthlyForm();
            saveMonthlyAssessment({ preventDefault: vi.fn() });
            expect(showToast).toHaveBeenCalledWith('✓ Monthly assessment saved!', 'success');
        });

        it('should navigate to home after delay', () => {
            setupMonthlyForm();
            saveMonthlyAssessment({ preventDefault: vi.fn() });
            vi.advanceTimersByTime(1500);
            expect(showScreen).toHaveBeenCalledWith('home');
        });

        it('should reset form after delay', () => {
            setupMonthlyForm();
            const form = document.getElementById('monthlyForm');
            const resetSpy = vi.spyOn(form, 'reset');
            saveMonthlyAssessment({ preventDefault: vi.fn() });
            vi.advanceTimersByTime(1500);
            expect(resetSpy).toHaveBeenCalled();
        });

        it('should handle checked checkboxes correctly', () => {
            setupMonthlyForm();
            document.getElementById('photosTaken').checked = true;
            document.getElementById('videoTaken').checked = true;
            document.getElementById('readyNextPhase').checked = true;
            saveMonthlyAssessment({ preventDefault: vi.fn() });
            expect(mockMonthlyData[0].photosTaken).toBe(true);
            expect(mockMonthlyData[0].videoTaken).toBe(true);
            expect(mockMonthlyData[0].readyNextPhase).toBe(true);
        });
    });
});
