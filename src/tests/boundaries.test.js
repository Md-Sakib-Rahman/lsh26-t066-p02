import { describe, it, expect } from 'vitest';
import { epochDay, daysLeft } from '../lib/date.js';

describe('epochDay', () => {
  it('is deterministic and comparable', () => {
    expect(epochDay('2026-08-16')).toBeLessThan(epochDay('2026-08-17'));
  });

  it('handles month/year rollovers correctly', () => {
    expect(epochDay('2026-03-01') - epochDay('2026-02-28')).toBe(1);
    expect(epochDay('2027-01-01') - epochDay('2026-12-31')).toBe(1);
  });

  it('throws on malformed input', () => {
    expect(() => epochDay('not-a-date')).toThrow();
  });
});

describe('daysLeft', () => {
  it('is 0 when expiry is today', () => {
    expect(daysLeft('2026-08-16', '2026-08-16')).toBe(0);
  });

  it('is negative when already expired', () => {
    expect(daysLeft('2026-08-15', '2026-08-16')).toBe(-1);
  });

  it('is positive when expiry is in the future', () => {
    expect(daysLeft('2026-08-17', '2026-08-16')).toBe(1);
  });

  it('matches the seeded boundary values from the sample dataset', () => {
    // These are the six boundary values confirmed present in every case:
    // -1, 0, 30, 31, 90, 91
    expect(daysLeft('2026-08-15', '2026-08-16')).toBe(-1);
    expect(daysLeft('2026-08-16', '2026-08-16')).toBe(0);
    expect(daysLeft('2026-09-15', '2026-08-16')).toBe(30);
    expect(daysLeft('2026-09-16', '2026-08-16')).toBe(31);
    expect(daysLeft('2026-11-14', '2026-08-16')).toBe(90);
    expect(daysLeft('2026-11-15', '2026-08-16')).toBe(91);
  });
});