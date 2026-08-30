/**
 * Hand-rolled validation for uploaded/pasted case JSON (schema 2.1/2.2).
 * No external validation library — the shape is small and stable, and
 * a judge's malformed file should fail with a clear message rather
 * than crash the app or silently misclassify data.
 */

const REQUIRED_ITEM_FIELDS = ['id', 'name', 'company', 'batch', 'quantity', 'unit_price_bdt', 'expiry'];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PRICE_RE = /^\d+\.\d{2}$/;

/**
 * @param {unknown} raw - parsed JSON, shape unknown
 * @returns {{ valid: true, case: object } | { valid: false, errors: string[] }}
 */
export function validateCase(raw) {
  const errors = [];

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, errors: ['Top-level value must be a JSON object.'] };
  }

  if (typeof raw.case_id !== 'string' || raw.case_id.trim() === '') {
    errors.push('"case_id" must be a non-empty string.');
  }

  if (typeof raw.today !== 'string' || !ISO_DATE_RE.test(raw.today)) {
    errors.push('"today" must be an ISO date string, e.g. "2026-08-16".');
  }

  if (!Array.isArray(raw.items) || raw.items.length === 0) {
    errors.push('"items" must be a non-empty array.');
  } else {
    raw.items.forEach((item, i) => {
      if (typeof item !== 'object' || item === null) {
        errors.push(`items[${i}] must be an object.`);
        return;
      }
      for (const field of REQUIRED_ITEM_FIELDS) {
        if (!(field in item)) errors.push(`items[${i}] is missing "${field}".`);
      }
      if ('quantity' in item && !Number.isInteger(item.quantity)) {
        errors.push(`items[${i}].quantity must be an integer.`);
      }
      if ('unit_price_bdt' in item && !PRICE_RE.test(String(item.unit_price_bdt))) {
        errors.push(`items[${i}].unit_price_bdt must look like "18.75".`);
      }
      if ('expiry' in item && !ISO_DATE_RE.test(String(item.expiry))) {
        errors.push(`items[${i}].expiry must be an ISO date string.`);
      }
      if ('id' in item && typeof item.id !== 'string') {
        errors.push(`items[${i}].id must be a string.`);
      }
    });
  }

  if (raw.mark_returned !== undefined &&
      (!Array.isArray(raw.mark_returned) || raw.mark_returned.some((id) => typeof id !== 'string'))) {
    errors.push('"mark_returned" must be an array of strings, if present.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Non-fatal cleanup: drop any mark_returned id that doesn't match a real
  // item, rather than rejecting an otherwise-valid case over it.
  const itemIds = new Set(raw.items.map((i) => i.id));
  const cleanedReturned = (raw.mark_returned ?? []).filter((id) => itemIds.has(id));

  return {
    valid: true,
    case: { ...raw, mark_returned: cleanedReturned },
  };
}