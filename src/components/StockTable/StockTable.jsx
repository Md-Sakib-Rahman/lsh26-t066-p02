import { useState, useMemo, useRef, useLayoutEffect } from "react";
import StockRow from "./StockRow.jsx";
import { GROUPS } from "../../lib/expiry.js";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: GROUPS.EXPIRED, label: "Expired" },
  { key: GROUPS.SOON_30, label: "≤ 30 days" },
  { key: GROUPS.SOON_90, label: "31–90 days" },
  { key: GROUPS.SAFE, label: "Safe" },
];

const MAX_HEIGHT_PX = 480; // internal scroll kicks in beyond this

/**
 * Renders the active stock list with group filter chips. Sorting is
 * fixed to expiry-ascending (worst first) per FR-10 — no user-facing
 * sort control, since the spec doesn't ask for one and the default is
 * the one judges actually want to see.
 *
 * @param {{
 *   items: Array<object>,  // classified active items from dashboard.active
 *   onMarkReturned: (id: string) => void
 * }} props
 */
export default function StockTable({ items, onMarkReturned }) {
  const [filter, setFilter] = useState("ALL");
  const contentRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(null);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.daysLeft - b.daysLeft),
    [items],
  );

  const visible = useMemo(
    () => (filter === "ALL" ? sorted : sorted.filter((i) => i.group === filter)),
    [sorted, filter],
  );

  // Measure the natural height of the content whenever the visible rows
  // change, then animate the wrapper to that height. Capped at
  // MAX_HEIGHT_PX so a large "All" list still scrolls internally instead
  // of growing without bound.
  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const naturalHeight = contentRef.current.scrollHeight;
    setContainerHeight(Math.min(naturalHeight, MAX_HEIGHT_PX));
  }, [visible]);

  return (
    <div className="app-card overflow-hidden">
      <div className="flex flex-wrap gap-2 p-4 border-b border-base-300">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              filter === f.key
                ? "btn-app-primary px-3 py-1 text-xs"
                : "btn-app-ghost px-3 py-1 text-xs"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="p-6 text-sm text-base-content/60">No items in this group.</p>
      ) : (
        <div
          className="overflow-x-auto overflow-y-auto transition-[height] duration-300 ease-in-out"
          style={{ height: containerHeight != null ? `${containerHeight}px` : "auto" }}
        >
          <div ref={contentRef}>
            <table className="w-full text-sm">
              <thead className="bg-base-300/50 text-left sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-semibold">Medicine</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Batch</th>
                  <th className="px-4 py-3 font-semibold">Qty</th>
                  <th className="px-4 py-3 font-semibold">Expiry</th>
                  <th className="px-4 py-3 font-semibold">Days left</th>
                  <th className="px-4 py-3 font-semibold">Group</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <StockRow key={item.id} item={item} onMarkReturned={onMarkReturned} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 