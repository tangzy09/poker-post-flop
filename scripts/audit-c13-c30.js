/* Deep audit for c13–c30 — pedagogical + mechanical checks */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const files = [
  "js/i18n.js",
  "data/solved-spots.js",
  "js/courses.js",
  "js/content.js",
  "js/content-ext.js",
  "js/table.js",
  "js/engine.js",
];
let code = "";
for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
code += "globalThis.__out = { STR, COURSES, QUESTIONS, getQuestions, drillActionsForQuestion, facingBet, facingAllIn };";
const ctx = { window: {}, localStorage: { _m: {}, getItem() { return null; }, setItem() {} }, document: {}, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { STR, getQuestions, drillActionsForQuestion, facingBet, facingAllIn } = ctx.__out;

const RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
const CARD_RE = /^(?:[2-9]|T|J|Q|K|A)[cdhs]$/;
const NEED = { flop: 3, turn: 4, river: 5 };

function t(key) { return STR.en[key] || key; }
function cardRank(c) { return RANK[c[0].toUpperCase()]; }

function handRank(board, hand) {
  const ranks = [...board, ...hand].map(cardRank);
  const maxB = Math.max(...board.map(cardRank));
  const hr = hand.map(cardRank);
  const pocket = hr[0] === hr[1];
  if (pocket && ranks.filter((r) => r === hr[0]).length >= 3) return "set";
  if (hr.some((r) => r === maxB) && hr.filter((r) => r === maxB).length >= 1) {
    const matches = hr.filter((r) => r === maxB).length + board.filter((r) => cardRank(r) === maxB).length;
    if (matches >= 3) return "trips+";
    return hr[0] === hr[1] && hr[0] > maxB ? "overpair" : "top_pair";
  }
  if (pocket && hr[0] > maxB) return "overpair";
  if (hr.some((r) => board.some((b) => cardRank(b) === r))) return "pair";
  return "high";
}

function auditQuestion(q) {
  const issues = [];
  const spot = q.spot || {};
  const board = spot.board || [];
  const hand = (spot.hero && spot.hero.hand) || [];
  const street = spot.street || "flop";
  const actions = drillActionsForQuestion(q);
  const stem = t(q.stemKey);
  const lbl = spot.hero && spot.hero.labelKey ? t(spot.hero.labelKey) : "";

  // mechanical
  if (board.length !== NEED[street]) {
    issues.push(`board length ${board.length} != ${NEED[street]} for ${street}`);
  }
  const cards = [...board, ...hand];
  const seen = new Set();
  for (const c of cards) {
    if (!CARD_RE.test(c)) issues.push(`bad card ${c}`);
    if (seen.has(c)) issues.push(`duplicate ${c}`);
    seen.add(c);
  }
  for (const c of q.correct || []) {
    if (!actions.includes(c)) issues.push(`correct "${c}" not in [${actions}]`);
  }
  if (facingAllIn(spot) && actions.includes("raise")) issues.push("all-in spot has raise");
  if (!facingBet(spot) && q.correct.some((c) => ["fold", "call", "raise"].includes(c))) {
    issues.push("fold/call/raise correct without bet");
  }
  if (facingBet(spot) && q.correct.includes("check")) issues.push("check correct while facing bet");

  // feedback coverage for wrong common actions
  const fb = q.feedback || {};
  for (const c of q.correct || []) {
    for (const a of actions) {
      if (a !== c && !fb[a] && !fb._default) {
        // only warn if no feedback for plausible wrong pick
      }
    }
  }
  const wrongActs = actions.filter((a) => !q.correct.includes(a));
  if (wrongActs.length && wrongActs.every((a) => !fb[a])) {
    issues.push(`no feedback for wrong actions: ${wrongActs.join(",")}`);
  }

  // label vs hand sanity
  const blob = (stem + " " + lbl).toLowerCase();
  const hr = handRank(board, hand);
  if (/top pair|顶对/.test(lbl) && hr !== "top_pair" && hr !== "trips+") {
    issues.push(`label top pair but handRank=${hr} hand=${hand.join(" ")} board=${board.join(" ")}`);
  }
  if (/overpair|超对/.test(lbl) && hr !== "overpair" && hr !== "set") {
    issues.push(`label overpair but handRank=${hr}`);
  }
  if (/bottom set|底三条/.test(lbl)) {
    const minB = Math.min(...board.map(cardRank));
    if (!(hand[0][0] === hand[1][0] && cardRank(hand[0]) === minB)) {
      issues.push("label bottom set mismatch");
    }
  }
  if (/top set|顶三条/.test(lbl)) {
    const maxB = Math.max(...board.map(cardRank));
    const pr = cardRank(hand[0]);
    if (!(hand[0][0] === hand[1][0] && pr === maxB)) issues.push("label top set mismatch");
  }
  if (/straight|顺子/.test(lbl) && !/missed|破产|未中/.test(blob)) {
    const set = new Set([...board, ...hand].map(cardRank));
    let has = false;
    for (let hi = 14; hi >= 5; hi--) {
      const seq = hi === 5 ? [14, 2, 3, 4, 5] : [hi, hi - 1, hi - 2, hi - 3, hi - 4];
      if (seq.every((r) => set.has(r))) { has = true; break; }
    }
    if (!has) issues.push("label straight but no made straight");
  }

  // pot/bet sanity
  if ((spot.bet || 0) > (spot.pot || 0) * 3 && !facingAllIn(spot) && !/overbet|超池/.test(stem)) {
    issues.push(`large bet ${spot.bet} vs pot ${spot.pot} without overbet context`);
  }

  return issues;
}

const courses = [];
for (let i = 13; i <= 30; i++) courses.push("c" + i);

let all = [];
for (const cid of courses) {
  for (const q of getQuestions(cid)) {
    const issues = auditQuestion(q);
    if (issues.length) all.push({ id: q.id, issues });
  }
}

if (all.length) {
  console.log("ISSUES FOUND:", all.length);
  for (const x of all) {
    console.log("\n" + x.id);
    for (const i of x.issues) console.log("  - " + i);
  }
  process.exit(1);
}
console.log("c13–c30 deep audit: OK (", courses.length * 12, "questions )");
