/**
 * Persists the pharmacist's "returned to distributor" decisions across
 * page reloads, scoped per case.
 *
 * Item IDs (e.g. "M006") are reused across cases — the same ID means a
 * different medicine in PUB-01 vs PUB-05 — so storage MUST be keyed by
 * case_id. A single global key would leak returns between cases.
 *
 * The stored set only ever contains IDs the pharmacist added during the
 * session via the UI. The case's own seeded `mark_returned` list is never
 * written here — it's merged in at load time by the caller — so that if a
 * case's seed data changes upstream, stale localStorage doesn't shadow it.
 */

const KEY_PREFIX = 'p02:returns:';

function keyFor(caseId) {
  if (!caseId) {
    throw new Error('storage.js: caseId is required');
  }
  return `${KEY_PREFIX}${caseId}`;
}

/**
 * Reads the session-added returned IDs for a case from localStorage.
 * Returns an empty array if nothing is stored, storage is unavailable,
 * or the stored value is corrupted.
 * @param {string} caseId
 * @returns {string[]}
 */
export function readStoredReturns(caseId) {
  const key = keyFor(caseId);
  try {
    const raw = localStorage.getItem(keyFor(caseId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((id) => typeof id === 'string');
  } catch {
    // localStorage disabled, quota issues, corrupted JSON, etc.
    // Fail safe to "nothing stored" rather than throwing in the UI.
    return [];
  }
}

/**
 * Writes the full set of session-added returned IDs for a case.
 * @param {string} caseId
 * @param {Iterable<string>} returnedIds
 */
export function writeStoredReturns(caseId, returnedIds) {
  const key = keyFor(caseId);  
  try {
    localStorage.setItem(keyFor(caseId), JSON.stringify([...returnedIds]));
  } catch {
    // Storage unavailable/full — the session can continue without
    // persistence rather than crashing the app.
  }
}

/**
 * Clears all session-added returns for a case (used by "undo all" or
 * when resetting a case to its seeded state).
 * @param {string} caseId
 */
export function clearStoredReturns(caseId) {
  const key = keyFor(caseId);
  try {
    localStorage.removeItem(keyFor(caseId));
  } catch {
    // no-op if storage is unavailable
  }
}

/**
 * Loads the full returned-ID set for a case: the case's seeded
 * mark_returned list, unioned with whatever the pharmacist has added
 * during the session and persisted.
 * @param {string} caseId
 * @param {string[]} seededIds - caseData.mark_returned ?? []
 * @returns {Set<string>}
 */
export function loadReturnedIds(caseId, seededIds = []) {
  const stored = readStoredReturns(caseId);
  return new Set([...seededIds, ...stored]);
}

/**
 * Persists a full returned-ID set for a case, storing only the IDs that
 * are NOT part of the seed (so seed changes upstream aren't shadowed by
 * stale storage).
 * @param {string} caseId
 * @param {Set<string>} returnedIds - the full current set (seed + session)
 * @param {string[]} seededIds - caseData.mark_returned ?? []
 */
export function saveReturnedIds(caseId, returnedIds, seededIds = []) {
  const seededSet = new Set(seededIds);
  const sessionOnly = [...returnedIds].filter((id) => !seededSet.has(id));
  writeStoredReturns(caseId, sessionOnly);
}