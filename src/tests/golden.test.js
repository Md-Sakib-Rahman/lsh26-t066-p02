import { describe, it, expect } from 'vitest';
import { buildDashboardFromCase } from '../lib/dashboard.js';
import cases from '../data/cases.json';

// Reference table derived independently from the sample dataset (§10 of the SRS).
// [case_id, expired, soon30, soon90, safe, returnedCount, expiredValueBdt, soon30ValueBdt]
const GOLDEN = [
  ['PUB-01', 10, 10, 11, 15, 1, '21218.90', '96934.25'],
  ['PUB-02', 12, 11, 12, 18, 1, '23150.90', '55979.00'],
  ['PUB-03', 11, 6, 10, 16, 3, '125768.10', '102218.75'],
  ['PUB-04', 13, 15, 5, 13, 1, '87934.00', '17596.60'],
  ['PUB-05', 7, 9, 14, 9, 1, '38316.00', '75194.35'],
  ['PUB-06', 13, 15, 6, 21, 1, '22201.30', '118848.50'],
  ['PUB-07', 13, 8, 9, 15, 1, '52337.70', '116185.25'],
  ['PUB-08', 7, 8, 8, 15, 2, '90998.00', '42869.35'],
  ['PUB-09', 8, 10, 12, 17, 2, '18926.00', '30363.40'],
  ['PUB-10', 11, 11, 8, 13, 3, '89541.70', '25528.50'],
  ['PUB-11', 16, 7, 12, 19, 2, '51100.45', '97088.00'],
  ['PUB-12', 10, 6, 8, 17, 3, '59433.80', '39542.50'],
  ['PUB-13', 14, 5, 7, 11, 3, '131766.40', '34954.50'],
  ['PUB-14', 10, 5, 8, 16, 2, '65031.20', '13669.50'],
  ['PUB-15', 9, 4, 13, 18, 3, '10297.00', '4370.00'],
  ['PUB-16', 17, 14, 5, 23, 1, '42982.75', '94729.50'],
  ['PUB-17', 18, 7, 9, 24, 1, '68495.25', '111088.50'],
  ['PUB-18', 8, 9, 8, 12, 3, '102124.80', '101121.50'],
  ['PUB-19', 13, 6, 12, 19, 2, '119843.00', '14483.75'],
  ['PUB-20', 10, 7, 8, 25, 2, '27369.00', '69640.75'],
  ['PUB-21', 20, 3, 9, 11, 3, '198324.55', '21064.00'],
  ['PUB-22', 12, 4, 10, 12, 2, '17187.90', '49137.20'],
  ['PUB-23', 5, 7, 14, 26, 1, '13385.00', '86490.80'],
  ['PUB-24', 17, 6, 10, 12, 1, '183629.00', '115689.50'],
  ['PUB-25', 14, 12, 12, 19, 2, '84781.25', '63261.35'],
];

function bdtToPaisa(bdtStr) {
  const [whole, frac] = bdtStr.split('.');
  return Number(whole) * 100 + Number(frac);
}

const byId = Object.fromEntries(cases.cases.map((c) => [c.case_id, c]));

describe('golden dataset — all 25 public cases', () => {
  it.each(GOLDEN)(
    '%s matches reference counts and values',
    (caseId, expired, soon30, soon90, safe, returnedCount, expiredBdt, soon30Bdt) => {
      const caseData = byId[caseId];
      expect(caseData, `case ${caseId} not found in dataset`).toBeDefined();

      const dash = buildDashboardFromCase(caseData);

      expect(dash.counts.EXPIRED).toBe(expired);
      expect(dash.counts.SOON_30).toBe(soon30);
      expect(dash.counts.SOON_90).toBe(soon90);
      expect(dash.counts.SAFE).toBe(safe);
      expect(dash.returned.length).toBe(returnedCount);

      expect(dash.expiredValuePaisa).toBe(bdtToPaisa(expiredBdt));
      expect(dash.soon30ValuePaisa).toBe(bdtToPaisa(soon30Bdt));

      // sanity: every item is accounted for exactly once
      const total =
        dash.counts.EXPIRED +
        dash.counts.SOON_30 +
        dash.counts.SOON_90 +
        dash.counts.SAFE +
        dash.returned.length;
      expect(total).toBe(caseData.items.length);
    }
  );
});