import { describe, it, expect } from 'vitest';

/**
 * Tests for CSV escaping helper.
 * Extracts and tests the escapeCSV function to ensure proper handling
 * of quotes, commas, newlines, and edge cases.
 */

// Extract the escapeCSV function (matching implementation in export.js)
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // If value contains comma, quote, or newline, it must be quoted
    if (/[",\n\r]/.test(str)) {
        // Double any quotes and wrap in quotes
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

describe('CSV escaping', () => {
    describe('escapeCSV()', () => {
        it('should return empty string for null', () => {
            expect(escapeCSV(null)).toBe('');
        });

        it('should return empty string for undefined', () => {
            expect(escapeCSV(undefined)).toBe('');
        });

        it('should handle simple strings without special characters', () => {
            expect(escapeCSV('Hello World')).toBe('Hello World');
            expect(escapeCSV('123')).toBe('123');
        });

        it('should escape strings containing commas', () => {
            expect(escapeCSV('Hello, World')).toBe('"Hello, World"');
            expect(escapeCSV('Exercise: Bridge, Single-Leg')).toBe(
                '"Exercise: Bridge, Single-Leg"'
            );
        });

        it('should escape strings containing quotes', () => {
            expect(escapeCSV('My "Best" Day')).toBe('"My ""Best"" Day"');
            expect(escapeCSV('"quoted"')).toBe('"""quoted"""');
        });

        it('should escape strings containing newlines', () => {
            expect(escapeCSV('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
            expect(escapeCSV('Text\r\nWith\rNewlines')).toBe('"Text\r\nWith\rNewlines"');
        });

        it('should escape strings with multiple special characters', () => {
            expect(escapeCSV('Pain: 5/10, felt "okay"\nGood progress')).toBe(
                '"Pain: 5/10, felt ""okay""\nGood progress"'
            );
        });

        it('should convert numbers to strings', () => {
            expect(escapeCSV(123)).toBe('123');
            expect(escapeCSV(0)).toBe('0');
            expect(escapeCSV(3.14)).toBe('3.14');
        });

        it('should convert booleans to strings', () => {
            expect(escapeCSV(true)).toBe('true');
            expect(escapeCSV(false)).toBe('false');
        });

        it('should handle empty strings', () => {
            expect(escapeCSV('')).toBe('');
        });

        it('should handle whitespace-only strings', () => {
            expect(escapeCSV('   ')).toBe('   ');
            expect(escapeCSV('\t')).toBe('\t');
        });

        it('should handle edge case: only commas', () => {
            expect(escapeCSV(',')).toBe('","');
            expect(escapeCSV(',,')).toBe('",,"');
        });

        it('should handle edge case: only quotes', () => {
            expect(escapeCSV('"')).toBe('""""');
            expect(escapeCSV('""')).toBe('""""""');
        });

        it('should handle realistic workout notes', () => {
            // User enters multi-line notes with commas and quotes
            const notes =
                'Felt great today!\nKnee pain reduced to 2/10, much better than "yesterday\'s" 5/10.\nReady for next phase.';
            const escaped = escapeCSV(notes);
            expect(escaped).toContain('"');
            expect(escaped).toMatch(/^\"/); // starts with quote
            expect(escaped).toMatch(/\"$/); // ends with quote
            // Internal quotes should be doubled
            expect(escaped).toContain('""yesterday');
        });
    });

    describe('CSV row building', () => {
        it('should produce valid CSV row with escaped values', () => {
            const exercise = {
                name: 'Clamshells, Right Side',
                leftReps: 20,
                rightReps: 30,
                sets: 3,
                pain: 2,
                notes: 'Pain level "moderate", improved from last week',
            };

            const row = `${escapeCSV(exercise.name)},${escapeCSV(exercise.leftReps)},${escapeCSV(exercise.rightReps)},${escapeCSV(exercise.sets)},${escapeCSV(exercise.pain)},${escapeCSV(exercise.notes)}`;

            expect(row).toBe(
                '"Clamshells, Right Side",20,30,3,2,"Pain level ""moderate"", improved from last week"'
            );
        });

        it('should handle all null/undefined values', () => {
            const row = `${escapeCSV(null)},${escapeCSV(undefined)},${escapeCSV(null)}`;
            expect(row).toBe(',,');
        });

        it('should handle mixed null and valid values', () => {
            const row = `${escapeCSV('Valid')},${escapeCSV(null)},${escapeCSV(123)}`;
            expect(row).toBe('Valid,,123');
        });
    });
});
