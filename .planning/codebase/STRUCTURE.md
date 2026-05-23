# Structure

## Snapshot
The repository is organized around a Vite React app in `src/`, static assets in `public/`, generated build output in `dist/`, and project/reference documentation outside the runtime source tree. The application source is small but concentrated: the main calculator component is large, while domain utilities and data are grouped under `src/components/dosimetria/`.

## Directory Map
Key directories and files:

- `src/`: React/TypeScript source for the app.
- `src/components/`: top-level application component and dosimetria subcomponents.
- `src/components/dosimetria/`: domain-specific UI sections, types, constants, and utilities.
- `public/`: static runtime assets served by Vite, including `crimes.csv`.
- `dist/`: generated Vite build output, not source of truth.
- `referencias/`: legal/reference documents used as project context, not imported by app source.
- `_reversa_sdd/` and `.reversa/`: generated/specification or analysis artifacts, not imported by app source.
- `node_modules/`: installed dependencies, excluded from architecture inference.
- `.git/`: repository metadata, excluded from analysis.

## Source Files
`src/main.tsx` is the browser entry point. It renders `App` into `#root` and imports global Tailwind CSS.

`src/App.tsx` is a minimal wrapper that renders `DosimetriaPenal`.

`src/index.css` contains only Tailwind layer directives.

`src/vite-env.d.ts` provides Vite TypeScript environment declarations.

## Component Files
`src/components/DosimetriaPenal.tsx` is the primary orchestration component. It owns most state, fetches the crime CSV, derives the sentencing calculations, renders the tab system, and contains large inline sections for calculator phases, legal references, sumulas, and audit output.

`src/components/dosimetria/InfoPill.tsx` exports shared visual primitives: `Info` and `Pill`.

`src/components/dosimetria/ResultadoFinal.tsx` renders final sentencing summary cards, progression estimates, multa and medida de seguranca summaries, and a copyable generated report.

`src/components/dosimetria/PrescricaoDetracao.tsx` renders medida de seguranca, detraction, and prescription interruption/suspension controls.

`src/components/dosimetria/ConcursoSection.tsx` renders concurso de crimes inputs, modality diagnostics, calculated results, and copyable concurso report.

`src/components/dosimetria/MultaSection.tsx` renders multa inputs and validates/calculates day-fine totals.

## Domain Utility Files
`src/components/dosimetria/types.ts` defines the app's domain interfaces and UI prop types.

`src/components/dosimetria/data.ts` contains static domain/reference constants: Art. 59 vectors, aggravantes, atenuantes, majorantes, minorantes, sumulas, prescription ranges, supported fractions, and color class maps.

`src/components/dosimetria/utils.ts` contains reusable calculation and formatting logic: fraction mapping, prescription prazo lookup, penalty formatting, CSV parsing, regime calculation, progression calculation, concurso calculation, concurso modality suggestion, report generation, and regime color mapping.

## Static And Reference Assets
`public/crimes.csv` is a runtime static asset loaded with `fetch('/crimes.csv')`. It is the source for crime autocomplete/selection and includes mixed row formats: six-column rows with numeric year values and eight-column rows with min/max values plus units.

`public/crimes.csv:Zone.Identifier` is present and appears to be filesystem metadata from a downloaded file rather than application data.

`referencias/` contains legal/reference Markdown and PDF material. These files are not imported by the Vite source.

Top-level Markdown files such as `relatorio_sumulas_STJ.md` and `state.md` are documentation/context files, not runtime source.

## Generated Or Build Artifacts
`dist/` exists and contains built output including `index.html`, `assets/`, `crimes.csv`, and `crimes.csv:Zone.Identifier`. Treat this directory as generated output from Vite and static asset copying, not as source architecture.

`package-lock.json` records installed dependency versions.

`node_modules/` is dependency installation output and is excluded from analysis.

## Configuration Files
`package.json` defines the project as private ESM package `dosimetria-penal`, with scripts `dev`, `build`, and `preview`. Runtime dependencies are only `react` and `react-dom`; build/dev dependencies include Vite, TypeScript, Tailwind, PostCSS, Autoprefixer, and React type/plugin packages.

`vite.config.ts` enables the React plugin with default Vite settings.

`tailwind.config.ts` scans `index.html` and `src/**/*.{js,ts,jsx,tsx}` with no custom theme extensions or plugins.

`postcss.config.js` wires Tailwind CSS and Autoprefixer.

`tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`.

`tsconfig.app.json` targets ES2020, uses bundler module resolution, React JSX transform, strict checking, no unused locals/parameters, and defines an unused `@/*` alias to `src/*`.

`tsconfig.node.json` type-checks `vite.config.ts` with strict bundler-oriented settings.

`netlify.toml` builds with `npm run build`, publishes `dist`, and configures SPA fallback redirects.

`index.html` sets `lang="pt-BR"`, app title, viewport metadata, and the `#root` container.

## Hotspots And Coupling
`src/components/DosimetriaPenal.tsx` is the main coupling hotspot. It combines state ownership, data fetching, calculation derivation, tab rendering, form UI, legal reference text, and audit rendering. Changes to sentencing behavior, UI tabs, or data flow are likely to touch this file.

`src/components/dosimetria/utils.ts` is the domain behavior hotspot. Multiple components depend on its formatting, regime, progression, concurso, CSV parsing, and report generation functions.

`src/components/dosimetria/data.ts` is a static content hotspot. UI options and legal reference lists are centralized there, so changes to supported circumstances or sumulas flow into selectors and display components.

`public/crimes.csv` is coupled to `parseCrimeCSV`. Its mixed six-column/eight-column structure is supported by custom parsing; adding quoted CSV values or commas in fields would require parser changes.

`ResultadoFinal.tsx` duplicates some aggregation logic already derived in `DosimetriaPenal.tsx` for report generation, which can create drift if one calculation path changes without the other.

## Unknowns Or Assumptions
No automated tests, lint config, or CI configuration were found in inspected source/config files.

The app assumes browser APIs including `fetch`, `datalist`, `Intl.NumberFormat`, and `navigator.clipboard` are available.

The `@/*` TypeScript alias is configured but not used in inspected source files.

The legal/reference files outside `src/` may inform domain content, but they are not part of the runtime dependency graph unless manually copied into source/data files.
