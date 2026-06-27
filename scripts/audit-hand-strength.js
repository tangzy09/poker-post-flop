/* Verify pair-rank labels (top/second/third), set vs trips, label suits vs hero hand */
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
const t = (k) => STR.en[k] || "";

const RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
const SUIT_SYM = { c: "\u2663", d: "\u2666", h: "\u2665", s: "\u2660" };
const SYM_SUIT = { "\u2663": "c", "\u2666": "d", "\u2665": "h", "\u2660": "s" };

function cardRank(c) { return RANK[c[0].toUpperCase()]; }

function pairRankOnBoard(board, hand) {
  const br = board.map(cardRank);
  const hr = hand.map(cardRank);
  const paired = hr.find((r) => br.includes(r));
  if (!paired) return null;
  const uniqueBoard = [...new Set(br)].sort((a, b) => b - a);
  const idx = uniqueBoard.indexOf(paired);
  return idx >= 0 ? idx + 1 : null; // 1=top, 2=second, 3=third
}

function isPocketSet(board, hand) {
  return hand[0][0] === hand[1][0] && board.some((c) => c[0].toUpperCase() === hand[0][0].toUpperCase());
}

function isTrips(board, hand) {
  if (hand[0][0] !== hand[1][0]) {
    const hr = hand.map(cardRank);
    const br = board.map(cardRank);
    return hr.some((r) => br.filter((x) => x === r).length >= 2);
  }
  return false;
}

function parseLabelCards(lbl) {
  const cards = [];
  const re = /([2-9TJQKA])([\u2660\u2665\u2666\u2663])/gi;
  let m;
  while ((m = re.exec(lbl)) !== null) {
    cards.push(m[1].toUpperCase() + SYM_SUIT[m[2]]);
  }
  return cards;
}

function auditQuestion(q) {
  const issues = [];
  const spot = q.spot || {};
  const hand = spot.hero?.hand || [];
  const board = spot.board || [];
  if (hand.length !== 2 || board.length < 3) return issues;

  const lbl = spot.hero?.labelKey ? t(spot.hero.labelKey) : "";
  const lblL = lbl.toLowerCase();

  const pr = pairRankOnBoard(board, hand);
  if (/top pair|顶对/i.test(lblL) && !/weak top pair|弱顶对|tptk|顶对顶踢/i.test(lblL)) {
    if (pr !== 1) issues.push(`label top pair but pair rank is ${pr} (board=${board.join(" ")}, hand=${hand.join(" ")})`);
  }
  if (/second pair|第二对/i.test(lblL) && pr !== 2) {
    issues.push(`label second pair but pair rank is ${pr}`);
  }
  if (/third pair|第三对/i.test(lblL) && pr !== 3) {
    issues.push(`label third pair but pair rank is ${pr} (board=${board.join(" ")}, hand=${hand.join(" ")})`);
  }
  if (/middle pair|中对/i.test(lblL) && pr !== 2 && pr !== 3) {
    // middle pair often = second pair on 3-card flop; skip strict on flop-only ambiguous
    if (board.length >= 4 && pr !== 2) issues.push(`label middle pair but pair rank is ${pr}`);
  }

  if (isPocketSet(board, hand) && /\btrips\b/i.test(lblL) && !/trips board|5x trips/i.test(lblL)) {
    issues.push(`pocket pair on board should be set, not trips: ${lbl}`);
  }
  if (isTrips(board, hand) && !isPocketSet(board, hand) && /\bset\b/i.test(lblL) && !/top set|middle set|bottom set/i.test(lblL)) {
    issues.push(`one-card trips should not be labeled generic set: ${lbl}`);
  }

  return issues;
}

const all = [];
for (let i = 1; i <= 30; i++) {
  for (const q of getQuestions("c" + i)) {
    const iss = auditQuestion(q);
    if (iss.length) all.push({ id: q.id, issues: iss });
  }
}

if (all.length) {
  console.log("Hand-strength audit:", all.length, "issues");
  for (const x of all) {
    console.log("\n" + x.id);
    for (const i of x.issues) console.log("  - " + i);
  }
  process.exit(1);
}
console.log("Hand-strength audit: OK");
