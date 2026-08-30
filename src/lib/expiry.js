/**
 * Classification of a stock item based on days remaining until expiry.
 *
 * Rules (BR-1):
 *   EXPIRED  : daysLeft < 0
 *   SOON_30  : 0 <= daysLeft <= 30   (expires today counts as SOON_30, not EXPIRED)
 *   SOON_90  : 31 <= daysLeft <= 90
 *   SAFE     : daysLeft > 90
 *
 * These four groups are mutually exclusive and exhaustive for any integer
 * daysLeft value.
 */

export const GROUPS = Object.freeze({
  EXPIRED: 'EXPIRED',
  SOON_30: 'SOON_30',
  SOON_90: 'SOON_90',
  SAFE: 'SAFE',
});

/**
 * @param {number} daysLeft
 * @returns {'EXPIRED'|'SOON_30'|'SOON_90'|'SAFE'}
 */
export function classify(daysLeft) {
  if (!Number.isInteger(daysLeft)) {
    throw new Error(`classify() expects an integer daysLeft, got: ${daysLeft}`);
  }

  if (daysLeft < 0) return GROUPS.EXPIRED;
  if (daysLeft <= 30) return GROUPS.SOON_30;
  if (daysLeft <= 90) return GROUPS.SOON_90;
  return GROUPS.SAFE;
}