/* label-check.js — deterministic hand-strength evaluator for action questions.
   Recomputes what board+hand ACTUALLY makes and flags when the label / stem /
   feedback TEXT disagrees. Catches the dominant defect class:
     - made hand miscalled a draw (e.g. straight labeled "missed gutshot")
     - trips called "two pair", quads called "full house", set vs trips
     - "flush draw" claimed with no 4-flush; "nut FD" without the nut
     - "gutshot" that is actually an OESD (out-count)
     - label text naming a card that is physically on the board

   Run:  node tools/label-check.js
   Complements audit-all-questions.js (structure) and /review-strategy (judgment). */
const fs = require("fs"), vm = require("vm");
const files = ["js/i18n.js", "data/solved-spots.js", "js/courses.js", "js/content.js"];
if (fs.existsSync("js/content-ext.js")) files.push("js/content-ext.js");
let code = ""; for (const f of files) code += fs.readFileSync(f, "utf8") + "\n";
code += "globalThis.__o={getQuestions,t};";
const ctx = { localStorage: { getItem: () => null, setItem: () => {} }, console }; ctx.window = ctx;
vm.createContext(ctx); vm.runInContext(code, ctx);
const { getQuestions, t } = ctx.__o;

const RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
const SUITMAP = { "♠": "s", "♥": "h", "♦": "d", "♣": "c", s: "s", h: "h", d: "d", c: "c" };
const CARD = /^([2-9TJQKA])([cdhs])$/;

function counts(cards) { const m = {}; for (const c of cards) m[c[0]] = (m[c[0]] || 0) + 1; return m; }
function suitCounts(cards) { const m = {}; for (const c of cards) m[c[1]] = (m[c[1]] || 0) + 1; return m; }
function rankSet(cards) { const s = new Set(cards.map((c) => RANK[c[0]])); if (s.has(14)) s.add(1); return s; }
function hasStraight(set) { for (let lo = 1; lo <= 10; lo++) { let ok = true; for (let r = lo; r < lo + 5; r++) if (!set.has(r)) { ok = false; break; } if (ok) return true; } return false; }
function straightOuts(cards) {
  const base = rankSet(cards); if (hasStraight(base)) return -1; // -1 = made
  let outs = 0;
  for (let r = 2; r <= 14; r++) { if (base.has(r)) continue; const s = new Set(base); s.add(r); if (r === 14) s.add(1); if (hasStraight(s)) outs++; }
  return outs;
}

// classify made hand category from board+hand (7 max)
function evaluate(board, hand) {
  const all = [...board, ...hand];
  const rc = counts(all), sc = suitCounts(all);
  const flushSuit = Object.keys(sc).find((s) => sc[s] >= 5);
  const trips = Object.keys(rc).filter((r) => rc[r] === 3);
  const quads = Object.keys(rc).filter((r) => rc[r] === 4);
  const pairs = Object.keys(rc).filter((r) => rc[r] === 2);
  const madeStraight = hasStraight(rankSet(all));
  let cat = "high";
  if (quads.length) cat = "quads";
  else if (trips.length && (pairs.length || trips.length > 1)) cat = "fullhouse";
  else if (flushSuit) cat = "flush";
  else if (madeStraight) cat = "straight";
  else if (trips.length) cat = "trips";
  else if (pairs.length >= 2) cat = "twopair";
  else if (pairs.length === 1) cat = "pair";
  // set vs trips: a three-of-a-kind where hole is a pocket pair = set
  const pocket = hand.length === 2 && hand[0][0] === hand[1][0];
  let tripKind = null;
  if (trips.length) tripKind = (pocket && hand[0][0] === trips[0]) ? "set" : "trips";
  // flush draw: a suit with exactly 4 among 7, board holds >=2 of it, not a made flush
  let fd = null, nutFd = false;
  if (!flushSuit) for (const s of Object.keys(sc)) {
    if (sc[s] === 4 && board.filter((c) => c[1] === s).length >= 2) {
      fd = s; nutFd = hand.some((c) => c[0] === "A" && c[1] === s);
    }
  }
  const outs = straightOuts(all);
  return { cat, tripKind, fd, nutFd, straightOuts: outs };
}

const findings = [];
function flag(id, kind, msg) { findings.push({ id, kind, msg }); }

for (let i = 1; i <= 30; i++) for (const q of getQuestions("c" + i)) {
  if (q.type !== "action") continue;
  const s = q.spot || {}, hero = s.hero || {};
  const board = (s.board || []).filter((c) => CARD.test(c));
  const hand = (hero.hand || []).filter((c) => CARD.test(c));
  if (hand.length !== 2 || board.length < 3) continue;
  const ev = evaluate(board, hand);

  const lblTxt = hero.labelKey ? t(hero.labelKey) : (hero.label || "");
  // hand-strength claims come from the HERO's label + stem only — NOT feedback,
  // which routinely describes the villain's draws/trips and would false-positive.
  const text = (t(q.stemKey) + " " + lblTxt).toLowerCase();

  // 1. label names a card on the board. Extract from ♠♥♦♣ symbols only (the hand
  //    labels use symbols), so prose words like "ace"/"as" don't false-match.
  const lblCards = [];
  let m, re = /([2-9TJQKA])\s*([♠♥♦♣])/g;
  while ((m = re.exec(lblTxt)) !== null) { lblCards.push(m[1] + SUITMAP[m[2]]); }
  for (const lc of lblCards) if (board.includes(lc)) flag(q.id, "label-card", `标签提及 ${lc}，但它在公共牌中（不可能是底牌/写错花色）`);

  // 2. made hand vs "draw / missed / no-pair" wording
  const claimsDraw = /flush draw|\bfd\b|oesd|open-ender|open-ended|gutshot|卡顺|花听|顺听|两头顺|missed|落空|no pair|no draw|无对|无听|\bair\b|空气/.test(text);
  // …unless the text ALSO names the made hand (e.g. "a straight + flush draw",
  // "missed straight" on a board straight) — then it isn't actually misleading.
  const namesMade = /\bstraight\b|顺子|成顺|\bflush\b|同花|成花|full house|葫芦|\bquads?\b|四条|made (a|the)|已成|flopped a|rivered a/.test(text);
  if ((ev.cat === "straight" || ev.cat === "flush" || ev.cat === "fullhouse" || ev.cat === "quads") && claimsDraw && !namesMade && !/blocker|阻断|backdoor|后门/.test(text)) {
    flag(q.id, "made-as-draw", `实际已成 ${ev.cat}，但文案含听牌/落空/空气措辞`);
  }

  // 3. trips/set vs two pair
  if (/two pair|两对/.test(text) && (ev.cat === "trips" || ev.tripKind)) flag(q.id, "trips-as-2pair", `实际为 ${ev.tripKind || "trips"}（三条），文案称两对`);
  if (/(\bset\b|三条|\btrips\b)/.test(text.replace(/set[\s-]?up/g, "")) && ev.cat !== "trips" && !ev.tripKind && ev.cat !== "fullhouse" && ev.cat !== "quads") flag(q.id, "no-trips", `文案称三条/set，但实际为 ${ev.cat}（无三条）`);

  // 4. full house vs quads
  if (/full house|葫芦|full\b/.test(text) && ev.cat === "quads") flag(q.id, "quads-as-fh", `实际为 quads（四条），文案称葫芦`);

  // 5. flush-draw claim but no 4-flush
  if (/flush draw|花听|nut fd|nut flush draw|坚果花听/.test(text) && !ev.fd && ev.cat !== "flush" && !/backdoor|后门/.test(text)) {
    flag(q.id, "no-fd", `文案称同花听，但 board+hand 无 4 张同花`);
  }
  // 6. nut FD claim but not the nut
  if (/nut flush draw|nut fd|坚果花听|坚果同花听/.test(text) && ev.fd && !ev.nutFd) flag(q.id, "not-nut-fd", `文案称坚果花听，但未持该花色 A`);

  // 7. gutshot but actually OESD (8 outs)
  if (/gutshot|卡顺/.test(text) && !/open|两头|oesd/.test(text) && ev.straightOuts >= 8) flag(q.id, "gut-is-oesd", `文案称卡顺，但实际顺听 ${ev.straightOuts} 张 outs（OESD）`);
}

console.log("=== 牌力评估校验（成牌/听牌重算 vs 文案声明）===");
if (!findings.length) console.log("未发现牌力标签与实际牌力的矛盾。");
else { console.log(`发现 ${findings.length} 处疑点：\n`); for (const f of findings) console.log(`[${f.kind}] ${f.id}: ${f.msg}`); }
