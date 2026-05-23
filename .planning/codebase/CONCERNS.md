# Concerns

## Snapshot

- Repository is a client-only Vite + React + TypeScript app for educational Brazilian criminal sentencing calculations.
- Main logic is concentrated in `src/components/DosimetriaPenal.tsx` and `src/components/dosimetria/utils.ts`; legal lists live in `src/components/dosimetria/data.ts`; crime ranges load from `public/crimes.csv`.
- Production build passes with `npm run build`; generated `dist/` was treated as build output.
- No backend, authentication, analytics, cookies, or persistent browser storage were found in the inspected source/config/public files.

## Critical

- None confirmed from static inspection.

## High

- Legal/domain correctness risk: `calcProgressao` in `src/components/dosimetria/utils.ts:131` hard-codes simplified progression fractions and labels, including non-hediondo reclusao paths based primarily on sentence length (`5/6`, `3/5`, `1/2`) and then overrides reincidencia to `1/4`. The UI warns this is didactic, but the result is still displayed as a computed progression in `src/components/dosimetria/ResultadoFinal.tsx:162`. This is high-risk because execution/progression rules are statute-sensitive and fact-sensitive.
- Legal/domain correctness risk: automatic regime, substituicao, sursis, prescricao, concurso, and medida de seguranca rules are encoded as broad booleans/numeric thresholds in `src/components/DosimetriaPenal.tsx:116`, `src/components/DosimetriaPenal.tsx:125`, `src/components/DosimetriaPenal.tsx:141`, `src/components/DosimetriaPenal.tsx:145`, and `src/components/dosimetria/utils.ts:67`. The app includes caveats, but these computed outputs can appear authoritative without validating all statutory exceptions, case facts, or current jurisprudence.

## Medium

- Data quality risk: `public/crimes.csv` embeds legal ranges and violence flags with no source metadata, versioning, or validation tests. Examples worth review include homicide rows marked `violento=nao` in `public/crimes.csv:2-4` and several serious offenses marked non-violent depending on the domain definition used.
- CSV parsing risk: `parseCrimeCSV` uses `line.split(",")` in `src/components/dosimetria/utils.ts:40`, accepts only 6 or 8 fields, and silently drops other lines. Any future quoted field containing commas, extra columns, or malformed row can corrupt or remove crime data with no user-visible error.
- Maintainability risk: `src/components/DosimetriaPenal.tsx` is an 844-line component that owns state, calculations, legal reference rendering, audit output, and tab UI. This makes domain rule changes hard to isolate and review.
- Maintainability risk: calculations are duplicated or recomputed in multiple places, for example agravante/atenuante totals in `src/components/DosimetriaPenal.tsx:92-96` and `src/components/dosimetria/ResultadoFinal.tsx:51-54`, plus detraction/regime calculations in `DosimetriaPenal.tsx` and `PrescricaoDetracao.tsx`. Divergence is possible as rules evolve.
- Accessibility risk: icon-only remove buttons use visual `✕` text without descriptive accessible labels in `src/components/DosimetriaPenal.tsx:413`, `src/components/DosimetriaPenal.tsx:501`, `src/components/DosimetriaPenal.tsx:540`, `src/components/dosimetria/ConcursoSection.tsx:260`, and `src/components/dosimetria/PrescricaoDetracao.tsx:239`.
- Deployment/security hardening risk: `netlify.toml` defines build and SPA redirects only; no explicit security headers such as CSP, `X-Content-Type-Options`, `Referrer-Policy`, or frame restrictions are configured.

## Low

- UX/data-loss risk: there is no persistence; page refresh loses all calculations. `state.md:123` indicates this is known, but users entering long factual foundations may lose work unexpectedly.
- UX risk: `index.html:5` references `/vite.svg`; this is likely a leftover default favicon and weakens production polish.
- Validation risk: numeric inputs often rely on HTML `min`/`max` but calculations still parse raw strings with `parseFloat`, for example `MultaSection.tsx:19-28` and `PrescricaoDetracao.tsx:38-39`. Invalid values generally degrade to zero rather than producing structured validation messages.
- Clipboard privacy risk: generated reports can include user-entered factual foundations and are copied via `navigator.clipboard.writeText` in `ResultadoFinal.tsx:89` and `ConcursoSection.tsx:85` without an explicit reminder about sensitive case facts.

## Security And Privacy

- Positive: no secrets, API keys, backend endpoints, cookies, analytics, or local/session storage were found in the inspected source/config/public files.
- Primary privacy surface is client-side user-entered legal/factual text and clipboard export. The app does not transmit data by default, but copied reports can leave browser/app boundaries through the OS clipboard.
- Static hosting would benefit from explicit Netlify security headers, especially because the app is a legal-domain tool where users may enter sensitive facts even if no storage exists.

## Performance And Bundle Risk

- Build output is modest: Vite reported `dist/assets/index-C3cAPTrT.js` at 244.32 kB raw / 72.41 kB gzip and CSS at 13.66 kB raw / 3.17 kB gzip.
- Performance risk is currently low. The larger risk is future growth because all legal references, lists, calculation UI, and audit rendering are bundled into the main route/component.

## Accessibility And UX Risk

- Several remove buttons are not clearly named for assistive technology; add `aria-label` values that identify what will be removed.
- Dense tables, small text classes, and compact controls are common across the UI. This may be acceptable for desktop legal study but should be checked on mobile and with zoom.
- The app uses color-coded status (`red`, `green`, `yellow`, `blue`) heavily. Most labels also include text, but critical warnings should not rely on color alone.

## Maintainability Risk

- The central component mixes domain computation, state transitions, legal copy, and presentation. Extracting pure domain calculators with tests would make legal updates safer.
- Legal constants are hard-coded in source and CSV without provenance fields, effective dates, or review status.
- There are no automated tests in `package.json`; current confidence comes from TypeScript and manual/static inspection only.

## Data And Domain Risk

- This is the main risk area. The application performs legal calculations in a domain where small rule changes, exceptions, jurisprudential shifts, or case-specific facts can materially change results.
- `public/crimes.csv` should be treated as unverified reference data until each row has a cited legal basis and review date.
- The UI contains helpful disclaimers that the tool is didactic and does not replace judicial fundamentacao, but some computed labels still present direct outcomes such as regime, substituicao, sursis, prescricao, progression, and concurso results.

## Recommended Next Actions

- Add focused unit tests for `prescPrazo`, `calcRegime`, `calcProgressao`, `calcConcurso`, `fmt`, and `parseCrimeCSV` using known legal examples and edge cases.
- Replace ad hoc CSV parsing with a small RFC-compatible parser or restrict/validate CSV format at build time; report malformed rows visibly.
- Add source/provenance columns or sidecar metadata for `public/crimes.csv`, including law/article source, effective date, reviewer, and confidence.
- Split `DosimetriaPenal.tsx` into smaller components and pure calculation modules so legal rule changes can be reviewed independently from UI changes.
- Add Netlify security headers and a short privacy notice explaining that calculations stay local but clipboard exports may contain sensitive facts.
- Add `aria-label` to icon-only buttons and run an accessibility pass for keyboard navigation, zoom, and mobile layout.

## Unknowns Or Assumptions

- Assumed the intended use is educational, consistent with in-app copy and `state.md`; severity would increase if used for production legal decisions.
- Did not validate every legal rule or CSV row against current legislation/jurisprudence; concerns are based on code structure and evident hard-coded simplifications.
- Did not inspect generated `dist/` beyond build output because it is treated as generated artifact.
- Did not run browser-based accessibility or mobile viewport tests.
