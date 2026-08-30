import GroupBadge from './GroupBadge.jsx';
import { formatBdt } from '../../lib/money.js';

/**
 * A single active stock item row. Receives a fully classified item
 * (the shape produced by lib/dashboard.js — includes daysLeft, group,
 * valuePaisa) plus a callback for the return action.
 *
 * This component holds no logic of its own beyond formatting for
 * display — classification and value math already happened upstream.
 *
 * @param {{
 *   item: {
 *     id: string, name: string, company: string, batch: string,
 *     quantity: number, expiry: string, daysLeft: number,
 *     group: string, valuePaisa: number
 *   },
 *   onMarkReturned: (id: string) => void
 * }} props
 */
export default function StockRow({ item, onMarkReturned }) {
  return (
    <tr className="border-t border-base-300">
      <td className="px-4 py-3">{item.name}</td>
      <td className="px-4 py-3 text-base-content/60">{item.company}</td>
      <td className="px-4 py-3 text-base-content/60">{item.batch}</td>
      <td className="px-4 py-3">{item.quantity}</td>
      <td className="px-4 py-3">{item.expiry}</td>
      <td className="px-4 py-3 text-base-content/60">{item.daysLeft}d</td>
      <td className="px-4 py-3">
        <GroupBadge group={item.group} />
      </td>
      <td className="px-4 py-3">{formatBdt(item.valuePaisa)}</td>
      <td className="px-4 py-3">
        <button
          className="btn-app-danger px-3 py-1 text-xs"
          onClick={() => onMarkReturned(item.id)}
        >
          Return
        </button>
      </td>
    </tr>
  );
}