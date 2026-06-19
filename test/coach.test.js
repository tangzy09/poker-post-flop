/* coach.test.js — profile / plan / leak aggregation */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

function loadCoach() {
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
  code += "globalThis.__out = { Coach, COURSES, getQuestions, courseById, t: (k,p)=>k };";
  const ctx = {
    window: {},
    localStorage: { getItem() { return null; }, setItem() {} },
    document: { documentElement: {} },
    console,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.__out;
}

test("Coach.buildPlan ranks course+leak groups by score", () => {
  const { Coach } = loadCoach();
  const store = {
    reviewPile: [
      { courseId: "c9", qid: "c9-q1", leak: "street_plan", wrong: 3 },
      { courseId: "c9", qid: "c9-q2", leak: "street_plan", wrong: 2 },
      { courseId: "c5", qid: "c5-q1", leak: "cbet", wrong: 1 },
    ],
    statsByCourse: { c9: { h: 10, c: 4 }, c5: { h: 20, c: 16 } },
  };
  const plan = Coach.buildPlan(store);
  assert.equal(plan.ready, true);
  assert.equal(plan.items[0].courseId, "c9");
  assert.equal(plan.items[0].leak, "street_plan");
  assert.ok(plan.items[0].score > plan.items[1].score);
});

test("Coach.buildProfile needs minimum questions", () => {
  const { Coach } = loadCoach();
  const early = Coach.buildProfile({ stats: { totalQ: 5, correctQ: 3 }, reviewPile: [] });
  assert.equal(early.ready, false);
  const ready = Coach.buildProfile({
    stats: { totalQ: 30, correctQ: 20 },
    reviewPile: [
      { courseId: "c6", qid: "c6-q1", leak: "too_tight", wrong: 4 },
      { courseId: "c2", qid: "c2-q1", leak: "too_loose", wrong: 1 },
    ],
    statsByCourse: {
      c6: { h: 12, c: 6 },
      c2: { h: 10, c: 8 },
    },
    statsByStreet: {
      flop: { h: 10, c: 7 },
      turn: { h: 10, c: 4 },
    },
  });
  assert.equal(ready.ready, true);
  assert.equal(ready.styleKey, "profTight");
  assert.equal(ready.weakStreet.street, "turn");
});

test("Coach.aggregateLeaks weights wrong count", () => {
  const { Coach } = loadCoach();
  const agg = Coach.aggregateLeaks({
    reviewPile: [
      { leak: "sizing", wrong: 2 },
      { leak: "sizing", wrong: 3 },
      { leak: "too_tight", wrong: 1 },
    ],
  });
  assert.equal(agg.counts.sizing, 5);
  assert.equal(agg.topKey, "sizing");
});
