/* Find label/hand mismatches: pocket pair labeled as non-set, blocker claims, etc. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const files = ["js/i18n.js", "data/solved-spots.js", "js/courses.js", "js/content.js", "js/content-ext.js", "js/table.js", "js/engine.js"];
let code = "";
for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
code += "globalThis.__out = { STR, getQuestions };";
const ctx = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, document: {}, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { STR, getQuestions } = ctx.__out;
const t = (k) => STR.en[k] || k;

const RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };

function issues(q) {
  const out = [];
  const spot = q.spot || {};
  const hand = spot.hero?.hand || [];
  const lbl = (spot.hero?.labelKey && t(spot.hero.labelKey)) || "";
  const stem = t(q.stemKey);
  const blob = (stem + " " + lbl).toLowerCase();
  const board = spot.board || [];

  if (hand.length === 2 && hand[0][0] === hand[1][0]) {
    const pr = hand[0][0];
    const onBoard = board.some((c) => c[0].toUpperCase() === pr);
    const isSet = onBoard;
    const rankVal = RANK[pr.toUpperCase()] || 0;
    const boardRanks = board.map((c) => RANK[c[0].toUpperCase()]);
    const freq = {};
    for (const r of [...boardRanks, rankVal, rankVal]) freq[r] = (freq[r] || 0) + 1;
    const counts = Object.values(freq).sort((a, b) => b - a);
    const isFullHouse = counts[0] >= 3 && counts[1] >= 2;
    if (isSet && /middle pair|中对|second pair|第二对|top pair|顶对/.test(lbl) && !/set|三条/.test(lbl)) {
      out.push(`pocket ${pr} makes set but label says pair: ${lbl}`);
    }
    if (!isSet && !isFullHouse && /set|三条|full house|葫芦/.test(lbl) && !/middle set|中三条/.test(lbl)) {
      out.push(`pocket ${pr} is overpair/pair but label claims set+: ${lbl}`);
    }
  }

  const suitClaims = [...blob.matchAll(/\b([akqjt2-9])([shdc♠♥♦♣])\b/gi)];
  for (const m of suitClaims) {
    const r = m[1].toUpperCase();
    const sMap = { s: "s", h: "h", d: "d", c: "c", "♠": "s", "♥": "h", "♦": "d", "♣": "c" };
    const s = sMap[m[2].toLowerCase()] || m[2];
    const want = r + s;
    const have = [...hand, ...board].map((c) => c[0].toUpperCase() + c[1]);
    if (/blocker|阻断|持|hold|you hold/i.test(blob) && /[ashdc♠♥♦♣]/i.test(m[0])) {
      const inHand = hand.some((c) => c[0].toUpperCase() + c[1] === want);
      if (/blocker|阻断/.test(blob) && m.index > 0 && !inHand && ["As", "Ah", "Ad", "Ac", "Ks", "Kh", "Kd", "Kc", "Qs", "Qh", "Qd", "Qc"].includes(want)) {
        out.push(`claims ${want} blocker/hold but not in hand [${hand.join(" ")}]`);
      }
    }
  }

  if (/full house|葫芦/.test(lbl)) {
    const ranks = [...board, ...hand].map((c) => RANK[c[0].toUpperCase()]);
    const freq = {};
    for (const r of ranks) freq[r] = (freq[r] || 0) + 1;
    const counts = Object.values(freq).sort((a, b) => b - a);
    const hasFh = counts[0] >= 3 && counts[1] >= 2;
    if (!hasFh) out.push(`label full house but best hand is not full house`);
  }

  return out;
}

const all = [];
for (let i = 1; i <= 30; i++) {
  for (const q of getQuestions("c" + i)) {
    const iss = issues(q);
    if (iss.length) all.push({ id: q.id, issues: iss });
  }
}

if (all.length) {
  console.log("LABEL/HAND ISSUES:", all.length);
  for (const x of all) {
    console.log("\n" + x.id);
    for (const i of x.issues) console.log("  - " + i);
  }
  process.exit(1);
}
console.log("Label/hand audit: OK");
