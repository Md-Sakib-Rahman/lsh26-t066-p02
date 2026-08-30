import GroupBadge from '../StockTable/GroupBadge.jsx';
import { formatBdt } from '../../lib/money.js';

/**
 * Displays items the pharmacist has returned to the distributor,
 * separate from the active stock table (P3 requirement — returned
 * items must visibly leave the active groups).
 *
 * Each returned item still carries its original `group` classification
 * (from lib/dashboard.js) purely for display context — "this was
 * expiring soon when it was returned" — but contributes to no active
 * count or total.
 *
 * @param {{
 *   items: Array<object>,  // classified returned items from dashboard.returned
 *   onUndoReturn: (id: string) => void
 * }} props
 */
export default function ReturnedList({ items, onUndoReturn }) {
  const totalValuePaisa = items.reduce((sum, item) => sum + item.valuePaisa, 0);

  return (
    <div className="app-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
        <h2 className="text-base font-semibold">Returned to distributor</h2>
        <p className="text-sm text-base-content/60">
          {items.length} item{items.length === 1 ? '' : 's'} · {formatBdt(totalValuePaisa)} removed from active totals
        </p>
      </div>

      {items.length === 0 ? (
        <p className="p-6 text-sm text-base-content/60">
          Nothing returned yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-base-300/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Medicine</th>
                <th className="px-4 py-3 font-semibold">Batch</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Was</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-base-300 opacity-70">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-base-content/60">{item.batch}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <GroupBadge group={item.group} />
                  </td>
                  <td className="px-4 py-3">{formatBdt(item.valuePaisa)}</td>
                  <td className="px-4 py-3">
                    <button
                      className="btn-app-ghost px-3 py-1 text-xs"
                      onClick={() => onUndoReturn(item.id)}
                    >
                      Undo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}