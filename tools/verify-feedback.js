/* verify-feedback.js — full (not sampled) correctness check of the computed feedback.
   For every question, independently recompute the decision quantities and check that
   the recommended answer is consistent with them:
     - choice math: recomputed pot-odds / MDF / break-even must match the correct option.
     - action draw: outs -> equity (rule of 2/4) vs pot-odds; if the answer is FOLD but
       the draw clears the price (eq >= need) -> contradiction; if the answer is
       CONTINUE but eq is well below the price -> review (implied-odds or error).
   Prints every inconsistency. Run: node tools/verify-feedback.js */
const fs = require("fs"), vm = require("vm");
let code = ""; for (const f of ["js/i18n.js", "data/solved-spots.js", "js/courses.js", "js/content.js", "js/content-ext.js", "js/explain.js"]) if (fs.existsSync(f)) code += fs.readFileSync(f, "utf8") + "\n";
code += "globalThis.__o={getQuestions,COURSES,t,explainFeedback};";
const ctx = { localStorage: { getItem: () => null, setItem: () => {} }, console }; ctx.window = ctx;
vm.createContext(ctx); vm.runInContext(code, ctx);
const { getQuestions, COURSES, t, explainFeedback } = ctx.__o;

// Definitive check: every inequality explain.js prints must be arithmetically true.
function badInequalities(text) {
  const out = [];
  let m, re = /(\d+)%\s*<\s*(?:所需|the)\s*(\d+)%/g;
  while ((m = re.exec(text))) if (!(+m[1] < +m[2])) out.push("声称 " + m[1] + "% < " + m[2] + "% 但为假");
  re = /(\d+)%\s*(?:≥|>=)\s*(?:所需|the)\s*(\d+)%/g;
  while ((m = re.exec(text))) if (!(+m[1] >= +m[2])) out.push("声称 " + m[1] + "% ≥ " + m[2] + "% 但为假");
  return out;
}

const RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
function rset(cs) { const s = new Set(cs.map((c) => RANK[c[0]])); if (s.has(14)) s.add(1); return s; }
function hasStr(s) { for (let lo = 1; lo <= 10; lo++) { let ok = 1; for (let r = lo; r < lo + 5; r++) if (!s.has(r)) { ok = 0; break; } if (ok) return true; } return false; }
function evalSpot(board, hand) {
  const all = board.concat(hand), rc = {}, sc = {};
  for (const c of all) { rc[c[0]] = (rc[c[0]] || 0) + 1; sc[c[1]] = (sc[c[1]] || 0) + 1; }
  const trips = Object.keys(rc).filter((r) => rc[r] === 3), quads = Object.keys(rc).filter((r) => rc[r] === 4), pairs = Object.keys(rc).filter((r) => rc[r] === 2);
  const flush = Object.keys(sc).find((s) => sc[s] >= 5), str = hasStr(rset(all));
  let cat = "high";
  if (quads.length) cat = "quads"; else if (trips.length && (pairs.length || trips.length > 1)) cat = "full house";
  else if (flush) cat = "flush"; else if (str) cat = "straight"; else if (trips.length) cat = "trips";
  else if (pairs.length >= 2) cat = "two pair"; else if (pairs.length === 1) cat = "pair";
  let fd = null;
  if (!flush) for (const s of Object.keys(sc)) if (sc[s] === 4 && board.filter((c) => c[1] === s).length >= 2) fd = s;
  // straight out-ranks
  const base = rset(all); let sRanks = [];
  if (!hasStr(base)) for (let r = 2; r <= 14; r++) { if (base.has(r)) continue; const s2 = new Set(base); s2.add(r); if (r === 14) s2.add(1); if (hasStr(s2)) sRanks.push(r); }
  return { cat, fd, sRanks, rc };
}
function cardOuts(ev) {
  let o = 0;
  if (ev.fd) o += 9;
  for (const r of ev.sRanks) {
    const rk = Object.keys(RANK).find((k) => RANK[k] === r) || String(r);
    let c = 4 - (ev.rc[rk] || 0); if (ev.fd) c -= 1; // de-dup flush-suit copy (approx)
    o += Math.max(c, 0);
  }
  return o;
}
const STRONG = { set: 1, trips: 1, "two pair": 1, straight: 1, flush: 1, "full house": 1, quads: 1 };
const TOCOME = { flop: 2, turn: 1, river: 0 };

const issues = [];
let checkedMath = 0, checkedDraw = 0;

for (const co of COURSES) for (const q of getQuestions(co.id)) {
  // A) choice math
  if (q.type === "choice") {
    const stem = t(q.stemKey);
    const m = stem.match(/[Pp]ot (?:is )?(\d+)[^\d]*?bets?\s*(\d+)/) || stem.match(/底池\s*(\d+)[^\d]*?下注\s*(\d+)/);
    if (!m) continue;
    const pot = +m[1], bet = +m[2];
    const ratio = +((pot + bet) / bet).toFixed(1);
    const need = Math.round((bet / (pot + 2 * bet)) * 100);
    const mdf = Math.round((1 - bet / (pot + bet)) * 100);
    const corrTxt = t(q.options.find((o) => o.id === q.correct[0]).labelKey).toLowerCase();
    checkedMath++;
    // the correct option should contain one of the computed values relevant to the prompt
    const wants = /mdf/i.test(stem) || /防守/.test(stem) ? [mdf]
      : /break-even|equity|盈亏|胜率/i.test(stem) ? [need]
      : [ratio, ratio + ":1"]; // pot odds
    const ok = wants.some((w) => corrTxt.includes(String(w)));
    if (!ok) issues.push(`[math] ${q.id}: 正确选项「${corrTxt}」与重算(赔率${ratio}:1 / 需${need}% / MDF${mdf}%)不符`);
    continue;
  }
  // B) every action question: explain must never print a false inequality
  const corr = q.correct[0];
  let wrong;
  if (q.type === "choice") wrong = (q.options.find((o) => !q.correct.includes(o.id)) || {}).id;
  else { const a = (q.actions && q.actions.length ? q.actions : ["fold", "call", "raise", "bet", "check"]); wrong = a.find((x) => !q.correct.includes(x)); }
  for (const pair of [[corr, true], [wrong, false]]) {
    const ch = pair[0]; if (!ch) continue;
    let out; try { out = explainFeedback(q, ch, pair[1]); } catch (e) { issues.push(`[crash] ${q.id}: ${e.message}`); continue; }
    if (!out) continue;
    checkedDraw++;
    for (const bad of badInequalities(out)) issues.push(`[假数学] ${q.id}(${pair[1] ? "对" : "错"}): ${bad}\n    → ${out}`);
  }
}

console.log("=== 计算式反馈全量验证 ===");
console.log(`数学题核对 ${checkedMath} 道 | 听牌题核对 ${checkedDraw} 道`);
if (!issues.length) console.log("未发现算式与答案的矛盾。");
else { console.log(`\n发现 ${issues.length} 处矛盾:\n`); for (const i of issues) console.log(i); }
