import { describe, it, expect, beforeEach } from 'vitest';
import {
  readStoredReturns,
  writeStoredReturns,
  clearStoredReturns,
  loadReturnedIds,
  saveReturnedIds,
} from '../lib/storage.js';

beforeEach(() => {
  localStorage.clear();
});

describe('readStoredReturns / writeStoredReturns', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(readStoredReturns('PUB-01')).toEqual([]);
  });

  it('round-trips written IDs', () => {
    writeStoredReturns('PUB-01', new Set(['M012', 'M030']));
    expect(readStoredReturns('PUB-01')).toEqual(['M012', 'M030']);
  });

  it('scopes storage per case_id', () => {
    writeStoredReturns('PUB-01', new Set(['M012']));
    writeStoredReturns('PUB-05', new Set(['M099']));

    expect(readStoredReturns('PUB-01')).toEqual(['M012']);
    expect(readStoredReturns('PUB-05')).toEqual(['M099']);
  });

  it('returns an empty array for corrupted JSON', () => {
    localStorage.setItem('p02:returns:PUB-01', '{not valid json');
    expect(readStoredReturns('PUB-01')).toEqual([]);
  });

  it('filters out non-string entries defensively', () => {
    localStorage.setItem('p02:returns:PUB-01', JSON.stringify(['M001', 42, null]));
    expect(readStoredReturns('PUB-01')).toEqual(['M001']);
  });

  it('throws if caseId is missing', () => {
    expect(() => readStoredReturns()).toThrow();
    expect(() => writeStoredReturns(undefined, new Set())).toThrow();
  });
});

describe('clearStoredReturns', () => {
  it('removes stored returns for a case', () => {
    writeStoredReturns('PUB-01', new Set(['M012']));
    clearStoredReturns('PUB-01');
    expect(readStoredReturns('PUB-01')).toEqual([]);
  });

  it('does not affect other cases', () => {
    writeStoredReturns('PUB-01', new Set(['M012']));
    writeStoredReturns('PUB-05', new Set(['M099']));
    clearStoredReturns('PUB-01');
    expect(readStoredReturns('PUB-05')).toEqual(['M099']);
  });
});

describe('loadReturnedIds', () => {
  it('unions seeded IDs with stored session IDs', () => {
    writeStoredReturns('PUB-01', new Set(['M012']));
    const result = loadReturnedIds('PUB-01', ['M006']);
    expect(result).toEqual(new Set(['M006', 'M012']));
  });

  it('works with no seeded IDs', () => {
    writeStoredReturns('PUB-01', new Set(['M012']));
    const result = loadReturnedIds('PUB-01', []);
    expect(result).toEqual(new Set(['M012']));
  });

  it('works with no stored IDs', () => {
    const result = loadReturnedIds('PUB-01', ['M006']);
    expect(result).toEqual(new Set(['M006']));
  });

  it('de-duplicates if an ID is both seeded and separately stored', () => {
    writeStoredReturns('PUB-01', new Set(['M006']));
    const result = loadReturnedIds('PUB-01', ['M006']);
    expect(result).toEqual(new Set(['M006']));
  });
});

describe('saveReturnedIds', () => {
  it('only persists IDs beyond the seed', () => {
    const fullSet = new Set(['M006', 'M012', 'M030']);
    saveReturnedIds('PUB-01', fullSet, ['M006']);
    expect(readStoredReturns('PUB-01')).toEqual(
      expect.arrayContaining(['M012', 'M030'])
    );
    expect(readStoredReturns('PUB-01')).not.toContain('M006');
  });

  it('round-trips correctly through loadReturnedIds', () => {
    const seeded = ['M006'];
    const fullSet = new Set([...seeded, 'M012']);
    saveReturnedIds('PUB-01', fullSet, seeded);

    const reloaded = loadReturnedIds('PUB-01', seeded);
    expect(reloaded).toEqual(new Set(['M006', 'M012']));
  });
});