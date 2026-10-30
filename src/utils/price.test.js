import { describe, it, expect } from 'vitest';
import { calculateItemTotal, formatPrice } from './price';

describe('Price Utils', () => {
  describe('calculateItemTotal', () => {
    it('calculates total for base price and quantity 1 without extra portion cost', () => {
      expect(calculateItemTotal(14, 0, 1)).toBe(14);
    });

    it('adds portion extra cost to base price before multiplying by quantity', () => {
      // (14 + 10) * 3 = 24 * 3 = 72
      expect(calculateItemTotal(14, 10, 3)).toBe(72);
      // (14 + 3) * 2 = 34
      expect(calculateItemTotal(14, 3, 2)).toBe(34);
    });

    it('handles decimal prices accurately', () => {
      expect(calculateItemTotal(12.99, 3.5, 2)).toBe(32.98);
      expect(calculateItemTotal(8.2, 0, 1)).toBe(8.2);
    });

    it('falls back safely on missing or invalid inputs', () => {
      expect(calculateItemTotal()).toBe(0);
      expect(calculateItemTotal('14', '6', '2')).toBe(40);
      expect(calculateItemTotal(14, 0, 0)).toBe(14); // min qty 1
    });
  });

  describe('formatPrice', () => {
    it('formats numbers with rupee symbol and two decimal places', () => {
      expect(formatPrice(14)).toBe('₹14.00');
      expect(formatPrice(72)).toBe('₹72.00');
      expect(formatPrice(12.99)).toBe('₹12.99');
      expect(formatPrice(0)).toBe('₹0.00');
    });

    it('handles numeric strings gracefully', () => {
      expect(formatPrice('20')).toBe('₹20.00');
      expect(formatPrice('invalid')).toBe('₹0.00');
    });
  });
});
