# Poker Post-Flop

Bilingual (English / 中文) **heads-up post-flop trainer**: 30 lessons, theory slides, 488 drill questions, wrong-answer feedback, review pile, and an interactive table view.

**Live:**

| Host | URL |
|------|-----|
| EC2 (primary) | https://post-flop-coach.ai-speeds.com/ |
| EC2 (IP path) | http://3.26.95.240/post-flop-coach/ |
| GitHub Pages | https://tangzy09.github.io/poker-post-flop/ |

## Features

- 30 courses — fundamentals (C1–C12) plus advanced topics (C13–C30): sizing, blockers, 3-bet pots, turn/river lines, tournaments, capstone review
- Learn → drill flow with per-lesson summaries; **review lessons** anytime after the first pass
- Poker table visualization (HU spots + multi-way table demo)
- C3 range / equity chart (`js/range-chart.js` + `js/equity.js`)
- **Profile, leak analysis, training plan** on Stats tab (`js/coach.js`)
- Progress saved in browser `localStorage`
- Automated content validation (`npm test`, `npm run audit`)

## Run locally

No build step required for the web app.

```bash
git clone https://github.com/tangzy09/poker-post-flop.git
cd poker-post-flop
npx serve .
# open http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Curriculum + structural + pedagogical content tests |
| `npm run audit` | Per-question audit report → `tools/audit-report.json` |
| `npm run build:www` | Copy web assets to `www/` for Capacitor |
| `npm run app:android` | Build `www/` and open Android project (requires `npx cap add android`) |

## Project layout

```
index.html            App shell + styles
js/
  i18n.js             Bilingual UI strings
  courses.js          12-lesson metadata
  content.js          Theory slides + all 288 questions  ← question bank
  engine.js           Progress, grading, review
  coach.js            Profile, leaks, training plan
  table.js            Table / spot rendering
  equity.js           Hold'em equity engine (C3 chart)
  range-chart.js      C3 range visualization
  app.js              UI
data/solved-spots.js  Reference solver spots (C7/C8)
test/
  content-validate.test.js   Structure invariants
  content-audit.test.js      Math, draws, labels, solver boards
  curriculum.test.js         Course / question counts
tools/
  build-www.js        Capacitor www bundle
  audit-all-questions.js     Full 288-question audit CLI
```

## Content & quality checks

**Question bank** lives in `js/content.js` (C1–C12) and generated `js/content-ext.js` (C13–C30 from `scripts/courses-ext-data.js`).

Before shipping content changes:

```bash
node scripts/gen-content-ext.js   # after editing courses-ext-data.js
npm test                          # must pass
npm run audit                     # 488/488 expected; see tools/audit-report.json
node scripts/audit-stem-spot.js   # stem text vs rendered board/hand
```

The audit verifies: C1 math, no duplicate cards, draw/flush claims vs board, hand-strength labels, stem vs spot consistency, solver-linked boards, i18n keys, and feedback registration.

## Deploy

### GitHub Pages

Push to `main` — CI runs tests then publishes (`.github/workflows/pages.yml`).

### EC2

Static files served from `/var/www/post-flop-coach/` (nginx). From the repo root on Windows:

```powershell
$KEY = "C:\Users\tangz\Documents\ec2_1.pem"
$HOST = "ec2-user@3.26.95.240"
$DEST = "/var/www/post-flop-coach"

scp -i $KEY -o StrictHostKeyChecking=no index.html "${HOST}:${DEST}/"
scp -i $KEY -o StrictHostKeyChecking=no -r js data "${HOST}:${DEST}/"
ssh -i $KEY -o StrictHostKeyChecking=no $HOST "chmod -R a+rX $DEST; find $DEST -type d -exec chmod 755 {} \; ; find $DEST -type f -exec chmod 644 {} \;"
```

Or run `powershell -File tools/deploy-ec2.ps1` (uses the same paths).

## Mobile (Capacitor)

```bash
npm install
npm run build:www
npx cap add android   # or ios
npx cap sync
npx cap open android
```

## License

Private / personal project — all rights reserved unless stated otherwise.
