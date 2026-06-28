const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

function loadI18n() {
  let code = fs.readFileSync(path.join(root, "js/i18n.js"), "utf8") + "\n";
  code += "globalThis.__out = { t, tConcept, applyI18n, setLang, STR };";
  const shell = { getAttribute: () => "app.title", textContent: "Poker Post-Flop" };
  const ctx = {
    window: {},
    localStorage: {
      _m: {},
      getItem(k) {
        return this._m[k] ?? null;
      },
      setItem(k, v) {
        this._m[k] = v;
      },
    },
    document: {
      title: "Poker Post-Flop",
      documentElement: { lang: "en" },
      querySelectorAll(sel) {
        return sel === "[data-i18n]" ? [shell] : [];
      },
    },
    console,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return { ...ctx.__out, shell, document: ctx.document };
}

test("applyI18n updates static shell and document title in Chinese", () => {
  const { applyI18n, setLang, shell, document } = loadI18n();
  setLang("zh");
  applyI18n(document);
  assert.equal(shell.textContent, "扑克翻后");
  assert.equal(document.title, "扑克翻后");
});

test("tConcept resolves leak aliases", () => {
  const { tConcept, setLang } = loadI18n();
  setLang("zh");
  assert.equal(tConcept("too_tight"), "防守过紧");
  assert.equal(tConcept("mdf"), "MDF / 防守频率");
});
