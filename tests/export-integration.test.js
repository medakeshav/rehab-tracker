import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => {
    let workoutData = [];
    let weeklyData = [];
    let monthlyData = [];
    return {
        get workoutData() {
            return workoutData;
        },
        get weeklyData() {
            return weeklyData;
        },
        get monthlyData() {
            return monthlyData;
        },
        setWorkoutData: vi.fn((v) => {
            workoutData = v;
        }),
        setWeeklyData: vi.fn((v) => {
            weeklyData = v;
        }),
        setMonthlyData: vi.fn((v) => {
            monthlyData = v;
        }),
        setCurrentPhase: vi.fn(),
        __setTestData: (w, wk, m) => {
            workoutData = w;
            weeklyData = wk;
            monthlyData = m;
        },
    };
});

// Mock utils.js
vi.mock('../js/utils.js', () => ({
    showToast: vi.fn(),
    showConfirmDialog: vi.fn((title, message, confirmText, onConfirm, isDestructive) => {
        // Auto-confirm for testing
        if (onConfirm) onConfirm();
    }),
    updateStats: vi.fn(),
}));

// Mock navigation.js
vi.mock('../js/navigation.js', () => ({
    showScreen: vi.fn(),
}));

import { exportAllData, clearAllData } from '../js/export.js';
import * as state from '../js/state.js';
import { showToast, showConfirmDialog, updateStats } from '../js/utils.js';
import { showScreen } from '../js/navigation.js';

describe('Export Integration', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '';
        vi.clearAllMocks();
        state.__setTestData([], [], []);
    });

    // ========== exportAllData ==========
    describe('exportAllData()', () => {
        it('should show error toast when no data exists', () => {
            exportAllData();
            expect(showToast).toHaveBeenCalledWith('No data to export', 'error');
        });

        it('should show success toast when data is exported', () => {
            state.__setTestData(
                [
                    {
                        date: '2025-01-15',
                        phase: 1,
                        exercises: [
                            {
                                name: 'Ex1',
                                leftReps: 10,
                                rightReps: 10,
                                sets: 3,
                                pain: 2,
                                notes: '',
                            },
                        ],
                    },
                ],
                [],
                []
            );

            // Mock URL.createObjectURL and link click
            global.URL.createObjectURL = vi.fn(() => 'blob:test');
            exportAllData();
            expect(showToast).toHaveBeenCalledWith('✓ Data exported successfully!', 'success');
        });

        it('should export only workout data when weekly/monthly are empty', () => {
            state.__setTestData(
                [
                    {
                        date: '2025-01-15',
                        phase: 1,
                        exercises: [
                            {
                                name: 'Ex1',
                                leftReps: 10,
                                rightReps: 10,
                                sets: 3,
                                pain: 0,
                                notes: '',
                            },
                        ],
                    },
                ],
                [],
                []
            );
            global.URL.createObjectURL = vi.fn(() => 'blob:test');
            exportAllData();
            expect(showToast).toHaveBeenCalledWith('✓ Data exported successfully!', 'success');
        });

        it('should export weekly data when present', () => {
            state.__setTestData(
                [],
                [
                    {
                        week: 4,
                        date: '2025-01-26',
                        standLeft: 25,
                        standRight: 30,
                        bridgeLeft: 12,
                        bridgeRight: 15,
                        reachLeft: 8,
                        reachRight: 10,
                        kneePain: 2,
                        backPain: 1,
                        footPain: 0,
                        notes: 'Good',
                    },
                ],
                []
            );
            global.URL.createObjectURL = vi.fn(() => 'blob:test');
            exportAllData();
            expect(showToast).toHaveBeenCalledWith('✓ Data exported successfully!', 'success');
        });

        it('should export monthly data when present', () => {
            state.__setTestData(
                [],
                [],
                [
                    {
                        month: 2,
                        date: '2025-02-28',
                        calfRight: 36.5,
                        calfLeft: 35,
                        thighRight: 52,
                        thighLeft: 51.5,
                        photosTaken: true,
                        videoTaken: false,
                        phase: 1,
                        readyNextPhase: false,
                        notes: 'Good progress',
                    },
                ]
            );
            global.URL.createObjectURL = vi.fn(() => 'blob:test');
            exportAllData();
            expect(showToast).toHaveBeenCalledWith('✓ Data exported successfully!', 'success');
        });
    });

    // ========== clearAllData ==========
    describe('clearAllData()', () => {
        it('should call showConfirmDialog with destructive flag', () => {
            clearAllData();
            expect(showConfirmDialog).toHaveBeenCalledWith(
                'Delete All Data',
                expect.any(String),
                'Delete Everything',
                expect.any(Function),
                true
            );
        });

        it('should clear localStorage on confirm', () => {
            localStorage.setItem('testKey', 'testValue');
            clearAllData();
            expect(localStorage.getItem('testKey')).toBeNull();
        });

        it('should reset state arrays on confirm', () => {
            state.__setTestData([{ test: true }], [{ test: true }], [{ test: true }]);
            clearAllData();
            expect(state.setWorkoutData).toHaveBeenCalledWith([]);
            expect(state.setWeeklyData).toHaveBeenCalledWith([]);
            expect(state.setMonthlyData).toHaveBeenCalledWith([]);
        });

        it('should reset phase to 1', () => {
            clearAllData();
            expect(state.setCurrentPhase).toHaveBeenCalledWith(1);
        });

        it('should show success toast', () => {
            clearAllData();
            expect(showToast).toHaveBeenCalledWith('All data cleared', 'success');
        });

        it('should update stats after clearing', () => {
            clearAllData();
            expect(updateStats).toHaveBeenCalled();
        });

        it('should navigate to home screen', () => {
            clearAllData();
            expect(showScreen).toHaveBeenCalledWith('home');
        });
    });
});
