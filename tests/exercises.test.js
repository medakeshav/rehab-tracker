import { describe, it, expect } from 'vitest';
import { exercises, getExercisesForPhase } from '../exercises.js';

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
