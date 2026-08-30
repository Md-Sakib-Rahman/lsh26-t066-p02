import { describe, it, expect } from 'vitest';
import { validateCase } from '../lib/schema.js';

const validItem = {
  id: 'M001', name: 'Napa 500', company: 'Beximco',
  batch: 'F7868', quantity: 211, unit_price_bdt: '1.50', expiry: '2026-07-29',
};

function makeCase(overrides = {}) {
  return {
    case_id: 'TEST-01',
    today: '2026-08-16',
    items: [validItem],
    mark_returned: [],
    ...overrides,
  };
}

describe('validateCase', () => {
  it('accepts a well-formed case', () => {
    const result = validateCase(makeCase());
    expect(result.valid).toBe(true);
  });

  it('rejects non-object input', () => {
    expect(validateCase(null).valid).toBe(false);
    expect(validateCase([1, 2]).valid).toBe(false);
    expect(validateCase('a string').valid).toBe(false);
  });

  it('rejects a missing or malformed case_id', () => {
    expect(validateCase(makeCase({ case_id: '' })).valid).toBe(false);
    expect(validateCase(makeCase({ case_id: 123 })).valid).toBe(false);
  });

  it('rejects a malformed today date', () => {
    expect(validateCase(makeCase({ today: '30/08/2026' })).valid).toBe(false);
  });

  it('rejects an empty items array', () => {
    expect(validateCase(makeCase({ items: [] })).valid).toBe(false);
  });

  it('rejects an item missing a required field', () => {
    const badItem = { ...validItem };
    delete badItem.batch;
    const result = validateCase(makeCase({ items: [badItem] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('batch'))).toBe(true);
  });

  it('rejects a non-integer quantity', () => {
    const result = validateCase(makeCase({ items: [{ ...validItem, quantity: 1.5 }] }));
    expect(result.valid).toBe(false);
  });

  it('rejects a malformed price string', () => {
    const result = validateCase(makeCase({ items: [{ ...validItem, unit_price_bdt: '1.5' }] }));
    expect(result.valid).toBe(false);
  });

  it('strips unknown mark_returned ids instead of rejecting the case', () => {
    const result = validateCase(makeCase({ mark_returned: ['M001', 'M999'] }));
    expect(result.valid).toBe(true);
    expect(result.case.mark_returned).toEqual(['M001']);
  });

  it('accepts a case with no mark_returned field at all', () => {
    const c = makeCase();
    delete c.mark_returned;
    const result = validateCase(c);
    expect(result.valid).toBe(true);
    expect(result.case.mark_returned).toEqual([]);
  });

  it('validates against the real PUB-01 case from the dataset', async () => {
    const cases = (await import('../data/cases.json')).default;
    const pub01 = cases.cases.find((c) => c.case_id === 'PUB-01');
    const result = validateCase(pub01);
    expect(result.valid).toBe(true);
  });
});