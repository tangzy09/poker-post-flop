/* content-audit.test.js — pedagogical correctness checks beyond structure.
   Run: node --test test/content-audit.test.js */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

function load() {
  const files = [
    "js/i18n.js",
    "data/solved-spots.js",
    "js/courses.js",
    "js/content.js",
    "js/table.js",
    "js/engine.js",
  ];
  let code = "";
  for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
  code += "globalThis.__out = { STR, COURSES, QUESTIONS, getQuestions, getLearn, SOLVED_SPOTS };";
  const ctx = {
    window: {},
    localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; } },
    document: { documentElement: {} },
    console,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.__out;
}

function t(STR, key) {
  return STR.en[key] || key;
}

const CARD_RE = /^(?:[2-9]|T|J|Q|K|A)[cdhs]$/;
const RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

function parseMathQuestions(STR) {
  const checks = [];
  for (const key of Object.keys(STR.en)) {
    const m = key.match(/^c1\.q(\d+)\.s$/);
    if (!m) continue;
    checks.push({ n: +m[1], stem: STR.en[key], ans: STR.en["c1.q" + m[1] + ".a"] });
  }
  return checks;
}

function expectMdf(pot, bet) {
  return 1 - bet / (pot + bet);
}

function auditC1Math(STR) {
  const issues = [];
  for (const q of parseMathQuestions(STR)) {
    const s = q.stem;
    let m;

    m = s.match(/Pot is (\d+), villain bets (\d+).*pot odds/i);
    if (m) {
      const pot = +m[1], bet = +m[2];
      const ratio = (pot + bet) / bet;
      if (!q.ans.includes(String(ratio))) {
        issues.push(`c1.q${q.n}: pot odds should be ${ratio}:1, answer is "${q.ans}"`);
      }
    }

    m = s.match(/Pot is (\d+), villain bets (\d+).*MDF/i);
    if (m) {
      const pot = +m[1], bet = +m[2];
      const pct = Math.round(expectMdf(pot, bet) * 100);
      if (!q.ans.includes(String(pct))) {
        issues.push(`c1.q${q.n}: MDF should be ~${pct}%, answer is "${q.ans}"`);
      }
    }

    m = s.match(/Pot is (\d+), villain bets (\d+).*Break-even/i);
    if (m) {
      const pot = +m[1], bet = +m[2];
      const eq = Math.round((bet / (pot + bet + bet)) * 100);
      if (!q.ans.includes(String(eq))) {
        issues.push(`c1.q${q.n}: break-even equity should be ${eq}%, answer is "${q.ans}"`);
      }
    }

    if (/Facing a pot-sized bet.*break-even/i.test(s) && !q.ans.includes("33")) {
      issues.push(`c1.q${q.n}: pot-bet break-even should be 33%, got "${q.ans}"`);
    }
  }
  return issues;
}

function auditStems(STR, questions) {
  const issues = [];
  const learnBodyKeys = new Set();
  for (let c = 1; c <= 12; c++) {
    for (let l = 1; l <= 3; l++) learnBodyKeys.add("c" + c + ".l" + l + ".b");
  }
  for (const q of questions) {
    if (learnBodyKeys.has(q.stemKey)) {
      issues.push(`${q.id}: stemKey "${q.stemKey}" is learn-slide body text`);
    }
    const stem = t(STR, q.stemKey);
    if (q.type === "action" && q.spot && q.spot.facing === "bet") {
      if (/What is MDF|Approximate MDF|^Pot is .*pot odds/i.test(stem) && !/Best action|Best default|defend/i.test(stem)) {
        issues.push(`${q.id}: math stem on action spot`);
      }
    }
  }
  return issues;
}

function cardRank(card) {
  return RANK[card[0]];
}

function cardSuit(card) {
  return card[1];
}

function allCards(q) {
  const spot = q.spot || {};
  return [...(spot.board || []), ...((spot.hero && spot.hero.hand) || [])];
}

function countSuit(cards, suit) {
  return cards.filter((c) => cardSuit(c) === suit).length;
}

function maxSuitOnBoard(board) {
  return Math.max(countSuit(board, "c"), countSuit(board, "d"), countSuit(board, "h"), countSuit(board, "s"));
}

function straightCompletes(boardRanks, handRanks) {
  const all = [...boardRanks, ...handRanks];
  const set = new Set(all);
  const outs = [];
  for (const hi of RANKS.map((r) => RANK[r])) {
    if (hi === 14) continue;
    const seq = [hi, hi - 1, hi - 2, hi - 3, hi - 4];
    const have = seq.filter((r) => set.has(r)).length;
    if (have === 4) {
      const missing = seq.find((r) => !set.has(r));
      outs.push(missing);
    }
  }
  // wheel: A2345
  const wheel = [14, 2, 3, 4, 5];
  const wh = wheel.filter((r) => set.has(r)).length;
  if (wh === 4) outs.push(wheel.find((r) => !set.has(r)));
  return [...new Set(outs)];
}

function straightOuts(board, hand) {
  const set = new Set([...board, ...hand].map(cardRank));
  const outs = [];
  for (let r = 2; r <= 14; r++) {
    if (set.has(r)) continue;
    const test = new Set([...set, r]);
    if (hasStraight(test)) outs.push(r);
  }
  return outs;
}

function hasStraight(rankSet) {
  for (let hi = 14; hi >= 5; hi--) {
    const seq = hi === 5 ? [14, 2, 3, 4, 5] : [hi, hi - 1, hi - 2, hi - 3, hi - 4];
    if (seq.every((r) => rankSet.has(r))) return true;
  }
  return false;
}

function classifyStraightDraw(board, hand) {
  const outs = straightOuts(board, hand);
  if (outs.length >= 2) return "oesd";
  if (outs.length === 1) return "gutshot";
  return "none";
}

function maxSameSuit(cards) {
  let max = 0;
  for (const suit of ["c", "d", "h", "s"]) {
    max = Math.max(max, countSuit(cards, suit));
  }
  return max;
}

function textClaimsFlushDraw(text) {
  if (/backdoor|bdfd|后门/i.test(text)) return false;
  return /\bflush draw\b|nut fd|nut flush draw|坚果同花听|坚果花听/i.test(text);
}

function boardFlushComplete(board) {
  return maxSuitOnBoard(board) >= 3;
}

function textClaimsOESD(text) {
  return /open-ender|open-ended|OESD|两头顺/i.test(text);
}

function textClaimsGutshot(text) {
  return /gutshot|卡顺/i.test(text);
}

function textClaimsFlushComplete(text) {
  return /complet.*flush|成同花|牌面成同花|third (diamond|spade|heart|club)/i.test(text);
}

function textClaimsNutFlush(text, hand, board) {
  return /nut flush|坚果同花/i.test(text) && hand.length === 2;
}

function auditSpotClaims(q, STR) {
  const issues = [];
  const spot = q.spot;
  if (!spot) return issues;
  const board = spot.board || [];
  const hand = (spot.hero && spot.hero.hand) || [];
  const cards = allCards(q);
  const seen = {};
  for (const c of cards) {
    if (seen[c]) issues.push(`${q.id}: duplicate card ${c}`);
    seen[c] = true;
    if (!CARD_RE.test(c)) issues.push(`${q.id}: malformed card ${c}`);
  }

  const enStem = t(STR, q.stemKey).toLowerCase();
  const lblKey = spot.hero && spot.hero.labelKey;
  const enLbl = lblKey ? t(STR, lblKey).toLowerCase() : (spot.hero && spot.hero.label || "").toLowerCase();
  const blob = enStem + " " + enLbl;

  const sd = classifyStraightDraw(board, hand);
  if (textClaimsOESD(blob) && sd !== "oesd") {
    issues.push(`${q.id}: claims open-ender but draw type is "${sd}" (board=${board.join(" ")}, hand=${hand.join(" ")})`);
  }
  if (textClaimsGutshot(blob) && sd !== "gutshot" && sd !== "oesd") {
    issues.push(`${q.id}: claims gutshot but draw type is "${sd}"`);
  }

  if (textClaimsFlushComplete(blob)) {
    if (!boardFlushComplete(board)) {
      issues.push(`${q.id}: claims flush complete but board max suit count is ${maxSuitOnBoard(board)} (${board.join(" ")})`);
    }
  }

  if (/no diamond|no spade|no heart|no club|无方|无黑桃|无红心|无梅花/i.test(blob)) {
    for (const suit of ["c", "d", "h", "s"]) {
      if (new RegExp(`no ${suit === "d" ? "diamond" : suit === "s" ? "spade" : suit === "h" ? "heart" : "club"}`, "i").test(blob) ||
          (suit === "d" && /无方块/.test(blob)) ||
          (suit === "s" && /无黑桃/.test(blob)) ||
          (suit === "h" && /无红心/.test(blob)) ||
          (suit === "c" && /无梅花/.test(blob))) {
        if (hand.some((c) => cardSuit(c) === suit)) {
          issues.push(`${q.id}: text says no ${suit} but hero holds ${hand.filter((c) => cardSuit(c) === suit).join(",")}`);
        }
      }
    }
  }

  if (textClaimsFlushDraw(blob) && hand.length >= 2 && !/made the nut flush|completes your nut flush|成坚果同花|完成你的坚果同花/i.test(blob)) {
    if (maxSameSuit(cards) < 4) {
      issues.push(`${q.id}: claims flush draw but max same-suit count is ${maxSameSuit(cards)} (${cards.join(" ")})`);
    }
  }

  if (hand.length === 2 && board.length >= 3) {
    const boardRanks = board.map(cardRank);
    const handRanks = hand.map(cardRank);
    const maxBoard = Math.max(...boardRanks);
    const minBoard = Math.min(...boardRanks);
    const lblBlob = enLbl;

    if (/top pair|顶对/i.test(lblBlob)) {
      const hasTop = handRanks.some((r) => r === maxBoard);
      if (!hasTop) issues.push(`${q.id}: label claims top pair but hero ranks [${handRanks}] vs board high ${maxBoard}`);
    }
    if (/top set|顶三条/i.test(lblBlob)) {
      const pocket = handRanks[0] === handRanks[1];
      if (!pocket || handRanks[0] !== maxBoard) {
        issues.push(`${q.id}: label claims top set but hand=${hand.join(" ")} on board high ${maxBoard}`);
      }
    }
    if (/bottom set|底三条|最小三条/i.test(lblBlob)) {
      const pocket = handRanks[0] === handRanks[1];
      if (!pocket || handRanks[0] !== minBoard) {
        issues.push(`${q.id}: label claims bottom set but hand=${hand.join(" ")} on board low ${minBoard}`);
      }
    }
  }

  return issues;
}

function auditChoiceAlwaysA(questions) {
  const issues = [];
  for (const q of questions) {
    if (q.type !== "choice") continue;
    if (q.correct.length !== 1 || q.correct[0] !== "a") continue;
    // flag courses where ALL concept questions are hardcoded "a" — sanity only
  }
  return issues;
}

function auditSolverSpots(questions, SOLVED_SPOTS) {
  const byId = Object.fromEntries(SOLVED_SPOTS.map((s) => [s.id, s]));
  const issues = [];
  for (const q of questions) {
    if (!q.spot || !q.spot.solverRef) continue;
    const ref = q.spot.solverRef;
    const sol = byId[ref];
    if (!sol) continue;
    const boardStr = (q.spot.board || []).join("").replace(/([hdcs])/g, "$1").toLowerCase();
    const solBoard = sol.board.toLowerCase();
    const norm = (q.spot.board || []).map((c) => c.toLowerCase()).join("");
    if (norm !== solBoard) {
      issues.push(`${q.id}: board ${norm} != solver ${solBoard} for ${ref}`);
    }
  }
  return issues;
}

test("C1 math answers match formulas", () => {
  const { STR } = load();
  assert.deepEqual(auditC1Math(STR), [], "\n  - " + auditC1Math(STR).join("\n  - ") + "\n");
});

test("action question stems are not learn-slide bodies or mismatched math prompts", () => {
  const out = load();
  const all = out.COURSES.flatMap((c) => out.getQuestions(c.id));
  const issues = auditStems(out.STR, all);
  assert.deepEqual(issues, [], "\n  - " + issues.join("\n  - ") + "\n");
});

test("no duplicate cards in any spot", () => {
  const out = load();
  const issues = [];
  for (const c of out.COURSES) {
    for (const q of out.getQuestions(c.id)) {
      if (q.type !== "action" || !q.spot) continue;
      issues.push(...auditSpotClaims(q, out.STR).filter((x) => x.includes("duplicate") || x.includes("malformed")));
    }
  }
  assert.deepEqual(issues, [], "\n  - " + issues.join("\n  - ") + "\n");
});

test("spot text claims match board/hand (draw type, flush, suits)", () => {
  const out = load();
  const issues = [];
  for (const c of out.COURSES) {
    for (const q of out.getQuestions(c.id)) {
      if (q.type !== "action" || !q.spot) continue;
      issues.push(...auditSpotClaims(q, out.STR));
    }
  }
  assert.deepEqual(issues, [], "\n  - " + issues.join("\n  - ") + "\n");
});

test("solver-linked spots use matching boards", () => {
  const out = load();
  const all = out.COURSES.flatMap((c) => out.getQuestions(c.id));
  const issues = auditSolverSpots(all, out.SOLVED_SPOTS);
  assert.deepEqual(issues, [], "\n  - " + issues.join("\n  - ") + "\n");
});

test("every choice question has feedback key registered", () => {
  const out = load();
  const issues = [];
  for (const c of out.COURSES) {
    for (const q of out.getQuestions(c.id)) {
      if (q.type !== "choice") continue;
      const dk = q.feedback && q.feedback._default && q.feedback._default.reasonKey;
      if (!dk || !out.STR.en[dk]) issues.push(`${q.id}: missing feedback key ${dk}`);
      for (const o of q.options || []) {
        if (!out.STR.en[o.labelKey]) issues.push(`${q.id}: missing option ${o.labelKey}`);
      }
    }
  }
  assert.deepEqual(issues, [], "\n  - " + issues.join("\n  - ") + "\n");
});
