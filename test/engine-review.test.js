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

test("finishReviewSession shows summary and keeps reviewReturnTo", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.courseId = "c1";
  Engine.reviewMode = true;
  Engine.reviewReturnTo = "stats";
  Engine.answers = [
    { qid: "c2-q1", ok: true },
    { qid: "c2-q2", ok: false },
    { qid: "c2-q3", ok: true },
  ];
  Engine.reviewSessionMastered = 1;
  Engine.finishReviewSession();
  assert.equal(Engine.getProgress("c1").completed, false);
  assert.equal(Engine.screen, "review-over");
  assert.equal(Engine.reviewReturnTo, "stats");
  assert.equal(Engine.reviewSummary.correct, 2);
  assert.equal(Engine.reviewSummary.total, 3);
  assert.equal(Engine.reviewSummary.pct, 67);
  assert.equal(Engine.reviewSummary.mastered, 1);
  Engine.exitReviewFlow();
  assert.equal(Engine.screen, "stats");
  assert.equal(Engine.reviewSummary, null);
});

test("onReviewCorrect counts session mastered", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  const rec = { courseId: "c2", qid: "c2-q1", streak: 1, wrong: 1 };
  Engine.store.reviewPile = [rec];
  Engine.reviewSessionMastered = 0;
  Engine.onReviewCorrect(rec);
  assert.equal(rec.streak, 2);
  assert.equal(Engine.store.reviewPile.length, 0);
  assert.equal(Engine.reviewSessionMastered, 1);
});

test("startReview returns to review screen when launched from review", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.reviewPile = [{ courseId: "c2", qid: "c2-q1", wrong: 1, streak: 0, leak: "too_tight" }];
  Engine.screen = "review";
  Engine.startReview({ courseId: "c2" });
  assert.equal(Engine.reviewReturnTo, "review");
  assert.equal(Engine.reviewMode, true);
});

test("startReview empty filter keeps reviewReturnTo for review-empty back", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.reviewPile = [{ courseId: "c2", qid: "c2-q1", wrong: 1, streak: 0, leak: "too_tight" }];
  Engine.screen = "stats";
  Engine.startReview({ courseId: "c99" });
  assert.equal(Engine.screen, "review-empty");
  assert.equal(Engine.reviewReturnTo, "stats");
  assert.equal(Engine.reviewMode, false);
});

test("exitReviewFlow returns to reviewReturnTo from review-empty", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.screen = "review-empty";
  Engine.reviewReturnTo = "stats";
  Engine.reviewFilter = { courseId: "c1" };
  Engine.exitReviewFlow();
  assert.equal(Engine.screen, "stats");
  assert.equal(Engine.reviewReturnTo, null);
  assert.equal(Engine.reviewFilter, null);
});

test("exitReviewFlow returns to review when cancelled mid review drill", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.reviewMode = true;
  Engine.screen = "drill";
  Engine.reviewReturnTo = "review";
  Engine.reviewQueue = [{}];
  Engine.exitReviewFlow();
  assert.equal(Engine.screen, "review");
  assert.equal(Engine.reviewMode, false);
  assert.equal(Engine.reviewQueue.length, 0);
});

test("removeFromPile removes matching record", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  const rec = { courseId: "c2", qid: "c2-q1", wrong: 1 };
  Engine.store.reviewPile = [rec, { courseId: "c5", qid: "c5-q1", wrong: 1 }];
  Engine.removeFromPile(rec);
  assert.equal(Engine.store.reviewPile.length, 1);
  assert.equal(Engine.store.reviewPile[0].courseId, "c5");
});

test("_migrateStore trims c1 progress and review pile to 8 questions", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.progress.c1 = { learnDone: true, qDone: 20, correct: 15, total: 24, completed: true };
  Engine.store.statsByCourse.c1 = { h: 24, c: 18 };
  Engine.store.stats = { totalQ: 100, correctQ: 70, coursesDone: 1 };
  Engine.store.reviewPile = [
    { courseId: "c1", qid: "c1-q1", wrong: 1 },
    { courseId: "c1", qid: "c1-q20", wrong: 1 },
    { courseId: "c2", qid: "c2-q1", wrong: 1 },
  ];
  Engine._migrateStore();
  assert.equal(Engine.store.progress.c1.total, 8);
  assert.equal(Engine.store.progress.c1.qDone, 8);
  assert.equal(Engine.store.reviewPile.length, 2);
  assert.ok(Engine.store.reviewPile.every((r) => r.qid !== "c1-q20"));
  assert.equal(Engine.store.statsByCourse.c1.h, 8);
  assert.equal(Engine.store.statsByCourse.c1.c, 8);
  assert.equal(Engine.store.stats.totalQ, 84);
  assert.equal(Engine.store.stats.correctQ, 60);
});

test("_migrateStore backfills statsByCourse from completed progress", () => {
  const { Engine } = loadEngine();
  Engine.store = freshStore();
  Engine.store.progress.c5 = { learnDone: true, qDone: 24, correct: 18, total: 24, completed: true };
  Engine._migrateStore();
  assert.equal(Engine.store.statsByCourse.c5.h, 24);
  assert.equal(Engine.store.statsByCourse.c5.c, 18);
});
