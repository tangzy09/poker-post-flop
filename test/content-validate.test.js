/* content-validate.test.js — machine-checkable correctness invariants for the
   curriculum. Catches the classes of bugs we fixed by hand:
   - duplicate cards in a spot (board + hero hand)
   - malformed card codes
   - "correct" answers that aren't selectable options/actions
   - i18n keys referenced by a question that were never registered
   - solverRef pointing at a missing solved spot
   - bad confidence labels / wrong question counts
   Run: `node --test` (or `node test/content-validate.test.js`). */

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
    "js/content-ext.js",
    "js/table.js",
    "js/engine.js",
  ];
  let code = "";
  for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
  code += "globalThis.__out = { STR, COURSES, QUESTIONS, getQuestions, getLearn, SOLVED_SPOTS, courseDrillCount, drillActionsForQuestion, facingBet, facingAllIn, FACE, FACE_CALL, ACT };";
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

const DEFAULT_ACTIONS = ["fold", "check", "call", "bet"];
const ALL_ACTIONS = ["fold", "check", "call", "bet", "raise"];
const CONFIDENCES = ["precise", "reference", "conceptual"];
const CARD_RE = /^(?:[2-9]|T|J|Q|K|A)[cdhs]$/;

function keyExists(STR, key) {
  return key != null && Object.prototype.hasOwnProperty.call(STR.en, key);
}

// Walk every question and accumulate human-readable problems.
function collectIssues(out) {
  const { STR, COURSES, getQuestions, SOLVED_SPOTS, courseDrillCount } = out;
  const issues = [];
  const solverIds = new Set((SOLVED_SPOTS || []).map((s) => s.id));
  const seenIds = new Set();

  for (const course of COURSES) {
    const qs = getQuestions(course.id);
    if (qs.length !== courseDrillCount(course)) issues.push(`${course.id}: expected ${courseDrillCount(course)} questions, got ${qs.length}`);

    for (const q of qs) {
      const at = `${q.id || course.id + "?"}`;
      if (seenIds.has(q.id)) issues.push(`${at}: duplicate question id`);
      seenIds.add(q.id);

      if (!keyExists(STR, q.stemKey)) issues.push(`${at}: stemKey "${q.stemKey}" not registered`);
      if (!CONFIDENCES.includes(q.confidence)) issues.push(`${at}: bad confidence "${q.confidence}"`);
      if (!Array.isArray(q.correct) || q.correct.length === 0) issues.push(`${at}: empty correct[]`);

      if (q.type === "choice") {
        const ids = (q.options || []).map((o) => o.id);
        if (ids.length < 2) issues.push(`${at}: choice needs >=2 options`);
        for (const o of q.options || []) {
          if (!keyExists(STR, o.labelKey)) issues.push(`${at}: option labelKey "${o.labelKey}" not registered`);
        }
        for (const c of q.correct || []) {
          if (!ids.includes(c)) issues.push(`${at}: correct "${c}" not among options [${ids}]`);
        }
        const dk = q.feedback && q.feedback._default && q.feedback._default.reasonKey;
        if (dk && !keyExists(STR, dk)) issues.push(`${at}: feedback reasonKey "${dk}" not registered`);
      } else if (q.type === "action") {
        const spot = q.spot || {};
        const actions = out.drillActionsForQuestion(q);
        for (const a of actions) {
          if (!ALL_ACTIONS.includes(a)) issues.push(`${at}: unknown action "${a}"`);
        }
        for (const c of q.correct || []) {
          if (!actions.includes(c)) issues.push(`${at}: correct "${c}" not selectable in [${actions}]`);
        }
        if (out.facingBet(spot) && actions.includes("check")) {
          issues.push(`${at}: check offered while facing a bet`);
        }
        if (!out.facingBet(spot) && (actions.includes("fold") || actions.includes("call") || actions.includes("raise"))) {
          issues.push(`${at}: fold/call/raise offered without a bet to face`);
        }
        if (out.facingAllIn(spot) && actions.includes("raise")) {
          issues.push(`${at}: raise offered while facing all-in`);
        }
        if (out.facingAllIn(spot) && (!actions.includes("fold") || !actions.includes("call"))) {
          issues.push(`${at}: facing all-in must offer fold and call only`);
        }

        // Card validity + duplicate detection across board and hero hand.
        const cards = [...(spot.board || []), ...((spot.hero && spot.hero.hand) || [])];
        const seenCards = {};
        for (const card of cards) {
          if (!CARD_RE.test(card)) issues.push(`${at}: malformed card "${card}"`);
          if (seenCards[card]) issues.push(`${at}: duplicate card "${card}"`);
          seenCards[card] = true;
        }

        if (spot.hero && spot.hero.labelKey && !keyExists(STR, spot.hero.labelKey)) {
          issues.push(`${at}: hero labelKey "${spot.hero.labelKey}" not registered`);
        }
        if (q.ctxKey && !keyExists(STR, q.ctxKey)) issues.push(`${at}: ctxKey "${q.ctxKey}" not registered`);
        if (spot.solverRef && !solverIds.has(spot.solverRef)) {
          issues.push(`${at}: solverRef "${spot.solverRef}" not in SOLVED_SPOTS`);
        }

        const fb = q.feedback || {};
        for (const act of Object.keys(fb)) {
          const rk = fb[act] && fb[act].reasonKey;
          if (rk && !keyExists(STR, rk)) issues.push(`${at}: feedback[${act}] reasonKey "${rk}" not registered`);
        }
      } else {
        issues.push(`${at}: unknown question type "${q.type}"`);
      }
    }
  }
  return issues;
}

test("every question is structurally valid (cards, keys, answers)", () => {
  const out = load();
  const issues = collectIssues(out);
  assert.deepEqual(issues, [], "\n  - " + issues.join("\n  - ") + "\n");
});

test("every learn slide has registered title/body keys + a summary slide", () => {
  const out = load();
  const { STR, COURSES, getLearn } = out;
  const issues = [];
  for (const course of COURSES) {
    const slides = getLearn(course.id);
    if (!Array.isArray(slides) || slides.length < 1) {
      issues.push(`${course.id}: no learn slides`);
      continue;
    }
    slides.forEach((s, i) => {
      const at = `${course.id}.learn[${i}]`;
      if (!keyExists(STR, s.titleKey)) issues.push(`${at}: titleKey "${s.titleKey}" not registered`);
      if (!keyExists(STR, s.bodyKey)) issues.push(`${at}: bodyKey "${s.bodyKey}" not registered`);
    });
    if (!slides.some((s) => s.summary)) issues.push(`${course.id}: missing a summary slide`);
  }
  assert.deepEqual(issues, [], "\n  - " + issues.join("\n  - ") + "\n");
});

test("every spot has a complete board for its street", () => {
  const out = load();
  const need = { flop: 3, turn: 4, river: 5 };
  const issues = [];
  for (const course of out.COURSES) {
    for (const q of out.getQuestions(course.id)) {
      if (q.type !== "action" || !q.spot) continue;
      const street = q.spot.street || "flop";
      const n = (q.spot.board || []).length;
      if (need[street] && n !== need[street]) {
        issues.push(`${q.id}: ${street} board should have ${need[street]} cards, got ${n}`);
      }
    }
  }
  assert.deepEqual(issues, [], "\n  - " + issues.join("\n  - ") + "\n");
});
