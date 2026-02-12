/**
 * icons.js — Hand-crafted SVG icon library
 *
 * Each icon is a function that returns an SVG string.
 * All icons use currentColor for stroke, so they inherit text color.
 * Default size is 24px, adjustable via parameter.
 */

const sw = 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const icons = {
    // ========== Navigation ==========
    home: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,

    clipboard: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`,

    clock: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,

    barChart: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,

    menu: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,

    arrowLeft: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,

    settings: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,

    download: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,

    info: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,

    // ========== Exercise Categories ==========
    foot: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><path d="M7 20c0-2 1-3 3-4s3-3 3-5c0-3-2-6-2-8s1-3 3-3c3 0 4 3 4 6 0 2-.5 3.5-1 5s-1 3.5 0 5c.5 1 2 2 2 4"/><circle cx="8" cy="20" r="1"/><circle cx="19" cy="20" r="1"/></svg>`,

    hip: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><circle cx="12" cy="4" r="2"/><path d="M16 10l-4 2-4-2"/><path d="M8 10v6l4 5"/><path d="M16 10v6l-4 5"/><path d="M6 8l6 4 6-4"/></svg>`,

    core: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><rect x="7" y="4" width="10" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg>`,

    balance: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18"/></svg>`,

    strength: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/><rect x="3" y="6" width="6" height="4" rx="1"/><rect x="15" y="6" width="6" height="4" rx="1"/><rect x="3" y="14" width="6" height="4" rx="1"/><rect x="15" y="14" width="6" height="4" rx="1"/></svg>`,

    power: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,

    mobility: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><circle cx="12" cy="5" r="2"/><path d="M8 21l2-7"/><path d="M16 21l-2-7"/><path d="M7 10c0 0 2-2 5-2s5 2 5 2"/><path d="M10 14h4"/></svg>`,

    // ========== UI ==========
    checkCircle: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,

    trophy: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 22V8"/><path d="M14 22V8"/><path d="M8 6a4 4 0 0 1 8 0v4a4 4 0 0 1-8 0z"/></svg>`,

    chevronDown: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><polyline points="6 9 12 15 18 9"/></svg>`,

    chevronRight: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><polyline points="9 18 15 12 9 6"/></svg>`,

    xClose: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,

    phone: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,

    alertTriangle: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,

    sun: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,

    moon: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,

    dumbbell: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><path d="M6.5 6.5h11v11h-11z" transform="rotate(45 12 12)"/><line x1="4" y1="20" x2="7" y2="17"/><line x1="17" y1="7" x2="20" y2="4"/></svg>`,

    calendar: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,

    trash: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,

    target: (size = 24) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ${sw}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
};

/**
 * Get a category icon by exercise category name.
 * @param {string} category - Exercise category
 * @param {number} size - Icon size
 * @returns {string} SVG string
 */
export function getCategoryIcon(category, size = 18) {
    const map = {
        'Foot & Ankle': icons.foot,
        'Hip & Glute': icons.hip,
        Core: icons.core,
        Balance: icons.balance,
        'Balance & Stability': icons.balance,
        Mobility: icons.mobility,
        Strength: icons.strength,
        Power: icons.power,
    };
    const fn = map[category];
    return fn ? fn(size) : icons.target(size);
}

export default icons;
