import { GROUPS } from '../../lib/expiry.js';

/**
 * Visual mapping for each expiry group. Kept in one place so the
 * label text and badge styling can never drift out of sync with the
 * classification logic in lib/expiry.js.
 */
const GROUP_DISPLAY = {
  [GROUPS.EXPIRED]: { label: 'Expired', className: 'badge-expired' },
  [GROUPS.SOON_30]: { label: '≤ 30 days', className: 'badge-soon30' },
  [GROUPS.SOON_90]: { label: '31–90 days', className: 'badge-soon90' },
  [GROUPS.SAFE]: { label: 'Safe', className: 'badge-safe' },
};

/**
 * @param {{ group: 'EXPIRED'|'SOON_30'|'SOON_90'|'SAFE', className?: string }} props
 */
export default function GroupBadge({ group, className = '' }) {
  const display = GROUP_DISPLAY[group];

  if (!display) {
    // Defensive: a bad group value should be visible, not silently blank
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-neutral text-neutral-content">
        Unknown: {String(group)}
      </span>
    );
  }

  return (
    <span
      className={`${display.className} px-2 py-0.5 rounded-full text-xs inline-block ${className}`}
    >
      {display.label}
    </span>
  );
}