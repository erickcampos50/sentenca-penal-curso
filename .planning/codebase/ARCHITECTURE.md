# Architecture

## Snapshot
This repository is a client-only React 18 + Vite + TypeScript application for calculating Brazilian criminal sentencing dosimetry. The runtime app is rendered entirely in the browser, uses Tailwind utility classes for styling, and reads a static crime catalog from `public/crimes.csv`. There is no backend, router, global store, API client, test suite, or persistence layer in the inspected source.

## Application Shape
The application is a single-page calculator. `src/App.tsx` delegates directly to `src/components/DosimetriaPenal.tsx`, which owns the main tab navigation, most user input state, and the primary sentencing calculations. Supporting components under `src/components/dosimetria/` render focused sections for result display, prescription/detraction, criminal concurso, multa, and shared UI primitives.

The code separates static legal/reference data (`data.ts`), domain types (`types.ts`), domain calculations/report generation (`utils.ts`), and UI sections. The separation is partial: `DosimetriaPenal.tsx` still contains significant calculation and presentation logic in one 800+ line component.

## Entry Points
`index.html` defines the root DOM node at `#root` and loads `/src/main.tsx` as the module script.

`src/main.tsx` imports React, `ReactDOM.createRoot`, `App`, and `src/index.css`, then renders `<App />` inside `React.StrictMode`.

`src/App.tsx` renders `<DosimetriaPenal />` and has no additional application shell logic.

`vite.config.ts` uses `@vitejs/plugin-react` with default Vite behavior. `netlify.toml` builds via `npm run build`, publishes `dist`, and redirects all routes to `/index.html` for SPA fallback.

## Component Hierarchy
Top-level hierarchy:

`main.tsx` -> `App.tsx` -> `DosimetriaPenal.tsx`.

`DosimetriaPenal.tsx` renders five tab modes: `calc`, `concurso`, `refs`, `sumulas`, and `audit`. The `calc` tab includes inline sections for moldura penal, first phase, second phase, third phase, plus these extracted children:

- `MultaSection.tsx`: multa inputs and computed total.
- `PrescricaoDetracao.tsx`: medida de seguranca, detracao, prescription interruption/suspension controls.
- `ResultadoFinal.tsx`: summary cards, copyable sentencing report, progression/multa/medida display.
- `ConcursoSection.tsx`: rendered when the selected tab is `concurso`; manages concurso-specific rows and reports through parent-owned state.
- `InfoPill.tsx`: shared `Info` and `Pill` presentational primitives backed by color maps from `data.ts`.

The legal references, sumulas, audit log, and large portions of the calculator form are rendered inline inside `DosimetriaPenal.tsx` rather than as separate route/page components.

## State And Data Flow
State is local React component state. `DosimetriaPenal.tsx` owns the main state: active tab, penalty bounds, penalty type, reincidence/violence flags, Art. 59 classifications and observations, aggravating/attenuating rows, majorante/minorante rows, detraction, attempted crime settings, hediondo/reincidencia flags, prescription config, multa config, crime catalog, selected crime, and concurso config/crimes.

Static crime data flows from `public/crimes.csv` through `fetch('/crimes.csv')` in a `useEffect` in `DosimetriaPenal.tsx`, then through `parseCrimeCSV` in `utils.ts`. Selecting a crime populates pena minima, pena maxima, tipo, and violence fields. If fetch or parsing fails at the fetch boundary, the catalog state falls back to an empty array.

Derived sentencing values are recalculated on each render from current state: validity of min/max, interval, pena-base, intermediate penalty, definitive penalty, detraction, regime, substitution, sursis, and prescription deadlines. `ResultadoFinal.tsx` recomputes some aggregate values for report generation from props. `ConcursoSection.tsx` receives parent-owned concurso state and uses `calcConcurso` and `sugerirModalidadeConcurso` from `utils.ts` to derive results.

There is no cross-session persistence. Copy-to-clipboard behavior in `ResultadoFinal.tsx` and `ConcursoSection.tsx` uses `navigator.clipboard.writeText` and local `copied` flags.

## Domain Model
The domain model is TypeScript interfaces in `src/components/dosimetria/types.ts`:

- `Crime`: static catalog item with name, penalty type, min/max years, violence flag, and observation.
- `RowItem`: selected legal circumstance plus fraction for aggravantes, atenuantes, majorantes, and minorantes.
- `ConcursoCrime` and `ConcursoConfig`: individual dosimetrated crimes and selected concurso modality inputs.
- `PrescricaoConfig`: prescription toggles, dates, suspension periods, and fuga days.
- `MedidaSeguranca` and `MultaConfig`: post-dosimetry supporting calculations.
- `VetorInfo`, `SumulaInfo`, `PrescricaoFaixa`, and `ListItem`: static legal/reference data shapes.

Core domain functions are in `src/components/dosimetria/utils.ts`: fraction values (`FV`), prescription deadline lookup, year/month/day formatting using a 360-day commercial year, CSV parsing, regime calculation, progression estimation, concurso calculation, concurso modality suggestion, generated report text, and regime color mapping.

Static legal data lives in `src/components/dosimetria/data.ts`: Art. 59 vectors, aggravantes, atenuantes, majorantes, minorantes, sumulas, prescription ranges, supported fractions, and UI color maps.

## Rendering And Styling Flow
Styling is Tailwind-first. `src/index.css` only imports Tailwind layers with `@tailwind base`, `@tailwind components`, and `@tailwind utilities`. `tailwind.config.ts` scans `index.html` and `src/**/*.{js,ts,jsx,tsx}` and has no custom theme extensions or plugins.

Components use inline Tailwind class strings heavily. Layout is a constrained mobile-friendly column (`max-w-3xl mx-auto`) with cards, grids, tables, and tab buttons. There are no CSS modules, component libraries, or custom global CSS beyond Tailwind directives.

## Error Handling And Edge Cases
Input validation is mostly inline and defensive: invalid or negative penalty bounds collapse to safe numeric defaults, max must be greater than or equal to min, empty rows are ignored, unsupported fractions are ignored via `frac in FV`, detraction cannot reduce below zero, and concurso ignores crimes without a positive definitive penalty.

`parseCrimeCSV` supports two CSV shapes: six columns with numeric min/max already in years, and eight columns with min/max plus units converted by `convertToYears`. It uses naive comma splitting, so quoted commas in fields would break parsing.

Clipboard write failures are caught and only reset local copied state. Crime CSV fetch failures are caught and leave `crimesList` empty. Date parsing in `PrescricaoDetracao.tsx` returns no interruption result for missing or invalid dates.

There is no app-level error boundary. Non-null assertion on `document.getElementById('root')!` in `src/main.tsx` assumes `index.html` always provides the root element.

## Architectural Constraints
The app is designed as a static SPA and can be served from Vite/Netlify without server-side rendering. All legal data and calculations are bundled client-side except `public/crimes.csv`, which remains a static runtime asset.

Build constraints are defined by `package.json`: `npm run build` runs `tsc && vite build`, with strict TypeScript settings in `tsconfig.app.json`, including `strict`, `noUnusedLocals`, and `noUnusedParameters`. Path alias `@/*` is configured but inspected source uses relative imports.

The current architecture favors fast local iteration over modular boundaries. `DosimetriaPenal.tsx` is the main hotspot because it coordinates data loading, state, calculations, tab rendering, legal reference content, audit output, and child composition in one file.

## Unknowns Or Assumptions
No tests were found, so behavioral guarantees are inferred from source inspection only.

`dist/` exists as built output with copied static assets and should not be treated as source architecture.

Legal correctness and statutory currency were not verified beyond reading the app's embedded references and source data.

Reference materials under `referencias/`, `_reversa_sdd/`, `.reversa/`, and reports appear to be project documentation or generated analysis artifacts, not runtime application source.
