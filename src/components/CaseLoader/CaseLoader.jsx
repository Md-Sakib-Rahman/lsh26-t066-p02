import { useState, useRef } from 'react';
import { validateCase } from '../../lib/schema.js';

/**
 * Lets a judge load a case in schema 2.1/2.2 shape by uploading a file
 * or pasting JSON directly, per the submission kit's requirement:
 * "Your app must be able to take the values in these files, either by
 * loading the file or by typing them in."
 *
 * Also provides the required reset-to-fixture action so a judge can
 * return to the published sample data after testing a custom case.
 *
 * @param {{
 *   onLoadCase: (caseObject: object) => void,
 *   onReset: () => void,
 *   isCustomCaseLoaded: boolean
 * }} props
 */
export default function CaseLoader({ onLoadCase, onReset, isCustomCaseLoaded }) {
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const fileInputRef = useRef(null);

  function handleParsedJson(text) {
    setError(null);
    setWarning(null);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError('That is not valid JSON. Check for a trailing comma or missing bracket.');
      return;
    }

    const result = validateCase(parsed);
    if (!result.valid) {
      setError(result.errors.join(' '));
      return;
    }

    onLoadCase(result.case);

    const originalReturnedCount = parsed.mark_returned?.length ?? 0;
    const cleanedReturnedCount = result.case.mark_returned.length;
    if (cleanedReturnedCount < originalReturnedCount) {
      setWarning(
        `${originalReturnedCount - cleanedReturnedCount} entr${originalReturnedCount - cleanedReturnedCount === 1 ? 'y' : 'ies'} in "mark_returned" did not match any item id and were ignored.`
      );
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => handleParsedJson(String(reader.result));
    reader.onerror = () => setError('Could not read the selected file.');
    reader.readAsText(file);

    // allow re-selecting the same file after an error
    e.target.value = '';
  }

  function handlePasteLoad() {
    if (pasteText.trim() === '') {
      setError('Paste a case JSON object first.');
      return;
    }
    handleParsedJson(pasteText);
  }

  function handleReset() {
    setError(null);
    setWarning(null);
    setPasteText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onReset();
  }

  return (
    <div className="app-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Load a custom case</h2>
        {isCustomCaseLoaded && (
          <span className="badge-soon30 px-2 py-0.5 rounded-full text-xs">
            Custom case loaded
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="btn-app-outline px-3 py-1.5 text-sm cursor-pointer">
          Upload JSON file
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {isCustomCaseLoaded && (
          <button className="btn-app-ghost px-3 py-1.5 text-sm" onClick={handleReset}>
            Reset to published sample
          </button>
        )}
      </div>

      <div className="space-y-2">
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder='Or paste a case JSON object here, e.g. { "case_id": "...", "today": "...", "items": [...] }'
          rows={4}
          className="textarea textarea-bordered w-full text-sm bg-base-100 border-base-300 rounded-field font-mono"
        />
        <button className="btn-app-primary px-4 py-1.5 text-sm" onClick={handlePasteLoad}>
          Load pasted JSON
        </button>
      </div>

      {error && (
        <p className="text-sm text-error bg-error/10 border border-error/30 rounded-field px-3 py-2">
          {error}
        </p>
      )}
      {warning && !error && (
        <p className="text-sm text-warning bg-warning/10 border border-warning/30 rounded-field px-3 py-2">
          {warning}
        </p>
      )}
    </div>
  );
}