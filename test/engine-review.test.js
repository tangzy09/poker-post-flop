/* engine-review.test.js — review mode + stats correctness */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

function loadEngine() {
  const files = [
    "js/i18n.js",
    "data/solved-spots.js",
    "js/courses.js",
    "js/content.js",
    "js/table.js",
    "js/engine.js",
    "js/coach.js",
  ];
  let code = "";
  for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
  code += "globalThis.__out = { Engine, getQuestions, COURSES };";
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

function freshStore() {
  return {
    progress: {},
    reviewPile: [],
    stats: { totalQ: 0, correctQ: 0, coursesDone: 0 },
    statsByCourse: {},
    statsByStreet: {},
  };
}

test("review wrong answer resets streak on pile record", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  const rec = { courseId: "c2", qid: "c2-q1", choice: "fold", streak: 1, wrong: 2, leak: "too_tight" };
  Engine.store.reviewPile = [rec];
  Engine.reviewMode = true;
  Engine.courseId = "c2";
  const q = { id: "c2-q1", type: "action", correct: ["call"], leak: "too_tight", _courseId: "c2", _rec: rec };
  Engine.recordAnswer(q, "fold", { ok: false });
  assert.equal(rec.streak, 0);
  assert.equal(rec.wrong, 3);
});

test("review mode does not increment drill stats", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  const rec = { courseId: "c5", qid: "c5-q1", streak: 0, wrong: 1, leak: "cbet" };
  Engine.store.reviewPile = [rec];
  Engine.reviewMode = true;
  Engine.courseId = "c5";
  const q = { id: "c5-q1", type: "action", correct: ["bet"], spot: { street: "flop" }, _courseId: "c5", _rec: rec };
  Engine.recordAnswer(q, "check", { ok: false });
  assert.equal(Engine.store.stats.totalQ, 0);
  assert.equal(Engine.store.statsByCourse.c5, undefined);
  assert.equal(Engine.store.statsByStreet.flop, undefined);
});

test("drill stats use question course id in cross-course review queue", () => {
  const { Engine, getQuestions } = loadEngine();
  Engine.store = freshStore();
  Engine.reviewMode = false;
  Engine.courseId = "c2";
  const q9 = getQuestions("c9")[0];
  const q = Object.assign({}, q9, { _courseId: "c9" });
  Engine.recordAnswer(q, "check", { ok: true });
  assert.ok(Engine.store.statsByCourse.c9);
  assert.equal(Engine.store.statsByCourse.c2, undefined);
});

test("startReview matches missing leak as other", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.reviewPile = [
    { courseId: "c3", qid: "c3-q1", wrong: 1, streak: 0, leak: "range_blind" },
    { courseId: "c4", qid: "c4-q1", wrong: 1, streak: 0 },
  ];
  Engine._migrateStore();
  Engine.startReview({ courseId: "c4", leak: "other" });
  assert.equal(Engine.reviewQueue.length, 1);
  assert.equal(Engine.reviewQueue[0].id, "c4-q1");
});

test("finishReview does not mark course completed", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.courseId = "c1";
  Engine.reviewMode = true;
  Engine.reviewReturnTo = "stats";
  Engine.finishReview();
  assert.equal(Engine.getProgress("c1").completed, false);
  assert.equal(Engine.screen, "stats");
  assert.equal(Engine.reviewMode, false);
});

test("_migrateStore backfills statsByCourse from completed progress", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.progress.c5 = { learnDone: true, qDone: 24, correct: 18, total: 24, completed: true };
  Engine._migrateStore();
  assert.equal(Engine.store.statsByCourse.c5.h, 24);
  assert.equal(Engine.store.statsByCourse.c5.c, 18);
});
