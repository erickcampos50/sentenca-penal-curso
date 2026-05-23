# Conventions

## Snapshot
This is a small Vite + React + TypeScript single-page app for penal dosimetry calculations. Runtime code lives under `src/`, with `dist/` as built output and `public/crimes.csv` copied for browser fetches. The app is componentized around `src/components/DosimetriaPenal.tsx` plus focused files under `src/components/dosimetria/`.

## Language And Module Style
The package is ESM (`package.json` has `"type": "module"`). Source uses TypeScript and React JSX with `jsx: "react-jsx"` in `tsconfig.app.json`. Imports are mostly relative (`./dosimetria/utils`, `./InfoPill`) even though `@/*` is configured in `tsconfig.app.json`. Config files use ESM exports, e.g. `vite.config.ts` and `tailwind.config.ts`.

## React Component Patterns
Components are function components with default exports for page/section components (`DosimetriaPenal`, `ResultadoFinal`, `ConcursoSection`, `MultaSection`, `PrescricaoDetracao`) and named exports for small shared primitives (`Info`, `Pill` in `InfoPill.tsx`). Component props are local `interface Props` declarations in each component file, while reusable shared prop types live in `types.ts`. State is held mostly in `DosimetriaPenal.tsx` and passed down as values and setters.

## State Management Patterns
State management is plain React `useState` and `useEffect`; there is no external state library or context. `DosimetriaPenal.tsx` owns the main calculator state, derived calculation values are recomputed inline during render, and child components receive `React.Dispatch<React.SetStateAction<...>>` setters when they need to mutate parent state. Browser APIs are used directly for `fetch("/crimes.csv")` and `navigator.clipboard.writeText`.

## TypeScript Patterns
Strict TypeScript is enabled (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` in `tsconfig.app.json`). Domain shapes are centralized in `src/components/dosimetria/types.ts` using interfaces and literal union types such as `Color` and `ConcursoModalidade`. Utility maps use typed records (`Record<Color, string>`, `Record<ConcursoModalidade, number>`). The code often stores form input values as strings and parses them locally with `parseFloat` for calculations.

## Styling Patterns
Styling is Tailwind utility classes directly in JSX. `src/index.css` only includes Tailwind base/components/utilities directives, and `tailwind.config.ts` has no theme extensions or plugins. Layout uses compact cards, `max-w-3xl`, `rounded-lg`/`rounded-xl`, borders, shadows, and color-coded feedback blocks. Shared color styling for info boxes and pills is centralized in `COLOR_MAP` and `PILL_MAP` in `data.ts`.

## Data Modeling Patterns
Static legal reference data is kept in `src/components/dosimetria/data.ts` as exported arrays and records (`VETORES`, `AGRAVANTES_LIST`, `SUMULAS`, `PRESCRICAO`, `FRACS`). Calculation helpers and report generation live in `utils.ts`. Crime catalogue data is loaded at runtime from `/crimes.csv` and parsed by `parseCrimeCSV`, which supports two row shapes based on column count.

## Naming And File Organization
Top-level app entry files are `src/main.tsx` and `src/App.tsx`. Main feature code is under `src/components/dosimetria/` with PascalCase component files, plus lowercase shared modules `data.ts`, `types.ts`, and `utils.ts`. Variables and function names are mixed Portuguese abbreviations and domain terms (`penDef`, `presc`, `agravs`, `calcRegime`), reflecting the legal domain but making some calculations dense.

## Documentation Patterns
There is no README in the inspected root. Domain guidance is embedded in UI copy, comments, and generated report text. External legal reference material exists in `referencias/`, `relatorio_sumulas_STJ.md`, and `state.md`, but source modules do not link to those files directly. Comments are mostly section markers in Portuguese inside components, e.g. `// Fase 1`, `// Prescrição`, and JSX block comments.

## Deviations Or Inconsistencies
Formatting is not enforced by a configured linter or formatter. Quote style differs between files: `App.tsx` and config files use single quotes in places, while most feature files use double quotes. `DosimetriaPenal.tsx` is large and mixes state ownership, calculation logic, report/audit construction, and UI rendering in one file. Some imports are unused or intentionally suppressed, e.g. `calcRegime` accepts `hediondo` but currently discards it with `void hediondo` in `utils.ts`.
