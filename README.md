# Pharmacy Expiry Shelf Check

Solution for **LofiStack Hackathon 2026 — P02**

## Project information

- **Team:** `Two Guys One Repo`
- **Team ID:** `LSH26-T066`
- **Problem:** `P02 — Pharmacy Expiry Shelf Check`
- **Live application:** `https://lsh26-t066-p02.vercel.app/`



## Solution summary

A single-screen dashboard for a pharmacist to see, at a glance, how much shelf stock is expired, expiring soon, or safe — and how much money that represents. Items can be marked as returned to the distributor, which removes them from the active counts and totals. The app can load any of the 25 published sample cases, or a judge can paste/upload a new case in the same JSON shape to test it live.

## Requirements

| Requirement | Status | Where to verify |
|---|---|---|
| Stock list of ≥40 medicines with name, batch, quantity, expiry (Item 1) | Complete | `src/data/cases.json`; loaded via `CasePicker` |
| Dashboard splits stock into 4 groups with counts (Item 2) | Complete | `src/components/SummaryCards/SummaryCards.jsx`, `src/lib/expiry.js` |
| Mark item returned; leaves active groups (Item 3) | Complete | `src/components/StockTable/StockRow.jsx` ("Return" button), `src/lib/dashboard.js` |
| Taka value shown for expired and ≤30-day groups (Item 4, R-04, R-27) | Complete | `SummaryCards.jsx`, `src/lib/money.js` |
| Returned item leaves active value totals (R-24) | Complete | `src/lib/dashboard.js` — verified by `src/tests/golden.test.js` across all 25 public cases |
| App accepts new case data by upload or paste (submission kit requirement) | Complete | `src/components/CaseLoader/CaseLoader.jsx`, `src/lib/schema.js` |
| Returned state and selected case survive a page reload | Complete | `src/lib/storage.js` |

## How to test the application

1. Open the live application.
2. Use the **Case** dropdown to select any of the 25 published sample cases (`PUB-01` … `PUB-25`) and confirm the four group counts, the two taka totals, and the "As of" date update.
3. Click **Return** on any active row and confirm it disappears from the active groups/totals and appears in the **Returned to distributor** list below.
4. Click **Undo** on a returned row and confirm it returns to its original group.
5. To test with new data: paste a JSON object in the same shape as the sample files into the **Load a custom case** box (or upload a `.json` file), and click **Load pasted JSON**. Click **Reset to published sample** to return to the dropdown's case.

### Test or sample data

The app ships with the full published fixture (`P02_pharmacy_expiry_public.json`, 25 cases) embedded at build time — no setup step is needed; it loads automatically on first visit.

To test a **new** case, paste or upload a JSON object shaped like:

```json
{
  "case_id": "JUDGE-01",
  "today": "2026-08-30",
  "items": [
    { "id": "X001", "name": "Example Med", "company": "ExampleCo", "batch": "Z1111", "quantity": 10, "unit_price_bdt": "5.00", "expiry": "2026-08-29" }
  ],
  "mark_returned": []
}
```

Click **Reset to published sample** at any time to discard the custom case and return to the dropdown-selected published sample — this restores the initial state.

## Run locally

### Requirements

- Node.js 18+
- No database or account required

### Setup

```bash
git clone <FILL IN: PUBLIC-REPOSITORY-URL>
cd lsh26-t066-p02
npm install
npm run dev
```

No environment variables are required — the app has no backend and no third-party API calls.

## Problem-solving approach

- **Understanding the problem:** the sample data was profiled in full before any code was written. Every one of the 25 public cases seeds exactly one item at each of six boundary values (`days_left` = −1, 0, 30, 31, 90, 91) and seeds every `mark_returned` entry inside the 0–30 day group — this shaped the whole test strategy around getting the classification boundaries and the returned-item exclusion exactly right, since those are clearly the parts being checked.
- **Chosen solution:** a pure, framework-free domain layer (`src/lib/`) — date math, money math, classification, aggregation, and storage — built and unit-tested in isolation *before* any UI component existed. All arithmetic uses integer day counts and integer paisa to avoid timezone drift and floating-point rounding errors.
- **Most important technical decision:** no backend and no login. The whole problem is a pure function of a dataset plus a set of returned IDs; nothing here needs multiple users, accounts, or server-side persistence. Returns and the selected case persist in `localStorage`, scoped per `case_id` (item IDs repeat across cases, so a global key would leak state between cases).
- **How it was tested:** a golden-data test suite (`src/tests/golden.test.js`) computes the expected count and value for every one of the 25 public cases independently, then asserts the app's `buildDashboard()` output matches exactly — 64 automated tests total across the domain layer (date, classification, money, dashboard aggregation, storage, and case-JSON validation).

## Technology used

- **Frontend:** React (Vite), Tailwind CSS v4, daisyUI, Recharts
- **Backend:** None — client-only application
- **Database:** None — case data is embedded at build time; return state uses browser `localStorage`
- **Deployment:** Vercel
- **Other material tools:** Vitest (test runner)

See [`LICENSES.md`](LICENSES.md) for third-party materials.

## Team contributions

| Registered member | GitHub username | Major contribution | Evidence |
|---|---|---|---|
| `<FILL IN: name>` | `<FILL IN: username>` | `<FILL IN>` | `<FILL IN: file/feature/commit>` |
| `<FILL IN: name>` | `<FILL IN: username>` | `<FILL IN>` | `<FILL IN: file/feature/commit>` |

Commit count alone does not represent contribution.

## AI usage

- **Tool:** Claude (Anthropic)
- **Used for:** designing the architecture and requirements document ahead of the event; writing and iterating the domain layer (`src/lib/`) and its Vitest test suites; writing UI components against an agreed prop contract; debugging a state-initialization-order bug in `App.jsx`; drafting this README, `evaluation-manifest.json`, and `LICENSES.md` from the organizer-supplied templates.
- **How output was verified:** every domain-layer function was checked against a golden-value table computed independently from the published sample data (all 25 cases, 64 automated tests, run and confirmed passing by the team before integration). UI components were manually verified in isolation against mock props before being wired into the app. The team read and understood all generated code before committing it.

## Major design decisions

- **No backend, no login, no database:** the problem has one undifferentiated user role ("the pharmacist") and no cross-device or multi-user requirement; adding auth/a database would add build risk and licensing surface for zero required functionality.
- **Integer arithmetic for all money and date math:** `unit_price_bdt` is parsed into integer paisa and dates are converted to integer epoch-day counts, avoiding floating-point drift and timezone-related off-by-one errors on the classification boundaries the sample data specifically seeds.
- **Returns and selected-case persistence via `localStorage`, keyed by `case_id`:** item IDs repeat across different cases in the sample data, so storage is scoped per case to avoid one case's returns leaking into another.
- **Case upload/paste accepts either method** rather than building a manual data-entry form, per the submission kit's explicit "loading the file or typing them in" allowance — file upload and paste-as-text were judged the lowest-risk way to satisfy this within the build window.

## Known limitations

- Returns and the selected published case persist across a reload; a custom (judge-pasted/uploaded) case itself is not persisted across a reload — reloading returns to the last published case selected. This was a deliberate scope decision; see the manifest for reasoning.
- No text/company/batch search — filtering is available by expiry group only.
- No CSV export of the expired/soon-to-expire list.
- No automated UI/component tests; components were verified manually against mock props. Automated tests cover the domain logic layer only (64 tests).

## Repository records

- [`EVENT.md`](EVENT.md) — event start code and pre-event-material declaration
- [`evaluation-manifest.json`](evaluation-manifest.json) — structured judging evidence
- [`LICENSES.md`](LICENSES.md) — frameworks, libraries, templates and assets