/**
 * All date math in this module works on integer "epoch days" (days since
 * the Unix epoch), never on JS Date-object arithmetic with wall-clock time.
 * This avoids timezone/DST drift entirely, which matters because dataset
 * dates must be compared consistently regardless of the browser's locale.
 *
 * Dates are always plain ISO strings: "YYYY-MM-DD".
 */

/**
 * Converts an ISO date string to an integer day count since epoch.
 * @param {string} isoDate - e.g. "2026-08-16"
 * @returns {number} integer epoch day
 */
export function epochDay(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    throw new Error(`Invalid ISO date: "${isoDate}"`);
  }

  // Date.UTC uses 0-indexed months
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/**
 * Computes how many days remain until expiry, relative to a given "today".
 * Positive = still has days left. Zero = expires today. Negative = expired.
 * @param {string} expiryIso
 * @param {string} todayIso
 * @returns {number}
 */
export function daysLeft(expiryIso, todayIso) {
  return epochDay(expiryIso) - epochDay(todayIso);
}