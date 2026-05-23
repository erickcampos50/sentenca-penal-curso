# Stack

## Snapshot

Single-page React application for penal sentencing/dosimetry calculations. Source lives under `src/`, static public data under `public/`, and legal/reference material under `referencias/` and `.reversa/reports/`. No backend source, database layer, API client, or server runtime was found.

## Runtime And Package Management

- Node/npm project with `package-lock.json`; package manager appears to be npm.
- `package.json` declares ESM via `"type": "module"`.
- Scripts in `package.json`: `npm run dev` starts Vite, `npm run build` runs `tsc && vite build`, and `npm run preview` starts Vite preview.
- Runtime dependencies are only `react` and `react-dom` at React 18.

## Application Framework

- React 18 SPA mounted in `src/main.tsx` with `ReactDOM.createRoot` and `React.StrictMode`.
- `src/App.tsx` renders the main `DosimetriaPenal` component directly.
- Main UI and state orchestration are in `src/components/DosimetriaPenal.tsx`; feature subcomponents live under `src/components/dosimetria/`.
- State is local React state (`useState`, `useEffect`); no router, global store, or data-fetching framework was found.

## Build And Tooling

- Vite 5 is the application bundler and dev server (`vite.config.ts`).
- `@vitejs/plugin-react` is the only Vite plugin configured.
- TypeScript 5 is used for type checking before Vite build.
- PostCSS is configured through `postcss.config.js` with Tailwind CSS and Autoprefixer.
- No test runner, lint script, formatter config, CI config, or Storybook config was found in the inspected files.

## Styling System

- Tailwind CSS 3 is the styling system.
- `src/index.css` imports Tailwind base, components, and utilities.
- `tailwind.config.ts` scans `index.html` and `src/**/*.{js,ts,jsx,tsx}` and does not define theme extensions or plugins.
- Components use inline Tailwind utility class strings rather than CSS modules or component libraries.

## TypeScript Configuration

- Root `tsconfig.json` uses project references to `tsconfig.app.json` and `tsconfig.node.json`.
- App compiler settings target `ES2020`, include DOM libraries, use `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `strict: true`, and `noEmit: true`.
- `tsconfig.app.json` enables `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`.
- Path alias `@/*` maps to `./src/*`, although current inspected imports mostly use relative paths.
- `tsconfig.node.json` covers `vite.config.ts` with strict bundled ESM settings.

## Data And Static Assets

- `public/crimes.csv` is a runtime static data file loaded by `fetch("/crimes.csv")` in `src/components/DosimetriaPenal.tsx`.
- Static legal constants and display data are embedded in `src/components/dosimetria/data.ts`.
- Calculation, parsing, formatting, regime, progression, concurso, and report helpers are in `src/components/dosimetria/utils.ts`.
- `referencias/` contains source/reference legal materials, including Planalto markdown captures and a PDF excerpt.
- `.reversa/reports/` contains prior analysis reports and should be treated as documentation/audit input, not application runtime code.
- `public/crimes.csv:Zone.Identifier` appears to be host metadata rather than application data.

## Deployment

- `netlify.toml` configures Netlify build with `command = "npm run build"` and `publish = "dist"`.
- `netlify.toml` defines a catch-all redirect from `/*` to `/index.html` with status `200`, suitable for SPA fallback.
- `dist/` is present as generated Vite build output and should not be treated as source architecture.

## Notable Dependencies

- `react` and `react-dom`: browser UI runtime.
- `vite` and `@vitejs/plugin-react`: dev server and production bundling.
- `typescript`: static type checking.
- `tailwindcss`, `postcss`, and `autoprefixer`: CSS utility generation and post-processing.

## Unknowns Or Assumptions

- Node version is not pinned in `package.json`, `.nvmrc`, or Netlify config in the inspected files.
- No automated tests were found, so expected verification appears to be build/type-check plus manual browser validation.
- Legal data provenance for `public/crimes.csv` is not encoded in machine-readable metadata; related human-readable references exist in `referencias/` and `.reversa/reports/`.
- No environment variable usage was found in inspected source/config files.
