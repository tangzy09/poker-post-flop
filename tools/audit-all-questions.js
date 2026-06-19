/* audit-all-questions.js — per-question pedagogical audit report */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const files = ["js/i18n.js", "data/solved-spots.js", "js/courses.js", "js/content.js", "js/table.js", "js/engine.js"];
let code = "";
for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
code += "globalThis.__out = { STR, COURSES, QUESTIONS, getQuestions, getLearn, SOLVED_SPOTS };";
const ctx = { window: {}, localStorage: { _m: {}, getItem() { return null; }, setItem() {} }, document: { documentElement: {} }, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { STR, COURSES, getQuestions, SOLVED_SPOTS } = ctx.__out;

const RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
const CARD_RE = /^(?:[2-9]|T|J|Q|K|A)[cdhs]$/;
const NEED_BOARD = { flop: 3, turn: 4, river: 5 };
const ALL_ACTIONS = ["fold", "check", "call", "bet", "raise"];
const solverById = Object.fromEntries(SOLVED_SPOTS.map((s) => [s.id, s]));

function t(key) { return STR.en[key] || key; }

function cardRank(c) { return RANK[c[0]]; }
function cardSuit(c) { return c[1]; }
function countSuit(cards, suit) { return cards.filter((c) => cardSuit(c) === suit).length; }
function maxSameSuit(cards) {
  return Math.max(...["c", "d", "h", "s"].map((s) => countSuit(cards, s)));
}
function maxSuitOnBoard(board) { return maxSameSuit(board); }

function hasStraight(rankSet) {
  for (let hi = 14; hi >= 5; hi--) {
    const seq = hi === 5 ? [14, 2, 3, 4, 5] : [hi, hi - 1, hi - 2, hi - 3, hi - 4];
    if (seq.every((r) => rankSet.has(r))) return true;
  }
  return false;
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
function classifySD(board, hand) {
  const outs = straightOuts(board, hand);
  if (outs.length >= 2) return "oesd";
  if (outs.length === 1) return "gutshot";
  return "none";
}

function expectMdf(pot, bet) { return Math.round((1 - bet / (pot + bet)) * 100); }

function auditC1Choice(q) {
  const issues = [];
  const s = t(q.stemKey);
  const ans = t(q.options.find((o) => o.id === q.correct[0]).labelKey);
  let m;
  m = s.match(/Pot is (\d+), villain bets (\d+).*pot odds/i);
  if (m) {
    const pot = +m[1], bet = +m[2];
    const ratio = (pot + bet) / bet;
    if (!ans.includes(String(ratio))) issues.push(`数学：赔率应为 ${ratio}:1，答案「${ans}」`);
  }
  m = s.match(/Pot is (\d+), villain bets (\d+).*MDF/i);
  if (m) {
    const pct = expectMdf(+m[1], +m[2]);
    if (!ans.includes(String(pct))) issues.push(`数学：MDF 应为 ${pct}%，答案「${ans}」`);
  }
  m = s.match(/Pot is (\d+), villain bets (\d+).*Break-even/i);
  if (m) {
    const eq = Math.round((+m[2] / (+m[1] + +m[2] + +m[2])) * 100);
    if (!ans.includes(String(eq))) issues.push(`数学：盈亏平衡胜率应为 ${eq}%`);
  }
  if (/Facing a pot-sized bet.*break-even/i.test(s) && !ans.includes("33")) {
    issues.push("数学：底池下注盈亏平衡应为 33%");
  }
  if (!q.feedback?._default?.reasonKey || !STR.en[q.feedback._default.reasonKey]) {
    issues.push("缺少错题反馈 key");
  }
  return issues;
}

function auditChoice(q) {
  const issues = [];
  if (!STR.en[q.stemKey]) issues.push("题干 key 未注册");
  for (const o of q.options || []) {
    if (!STR.en[o.labelKey]) issues.push(`选项 ${o.labelKey} 未注册`);
  }
  if (!q.correct.every((c) => q.options.some((o) => o.id === c))) {
    issues.push(`正确答案 ${q.correct} 不在选项中`);
  }
  const fb = q.feedback?._default?.reasonKey;
  if (!fb || !STR.en[fb]) issues.push("缺少反馈 key");
  if (q.id.startsWith("c1-q")) issues.push(...auditC1Choice(q));
  return issues;
}

function auditAction(q) {
  const issues = [];
  const notes = [];
  const spot = q.spot || {};
  const board = spot.board || [];
  const hand = (spot.hero?.hand) || [];
  const cards = [...board, ...hand];
  const stem = t(q.stemKey);
  const lblKey = spot.hero?.labelKey;
  const lbl = lblKey ? t(lblKey) : (spot.hero?.label || "");
  const blob = (stem + " " + lbl).toLowerCase();
  const lblL = lbl.toLowerCase();

  if (!STR.en[q.stemKey]) issues.push("题干 key 未注册");
  if (learnBodyKeys.has(q.stemKey)) issues.push("题干误用原理页正文");

  const street = spot.street || "flop";
  if (NEED_BOARD[street] && board.length !== NEED_BOARD[street]) {
    issues.push(`${street} 应有 ${NEED_BOARD[street]} 张公共牌，实际 ${board.length}`);
  }

  const actions = q.actions?.length ? q.actions : ALL_ACTIONS;
  for (const c of q.correct) {
    if (!actions.includes(c)) issues.push(`推荐行动「${c}」不在可选 [${actions}] 中`);
  }

  const seen = {};
  for (const c of cards) {
    if (!CARD_RE.test(c)) issues.push(`非法牌 ${c}`);
    if (seen[c]) issues.push(`重复牌 ${c}`);
    seen[c] = true;
  }

  if (spot.solverRef) {
    const sol = solverById[spot.solverRef];
    if (!sol) issues.push(`solverRef ${spot.solverRef} 不存在`);
    else {
      const norm = board.map((c) => c.toLowerCase()).join("");
      if (norm !== sol.board.toLowerCase()) issues.push(`公共牌与 solver ${spot.solverRef} 不一致`);
      else notes.push(`Solver 题：${spot.solverRef}`);
    }
  }

  if (hand.length >= 2 && board.length >= 3) {
    const br = board.map(cardRank);
    const hr = hand.map(cardRank);
    const maxB = Math.max(...br);
    const minB = Math.min(...br);

    if (/top pair|顶对/i.test(lblL) && !hr.some((r) => r === maxB)) {
      issues.push(`标签写顶对，但 hero [${hand.join(" ")}] 未中 board 高张 ${maxB}`);
    }
    if (/top set|顶三条/i.test(lblL)) {
      if (!(hr[0] === hr[1] && hr[0] === maxB)) issues.push(`标签写顶三条，但手牌/牌面不匹配`);
    }
    if (/bottom set|底三条|最小三条/i.test(lblL)) {
      if (!(hr[0] === hr[1] && hr[0] === minB)) issues.push(`标签写底三条，但手牌/牌面不匹配`);
    }

    const sd = classifySD(board, hand);
    if (/open-ender|open-ended|oesd|两头顺/i.test(blob) && sd !== "oesd") {
      issues.push(`文案称两头顺，实际为 ${sd}（board=${board.join(" ")}, hand=${hand.join(" ")}）`);
    }
    if (/gutshot|卡顺/i.test(blob) && !/backdoor|bdfd|后门/i.test(blob) && sd === "none") {
      issues.push(`文案称卡顺，但无顺听（board=${board.join(" ")}, hand=${hand.join(" ")}）`);
    }

    if (/flush draw|nut fd|nut flush draw|坚果同花听|坚果花听/i.test(blob) && !/backdoor|bdfd|后门|made the nut flush|completes your nut flush|成坚果同花/i.test(blob)) {
      if (maxSameSuit(cards) < 4) issues.push(`文案称同花听，但最多 ${maxSameSuit(cards)} 张同花`);
    }

    if (/no diamond|no spade|no heart|无方|无黑桃|无红心/i.test(blob)) {
      for (const [suit, pat] of [["d", /no diamond|无方/], ["s", /no spade|无黑桃/], ["h", /no heart|无红心/]]) {
        if (pat.test(blob) && hand.some((c) => cardSuit(c) === suit)) {
          issues.push(`文案称无${suit}，但 hero 持有 ${hand.filter((c) => cardSuit(c) === suit).join(",")}`);
        }
      }
    }

    if (/complet.*flush|牌面成同花|third (diamond|spade|heart)/i.test(blob) && maxSuitOnBoard(board) < 3) {
      issues.push(`文案称同花已成，但 board 最多 ${maxSuitOnBoard(board)} 张同花`);
    }
  }

  if (hand.length === 0) notes.push("范围题（无具体手牌）");

  for (const act of Object.keys(q.feedback || {})) {
    const rk = q.feedback[act]?.reasonKey;
    if (rk && !STR.en[rk]) issues.push(`反馈 key ${rk} 未注册`);
  }

  if (q.confidence === "precise") notes.push("Solver 精确置信度");

  return { issues, notes };
}

const learnBodyKeys = new Set();
for (let c = 1; c <= 12; c++) for (let l = 1; l <= 3; l++) learnBodyKeys.add(`c${c}.l${l}.b`);

const report = { ok: [], warn: [], fail: [], byCourse: {} };

for (const course of COURSES) {
  const qs = getQuestions(course.id);
  report.byCourse[course.id] = { total: qs.length, ok: 0, warn: 0, fail: 0, items: [] };

  for (const q of qs) {
    let issues = [];
    let notes = [];
    if (q.type === "choice") {
      issues = auditChoice(q);
    } else if (q.type === "action") {
      const r = auditAction(q);
      issues = r.issues;
      notes = r.notes;
    } else {
      issues = [`未知题型 ${q.type}`];
    }

    const entry = {
      id: q.id,
      type: q.type,
      confidence: q.confidence,
      correct: q.correct,
      stem: t(q.stemKey).slice(0, 80),
      issues,
      notes,
    };

    if (issues.length === 0) {
      report.ok.push(q.id);
      report.byCourse[course.id].ok++;
      entry.status = "ok";
    } else {
      report.fail.push({ id: q.id, issues });
      report.byCourse[course.id].fail++;
      entry.status = "fail";
    }
    report.byCourse[course.id].items.push(entry);
  }
}

const outPath = path.join(root, "tools", "audit-report.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log("=== 全库题目审计 ===");
console.log(`总计 ${report.ok.length + report.fail.length} 题`);
console.log(`通过 ${report.ok.length} 题`);
console.log(`问题 ${report.fail.length} 题`);
console.log("");
for (const c of COURSES) {
  const b = report.byCourse[c.id];
  console.log(`${c.id}: ${b.ok}/${b.total} 通过${b.fail ? "，" + b.fail + " 有问题" : ""}`);
}
if (report.fail.length) {
  console.log("\n--- 问题明细 ---");
  for (const f of report.fail) {
    console.log(`${f.id}:`);
    for (const i of f.issues) console.log(`  - ${i}`);
  }
} else {
  console.log("\n全部 288 题结构/数学/牌面描述校验通过。");
}
console.log(`\n完整 JSON: ${outPath}`);
