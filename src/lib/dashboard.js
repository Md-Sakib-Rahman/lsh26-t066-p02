import { daysLeft } from './date.js';
import { classify, GROUPS } from './expiry.js';
import { toPaisa, lineValuePaisa } from './money.js';

/**
 * Builds the full dashboard view model for a single case, given the set
 * of item IDs the pharmacist has marked as returned.
 *
 * Returned items are excluded from all active counts and all active value
 * totals (BR-2 / R-24) — this exclusion happens here, before aggregation,
 * not as a display-layer filter.
 *
 * @param {{ case_id: string, today: string, items: Array, mark_returned?: string[] }} caseData
 * @param {Set<string>} returnedIds
 * @returns {{
 *   today: string,
 *   counts: Record<string, number>,
 *   values: Record<string, number>,
 *   expiredValuePaisa: number,
 *   soon30ValuePaisa: number,
 *   active: Array,
 *   returned: Array
 * }}
 */
export function buildDashboard(caseData, returnedIds) {
  const { today, items } = caseData;

  const counts = {
    [GROUPS.EXPIRED]: 0,
    [GROUPS.SOON_30]: 0,
    [GROUPS.SOON_90]: 0,
    [GROUPS.SAFE]: 0,
  };
  const values = {
    [GROUPS.EXPIRED]: 0,
    [GROUPS.SOON_30]: 0,
    [GROUPS.SOON_90]: 0,
    [GROUPS.SAFE]: 0,
  };

  const active = [];
  const returned = [];

  for (const item of items) {
    const dLeft = daysLeft(item.expiry, today);
    const group = classify(dLeft);
    const unitPricePaisa = toPaisa(item.unit_price_bdt);
    const valuePaisa = lineValuePaisa(unitPricePaisa, item.quantity);
    const isReturned = returnedIds.has(item.id);

    const classified = {
      ...item,
      daysLeft: dLeft,
      group,
      unitPricePaisa,
      valuePaisa,
      returned: isReturned,
    };

    if (isReturned) {
      returned.push(classified);
      continue; // excluded from counts/values entirely
    }

    active.push(classified);
    counts[group] += 1;
    values[group] += valuePaisa;
  }

  return {
    today,
    counts,
    values,
    expiredValuePaisa: values[GROUPS.EXPIRED],
    soon30ValuePaisa: values[GROUPS.SOON_30],
    active,
    returned,
  };
}

/**
 * Convenience helper: builds a dashboard using a case's own mark_returned
 * list as the initial returned set (used on first load of a case).
 * @param {object} caseData
 * @returns {ReturnType<typeof buildDashboard>}
 */
export function buildDashboardFromCase(caseData) {
  const returnedIds = new Set(caseData.mark_returned ?? []);
  return buildDashboard(caseData, returnedIds);
}