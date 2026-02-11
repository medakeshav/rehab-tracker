import { describe, it, expect } from 'vitest';

/**
 * Tests for CSV export formatting.
 * We re-implement the formatting logic here to test it in isolation
 * without needing global state or DOM.
 */

function buildWorkoutCSV(workoutData) {
    let csv = 'Date,Phase,Exercise,Left Reps,Right Reps,Sets,Pain Level,Notes\n';

    workoutData.forEach((workout) => {
        workout.exercises.forEach((ex) => {
            csv += `${workout.date},${workout.phase},"${ex.name}",${ex.leftReps},${ex.rightReps},${ex.sets},${ex.pain},"${ex.notes}"\n`;
        });
    });

    return csv;
}

function buildWeeklyCSV(weeklyData) {
    let csv =
        'Week,Date,Stand Left,Stand Right,Bridge Left,Bridge Right,Reach Left,Reach Right,Knee Pain,Back Pain,Foot Pain,Notes\n';

    weeklyData.forEach((week) => {
        csv += `${week.week},${week.date},${week.standLeft},${week.standRight},${week.bridgeLeft},${week.bridgeRight},${week.reachLeft},${week.reachRight},${week.kneePain},${week.backPain},${week.footPain},"${week.notes}"\n`;
    });

    return csv;
}

function buildMonthlyCSV(monthlyData) {
    let csv =
        'Month,Date,Calf Right,Calf Left,Thigh Right,Thigh Left,Photos,Video,Phase,Ready Next Phase,Notes\n';

    monthlyData.forEach((month) => {
        csv += `${month.month},${month.date},${month.calfRight},${month.calfLeft},${month.thighRight},${month.thighLeft},${month.photosTaken},${month.videoTaken},${month.phase},${month.readyNextPhase},"${month.notes}"\n`;
    });

    return csv;
}

// ========== Tests ==========

describe('Workout CSV export', () => {
    it('should have correct headers', () => {
        const csv = buildWorkoutCSV([]);
        const header = csv.split('\n')[0];
        expect(header).toBe('Date,Phase,Exercise,Left Reps,Right Reps,Sets,Pain Level,Notes');
    });

    it('should format a workout row correctly', () => {
        const data = [
            {
                date: '2025-01-15',
                phase: 1,
                exercises: [
                    {
                        name: 'Calf Raises',
                        leftReps: 15,
                        rightReps: 22,
                        sets: 3,
                        pain: 2,
                        notes: 'Felt good',
                    },
                ],
            },
        ];
        const csv = buildWorkoutCSV(data);
        const lines = csv.trim().split('\n');
        expect(lines.length).toBe(2); // header + 1 data row
        expect(lines[1]).toBe('2025-01-15,1,"Calf Raises",15,22,3,2,"Felt good"');
    });

    it('should produce one row per exercise', () => {
        const data = [
            {
                date: '2025-01-15',
                phase: 1,
                exercises: [
                    { name: 'Ex1', leftReps: 10, rightReps: 10, sets: 3, pain: 0, notes: '' },
                    { name: 'Ex2', leftReps: 12, rightReps: 12, sets: 2, pain: 1, notes: '' },
                    { name: 'Ex3', leftReps: 8, rightReps: 8, sets: 1, pain: 0, notes: '' },
                ],
            },
        ];
        const csv = buildWorkoutCSV(data);
        const lines = csv.trim().split('\n');
        expect(lines.length).toBe(4); // header + 3 data rows
    });

    it('should handle notes with commas by quoting', () => {
        const data = [
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
                        notes: 'Pain on left, but ok',
                    },
                ],
            },
        ];
        const csv = buildWorkoutCSV(data);
        // Notes are already wrapped in double quotes
        expect(csv).toContain('"Pain on left, but ok"');
    });
});

describe('Weekly CSV export', () => {
    it('should have correct headers', () => {
        const csv = buildWeeklyCSV([]);
        const header = csv.split('\n')[0];
        expect(header).toBe(
            'Week,Date,Stand Left,Stand Right,Bridge Left,Bridge Right,Reach Left,Reach Right,Knee Pain,Back Pain,Foot Pain,Notes'
        );
    });

    it('should format a weekly row correctly', () => {
        const data = [
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
                notes: 'Improving',
            },
        ];
        const csv = buildWeeklyCSV(data);
        const lines = csv.trim().split('\n');
        expect(lines.length).toBe(2);
        expect(lines[1]).toBe('4,2025-01-26,25,30,12,15,8,10,2,1,0,"Improving"');
    });
});

describe('Monthly CSV export', () => {
    it('should have correct headers', () => {
        const csv = buildMonthlyCSV([]);
        const header = csv.split('\n')[0];
        expect(header).toBe(
            'Month,Date,Calf Right,Calf Left,Thigh Right,Thigh Left,Photos,Video,Phase,Ready Next Phase,Notes'
        );
    });

    it('should format a monthly row correctly', () => {
        const data = [
            {
                month: 2,
                date: '2025-02-28',
                calfRight: 36.5,
                calfLeft: 35.0,
                thighRight: 52.0,
                thighLeft: 51.5,
                photosTaken: true,
                videoTaken: false,
                phase: 1,
                readyNextPhase: false,
                notes: 'Good progress',
            },
        ];
        const csv = buildMonthlyCSV(data);
        const lines = csv.trim().split('\n');
        expect(lines.length).toBe(2);
        expect(lines[1]).toBe('2,2025-02-28,36.5,35,52,51.5,true,false,1,false,"Good progress"');
    });
});
