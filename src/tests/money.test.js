import { describe, it, expect } from 'vitest';
import { toPaisa, lineValuePaisa, formatBdt } from '../lib/money.js';

describe('toPaisa', () => {
  it('converts simple prices correctly', () => {
    expect(toPaisa('1.50')).toBe(150);
    expect(toPaisa('350.00')).toBe(35000);
  });

  it('converts prices with awkward decimals correctly', () => {
    expect(toPaisa('18.75')).toBe(1875);
    expect(toPaisa('3.20')).toBe(320);
    expect(toPaisa('45.50')).toBe(4550);
  });

  it('throws on malformed input', () => {
    expect(() => toPaisa('18.7')).toThrow();
    expect(() => toPaisa('abc')).toThrow();
    expect(() => toPaisa(18.75)).toThrow(); // must be a string
  });
});

describe('lineValuePaisa', () => {
  it('multiplies unit price by quantity', () => {
    expect(lineValuePaisa(150, 211)).toBe(31650); // Napa 500 example from dataset
  });

  it('handles zero quantity', () => {
    expect(lineValuePaisa(150, 0)).toBe(0);
  });
});

describe('formatBdt', () => {
  it('formats whole taka amounts', () => {
    expect(formatBdt(437000)).toBe('৳4,370.00');
  });

  it('formats amounts with paisa correctly', () => {
    expect(formatBdt(2121890)).toBe('৳21,218.90');
  });

  it('applies lakh grouping for large amounts', () => {
    expect(formatBdt(19832455)).toBe('৳1,98,324.55'); // PUB-21 expired value
  });

  it('formats zero correctly', () => {
    expect(formatBdt(0)).toBe('৳0.00');
  });

  it('formats negative values with a leading minus', () => {
    expect(formatBdt(-150)).toBe('-৳1.50');
  });
});