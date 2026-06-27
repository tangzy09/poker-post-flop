const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

function loadRangeChart() {
  const files = ["js/i18n.js", "js/equity.js", "js/range-chart.js"];
  let code = "";
  for (const f of files) code += fs.readFileSync(path.join(root, f), "utf8") + "\n";
  code += "globalThis.__out = { boardTextureHint, computeHuEquity, t };";
  const ctx = {
    window: {},
    localStorage: { _m: {}, getItem() { return null; }, setItem() {} },
    document: { documentElement: {} },
    console,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.__out;
}

test("boardTextureHint matches C3 lesson boards", () => {
  const { boardTextureHint, t } = loadRangeChart();
  assert.equal(boardTextureHint(["Ah", "7d", "2c"]), t("range.hintDryHigh"));
  assert.equal(boardTextureHint(["6h", "5s", "4d"]), t("range.hintLowConnected"));
  assert.equal(boardTextureHint(["Ks", "8d", "3c"]), t("range.hintDryHigh"));
});

test("computeHuEquity favors caller on low connected 654", () => {
  const { computeHuEquity } = loadRangeChart();
  const eq = computeHuEquity(["6h", "5s", "4d"]);
  assert.ok(eq < 0.52, "BB should be near even or ahead on 654");
});
