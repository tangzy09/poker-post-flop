# AI assistant guidelines (Claude / Copilot)

Project: **Poker Post-Flop** — static bilingual HU post-flop trainer (30 courses, 488 questions).

## Stack

- No bundler. Edit `index.html` (CSS) + `js/*.js` directly.
- Tests: `npm test` (Node `node:test`, no install required).
- Content C13–C30: edit `scripts/courses-ext-data.js`, then `node scripts/gen-content-ext.js`.

## Before finishing a task

1. Run `npm test` when touching `js/`, `scripts/`, or `test/`.
2. Run `npm run audit` when changing question content (expect 488/488).
3. Do **not** commit unless the user asks.

## Code conventions

- Match existing style: plain functions, no frameworks, minimal diff.
- i18n: every user-facing string via `reg()` / `_r()` / `{ en, zh }`; use `t()` at render time.
- `applyI18n(document)` must run so header `data-i18n` and `document.title` update in Chinese.
- Never use CSS class `btn` on range-matrix or legend swatches (conflicts with global buttons); use `rng-open`, `rng-call`, `rng-both`.
- Hero hand text: `labelKey`, not hardcoded English `label`.
- Feedback concepts: use `tConcept()` in `engine.js`, or keys registered in i18n/content.

## Terminology (zh)

| EN | 中文 |
|----|------|
| weak top pair | 弱顶对 |
| missed draw | 破产听牌 |
| capped villain | 对手（封顶） |

## Key files

| Task | Files |
|------|-------|
| UI / screens | `js/app.js`, `index.html` |
| New C1–C12 questions | `js/content.js` |
| New C13–C30 questions | `scripts/courses-ext-data.js` → gen script |
| UI strings | `js/i18n.js` |
| Course list | `js/courses.js` |
| Stats / leaks | `js/coach.js` |
| Deploy EC2 | `tools/deploy-ec2.ps1` |

## Deploy (user request only)

```powershell
powershell -File tools/deploy-ec2.ps1
```

Stamps git hash into `index.html` script URLs for cache busting.

## Docs

- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — VS Code workflow (中文)
- [docs/CONTENT.md](docs/CONTENT.md) — question bank & i18n (中文)
