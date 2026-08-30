import { useState, useMemo, useCallback } from "react";
import casesData from "./data/cases.json";
import { buildDashboard } from "./lib/dashboard.js";
import {
  loadReturnedIds,
  saveReturnedIds,
  loadSelectedCaseId,
  saveSelectedCaseId,
} from "./lib/storage.js";

import CasePicker from "./components/CasePicker/CasePicker.jsx";
import SummaryCards from "./components/SummaryCards/SummaryCards.jsx";
import StockTable from "./components/StockTable/StockTable.jsx";
import ReturnedList from "./components/ReturnedList/ReturnedList.jsx";
import CaseLoader from "./components/CaseLoader/CaseLoader.jsx";
import SummaryChart from './components/SummaryChart/SummaryChart.jsx';
import { GROUPS } from './lib/expiry.js';
const CASES_BY_ID = Object.fromEntries(
  casesData.cases.map((c) => [c.case_id, c]),
);
const CASE_IDS = casesData.cases.map((c) => c.case_id);

export default function App() {
  const [selectedCaseId, setSelectedCaseId] = useState(() =>
    loadSelectedCaseId(CASE_IDS[0]),
  );
  const [customCase, setCustomCase] = useState(null);

  // custom (judge-loaded) case takes priority over the dropdown selection
  const caseData = customCase ?? CASES_BY_ID[selectedCaseId];
  const seededIds = caseData.mark_returned ?? [];
  const activeCaseId = customCase ? customCase.case_id : selectedCaseId;

  // Returned IDs = case's seeded mark_returned + whatever the
  // pharmacist has clicked this session, persisted per case_id.
  const [returnedIds, setReturnedIds] = useState(() =>
    loadReturnedIds(activeCaseId, seededIds),
  );

  const dashboard = useMemo(
    () => buildDashboard(caseData, returnedIds),
    [caseData, returnedIds],
  );

  function handleLoadCase(loadedCase) {
    setCustomCase(loadedCase);
    setReturnedIds(
      loadReturnedIds(loadedCase.case_id, loadedCase.mark_returned ?? []),
    );
  }
  function handleResetToFixture() {
    setCustomCase(null);
    setReturnedIds(
      loadReturnedIds(
        selectedCaseId,
        CASES_BY_ID[selectedCaseId].mark_returned ?? [],
      ),
    );
  }
  //   const handleSelectCase = useCallback((caseId) => {
  //     const nextCase = CASES_BY_ID[caseId];
  //     const nextSeeded = nextCase.mark_returned ?? [];
  //     setSelectedCaseId(caseId);
  //     setReturnedIds(loadReturnedIds(caseId, nextSeeded));
  //   }, []);
  const handleSelectCase = useCallback((caseId) => {
    const nextCase = CASES_BY_ID[caseId];
    const nextSeeded = nextCase.mark_returned ?? [];
    setSelectedCaseId(caseId);
    saveSelectedCaseId(caseId);
    setCustomCase(null); // dropdown selection always overrides a loaded custom case
    setReturnedIds(loadReturnedIds(caseId, nextSeeded));
  }, []);

  const handleMarkReturned = useCallback(
    (itemId) => {
      setReturnedIds((prev) => {
        const next = new Set(prev);
        next.add(itemId);
        saveReturnedIds(activeCaseId, next, seededIds);
        return next;
      });
    },
    [activeCaseId, seededIds],
  );

  const handleUndoReturn = useCallback(
    (itemId) => {
      setReturnedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        saveReturnedIds(activeCaseId, next, seededIds);
        return next;
      });
    },
    [activeCaseId, seededIds],
  );

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl">Pharmacy Expiry Shelf Check</h1>
          <p className="text-sm text-base-content/60">
            {dashboard.active.length + dashboard.returned.length} items loaded
            for {activeCaseId}
          </p>
          {/* <p className="text-sm text-base-content/60">
            {dashboard.active.length + dashboard.returned.length} items loaded
            for {selectedCaseId}
          </p> */}
        </header>

        <CasePicker
          caseIds={CASE_IDS}
          selectedCaseId={selectedCaseId}
          today={dashboard.today}
          onSelectCase={handleSelectCase}
        />
        <CaseLoader
          onLoadCase={handleLoadCase}
          onReset={handleResetToFixture}
          isCustomCaseLoaded={customCase !== null}
        />
        <SummaryCards counts={dashboard.counts} values={dashboard.values} />
        <SummaryChart counts={dashboard.counts} values={dashboard.values} />
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
