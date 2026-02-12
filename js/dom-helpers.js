/**
 * dom-helpers.js — Safe DOM creation utilities
 *
 * Provides helper functions for creating DOM elements without innerHTML,
 * eliminating XSS risk from user-generated content.
 */

/**
 * Create a DOM element with safe text content and attributes.
 * Inspired by hyperscript but simplified for our needs.
 *
 * @param {string} tag - HTML tag name (e.g., 'div', 'button')
 * @param {Object|string} [attrsOrText] - Attributes object or text content
 * @param {...(Node|string)} [children] - Child elements or text nodes
 * @returns {HTMLElement} Created element
 *
 * @example
 * // Simple element with text
 * h('div', 'Hello World')
 *
 * // Element with attributes and text
 * h('button', { class: 'btn', id: 'myBtn' }, 'Click Me')
 *
 * // Nested elements
 * h('div', { class: 'card' },
 *   h('h2', 'Title'),
 *   h('p', 'Description')
 * )
 *
 * // Element with event listener (use data attributes instead)
 * h('button', { 'data-action': 'save', class: 'btn' }, 'Save')
 */
function h(tag, attrsOrText, ...children) {
    const el = document.createElement(tag);

    // If second arg is a string, treat it as text content
    if (typeof attrsOrText === 'string') {
        el.textContent = attrsOrText;
        // Any additional args are children
        children.forEach((child) => appendChild(el, child));
        return el;
    }

    // If second arg is an object, treat as attributes
    if (attrsOrText && typeof attrsOrText === 'object' && !attrsOrText.nodeType) {
        Object.entries(attrsOrText).forEach(([key, value]) => {
            if (key === 'class' || key === 'className') {
                el.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else if (key.startsWith('data-')) {
                el.setAttribute(key, value);
            } else if (key === 'id') {
                el.id = value;
            } else {
                el.setAttribute(key, value);
            }
        });
    }

    // Append children
    children.forEach((child) => appendChild(el, child));

    return el;
}

/**
 * Safely append a child to a parent element.
 * Handles strings (converted to text nodes), DOM nodes, and null/undefined.
 *
 * @param {HTMLElement} parent - Parent element
 * @param {Node|string|null} child - Child to append
 */
function appendChild(parent, child) {
    if (child === null || child === undefined) return;

    if (typeof child === 'string') {
        parent.appendChild(document.createTextNode(child));
    } else if (child.nodeType) {
        // Check for nodeType property instead of instanceof Node
        parent.appendChild(child);
    } else if (Array.isArray(child)) {
        child.forEach((c) => appendChild(parent, c));
    }
}

/**
 * Remove all children from an element (safe alternative to innerHTML = '').
 *
 * @param {HTMLElement} element - Element to clear
 */
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Replace an element's content with new children.
 * Safer than innerHTML for dynamic content.
 *
 * @param {HTMLElement} element - Element to update
 * @param {...(Node|string)} children - New children
 */
function replaceContent(element, ...children) {
    clearElement(element);
    children.forEach((child) => appendChild(element, child));
}

/**
 * Create a text node (explicit alternative to string literals).
 *
 * @param {string} text - Text content
 * @returns {Text} Text node
 */
function text(text) {
    return document.createTextNode(text);
}

/**
 * Create a document fragment containing multiple children.
 * Useful for batch DOM operations.
 *
 * @param {...(Node|string)} children - Children to add to fragment
 * @returns {DocumentFragment}
 */
function fragment(...children) {
    const frag = document.createDocumentFragment();
    children.forEach((child) => appendChild(frag, child));
    return frag;
}

/**
 * Set attributes on an element in a safe way.
 *
 * @param {HTMLElement} element - Target element
 * @param {Object} attrs - Attributes to set
 */
function setAttributes(element, attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'class' || key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key === 'id') {
            element.id = value;
        } else {
            element.setAttribute(key, value);
        }
    });
}

export { h, clearElement, replaceContent, text, fragment, setAttributes };
