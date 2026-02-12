import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock utils.js
vi.mock('../js/utils.js', () => ({
    formatDate: vi.fn((dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }),
    calculateAvgPain: vi.fn((exercises) => {
        if (exercises.length === 0) return '0/10';
        const total = exercises.reduce((sum, ex) => sum + ex.pain, 0);
        return `${(total / exercises.length).toFixed(1)}/10`;
    }),
}));

// Mock state.js
const mockState = {
    workoutData: [],
    weeklyData: [],
    monthlyData: [],
};

vi.mock('../js/state.js', () => ({
    get workoutData() {
        return mockState.workoutData;
    },
    get weeklyData() {
        return mockState.weeklyData;
    },
    get monthlyData() {
        return mockState.monthlyData;
    },
}));

import { showHistoryTab, loadHistory, createHistoryCard } from '../js/history.js';

describe('History Integration', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="historyContent"></div>
            <button class="tab-btn" data-tab="workouts">Workouts</button>
            <button class="tab-btn" data-tab="weekly">Weekly</button>
            <button class="tab-btn" data-tab="monthly">Monthly</button>
        `;
        mockState.workoutData = [];
        mockState.weeklyData = [];
        mockState.monthlyData = [];
        vi.clearAllMocks();
    });

    // ========== showHistoryTab ==========
    describe('showHistoryTab()', () => {
        it('should activate the selected tab button', () => {
            showHistoryTab('workouts');
            const btn = document.querySelector('.tab-btn[data-tab="workouts"]');
            expect(btn.classList.contains('active')).toBe(true);
        });

        it('should deactivate other tab buttons', () => {
            // First activate weekly
            showHistoryTab('weekly');
            // Then switch to workouts
            showHistoryTab('workouts');
            const weeklyBtn = document.querySelector('.tab-btn[data-tab="weekly"]');
            expect(weeklyBtn.classList.contains('active')).toBe(false);
        });

        it('should load history for the selected tab', () => {
            mockState.workoutData = [
                {
                    date: '2025-01-15',
                    phase: 1,
                    exercises: [{ name: 'Ex1', pain: 2 }],
                },
            ];
            showHistoryTab('workouts');
            const content = document.getElementById('historyContent');
            expect(content.children.length).toBe(1);
        });
    });

    // ========== loadHistory ==========
    describe('loadHistory()', () => {
        it('should show empty state when no workout data', () => {
            loadHistory('workouts');
            const content = document.getElementById('historyContent');
            expect(content.innerHTML).toContain('No data yet');
        });

        it('should show empty state when no weekly data', () => {
            loadHistory('weekly');
            const content = document.getElementById('historyContent');
            expect(content.innerHTML).toContain('No data yet');
        });

        it('should show empty state when no monthly data', () => {
            loadHistory('monthly');
            const content = document.getElementById('historyContent');
            expect(content.innerHTML).toContain('No data yet');
        });

        it('should render workout cards', () => {
            mockState.workoutData = [
                {
                    date: '2025-01-15',
                    phase: 1,
                    exercises: [
                        { name: 'Calf Raises', pain: 2 },
                        { name: 'Quad Sets', pain: 3 },
                    ],
                },
            ];
            loadHistory('workouts');
            const content = document.getElementById('historyContent');
            expect(content.children.length).toBe(1);
            expect(content.innerHTML).toContain('Phase 1');
            expect(content.innerHTML).toContain('2');
        });

        it('should render weekly cards', () => {
            mockState.weeklyData = [
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
            ];
            loadHistory('weekly');
            const content = document.getElementById('historyContent');
            expect(content.children.length).toBe(1);
            expect(content.innerHTML).toContain('Week 4');
        });

        it('should render monthly cards', () => {
            mockState.monthlyData = [
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
                    notes: 'Progress',
                },
            ];
            loadHistory('monthly');
            const content = document.getElementById('historyContent');
            expect(content.children.length).toBe(1);
            expect(content.innerHTML).toContain('Month 2');
        });

        it('should display in reverse chronological order', () => {
            mockState.workoutData = [
                { date: '2025-01-10', phase: 1, exercises: [{ name: 'Ex', pain: 0 }] },
                { date: '2025-01-15', phase: 1, exercises: [{ name: 'Ex', pain: 0 }] },
                { date: '2025-01-20', phase: 1, exercises: [{ name: 'Ex', pain: 0 }] },
            ];
            loadHistory('workouts');
            const content = document.getElementById('historyContent');
            expect(content.children.length).toBe(3);
            // First card should be the newest date
            const firstCard = content.children[0].innerHTML;
            expect(firstCard).toContain('Jan');
        });

        it('should render multiple workout cards', () => {
            mockState.workoutData = [
                { date: '2025-01-10', phase: 1, exercises: [{ pain: 0, name: 'A' }] },
                { date: '2025-01-11', phase: 1, exercises: [{ pain: 0, name: 'B' }] },
            ];
            loadHistory('workouts');
            const content = document.getElementById('historyContent');
            expect(content.children.length).toBe(2);
        });
    });

    // ========== createHistoryCard ==========
    describe('createHistoryCard()', () => {
        it('should create a workout card element', () => {
            const item = {
                date: '2025-01-15',
                phase: 1,
                exercises: [{ name: 'Calf Raises', pain: 2 }],
            };
            const card = createHistoryCard(item, 'workouts');
            expect(card).toBeTruthy();
            expect(card.className).toBe('history-item');
            expect(card.innerHTML).toContain('Phase 1');
        });

        it('should show exercise count for workouts', () => {
            const item = {
                date: '2025-01-15',
                phase: 1,
                exercises: [
                    { name: 'Ex1', pain: 1 },
                    { name: 'Ex2', pain: 2 },
                    { name: 'Ex3', pain: 3 },
                ],
            };
            const card = createHistoryCard(item, 'workouts');
            expect(card.innerHTML).toContain('3');
        });

        it('should create a weekly card element', () => {
            const item = {
                week: 4,
                date: '2025-01-26',
                standLeft: 25,
                standRight: 30,
                bridgeLeft: 12,
                bridgeRight: 15,
                kneePain: 2,
                backPain: 1,
                footPain: 0,
            };
            const card = createHistoryCard(item, 'weekly');
            expect(card.innerHTML).toContain('Week 4');
            expect(card.innerHTML).toContain('25');
            expect(card.innerHTML).toContain('30');
        });

        it('should create a monthly card element', () => {
            const item = {
                month: 3,
                date: '2025-03-31',
                calfRight: 36,
                calfLeft: 35,
                thighRight: 52,
                thighLeft: 51,
                phase: 2,
                readyNextPhase: true,
            };
            const card = createHistoryCard(item, 'monthly');
            expect(card.innerHTML).toContain('Month 3');
            expect(card.innerHTML).toContain('Ready for next');
        });

        it('should not show "ready for next" when false', () => {
            const item = {
                month: 1,
                date: '2025-01-31',
                calfRight: 36,
                calfLeft: 35,
                thighRight: 52,
                thighLeft: 51,
                phase: 1,
                readyNextPhase: false,
            };
            const card = createHistoryCard(item, 'monthly');
            expect(card.innerHTML).not.toContain('Ready for next');
        });
    });
});
