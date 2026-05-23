# Integrations

## Snapshot

The application is effectively self-contained. It integrates with browser APIs, a same-origin static CSV file, and Netlify deployment conventions. No external HTTP APIs, authentication providers, analytics tools, payment services, databases, or server-side integrations were found.

## External Data Sources

- Runtime data source: `public/crimes.csv`, requested from the browser as `/crimes.csv` in `src/components/DosimetriaPenal.tsx`.
- CSV parsing is local and custom in `parseCrimeCSV` in `src/components/dosimetria/utils.ts`.
- Legal reference material exists in `referencias/`, including Planalto markdown captures and `JUS4585-Degustacao.pdf`, but these files are not directly imported by the app.
- `.reversa/reports/` contains generated compatibility/modification reports used as project knowledge, not runtime integrations.

## Static Assets And Public Files

- `index.html` is the Vite HTML entry point and mounts the app at `<div id="root"></div>`.
- `index.html` references `/vite.svg` as favicon, but no matching `public/vite.svg` was found during inspection; this may resolve only if present elsewhere or may be a stale default reference.
- `public/crimes.csv` is served as a static asset by Vite/Netlify and consumed at runtime.
- `public/crimes.csv:Zone.Identifier` appears to be OS/browser metadata and should not be treated as an app asset.

## Browser APIs

- DOM mounting uses `document.getElementById("root")` in `src/main.tsx`.
- Fetch API loads `/crimes.csv` in `src/components/DosimetriaPenal.tsx`.
- Clipboard API is used through `navigator.clipboard.writeText(...)` in report-copy flows in `src/components/dosimetria/ResultadoFinal.tsx` and `src/components/dosimetria/ConcursoSection.tsx`.
- HTML form controls include `datalist` for crime selection autocomplete in `src/components/DosimetriaPenal.tsx`.
- No Local Storage, Session Storage, IndexedDB, Web Workers, Service Workers, geolocation, media, or notification APIs were found in inspected source files.

## Hosting And Deployment

- Netlify is the configured host in `netlify.toml`.
- Build command is `npm run build`; published directory is `dist`.
- SPA fallback is configured with a `200` redirect from all routes to `/index.html`.
- No serverless functions, edge functions, headers, scheduled jobs, or environment variables were found in `netlify.toml`.

## Third Party Libraries Used At Runtime

- React and React DOM are the only third-party runtime libraries declared in `package.json`.
- No UI component package, charting library, date library, CSV library, HTTP client, validation library, or state-management library was found.
- Tailwind CSS classes are compiled at build time; Tailwind itself is not a browser runtime dependency.

## Development Tool Integrations

- Vite development server and build pipeline through `vite.config.ts`.
- React Fast Refresh support comes through `@vitejs/plugin-react`.
- TypeScript project references split app and Vite config checks across `tsconfig.app.json` and `tsconfig.node.json`.
- PostCSS pipeline uses Tailwind CSS and Autoprefixer from `postcss.config.js`.
- Netlify build settings are checked into `netlify.toml`.

## Missing Or Absent Integrations

- No backend API integration was found.
- No database, ORM, or persistence layer was found.
- No authentication, authorization, or user account integration was found.
- No analytics, telemetry, logging service, error reporting, or monitoring integration was found.
- No payment, email, file upload, cloud storage, search, AI/LLM, or external legal-data API integration was found.
- No test, lint, CI, container, or package-publishing integration was found in inspected config files.

## Unknowns Or Assumptions

- The app assumes `/crimes.csv` is available from the same origin at runtime; failure falls back to an empty crimes list.
- The CSV parser is simple comma splitting and may not support quoted commas or full RFC 4180 CSV behavior.
- The favicon reference in `index.html` may be stale unless `/vite.svg` is provided by deployment or another uninspected source.
- No secrets or environment-dependent integrations were discovered.
