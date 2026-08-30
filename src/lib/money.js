/**
 * All monetary values are handled as integer paisa (1 taka = 100 paisa)
 * internally, to avoid floating-point drift when summing many prices.
 * Formatting to a display string happens only at the very edge (UI).
 *
 * unit_price_bdt in the dataset is always a string with exactly two
 * decimal places, e.g. "18.75", "350.00", "1.50".
 */

/**
 * Converts a price string like "18.75" into integer paisa (1875).
 * Uses string splitting rather than parseFloat()*100 to avoid any
 * floating-point rounding at the conversion boundary.
 * @param {string} priceStr
 * @returns {number} integer paisa
 */
export function toPaisa(priceStr) {
  if (typeof priceStr !== 'string' || !/^\d+\.\d{2}$/.test(priceStr)) {
    throw new Error(`toPaisa() expects a "X.XX" string, got: ${priceStr}`);
  }

  const [whole, frac] = priceStr.split('.');
  return Number(whole) * 100 + Number(frac);
}

/**
 * Computes the total value of a line item in paisa.
 * @param {number} unitPricePaisa
 * @param {number} quantity
 * @returns {number} integer paisa
 */
export function lineValuePaisa(unitPricePaisa, quantity) {
  if (!Number.isInteger(unitPricePaisa) || !Number.isInteger(quantity)) {
    throw new Error('lineValuePaisa() expects integer paisa and integer quantity');
  }
  return unitPricePaisa * quantity;
}

/**
 * Formats integer paisa as a Bangladeshi Taka display string.
 * e.g. 2121890 -> "৳21,218.90"
 * @param {number} paisa
 * @returns {string}
 */
export function formatBdt(paisa) {
  if (!Number.isInteger(paisa)) {
    throw new Error(`formatBdt() expects integer paisa, got: ${paisa}`);
  }

  const negative = paisa < 0;
  const abs = Math.abs(paisa);
  const taka = Math.floor(abs / 100);
  const sub = String(abs % 100).padStart(2, '0');

  const grouped = taka.toLocaleString('en-IN'); // lakh/crore grouping

  return `${negative ? '-' : ''}৳${grouped}.${sub}`;
}