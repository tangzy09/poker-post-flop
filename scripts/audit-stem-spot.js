/* Stem text vs spot board/hand consistency (action questions only) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const files = ["js/i18n.js", "data/solved-spots.js", "js/courses.js", "js/content.js", "js/content-ext.js", "js/table.js", "js/engine.js"];
let code = "";
for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
code += "globalThis.__out = { STR, getQuestions, COURSES };";
const ctx = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, document: {}, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { STR, getQuestions } = ctx.__out;
const t = (k) => STR.en[k] || "";

const RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
const SUIT = { h: "h", c: "c", s: "s", d: "d", "♥": "h", "♣": "c", "♠": "s", "♦": "d" };

function rankVal(r) {
  return RANK[r.toUpperCase()];
}

function boardRanks(board) {
  return board.map((c) => rankVal(c[0]));
}

function parseBoardFromStem(stem) {
  const patterns = [
    /\bon ([2-9TJQKA](?:-[2-9TJQKA]){2,4})\b/i,
    /\bBoard ([2-9TJQKA](?:-[2-9TJQKA]){2,4})\b/i,
    /在 ([2-9TJQKA](?:-[2-9TJQKA]){2,4}) 持/,
    /牌面 ([2-9TJQKA](?:-[2-9TJQKA]){2,4})/,
  ];
  for (const re of patterns) {
    const m = stem.match(re);
    if (m) {
      return m[1].split("-").map((r) => rankVal(r));
    }
  }
  return null;
}

function parseHandCardsFromStem(stem) {
  const hold = stem.match(/\bhold ([^\.]+?) on\b/i) || stem.match(/持([^。]+?)在 /);
  if (!hold) return null;
  const chunk = hold[1].split(/\s*[—(-]/)[0].trim();
  const sym = chunk.match(/([2-9TJQKA][♥♣♠♦])\s*([2-9TJQKA][♥♣♠♦])/);
  if (sym) {
    return sym.slice(1, 3).map((c) => {
      const suit = SUIT[c[1]];
      return c[0].toUpperCase() + suit;
    });
  }
  const zh = chunk.match(/([2-9TJQKA][♥♣♠♦])([2-9TJQKA][♥♣♠♦])/);
  if (zh) {
    return [zh[1], zh[2]].map((c) => c[0].toUpperCase() + SUIT[c[1]]);
  }
  const ascii = chunk.match(/\b([2-9TJQKA][hcnsd])\s*([2-9TJQKA][hcnsd])\b/i);
  if (ascii) {
    return [ascii[1], ascii[2]].map((c) => c[0].toUpperCase() + c[1].toLowerCase());
  }
  return null;
}

function handRankKey(hand) {
  return hand.map((c) => rankVal(c[0])).sort((a, b) => a - b).join(",");
}

const issues = [];

for (const course of ctx.__out.COURSES) {
  for (const q of getQuestions(course.id)) {
    if (q.type !== "action" || !q.spot?.board?.length) continue;
    const stem = t(q.stemKey);
    const stemBoard = parseBoardFromStem(stem);
    const actual = boardRanks(q.spot.board);
    if (stemBoard && stemBoard.length === actual.length) {
      for (let i = 0; i < stemBoard.length; i++) {
        if (stemBoard[i] !== actual[i]) {
          issues.push(`${q.id}: stem board ${stemBoard.join("-")} vs spot ${actual.join("-")}`);
          break;
        }
      }
    }
    const stemHand = parseHandCardsFromStem(stem);
    const spotHand = q.spot.hero?.hand || q.spot.hand;
    if (stemHand && spotHand?.length === 2) {
      if (handRankKey(stemHand) !== handRankKey(spotHand)) {
        issues.push(`${q.id}: stem hand ${stemHand.join(" ")} vs spot ${spotHand.join(" ")}`);
      }
    }
  }
}

if (issues.length) {
  console.error("Stem/spot audit: " + issues.length + " issue(s)");
  for (const i of issues) console.error("  - " + i);
  process.exit(1);
}
console.log("Stem/spot audit: OK");
