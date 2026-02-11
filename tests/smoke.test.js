import { describe, it, expect } from 'vitest';

describe('Smoke test', () => {
    it('should verify test infrastructure works', () => {
        expect(1 + 1).toBe(2);
    });

    it('should have access to jsdom environment', () => {
        expect(typeof document).toBe('object');
        expect(typeof window).toBe('object');
        expect(typeof localStorage).toBe('object');
    });
});
