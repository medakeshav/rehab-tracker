import { describe, it, expect, beforeEach } from 'vitest';
import { h, clearElement, replaceContent, text, fragment, setAttributes } from '../js/dom-helpers.js';

/**
 * Tests for safe DOM creation helpers.
 */

describe('DOM Helpers', () => {
    describe('h() - Create elements', () => {
        it('should create element with tag only', () => {
            const el = h('div');
            expect(el.tagName).toBe('DIV');
        });

        it('should create element with text content', () => {
            const el = h('div', 'Hello World');
            expect(el.textContent).toBe('Hello World');
        });

        it('should create element with attributes', () => {
            const el = h('div', { class: 'my-class', id: 'my-id' });
            expect(el.className).toBe('my-class');
            expect(el.id).toBe('my-id');
        });

        it('should create element with attributes and children', () => {
            const el = h('div', { class: 'parent' }, h('span', 'child'));
            expect(el.className).toBe('parent');
            expect(el.children).toHaveLength(1);
            expect(el.children[0].tagName).toBe('SPAN');
        });

        it('should create nested elements', () => {
            const el = h(
                'div',
                { class: 'card' },
                h('h2', 'Title'),
                h('p', 'Description')
            );
            expect(el.children).toHaveLength(2);
            expect(el.children[0].textContent).toBe('Title');
            expect(el.children[1].textContent).toBe('Description');
        });

        it('should handle data attributes', () => {
            const el = h('button', { 'data-action': 'save', 'data-id': '123' });
            expect(el.getAttribute('data-action')).toBe('save');
            expect(el.getAttribute('data-id')).toBe('123');
        });

        it('should handle style objects', () => {
            const el = h('div', { style: { color: 'red', fontSize: '16px' } });
            expect(el.style.color).toBe('red');
            expect(el.style.fontSize).toBe('16px');
        });

        it('should sanitize text content (no XSS)', () => {
            const el = h('div', '<script>alert("xss")</script>');
            expect(el.innerHTML).not.toContain('<script>');
            expect(el.textContent).toContain('<script>');
        });

        it('should handle null children gracefully', () => {
            const el = h('div', null, 'text', null, h('span'));
            expect(el.childNodes).toHaveLength(2); // text node + span
        });

        it('should handle multiple string children', () => {
            const el = h('div', {}, 'Hello ', 'World');
            expect(el.textContent).toBe('Hello World');
        });
    });

    describe('clearElement()', () => {
        it('should remove all children', () => {
            const parent = document.createElement('div');
            parent.appendChild(document.createElement('span'));
            parent.appendChild(document.createElement('span'));
            expect(parent.children).toHaveLength(2);

            clearElement(parent);
            expect(parent.children).toHaveLength(0);
        });

        it('should handle empty element', () => {
            const el = document.createElement('div');
            clearElement(el);
            expect(el.children).toHaveLength(0);
        });

        it('should remove text nodes', () => {
            const el = document.createElement('div');
            el.textContent = 'Hello';
            expect(el.textContent).toBe('Hello');

            clearElement(el);
            expect(el.textContent).toBe('');
        });
    });

    describe('replaceContent()', () => {
        it('should replace all children with new content', () => {
            const el = document.createElement('div');
            el.innerHTML = '<span>Old</span>';

            replaceContent(el, h('p', 'New'));
            expect(el.children).toHaveLength(1);
            expect(el.children[0].tagName).toBe('P');
            expect(el.textContent).toBe('New');
        });

        it('should handle multiple new children', () => {
            const el = document.createElement('div');
            replaceContent(el, h('span', '1'), h('span', '2'), h('span', '3'));
            expect(el.children).toHaveLength(3);
        });

        it('should handle text nodes', () => {
            const el = document.createElement('div');
            replaceContent(el, 'Hello', ' ', 'World');
            expect(el.textContent).toBe('Hello World');
        });
    });

    describe('text()', () => {
        it('should create text node', () => {
            const node = text('Hello');
            expect(node.nodeType).toBe(Node.TEXT_NODE);
            expect(node.textContent).toBe('Hello');
        });

        it('should not parse HTML', () => {
            const node = text('<b>Bold</b>');
            expect(node.textContent).toBe('<b>Bold</b>');
        });
    });

    describe('fragment()', () => {
        it('should create document fragment', () => {
            const frag = fragment(h('div'), h('span'));
            expect(frag instanceof DocumentFragment).toBe(true);
            expect(frag.children).toHaveLength(2);
        });

        it('should handle text nodes', () => {
            const frag = fragment('Hello', ' ', 'World');
            expect(frag.textContent).toBe('Hello World');
        });

        it('should be useful for batch operations', () => {
            const parent = document.createElement('div');
            const frag = fragment(h('span', '1'), h('span', '2'), h('span', '3'));
            parent.appendChild(frag);
            expect(parent.children).toHaveLength(3);
        });
    });

    describe('setAttributes()', () => {
        it('should set attributes on existing element', () => {
            const el = document.createElement('div');
            setAttributes(el, { class: 'my-class', id: 'my-id' });
            expect(el.className).toBe('my-class');
            expect(el.id).toBe('my-id');
        });

        it('should handle data attributes', () => {
            const el = document.createElement('button');
            setAttributes(el, { 'data-action': 'click', 'data-value': '42' });
            expect(el.getAttribute('data-action')).toBe('click');
            expect(el.getAttribute('data-value')).toBe('42');
        });

        it('should handle style object', () => {
            const el = document.createElement('div');
            setAttributes(el, { style: { display: 'none', opacity: '0.5' } });
            expect(el.style.display).toBe('none');
            expect(el.style.opacity).toBe('0.5');
        });

        it('should overwrite existing attributes', () => {
            const el = document.createElement('div');
            el.className = 'old';
            setAttributes(el, { class: 'new' });
            expect(el.className).toBe('new');
        });
    });

    describe('XSS prevention', () => {
        it('should not execute scripts in text content', () => {
            const el = h('div', '<img src=x onerror="alert(1)">');
            // Should escape as text, not parse as HTML
            expect(el.textContent).toContain('onerror');
            expect(el.querySelector('img')).toBeNull(); // No img element created
        });

        it('should treat HTML as plain text', () => {
            const el = h('p', '<script>evil()</script>');
            expect(el.textContent).toContain('<script>');
            expect(el.querySelector('script')).toBeNull(); // No script element created
        });

        it('should handle malicious attributes safely', () => {
            const el = h('div', { 'data-hack': '<script>alert(1)</script>' });
            const attr = el.getAttribute('data-hack');
            expect(attr).toBe('<script>alert(1)</script>'); // Stored as string, won't execute
        });
    });
});
