import { GROUPS } from '../../lib/expiry.js';
import { formatBdt } from '../../lib/money.js';
import GroupCard from './GroupCard.jsx';

/**
 * Renders the four group-count tiles plus the two required taka totals
 * (FR-04, FR-05, FR-06). Takes the raw dashboard `counts`/`values` shape
 * produced by lib/dashboard.js directly — no transformation needed here
 * beyond formatting for display.
 *
 * @param {{
 *   counts: Record<string, number>,
 *   values: Record<string, number>
 * }} props
 */
export default function SummaryCards({ counts, values }) {
  const tiles = [
    {
      key: GROUPS.EXPIRED,
      label: 'Expired',
      count: counts[GROUPS.EXPIRED],
      value: formatBdt(values[GROUPS.EXPIRED]),
      toneClass: 'text-error',
    },
    {
      key: GROUPS.SOON_30,
      label: '≤ 30 days',
      count: counts[GROUPS.SOON_30],
      value: formatBdt(values[GROUPS.SOON_30]),
      toneClass: 'text-warning',
    },
    {
      key: GROUPS.SOON_90,
      label: '31–90 days',
      count: counts[GROUPS.SOON_90],
      value: null, // R-04: only the 30-day group's value is required
      toneClass: 'text-info',
    },
    {
      key: GROUPS.SAFE,
      label: 'Safe',
      count: counts[GROUPS.SAFE],
      value: null,
      toneClass: 'text-success',
    },
  ];

  const combinedRisk = values[GROUPS.EXPIRED] + values[GROUPS.SOON_30];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((tile) => (
          <GroupCard
            key={tile.key}
            label={tile.label}
            count={tile.count}
            value={tile.value}
            toneClass={tile.toneClass}
          />
        ))}
      </div>
      <p className="text-sm text-base-content/60 mt-3">
        {formatBdt(combinedRisk)} of purchase value is expired or expiring within 30 days.
      </p>
    </div>
  );
}