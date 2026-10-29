import { describe, it, expect } from 'vitest';
import { isValidPhoneNumber, isValidOtp } from './validation';

describe('Phone Number Validation', () => {
  it('accepts valid 10-digit numbers', () => {
    expect(isValidPhoneNumber('9818979450')).toBe(true);
    expect(isValidPhoneNumber('1234567890')).toBe(true);
  });

  it('rejects numbers with fewer or more than 10 digits', () => {
    expect(isValidPhoneNumber('12345')).toBe(false);
    expect(isValidPhoneNumber('123456789')).toBe(false);
    expect(isValidPhoneNumber('12345678901')).toBe(false);
  });

  it('rejects strings with letters or special characters', () => {
    expect(isValidPhoneNumber('981897945a')).toBe(false);
    expect(isValidPhoneNumber('+919818979450')).toBe(false);
    expect(isValidPhoneNumber('981-897-945')).toBe(false);
  });

  it('rejects empty, null, or undefined inputs', () => {
    expect(isValidPhoneNumber('')).toBe(false);
    expect(isValidPhoneNumber(null)).toBe(false);
    expect(isValidPhoneNumber(undefined)).toBe(false);
  });
});

describe('OTP Validation', () => {
  it('accepts valid 6-digit OTP', () => {
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('000000')).toBe(true);
  });

  it('rejects OTP with non-6 digit lengths', () => {
    expect(isValidOtp('12345')).toBe(false);
    expect(isValidOtp('1234567')).toBe(false);
    expect(isValidOtp('')).toBe(false);
  });

  it('rejects non-numeric characters', () => {
    expect(isValidOtp('12345a')).toBe(false);
    expect(isValidOtp('abcdef')).toBe(false);
  });
});
