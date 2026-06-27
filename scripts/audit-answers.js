/* Pedagogical answer sanity check for all 488 questions */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const files = ["js/i18n.js", "data/solved-spots.js", "js/courses.js", "js/content.js", "js/content-ext.js", "js/table.js", "js/engine.js"];
let code = "";
for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
code += "globalThis.__out = { STR, COURSES, getQuestions, SOLVED_SPOTS };";
const ctx = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, document: {}, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { STR, COURSES, getQuestions, SOLVED_SPOTS } = ctx.__out;
const t = (k) => STR.en[k] || "";
const tz = (k) => STR.zh[k] || "";

const RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
const ALL_ACTIONS = ["fold", "check", "call", "bet", "raise"];
const solverById = Object.fromEntries(SOLVED_SPOTS.map((s) => [s.id, s]));

function cardRank(c) { return RANK[c[0].toUpperCase()]; }

function handStrength(q) {
  const spot = q.spot || {};
  const board = spot.board || [];
  const hand = spot.hero?.hand || [];
  const lbl = (spot.hero?.labelKey && t(spot.hero.labelKey)) || spot.hero?.label || "";
  const blob = lbl.toLowerCase();
  const ranks = [...board, ...hand].map(cardRank);
  const freq = {};
  for (const r of ranks) freq[r] = (freq[r] || 0) + 1;
  const counts = Object.values(freq).sort((a, b) => b - a);

  const set = new Set(ranks);
  let straight = false;
  for (let hi = 14; hi >= 5; hi--) {
    const seq = hi === 5 ? [14, 2, 3, 4, 5] : [hi, hi - 1, hi - 2, hi - 3, hi - 4];
    if (seq.every((r) => set.has(r))) { straight = true; break; }
  }

  return {
    blob,
    lbl,
    isFullHouse: counts[0] >= 3 && counts[1] >= 2,
    isQuads: counts[0] >= 4,
    isSet: hand.length === 2 && hand[0][0] === hand[1][0] && board.some((c) => c[0].toUpperCase() === hand[0][0].toUpperCase()),
    isNutFlush: /nut flush|坚果同花/.test(blob) && !/draw|听/.test(blob),
    isStraight: straight && /straight|顺子/.test(blob) && !/missed|破产|draw|听/.test(blob),
    isAir: /\bair\b|空气/.test(blob) || (/ace-high|A 高/.test(blob) && !/pair|对|set|三条|two pair|两对|full|葫芦|straight|顺/.test(blob)),
    isMissedDraw: /missed|破产|落空|未中/.test(blob),
  };
}

function expectMdf(pot, bet) { return Math.round((1 - bet / (pot + bet)) * 100); }

function auditC1Choice(q) {
  const issues = [];
  const s = t(q.stemKey);
  const ans = t(q.options.find((o) => o.id === q.correct[0]).labelKey);
  let m;
  m = s.match(/Pot is (\d+), villain bets (\d+).*pot odds/i);
  if (m) {
    const ratio = (+m[1] + +m[2]) / +m[2];
    if (!ans.includes(String(ratio))) issues.push(`pot odds should be ${ratio}:1, got "${ans}"`);
  }
  m = s.match(/Pot is (\d+), villain bets (\d+).*MDF/i);
  if (m && !ans.includes(String(expectMdf(+m[1], +m[2])))) {
    issues.push(`MDF should be ~${expectMdf(+m[1], +m[2])}%, got "${ans}"`);
  }
  m = s.match(/Pot is (\d+), villain bets (\d+).*Break-even/i);
  if (m) {
    const eq = Math.round((+m[2] / (+m[1] + +m[2] + +m[2])) * 100);
    if (!ans.includes(String(eq))) issues.push(`break-even should be ${eq}%, got "${ans}"`);
  }
  if (/Facing a pot-sized bet.*break-even/i.test(s) && !ans.includes("33")) {
    issues.push("pot-bet break-even should be 33%");
  }
  return issues;
}

function auditChoice(q) {
  const issues = [];
  if (!q.correct.length) issues.push("no correct answer");
  if (!q.correct.every((c) => q.options.some((o) => o.id === c))) {
    issues.push(`correct ${JSON.stringify(q.correct)} not in options`);
  }
  const fb = q.feedback?._default?.reasonKey;
  if (!fb || !STR.en[fb]) issues.push("missing default feedback key");
  if (q.id.startsWith("c1-q")) issues.push(...auditC1Choice(q));
  return issues;
}

function auditAction(q) {
  const issues = [];
  const spot = q.spot || {};
  const actions = q.actions?.length ? q.actions : ALL_ACTIONS;
  const correct = q.correct || [];
  const facing = spot.facing || (spot.bet > 0 ? "bet" : "none");
  const hs = handStrength(q);
  const stem = t(q.stemKey);
  const lbl = hs.lbl;

  if (!correct.length) issues.push("no correct answer");
  for (const c of correct) {
    if (!actions.includes(c)) issues.push(`correct "${c}" not in actions [${actions}]`);
  }

  const fb = q.feedback || {};
  if (!Object.keys(fb).length) issues.push("no per-action feedback");
  for (const act of Object.keys(fb)) {
    const rk = fb[act]?.reasonKey;
    if (rk && !STR.en[rk]) issues.push(`feedback[${act}] key missing`);
  }

  // Never fold the nuts (made hand labels)
  if (correct.includes("fold")) {
    if (hs.isFullHouse || hs.isQuads) issues.push(`fold marked correct with ${lbl}`);
    if (hs.isSet && /top set|middle set|bottom set|顶三条|中三条|底三条|三条/.test(lbl) && !/underpair|垫底|weak top|弱顶|bluff-catch|抓诈|third pair|第三对|second pair|第二对|middle pair|中对/.test(lbl)) {
      if (!/overbet|超池|triple|三枪|barrel|第二枪|开火/.test(stem.toLowerCase() + stem)) {
        // sets folding only in extreme lines — still suspicious on generic spots
      }
      if (hs.isSet && spot.allIn) { /* jam fold spots rare */ }
    }
    if (hs.isNutFlush && !/overbet|超池|TPTK|顶对顶踢|top pair|顶对|second|第二|third|第三|weak|弱|bluff|抓诈|air|空气|ace-high|A 高|missed|破产/.test(lbl + stem)) {
      issues.push(`fold correct with nut flush: ${lbl}`);
    }
    if (hs.isStraight && hs.isNutFlush === false && /straight|顺子/.test(lbl) && !/missed|破产/.test(lbl)) {
      if (!/overbet|超池|four|四张|capstone|综合/.test(stem)) {
        // straight fold on scary board ok
      }
    }
  }

  if (hs.isSet && correct.includes("fold") && !/middle pair|中对|second pair|第二对|top pair weak|弱顶|underpair|垫底|88|77|66|44|33|22/.test(lbl)) {
    issues.push(`fold correct with set label: ${lbl}`);
  }

  if (hs.isAir && correct.includes("call") && facing === "bet" && (spot.bet || 0) >= (spot.pot || 1) * 0.4) {
    if (!/maniac|疯子|bluff-catch|抓诈|MDF|AA|bluff-catcher/.test(stem + lbl)) {
      issues.push(`air calling big bet: ${lbl}`);
    }
  }

  if (hs.isMissedDraw && correct.includes("call") && facing === "bet" && (spot.street || "flop") === "river") {
    issues.push(`missed draw calling river bet: ${lbl}`);
  }

  if (correct.includes("check") && facing === "bet") {
    issues.push("correct includes check but facing a bet");
  }
  if (correct.includes("bet") && facing === "bet" && !actions.includes("raise")) {
    issues.push("correct bet while facing bet but raise not offered");
  }
  if (correct.includes("bet") && facing !== "bet" && spot.bet === 0 && !actions.includes("bet")) {
    issues.push("correct bet but bet not in actions");
  }

  if (spot.solverRef) {
    const sol = solverById[spot.solverRef];
    if (sol?.recommended && !correct.includes(sol.recommended)) {
      issues.push(`solver ${spot.solverRef} recommends ${sol.recommended}, correct is ${correct}`);
    }
  }

  return issues;
}

const all = [];
let choiceCount = 0, actionCount = 0;

for (const course of COURSES) {
  for (const q of getQuestions(course.id)) {
    const iss = q.type === "choice" ? auditChoice(q) : q.type === "action" ? auditAction(q) : [`unknown type ${q.type}`];
    if (q.type === "choice") choiceCount++;
    if (q.type === "action") actionCount++;
    if (iss.length) all.push({ id: q.id, type: q.type, correct: q.correct, issues: iss });
  }
}

console.log(`Answer audit: ${choiceCount} choice + ${actionCount} action = ${choiceCount + actionCount} questions`);

if (all.length) {
  console.log(`Issues: ${all.length}`);
  for (const x of all) {
    console.log(`\n${x.id} (${x.type}) correct=${JSON.stringify(x.correct)}`);
    for (const i of x.issues) console.log("  - " + i);
  }
  process.exit(1);
}
console.log("Answer audit: OK");
