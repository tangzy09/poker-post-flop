const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

function loadScripts(extra) {
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
  if (extra) code += extra;
  const ctx = { window: {}, localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; } }, document: {}, console };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx;
}

test("12 courses defined", () => {
  const ctx = loadScripts("globalThis.__out = { COURSES, LEARN, QUESTIONS };");
  assert.equal(ctx.__out.COURSES.length, 12);
});

test("each course has 4 learn slides (incl. summary) and 24 questions", () => {
  const ctx = loadScripts("globalThis.__out = { COURSES, LEARN, QUESTIONS, getLearn, getQuestions };");
  for (const c of ctx.__out.COURSES) {
    const slides = ctx.__out.getLearn(c.id);
    assert.equal(slides.length, 4, c.id + " learn");
    assert.equal(slides[slides.length - 1].summary, true, c.id + " last slide is summary");
    assert.equal(ctx.__out.getQuestions(c.id).length, 24, c.id + " questions");
  }
});

test("all courses are free", () => {
  const ctx = loadScripts("globalThis.__out = { COURSES };");
  const free = ctx.__out.COURSES.filter((c) => c.free);
  assert.equal(free.length, 12);
});

test("solver spots present", () => {
  const ctx = loadScripts("globalThis.__out = { SOLVED_SPOTS };");
  assert.ok(ctx.__out.SOLVED_SPOTS.length >= 4);
});
