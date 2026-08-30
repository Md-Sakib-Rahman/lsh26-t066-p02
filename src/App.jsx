import { useState, useMemo, useCallback } from 'react';
import casesData from './data/cases.json';
import { buildDashboard } from './lib/dashboard.js';
import { loadReturnedIds, saveReturnedIds } from './lib/storage.js';

import CasePicker from './components/CasePicker/CasePicker.jsx';
import SummaryCards from './components/SummaryCards/SummaryCards.jsx';
import StockTable from './components/StockTable/StockTable.jsx';
import ReturnedList from './components/ReturnedList/ReturnedList.jsx';

const CASES_BY_ID = Object.fromEntries(
  casesData.cases.map((c) => [c.case_id, c])
);
const CASE_IDS = casesData.cases.map((c) => c.case_id);

export default function App() {
  const [selectedCaseId, setSelectedCaseId] = useState(CASE_IDS[0]);
  const caseData = CASES_BY_ID[selectedCaseId];
  const seededIds = caseData.mark_returned ?? [];

  // Returned IDs = case's seeded mark_returned + whatever the
  // pharmacist has clicked this session, persisted per case_id.
  const [returnedIds, setReturnedIds] = useState(() =>
    loadReturnedIds(selectedCaseId, seededIds)
  );

  const dashboard = useMemo(
    () => buildDashboard(caseData, returnedIds),
    [caseData, returnedIds]
  );

  const handleSelectCase = useCallback((caseId) => {
    const nextCase = CASES_BY_ID[caseId];
    const nextSeeded = nextCase.mark_returned ?? [];
    setSelectedCaseId(caseId);
    setReturnedIds(loadReturnedIds(caseId, nextSeeded));
  }, []);

  const handleMarkReturned = useCallback(
    (itemId) => {
      setReturnedIds((prev) => {
        const next = new Set(prev);
        next.add(itemId);
        saveReturnedIds(selectedCaseId, next, seededIds);
        return next;
      });
    },
    [selectedCaseId, seededIds]
  );

  const handleUndoReturn = useCallback(
    (itemId) => {
      setReturnedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        saveReturnedIds(selectedCaseId, next, seededIds);
        return next;
      });
    },
    [selectedCaseId, seededIds]
  );

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl">Pharmacy Expiry Shelf Check</h1>
          <p className="text-sm text-base-content/60">
            {dashboard.active.length + dashboard.returned.length} items loaded for {selectedCaseId}
          </p>
        </header>

        <CasePicker
          caseIds={CASE_IDS}
          selectedCaseId={selectedCaseId}
          today={dashboard.today}
          onSelectCase={handleSelectCase}
        />

        <SummaryCards counts={dashboard.counts} values={dashboard.values} />

        <StockTable
          items={dashboard.active}
          onMarkReturned={handleMarkReturned}
        />

        <ReturnedList
          items={dashboard.returned}
          onUndoReturn={handleUndoReturn}
        />
      </div>
    </div>
  );
}