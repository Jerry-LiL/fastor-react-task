import { describe, it, expect } from 'vitest';
import { clamp, clampOverlayPosition, getInitialCenteredPosition } from './overlay';

describe('Overlay Clamping and Positioning Utils', () => {
  describe('clamp()', () => {
    it('returns the value if within [min, max]', () => {
      expect(clamp(50, 0, 100)).toBe(50);
    });

    it('returns min if value is below min', () => {
      expect(clamp(-10, 0, 100)).toBe(0);
    });

    it('returns max if value is above max', () => {
      expect(clamp(150, 0, 100)).toBe(100);
    });

    it('handles inverted bounds safely', () => {
      expect(clamp(50, 100, 20)).toBe(100);
    });
  });

  describe('clampOverlayPosition()', () => {
    const bounds = {
      containerWidth: 400,
      containerHeight: 260,
      itemWidth: 100,
      itemHeight: 40,
    };

    it('keeps a position within valid bounds unchanged', () => {
      const pos = { x: 50, y: 50 };
      expect(clampOverlayPosition(pos, bounds)).toEqual({ x: 50, y: 50 });
    });

    it('clamps negative coordinates to 0', () => {
      const pos = { x: -30, y: -20 };
      expect(clampOverlayPosition(pos, bounds)).toEqual({ x: 0, y: 0 });
    });

    it('clamps coordinates that exceed container minus item size', () => {
      // maxX is 400 - 100 = 300, maxY is 260 - 40 = 220
      const pos = { x: 350, y: 250 };
      expect(clampOverlayPosition(pos, bounds)).toEqual({ x: 300, y: 220 });
    });

    it('handles cases where item is larger than container', () => {
      const tinyContainer = {
        containerWidth: 50,
        containerHeight: 20,
        itemWidth: 100,
        itemHeight: 40,
      };
      const pos = { x: 20, y: 10 };
      expect(clampOverlayPosition(pos, tinyContainer)).toEqual({ x: 0, y: 0 });
    });
  });

  describe('getInitialCenteredPosition()', () => {
    it('calculates the exact center coordinates', () => {
      const bounds = {
        containerWidth: 400,
        containerHeight: 300,
        itemWidth: 100,
        itemHeight: 50,
      };
      expect(getInitialCenteredPosition(bounds)).toEqual({
        x: 150, // (400 - 100) / 2
        y: 125, // (300 - 50) / 2
      });
    });

    it('defaults to 0 if item size exceeds container', () => {
      const bounds = {
        containerWidth: 50,
        containerHeight: 50,
        itemWidth: 100,
        itemHeight: 100,
      };
      expect(getInitialCenteredPosition(bounds)).toEqual({ x: 0, y: 0 });
    });
  });
});
