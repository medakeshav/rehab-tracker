import { describe, it, expect } from 'vitest';
import {
    exercises,
    getExercisesForPhase,
    getExercisesForTimeBlock,
    getVisibleExercisesForPhase,
    getTimeBlocksForPhase,
    TIME_BLOCKS,
} from '../exercises.js';

/** Helper to get all exercises across all phases */
function getAllExercises() {
    return [...exercises.phase1, ...exercises.phase2, ...exercises.phase3];
}

describe('exercises data structure', () => {
    it('should have three phases', () => {
        expect(exercises.phase1).toBeDefined();
        expect(exercises.phase2).toBeDefined();
        expect(exercises.phase3).toBeDefined();
    });

    it('should have exercises in every phase', () => {
        expect(exercises.phase1.length).toBeGreaterThan(0);
        expect(exercises.phase2.length).toBeGreaterThan(0);
        expect(exercises.phase3.length).toBeGreaterThan(0);
    });
});

describe('exercise required fields', () => {
    it('every exercise should have an id', () => {
        getAllExercises().forEach((ex) => {
            expect(ex.id, `Exercise "${ex.name}" missing id`).toBeDefined();
            expect(typeof ex.id).toBe('string');
            expect(ex.id.length).toBeGreaterThan(0);
        });
    });

    it('every exercise should have a name', () => {
        getAllExercises().forEach((ex) => {
            expect(ex.name, `Exercise ${ex.id} missing name`).toBeDefined();
            expect(typeof ex.name).toBe('string');
        });
    });

    it('every exercise should have leftTarget and rightTarget', () => {
        getAllExercises().forEach((ex) => {
            expect(ex.leftTarget, `Exercise ${ex.id} missing leftTarget`).toBeDefined();
            expect(ex.rightTarget, `Exercise ${ex.id} missing rightTarget`).toBeDefined();
            expect(typeof ex.leftTarget).toBe('number');
            expect(typeof ex.rightTarget).toBe('number');
        });
    });

    it('every exercise should have a sets count', () => {
        getAllExercises().forEach((ex) => {
            expect(ex.sets, `Exercise ${ex.id} missing sets`).toBeDefined();
            expect(typeof ex.sets).toBe('number');
            expect(ex.sets).toBeGreaterThan(0);
        });
    });
});

describe('V2: exercise time block fields', () => {
    it('every phase 1 exercise should have a timeBlock', () => {
        exercises.phase1.forEach((ex) => {
            expect(ex.timeBlock, `Exercise ${ex.id} missing timeBlock`).toBeDefined();
            expect(Object.keys(TIME_BLOCKS)).toContain(ex.timeBlock);
        });
    });

    it('every phase 1 exercise should have an exerciseType', () => {
        const validTypes = ['reps', 'timed', 'timed_holds', 'quick_log'];
        exercises.phase1.forEach((ex) => {
            expect(ex.exerciseType, `Exercise ${ex.id} missing exerciseType`).toBeDefined();
            expect(validTypes).toContain(ex.exerciseType);
        });
    });

    it('timed exercises should have timerDuration', () => {
        exercises.phase1
            .filter((ex) => ex.exerciseType === 'timed' || ex.exerciseType === 'timed_holds')
            .forEach((ex) => {
                expect(ex.timerDuration, `Timed exercise ${ex.id} missing timerDuration`).toBeDefined();
                expect(typeof ex.timerDuration.left).toBe('number');
                expect(typeof ex.timerDuration.right).toBe('number');
            });
    });

    it('quick_log exercises should have quickLogTarget', () => {
        exercises.phase1
            .filter((ex) => ex.exerciseType === 'quick_log')
            .forEach((ex) => {
                expect(ex.quickLogTarget, `Quick-log exercise ${ex.id} missing quickLogTarget`).toBeDefined();
                expect(typeof ex.quickLogTarget).toBe('number');
            });
    });
});

describe('no duplicate exercise IDs', () => {
    it('should have unique IDs across all phases', () => {
        const ids = getAllExercises().map((ex) => ex.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique IDs within phase 1', () => {
        const ids = exercises.phase1.map((ex) => ex.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have unique IDs within phase 2', () => {
        const ids = exercises.phase2.map((ex) => ex.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have unique IDs within phase 3', () => {
        const ids = exercises.phase3.map((ex) => ex.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});

describe('getExercisesForPhase', () => {
    it('should return only phase 1 exercises for phase 1', () => {
        const result = getExercisesForPhase(1);
        expect(result.length).toBe(exercises.phase1.length);
    });

    it('should return phase 1 + phase 2 exercises for phase 2', () => {
        const result = getExercisesForPhase(2);
        expect(result.length).toBe(exercises.phase1.length + exercises.phase2.length);
    });

    it('should return all exercises for phase 3', () => {
        const result = getExercisesForPhase(3);
        expect(result.length).toBe(
            exercises.phase1.length + exercises.phase2.length + exercises.phase3.length
        );
    });

    it('should default to phase 1 for invalid input', () => {
        const result = getExercisesForPhase(99);
        expect(result.length).toBe(exercises.phase1.length);
    });

    it('phase 2 should include all phase 1 exercises', () => {
        const phase1Ids = exercises.phase1.map((ex) => ex.id);
        const phase2Result = getExercisesForPhase(2);
        const phase2Ids = phase2Result.map((ex) => ex.id);

        phase1Ids.forEach((id) => {
            expect(phase2Ids).toContain(id);
        });
    });

    it('phase 3 should include all phase 1 and phase 2 exercises', () => {
        const allLowerIds = [...exercises.phase1, ...exercises.phase2].map((ex) => ex.id);
        const phase3Result = getExercisesForPhase(3);
        const phase3Ids = phase3Result.map((ex) => ex.id);

        allLowerIds.forEach((id) => {
            expect(phase3Ids).toContain(id);
        });
    });
});

describe('V2: getExercisesForTimeBlock', () => {
    it('should return only morning exercises', () => {
        const result = getExercisesForTimeBlock(1, 'morning');
        expect(result.length).toBeGreaterThan(0);
        result.forEach((ex) => {
            expect(ex.timeBlock).toBe('morning');
        });
    });

    it('should return only throughout_day exercises', () => {
        const result = getExercisesForTimeBlock(1, 'throughout_day');
        expect(result.length).toBeGreaterThan(0);
        result.forEach((ex) => {
            expect(ex.timeBlock).toBe('throughout_day');
        });
    });

    it('should return only evening exercises', () => {
        const result = getExercisesForTimeBlock(1, 'evening');
        expect(result.length).toBeGreaterThan(0);
        result.forEach((ex) => {
            expect(ex.timeBlock).toBe('evening');
        });
    });

    it('should return only before_bed exercises', () => {
        const result = getExercisesForTimeBlock(1, 'before_bed');
        expect(result.length).toBeGreaterThan(0);
        result.forEach((ex) => {
            expect(ex.timeBlock).toBe('before_bed');
        });
    });

    it('should return only bonus exercises', () => {
        const result = getExercisesForTimeBlock(1, 'bonus');
        expect(result.length).toBeGreaterThan(0);
        result.forEach((ex) => {
            expect(ex.timeBlock).toBe('bonus');
        });
    });

    it('all time block exercises should sum to total phase 1', () => {
        const blocks = ['morning', 'throughout_day', 'evening', 'before_bed', 'bonus'];
        let total = 0;
        blocks.forEach((block) => {
            total += getExercisesForTimeBlock(1, block).length;
        });
        expect(total).toBe(exercises.phase1.length);
    });
});

describe('V2: getTimeBlocksForPhase', () => {
    it('should return all time blocks for phase 1', () => {
        const blocks = getTimeBlocksForPhase(1);
        expect(blocks).toContain('morning');
        expect(blocks).toContain('throughout_day');
        expect(blocks).toContain('evening');
        expect(blocks).toContain('before_bed');
        expect(blocks).toContain('bonus');
    });

    it('should return blocks in display order', () => {
        const blocks = getTimeBlocksForPhase(1);
        for (let i = 1; i < blocks.length; i++) {
            expect(TIME_BLOCKS[blocks[i]].order).toBeGreaterThan(TIME_BLOCKS[blocks[i - 1]].order);
        }
    });
});

describe('V2: exercise plan specifics', () => {
    it('should have 4 morning routine exercises', () => {
        const morning = getExercisesForTimeBlock(1, 'morning');
        expect(morning.length).toBe(4);
    });

    it('should have 4 throughout-day quick-log exercises', () => {
        const day = getExercisesForTimeBlock(1, 'throughout_day');
        expect(day.length).toBe(4);
        day.forEach((ex) => {
            expect(ex.exerciseType).toBe('quick_log');
        });
    });

    it('should have 12 evening workout exercises', () => {
        const evening = getExercisesForTimeBlock(1, 'evening');
        expect(evening.length).toBe(12);
    });

    it('should have 2 before-bed exercises', () => {
        const bed = getExercisesForTimeBlock(1, 'before_bed');
        expect(bed.length).toBe(2);
    });

    it('should have bonus exercises from old plan', () => {
        const bonus = getExercisesForTimeBlock(1, 'bonus');
        expect(bonus.length).toBeGreaterThanOrEqual(5);
        const ids = bonus.map((ex) => ex.id);
        expect(ids).toContain('toe_yoga');
        expect(ids).toContain('towel_scrunch');
        expect(ids).toContain('calf_raises');
        expect(ids).toContain('piriformis_stretch');
    });

    it('dead bug holds should be timed_holds type', () => {
        const deadBug = exercises.phase1.find((ex) => ex.id === 'dead_bug_holds');
        expect(deadBug).toBeDefined();
        expect(deadBug.exerciseType).toBe('timed_holds');
        expect(deadBug.timerDuration.left).toBe(10);
        expect(deadBug.timerDuration.right).toBe(15);
    });

    it('bird dog holds should be timed_holds type', () => {
        const birdDog = exercises.phase1.find((ex) => ex.id === 'bird_dog_holds');
        expect(birdDog).toBeDefined();
        expect(birdDog.exerciseType).toBe('timed_holds');
        expect(birdDog.timerDuration.left).toBe(15);
        expect(birdDog.timerDuration.right).toBe(20);
    });

    it('plank should have progression data', () => {
        const plank = exercises.phase1.find((ex) => ex.id === 'plank');
        expect(plank).toBeDefined();
        expect(plank.progression).toBeDefined();
        expect(plank.progression[1]).toBeDefined();
    });
});

describe('exercise instructions', () => {
    it('all phase 1 exercises should have instructions', () => {
        exercises.phase1.forEach((ex) => {
            expect(
                ex.instructions,
                `Phase 1 exercise "${ex.name}" should have instructions`
            ).toBeDefined();
            expect(ex.instructions.title).toBeDefined();
            expect(ex.instructions.steps).toBeDefined();
            expect(Array.isArray(ex.instructions.steps)).toBe(true);
            expect(ex.instructions.steps.length).toBeGreaterThan(0);
        });
    });
});
