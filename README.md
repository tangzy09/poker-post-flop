# Poker Post-Flop

Bilingual (English / 中文) **heads-up post-flop trainer**: 30 lessons (including an adaptive placement test), theory slides, **699** drill questions, **computed bilingual feedback on both correct and wrong answers** (outs / equity / pot odds / MDF), review pile, and an interactive table view.

**Live:** https://post-flop-coach.ai-speeds.com/

| Host | URL |
|------|-----|
| EC2 (primary) | https://post-flop-coach.ai-speeds.com/ |
| GitHub Pages | https://tangzy09.github.io/poker-post-flop/ |

## Documentation

| Doc | Description |
|-----|-------------|
| **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** | VS Code + Claude 开发流程、命令、目录说明 |
| **[docs/CONTENT.md](docs/CONTENT.md)** | 题库结构、i18n、添加题目、质量检查 |
| **[AGENTS.md](AGENTS.md)** | AI 助手约定（Claude / Copilot 可读） |

## Features

- **30 courses** — C1 placement test, C2–C12 fundamentals, C13–C30 advanced: sizing/MDF, blockers, facing raises, 3-bet pots, pot control, turn defense, floating, overbets, donk bets, thin value, draws & semi-bluffs, river defense, multiway, exploits, tournament/ICM, multi-street planning, special boards, capstone
- **C13–C30 hold 24 drills each** (432 advanced spots) — every answer cross-checked by adversarial blind-solve
- **C1 placement test** — a fixed 20-question baseline drawn from later courses, with a detailed evaluation at the end
- **Computed feedback** (`js/explain.js`) — derives outs / equity / pot odds / MDF from board+hand and explains **both correct and wrong** answers in zh/en, falling back to hand-written reasons where a number adds nothing
- **Daily training** — 10 questions per day (due reviews + weakest courses + fresh spots, deterministic per date), with day-streak 🔥 tracking and mid-session resume
- **Spaced repetition** — missed questions return on a Leitner schedule (1d / 3d / 7d), graduating after four spaced correct answers; review tab shows due counts
- **Scoring & grades** — combo points per session and S/A/B/C course grades (best kept as card badges)
- **Leak heatmap** — stats page shows accuracy by leak type (MDF, over-folding, sizing…), color-coded
- Learn → drill flow; **review lessons** anytime after first pass
- Poker table visualization (HU spots)
- C3 range / equity chart (`js/range-chart.js`, `js/equity.js`)
- Profile, leak analysis, training plan (`js/coach.js`)
- Progress in browser `localStorage`
- Automated tests + content audit + hand-strength / feedback-math QA (`tools/label-check.js`, `tools/verify-feedback.js`)

## Quick start

No build step for the web app.

```bash
git clone https://github.com/tangzy09/poker-post-flop.git
cd poker-post-flop
npx serve . -l 3456
# open http://127.0.0.1:3456
```

In VS Code: **Terminal → Run Task → serve**

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | 44 tests — structure, content, engine, i18n |
| `npm run audit` | Full 699-question audit → `tools/audit-report.json` |
| `node scripts/gen-content-ext.js` | Regenerate `js/content-ext.js` from C13–C30 source |
| `npm run build:www` | Copy assets to `www/` for Capacitor |
| `powershell -File tools/deploy-ec2.ps1` | Stamp cache version + deploy to EC2 |

## Project layout

```
index.html              App shell + all CSS
js/
  i18n.js               Bilingual UI strings
  courses.js              30-course metadata
  content.js              C1–C12 learn + questions (edit by hand)
  content-ext.js          C13–C30 (generated)
  explain.js              Computed bilingual feedback (outs/equity/odds/MDF)
  engine.js               Progress, grading, review pile
  app.js                  Screens & events
  coach.js                Stats, leaks, training plan
  table.js                Table / spot rendering
  equity.js               Hold'em equity (C3 chart)
  range-chart.js          C3 range visualization
data/solved-spots.js      Solver reference spots (C7/C8)
scripts/
  courses-ext-data.js     C13–C30 source data
  gen-content-ext.js      Generator for content-ext.js
test/                     Automated tests
tools/
  deploy-ec2.ps1          EC2 deploy + cache bust
  stamp-version.js        Git hash → script ?v=
  label-check.js          Hand-strength label QA (cards vs text)
  verify-feedback.js      Feedback-math QA (every inequality checked)
docs/
  DEVELOPMENT.md          Dev guide (中文)
  CONTENT.md              Content / i18n guide (中文)
AGENTS.md                 AI assistant rules
.vscode/                  VS Code tasks & settings
```

## Content workflow

1. **C1–C12** — edit `js/content.js`
2. **C13–C30** — edit `scripts/courses-ext-data.js`, then `node scripts/gen-content-ext.js`
3. Run `npm test` and `npm run audit` (expect **699/699**)

See [docs/CONTENT.md](docs/CONTENT.md) for spot format, i18n, and terminology.

## Deploy

**EC2 (production):**

```powershell
powershell -File tools/deploy-ec2.ps1
```

**GitHub Pages:** push to `main` (`.github/workflows/pages.yml` runs tests then publishes).

## Mobile (Capacitor)

```bash
npm install
npm run build:www
npx cap add android
npx cap sync
npx cap open android
```

## License

Private / personal project — all rights reserved unless stated otherwise.
