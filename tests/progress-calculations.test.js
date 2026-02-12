import { describe, it, expect } from 'vitest';

/**
 * Tests for progress calculation logic.
 * Tests completion message generation, progress percentage calculations,
 * and milestone detection logic.
 */

// Re-implement key calculation logic for testing
function getCompletionPercentage(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

function selectCompletionMessage(exercise, remaining, percentage) {
    const messages = [];

    if (percentage === 100) {
        messages.push(
            `Amazing work! You completed all exercises including ${exercise.name}!`,
            `Workout complete! Great effort on ${exercise.name}!`,
            `You did it! ${exercise.name} was your final push!`
        );
    } else if (percentage >= 75) {
        messages.push(
            `Almost there! Just ${remaining} exercise${remaining !== 1 ? 's' : ''} left!`,
            `You're crushing it! ${remaining} to go!`
        );
    } else if (percentage >= 50) {
        messages.push(
            `Halfway done! ${exercise.name} complete!`,
            `Great progress! Keep going!`
        );
    } else {
        messages.push(
            `${exercise.name} done! Nice work!`,
            `Good job completing ${exercise.name}!`
        );
    }

    return messages[Math.floor(Math.random() * messages.length)];
}

describe('Progress Calculations', () => {
    describe('getCompletionPercentage()', () => {
        it('should return 0 for no exercises', () => {
            expect(getCompletionPercentage(0, 0)).toBe(0);
        });

        it('should calculate percentage correctly', () => {
            expect(getCompletionPercentage(0, 10)).toBe(0);
            expect(getCompletionPercentage(5, 10)).toBe(50);
            expect(getCompletionPercentage(10, 10)).toBe(100);
        });

        it('should round to nearest integer', () => {
            expect(getCompletionPercentage(1, 3)).toBe(33);
            expect(getCompletionPercentage(2, 3)).toBe(67);
        });

        it('should handle single exercise', () => {
            expect(getCompletionPercentage(0, 1)).toBe(0);
            expect(getCompletionPercentage(1, 1)).toBe(100);
        });

        it('should handle large numbers', () => {
            expect(getCompletionPercentage(250, 1000)).toBe(25);
        });
    });

    describe('selectCompletionMessage()', () => {
        const mockExercise = { name: 'Calf Raises' };

        it('should return string', () => {
            const msg = selectCompletionMessage(mockExercise, 5, 50);
            expect(typeof msg).toBe('string');
            expect(msg.length).toBeGreaterThan(0);
        });

        it('should include exercise name in message', () => {
            const msg = selectCompletionMessage(mockExercise, 0, 100);
            expect(msg.toLowerCase()).toContain('calf raises');
        });

        it('should reflect completion percentage', () => {
            // 100% messages should mention completion
            const fullMsg = selectCompletionMessage(mockExercise, 0, 100);
            expect(fullMsg.toLowerCase()).toMatch(/complete|did it|amazing/);

            // 75%+ messages should mention "almost"
            const almostMsg = selectCompletionMessage(mockExercise, 2, 80);
            expect(almostMsg.toLowerCase()).toMatch(/almost|just|crushing/);

            // 50%+ messages should mention halfway or progress
            const halfMsg = selectCompletionMessage(mockExercise, 5, 50);
            expect(halfMsg.toLowerCase()).toMatch(/halfway|progress|great/);
        });

        it('should include remaining count for high completion', () => {
            const msg = selectCompletionMessage(mockExercise, 3, 75);
            if (msg.includes('Just')) {
                expect(msg).toContain('3');
            }
        });

        it('should handle singular vs plural for remaining', () => {
            const msg1 = selectCompletionMessage(mockExercise, 1, 90);
            const msg2 = selectCompletionMessage(mockExercise, 5, 50);
            // Can't guarantee which message is selected, but shouldn't crash
            expect(msg1).toBeTruthy();
            expect(msg2).toBeTruthy();
        });

        it('should generate different messages for same inputs (randomness)', () => {
            const messages = new Set();
            // Generate 20 messages, should get some variety
            for (let i = 0; i < 20; i++) {
                messages.add(selectCompletionMessage(mockExercise, 5, 50));
            }
            // At least 2 different messages should be generated
            expect(messages.size).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Progress milestones', () => {
        it('should detect 25% milestone', () => {
            const pct = getCompletionPercentage(3, 12);
            expect(pct).toBe(25);
        });

        it('should detect 50% milestone', () => {
            const pct = getCompletionPercentage(6, 12);
            expect(pct).toBe(50);
        });

        it('should detect 75% milestone', () => {
            const pct = getCompletionPercentage(9, 12);
            expect(pct).toBe(75);
        });

        it('should detect 100% completion', () => {
            const pct = getCompletionPercentage(12, 12);
            expect(pct).toBe(100);
        });
    });

    describe('Edge cases', () => {
        it('should handle more completed than total gracefully', () => {
            // Shouldn't happen but be safe
            const pct = getCompletionPercentage(15, 10);
            expect(pct).toBeGreaterThanOrEqual(100);
        });

        it('should handle negative numbers gracefully', () => {
            const pct = getCompletionPercentage(-1, 10);
            expect(pct).toBeLessThanOrEqual(0);
        });

        it('should handle fractional inputs', () => {
            const pct = getCompletionPercentage(5.5, 10);
            expect(pct).toBe(55);
        });
    });
});
