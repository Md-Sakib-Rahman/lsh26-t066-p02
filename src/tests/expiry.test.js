import { describe, it, expect } from 'vitest';
import { classify, GROUPS } from '../lib/expiry.js';

describe('classify', () => {
  it('classifies negative daysLeft as EXPIRED', () => {
    expect(classify(-1)).toBe(GROUPS.EXPIRED);
    expect(classify(-400)).toBe(GROUPS.EXPIRED);
  });

  it('classifies 0 as SOON_30, not EXPIRED', () => {
    expect(classify(0)).toBe(GROUPS.SOON_30);
  });

  it('classifies the SOON_30 upper boundary (30) correctly', () => {
    expect(classify(30)).toBe(GROUPS.SOON_30);
  });

  it('classifies 31 as SOON_90, not SOON_30', () => {
    expect(classify(31)).toBe(GROUPS.SOON_90);
  });

  it('classifies the SOON_90 upper boundary (90) correctly', () => {
    expect(classify(90)).toBe(GROUPS.SOON_90);
  });

  it('classifies 91 as SAFE, not SOON_90', () => {
    expect(classify(91)).toBe(GROUPS.SAFE);
  });

  it('classifies large future values as SAFE', () => {
    expect(classify(720)).toBe(GROUPS.SAFE);
  });

  it('throws on non-integer input', () => {
    expect(() => classify(1.5)).toThrow();
    expect(() => classify('30')).toThrow();
  });
});