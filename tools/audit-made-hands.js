/* Audit: evaluate hero best 5-card made hand and flag answers/labels that treat
   a strong made hand (straight/flush/full house+) as weak/bluff-catcher/fold. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const files = ["js/i18n.js", "data/solved-spots.js", "js/courses.js", "js/content.js", "js/content-ext.js", "js/table.js", "js/engine.js"];
let code = "";
for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
code += "globalThis.__out = { STR, getQuestions };";
const ctx = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, document: {}, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { STR, getQuestions } = ctx.__out;
const t = (k) => (k ? STR.en[k] || k : "");
const tz = (k) => (k ? STR.zh[k] || k : "");

const RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
const CATS = ["high card", "pair", "two pair", "trips/set", "straight", "flush", "full house", "quads", "straight flush"];

function card(c) { return { r: RANK[c[0].toUpperCase()], s: c[1].toLowerCase() }; }

function bestCategory(cards) {
  // cards: array of {r,s}
  const ranks = cards.map((c) => c.r);
  const suits = {};
  for (const c of cards) (suits[c.s] = suits[c.s] || []).push(c.r);

  // flush?
  let flushSuit = null;
  for (const s in suits) if (suits[s].length >= 5) flushSuit = s;

  // straight flush?
  function hasStraight(rs) {
    const u = [...new Set(rs)].sort((a, b) => a - b);
    const set = new Set(u);
    if (set.has(14)) set.add(1); // wheel
    const all = [...set].sort((a, b) => a - b);
    let run = 1, best = 1;
    for (let i = 1; i < all.length; i++) {
      if (all[i] === all[i - 1] + 1) { run++; best = Math.max(best, run); }
      else run = 1;
    }
    return best >= 5;
  }
  if (flushSuit && hasStraight(suits[flushSuit])) return 8;

  const freq = {};
  for (const r of ranks) freq[r] = (freq[r] || 0) + 1;
  const counts = Object.values(freq).sort((a, b) => b - a);
  if (counts[0] >= 4) return 7;
  if (counts[0] >= 3 && counts[1] >= 2) return 6;
  if (flushSuit) return 5;
  if (hasStraight(ranks)) return 4;
  if (counts[0] >= 3) return 3;
  if (counts[0] === 2 && counts[1] === 2) return 2;
  if (counts[0] === 2) return 1;
  return 0;
}

// detect made flush/straight using hero hole cards (not just board)
function usesHole(board, hand, cat) {
  const boardCat = bestCategory(board.map(card));
  const fullCat = cat;
  return fullCat > boardCat; // hero improves over the board
}

const WEAK_RE = /bluff[- ]?catch|抓诈|weak|marginal|边缘|弱|second pair|third pair|第二对|第三对|middle pair|中对|missed|破产|air|空气|underpair|低对|ace[- ]?high|高牌|gutshot|卡顺|overcard/i;
const DRAW_RE = /draw|听牌|flush draw|同花听|straight draw|顺子听|fd\b|oesd|gutshot|卡顺/i;

const results = [];
for (let i = 1; i <= 30; i++) {
  for (const q of getQuestions("c" + i)) {
    if (q.type !== "action") continue;
    const spot = q.spot || {};
    const hand = spot.hero?.hand || [];
    const board = spot.board || [];
    if (hand.length !== 2 || board.length < 3) continue;
    const all = [...hand, ...board].map(card);
    const cat = bestCategory(all);
    const boardCat = bestCategory(board.map(card));
    const heroImproves = cat > boardCat;
    const street = spot.street;
    const isRiver = board.length === 5;

    const lbl = t(spot.hero?.labelKey);
    const stem = t(q.stemKey);
    const blob = (lbl + " || " + stem);
    const correct = q.correct || [];

    const flags = [];

    // 1. Hero has straight+ (using own cards) but labeled/stemmed as weak
    if (cat >= 4 && heroImproves && WEAK_RE.test(blob)) {
      flags.push(`HERO ${CATS[cat]} but text reads weak: "${(blob).slice(0,140)}"`);
    }
    // 2. Hero has straight+ (any street) and correct allows/forces fold
    if (cat >= 4 && heroImproves && correct.includes("fold")) {
      flags.push(`HERO ${CATS[cat]} but correct includes fold (${correct.join("/")})`);
    }
    // 3. Made flush/straight described as a "draw" on the river (can't be a draw anymore)
    if (cat >= 4 && isRiver && DRAW_RE.test(blob) && heroImproves) {
      flags.push(`HERO made ${CATS[cat]} on river but text says draw/听牌: "${blob.slice(0,140)}"`);
    }
    // 4. Label claims a category stronger than reality
    function labelClaims(re) { return re.test(lbl); }
    if (labelClaims(/flush|同花/i) && !labelClaims(/draw|听|flush draw/i) && cat < 5) {
      flags.push(`label claims FLUSH but best is ${CATS[cat]}`);
    }
    if (labelClaims(/straight|顺/i) && !labelClaims(/draw|听|straight draw|gutshot|卡顺/i) && cat < 4) {
      flags.push(`label claims STRAIGHT but best is ${CATS[cat]}`);
    }
    if (labelClaims(/full house|葫芦|boat/i) && cat < 6) {
      flags.push(`label claims FULL HOUSE but best is ${CATS[cat]}`);
    }
    if (labelClaims(/\bquads?\b|四条|铁支/i) && cat < 7) {
      flags.push(`label claims QUADS but best is ${CATS[cat]}`);
    }

    if (flags.length) {
      results.push({
        id: q.id,
        cat: CATS[cat],
        board: board.join(" "),
        hand: hand.join(" "),
        correct: correct.join("/"),
        lbl,
        stem: stem.slice(0, 120),
        flags,
      });
    }
  }
}

// Full list of hero strong made hands (straight+) for manual answer sanity-check
const strong = [];
for (let i = 1; i <= 30; i++) {
  for (const q of getQuestions("c" + i)) {
    if (q.type !== "action") continue;
    const spot = q.spot || {};
    const hand = spot.hero?.hand || [];
    const board = spot.board || [];
    if (hand.length !== 2 || board.length < 3) continue;
    const cat = bestCategory([...hand, ...board].map(card));
    const boardCat = bestCategory(board.map(card));
    if (cat >= 4 && cat > boardCat) {
      strong.push(`[${q.id}] ${CATS[cat]} | board=${board.join(" ")} hand=${hand.join(" ")} correct=${(q.correct||[]).join("/")} | ${t(spot.hero?.labelKey)}`);
    }
  }
}
console.log("=== ALL HERO STRAIGHT+ MADE HANDS (" + strong.length + ") ===");
for (const s of strong) console.log(s);
console.log("\n=== MADE-HAND AUDIT: " + results.length + " flagged ===\n");
for (const r of results) {
  console.log(`[${r.id}]  best=${r.cat}  board=${r.board}  hand=${r.hand}  correct=${r.correct}`);
  if (r.lbl) console.log(`   label: ${r.lbl}`);
  console.log(`   stem : ${r.stem}`);
  for (const f of r.flags) console.log(`   ⚠ ${f}`);
  console.log("");
}
