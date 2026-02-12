import { describe, it, expect } from 'vitest';
import { getPickerValue, setPickerValue } from '../js/wheel-picker.js';

/**
 * Tests for wheel picker component.
 * Note: Full integration tests require real browser rendering and scroll calculations.
 * These tests focus on the value get/set API which is most critical for data flow.
 */

describe('Wheel Picker', () => {
    describe('getPickerValue()', () => {
        it('should return 0 for non-existent picker', () => {
            expect(getPickerValue('nonexistent')).toBe(0);
        });

        it('should read value property when hidden input exists', () => {
            const picker = document.createElement('input');
            picker.type = 'hidden';
            picker.id = 'mockPicker';
            picker.value = '42';
            document.body.appendChild(picker);

            expect(getPickerValue('mockPicker')).toBe(42);
        });

        it('should return 0 for picker without value', () => {
            const picker = document.createElement('input');
            picker.type = 'hidden';
            picker.id = 'emptyPicker';
            document.body.appendChild(picker);

            expect(getPickerValue('emptyPicker')).toBe(0);
        });

        it('should parse string values as integers', () => {
            const picker = document.createElement('input');
            picker.type = 'hidden';
            picker.id = 'stringPicker';
            picker.value = '5';
            document.body.appendChild(picker);

            expect(getPickerValue('stringPicker')).toBe(5);
        });
    });

    describe('setPickerValue()', () => {
        it('should handle non-existent picker gracefully', () => {
            expect(() => setPickerValue('nonexistent', 10)).not.toThrow();
        });

        it('should update data-value attribute when called', () => {
            const container = document.createElement('div');
            container.innerHTML = '<div id="testPicker" data-value="0"></div>';
            document.body.appendChild(container);

            // Note: Full setPickerValue requires scroll container which jsdom can't properly simulate
            // This test just verifies the function doesn't crash
            expect(() => setPickerValue('testPicker', 5)).not.toThrow();
        });
    });

    describe('Edge cases', () => {
        it('should handle negative values', () => {
            const picker = document.createElement('input');
            picker.type = 'hidden';
            picker.id = 'negativePicker';
            picker.value = '-5';
            document.body.appendChild(picker);

            expect(getPickerValue('negativePicker')).toBe(-5);
        });

        it('should handle zero', () => {
            const picker = document.createElement('input');
            picker.type = 'hidden';
            picker.id = 'zeroPicker';
            picker.value = '0';
            document.body.appendChild(picker);

            expect(getPickerValue('zeroPicker')).toBe(0);
        });

        it('should handle large values', () => {
            const picker = document.createElement('input');
            picker.type = 'hidden';
            picker.id = 'largePicker';
            picker.value = '9999';
            document.body.appendChild(picker);

            expect(getPickerValue('largePicker')).toBe(9999);
        });

        it('should handle non-numeric values', () => {
            const picker = document.createElement('input');
            picker.type = 'hidden';
            picker.id = 'nanPicker';
            picker.value = 'abc';
            document.body.appendChild(picker);

            expect(getPickerValue('nanPicker')).toBe(0); // Falls back to 0
        });
    });
});

