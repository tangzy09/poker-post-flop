# Poker Post-Flop

Bilingual (English / 中文) **heads-up post-flop trainer**: 30 lessons, theory slides, **488** drill questions, wrong-answer feedback, review pile, and an interactive table view.

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

- **30 courses** — C1–C12 fundamentals + C13–C30 advanced (sizing, blockers, 3-bet pots, river defense, ICM, capstone)
- Learn → drill flow; **review lessons** anytime after first pass
- Poker table visualization (HU spots)
- C3 range / equity chart (`js/range-chart.js`, `js/equity.js`)
- Profile, leak analysis, training plan (`js/coach.js`)
- Progress in browser `localStorage`
- Automated tests + content audit

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
| `npm test` | 39 tests — structure, content, engine, i18n |
| `npm run audit` | Full 488-question audit → `tools/audit-report.json` |
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
docs/
  DEVELOPMENT.md          Dev guide (中文)
  CONTENT.md              Content / i18n guide (中文)
AGENTS.md                 AI assistant rules
.vscode/                  VS Code tasks & settings
```

## Content workflow

1. **C1–C12** — edit `js/content.js`
2. **C13–C30** — edit `scripts/courses-ext-data.js`, then `node scripts/gen-content-ext.js`
3. Run `npm test` and `npm run audit` (expect **488/488**)

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
