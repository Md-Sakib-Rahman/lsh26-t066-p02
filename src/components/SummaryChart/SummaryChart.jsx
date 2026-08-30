import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { GROUPS } from '../../lib/expiry.js';
import { formatBdt } from '../../lib/money.js';

/**
 * Bar chart re-presenting the same counts/values already shown in
 * SummaryCards, so a judge gets a visual read of the shelf's shape
 * (which group is biggest) alongside the exact numbers. Colors are
 * matched to GroupBadge's palette so the chart and the table/badges
 * map onto each other without a separate legend to decode.
 *
 * @param {{
 *   counts: Record<string, number>,
 *   values: Record<string, number>
 * }} props
 */

// Reads the live CSS custom properties so bar colors follow whichever
// theme (light/dark) is currently active, rather than hardcoded hex
// values that would look wrong after a theme toggle.
function themeColor(varName) {
  if (typeof window === 'undefined') return '#999';
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#999';
}

const GROUP_ORDER = [GROUPS.EXPIRED, GROUPS.SOON_30, GROUPS.SOON_90, GROUPS.SAFE];

const GROUP_META = {
  [GROUPS.EXPIRED]: { label: 'Expired', colorVar: '--color-error', hasValue: true },
  [GROUPS.SOON_30]: { label: '≤ 30 days', colorVar: '--color-warning', hasValue: true },
  [GROUPS.SOON_90]: { label: '31–90 days', colorVar: '--color-info', hasValue: false },
  [GROUPS.SAFE]: { label: 'Safe', colorVar: '--color-success', hasValue: false },
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { label, count, valuePaisa, hasValue } = payload[0].payload;

  return (
    <div className="app-card px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold">{label}</p>
      <p>{count} item{count === 1 ? '' : 's'}</p>
      {hasValue && <p className="text-base-content/70">{formatBdt(valuePaisa)}</p>}
    </div>
  );
}

export default function SummaryChart({ counts, values }) {
  const data = GROUP_ORDER.map((group) => {
    const meta = GROUP_META[group];
    return {
      group,
      label: meta.label,
      count: counts[group],
      valuePaisa: values[group],
      hasValue: meta.hasValue,
      color: themeColor(meta.colorVar),
    };
  });

  return (
    <div className="app-card p-4">
      <h2 className="text-base font-semibold mb-3">Stock by group</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: themeColor('--color-base-content'), fontSize: 12 }}
            axisLine={{ stroke: themeColor('--color-base-300') }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: themeColor('--color-base-content'), fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: themeColor('--color-base-300'), opacity: 0.4 }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={64}>
            {data.map((entry) => (
              <Cell key={entry.group} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}