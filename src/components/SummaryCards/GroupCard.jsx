/**
 * A single summary tile: item count for one expiry group, with an
 * optional taka value shown underneath (only EXPIRED and SOON_30 carry
 * a value per FR-05/FR-06 — the other two groups pass no `value` prop).
 */
export default function GroupCard({ label, count, value, toneClass }) {
  return (
    <div className="app-card p-4">
      <p className="text-sm text-base-content/60">{label}</p>
      <p className={`text-3xl font-semibold ${toneClass}`}>{count}</p>
      {value != null && (
        <p className="text-sm mt-1 text-base-content/70">{value}</p>
      )}
    </div>
  );
}