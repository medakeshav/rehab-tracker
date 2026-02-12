import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    createWheelPicker,
    getPickerValue,
    setPickerValue,
    WHEEL_PICKER_ITEM_HEIGHT,
} from '../js/wheel-picker.js';

describe('Wheel Picker Integration', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    // ========== WHEEL_PICKER_ITEM_HEIGHT ==========
    describe('WHEEL_PICKER_ITEM_HEIGHT', () => {
        it('should be 36', () => {
            expect(WHEEL_PICKER_ITEM_HEIGHT).toBe(36);
        });
    });

    // ========== createWheelPicker ==========
    describe('createWheelPicker()', () => {
        it('should return a DOM element', () => {
            const picker = createWheelPicker('test', 0, 10, 1, 5);
            expect(picker).toBeInstanceOf(HTMLElement);
        });

        it('should have correct class name', () => {
            const picker = createWheelPicker('test', 0, 10, 1, 5);
            expect(picker.className).toBe('wheel-picker-container');
        });

        it('should set data-picker-id attribute', () => {
            const picker = createWheelPicker('myPicker', 0, 10, 1, 5);
            expect(picker.getAttribute('data-picker-id')).toBe('myPicker');
        });

        it('should contain a hidden input with correct id', () => {
            const picker = createWheelPicker('testInput', 0, 10, 1, 5);
            const hidden = picker.querySelector('input[type="hidden"]');
            expect(hidden).toBeTruthy();
            expect(hidden.id).toBe('testInput');
        });

        it('should set default value on hidden input', () => {
            const picker = createWheelPicker('defaultTest', 0, 10, 1, 5);
            const hidden = picker.querySelector('input[type="hidden"]');
            expect(hidden.value).toBe('5');
        });

        it('should create correct number of items', () => {
            const picker = createWheelPicker('itemCount', 0, 10, 1, 5);
            const items = picker.querySelectorAll('.wheel-picker-item');
            expect(items.length).toBe(11); // 0 through 10 inclusive
        });

        it('should create items with step values', () => {
            const picker = createWheelPicker('stepTest', 0, 20, 5, 10);
            const items = picker.querySelectorAll('.wheel-picker-item');
            expect(items.length).toBe(5); // 0, 5, 10, 15, 20
        });

        it('should include scroll container', () => {
            const picker = createWheelPicker('scrollTest', 0, 5, 1, 0);
            const scroll = picker.querySelector('.wheel-picker-scroll');
            expect(scroll).toBeTruthy();
        });

        it('should include highlight band', () => {
            const picker = createWheelPicker('highlight', 0, 5, 1, 0);
            const highlight = picker.querySelector('.wheel-picker-highlight');
            expect(highlight).toBeTruthy();
        });

        it('should include tap guard', () => {
            const picker = createWheelPicker('guard', 0, 5, 1, 0);
            const guard = picker.querySelector('.wheel-picker-tap-guard');
            expect(guard).toBeTruthy();
        });

        it('should start locked (no scrolling)', () => {
            const picker = createWheelPicker('locked', 0, 5, 1, 0);
            const scroll = picker.querySelector('.wheel-picker-scroll');
            expect(scroll.style.overflowY).toBe('hidden');
        });

        it('should include top and bottom spacers', () => {
            const picker = createWheelPicker('spacers', 0, 5, 1, 0);
            const spacers = picker.querySelectorAll('.wheel-picker-spacer');
            expect(spacers.length).toBe(2);
        });

        it('should set data-value on each item', () => {
            const picker = createWheelPicker('dataVal', 1, 3, 1, 1);
            const items = picker.querySelectorAll('.wheel-picker-item');
            expect(items[0].getAttribute('data-value')).toBe('1');
            expect(items[1].getAttribute('data-value')).toBe('2');
            expect(items[2].getAttribute('data-value')).toBe('3');
        });

        it('should display value text in each item', () => {
            const picker = createWheelPicker('textVal', 10, 12, 1, 10);
            const items = picker.querySelectorAll('.wheel-picker-item');
            expect(items[0].textContent).toBe('10');
            expect(items[1].textContent).toBe('11');
            expect(items[2].textContent).toBe('12');
        });
    });

    // ========== getPickerValue ==========
    describe('getPickerValue()', () => {
        it('should return 0 for non-existent picker', () => {
            expect(getPickerValue('nonexistent')).toBe(0);
        });

        it('should read value from hidden input', () => {
            const picker = createWheelPicker('getValue', 0, 10, 1, 7);
            document.body.appendChild(picker);
            expect(getPickerValue('getValue')).toBe(7);
        });

        it('should parse string values correctly', () => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.id = 'stringVal';
            input.value = '42';
            document.body.appendChild(input);
            expect(getPickerValue('stringVal')).toBe(42);
        });

        it('should return 0 for non-numeric input', () => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.id = 'nanVal';
            input.value = 'abc';
            document.body.appendChild(input);
            expect(getPickerValue('nanVal')).toBe(0);
        });

        it('should return 0 for empty value', () => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.id = 'emptyVal';
            input.value = '';
            document.body.appendChild(input);
            expect(getPickerValue('emptyVal')).toBe(0);
        });
    });

    // ========== setPickerValue ==========
    describe('setPickerValue()', () => {
        it('should not throw for non-existent picker', () => {
            expect(() => setPickerValue('nonexistent', 5)).not.toThrow();
        });

        it('should update hidden input value', () => {
            const picker = createWheelPicker('setVal', 0, 20, 1, 0);
            document.body.appendChild(picker);
            setPickerValue('setVal', 15);
            expect(getPickerValue('setVal')).toBe(15);
        });

        it('should update visual state of items', () => {
            const picker = createWheelPicker('visual', 0, 5, 1, 0);
            document.body.appendChild(picker);
            setPickerValue('visual', 3);
            const items = picker.querySelectorAll('.wheel-picker-item');
            const selectedItem = items[3]; // index 3 = value 3
            expect(selectedItem.classList.contains('selected')).toBe(true);
        });

        it('should remove previous selection', () => {
            const picker = createWheelPicker('reselect', 0, 5, 1, 2);
            document.body.appendChild(picker);
            setPickerValue('reselect', 4);
            const items = picker.querySelectorAll('.wheel-picker-item');
            // Item at index 2 (old value) should not be selected
            expect(items[2].classList.contains('selected')).toBe(false);
            // Item at index 4 (new value) should be selected
            expect(items[4].classList.contains('selected')).toBe(true);
        });
    });
});
