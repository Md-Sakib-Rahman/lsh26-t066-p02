# Third-Party Material and AI Disclosure

List material frameworks, libraries, starters, templates, UI kits, fonts, icons and assets used in this repository.

## Direct dependencies

| Name | Version | Licence | Used for |
|---|---|---|---|
| React | 19.2.8 | MIT | UI library |
| React DOM | 19.2.8 | MIT | DOM rendering for React |
| Recharts | 2.15.4 | MIT | Summary bar chart (stock by group) |
| Vite | 6.x | MIT | Build tool / dev server |
| @vitejs/plugin-react | 4.x | MIT | React support for Vite |
| Tailwind CSS | 4.x | MIT | Utility-first CSS (dev dependency — build-time only, not shipped at runtime) |
| @tailwindcss/vite | 4.x | MIT | Tailwind v4 Vite plugin (dev dependency) |
| daisyUI | 5.x | MIT | Tailwind component classes, theme system (dev dependency) |
| Vitest | 2.x | MIT | Test runner for the domain logic layer (dev dependency) |
| ESLint (+ default Vite config) | 9.x | MIT | Linting, from the create-vite scaffold (dev dependency) |

## Transitive dependencies (pulled in by Recharts)

All resolve to MIT, ISC, or BSD-3-Clause — confirmed via `npx license-checker --production --summary` against the full dependency tree, run 30 August 2026. No copyleft (GPL/AGPL/LGPL/MPL) or non-commercial licence is present in the production dependency tree.

| Name | Licence | Name | Licence |
|---|---|---|---|
| d3-array | ISC | d3-scale | ISC |
| d3-color | ISC | d3-shape | ISC |
| d3-ease | BSD-3-Clause | d3-time | ISC |
| d3-format | ISC | d3-time-format | ISC |
| d3-interpolate | ISC | d3-timer | ISC |
| d3-path | ISC | internmap | ISC |
| decimal.js-light | MIT | react-is | MIT |
| dom-helpers | MIT | react-smooth | MIT |
| eventemitter3 | MIT | react-transition-group | BSD-3-Clause |
| fast-equals | MIT | recharts-scale | MIT |
| lodash | MIT | scheduler | MIT |
| prop-types | MIT | tiny-invariant | MIT |
| clsx | MIT | victory-vendor | MIT AND ISC |

**Note on Tailwind's internal tooling:** Tailwind CSS v4 depends internally on `lightningcss`, which is MPL-2.0-licensed. This package is a build-time CSS compiler only — it runs during `npm run build` and is never included in the deployed production bundle a user's browser downloads. It is correctly scoped as a transitive dependency of a `devDependency` (Tailwind CSS is listed under `devDependencies`, not `dependencies`), so it does not appear in the production dependency tree checked above and no MPL-licensed code ships in this application.

No fonts, icon packs, or third-party visual/design assets beyond the above libraries were used. No starter template beyond the default `create-vite` React scaffold (MIT) was used.

## AI tools

- **Claude (Anthropic)** — used for pre-event architecture planning from the published P02 sample data, writing and iterating the domain logic layer (`src/lib/`) and its automated test suites, writing UI components against an agreed prop contract, debugging, and drafting this file, `README.md`, and `evaluation-manifest.json` from the organizer-supplied templates. Output was verified against a golden reference table computed independently from the sample data (64 automated tests) and by manual review before every commit. Full disclosure is also recorded in `evaluation-manifest.json`.

## Original-work statement

Everything not declared in this file or `EVENT.md` was created by the registered team during the event window.