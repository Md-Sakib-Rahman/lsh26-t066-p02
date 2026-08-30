/**
 * Lets the pharmacist/judge switch between the 25 public evaluation
 * cases. Displays the case's "as-of" date prominently — this is the
 * date all expiry math is computed against, not the real calendar
 * date, so it needs to be unmistakable on screen (§NFR from the SRS).
 *
 * @param {{
 *   caseIds: string[],           // e.g. ['PUB-01', 'PUB-02', ...]
 *   selectedCaseId: string,
 *   today: string,               // the selected case's "today" field
 *   onSelectCase: (caseId: string) => void
 * }} props
 */
export default function CasePicker({ caseIds, selectedCaseId, today, onSelectCase }) {
  return (
    <div className="app-card p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <label htmlFor="case-select" className="text-sm font-semibold">
          Case
        </label>
        <select
          id="case-select"
          value={selectedCaseId}
          onChange={(e) => onSelectCase(e.target.value)}
          className="select select-bordered select-sm bg-base-100 border-base-300 rounded-field"
        >
          {caseIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <div className="text-sm">
        <span className="text-base-content/60">As of </span>
        <span className="font-semibold">{today}</span>
      </div>
    </div>
  );
}