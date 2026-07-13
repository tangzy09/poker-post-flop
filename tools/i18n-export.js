/* i18n-export.js — 多语言语料的导出 / 回填 / 校验。
 *
 *   node tools/i18n-export.js export <outDir>
 *       把全部可翻译字符串(UI + 题库 + 计算式反馈模板)导成 <outDir>/src.json
 *       格式: { "<key>": "<英文源>" , ... }  —— 键稳定,值是待翻译的英文。
 *       同时导 <outDir>/src.meta.json:每个 key 的**英文源指纹**(见下)。
 *
 *   node tools/i18n-export.js build <code> <translated.json>
 *       校验并生成 js/locales/<code>.js。任何一条不过 → 拒绝生成(不许半成品上线)。
 *
 *   node tools/i18n-export.js check
 *       体检已有的 js/locales/*.js:覆盖率、占位符、多余键、**源文本是否已变**。
 *
 * ⚠ 为什么要「英文源指纹」:
 *   题库的 key 是**按序号生成**的(buildSpots: `c13-q1.s` / `c13-q1.fb.a` …)。
 *   一旦在 courses-ext-data.js 中间**插入/删除/重排**一道题,后面所有 key 整体移位 ——
 *   译文文件里的键**依然存在**,但对应的已经是另一道题了 → **静默错译**,只查「键在不在」是抓不到的。
 *   所以每个 key 连英文源的 hash 一起存;源变了就报「该键需重译」。
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const INLINE = ["en", "zh"]; // 内联在 i18n.js 里,不需要 locale 文件

/* 在 VM 里真实执行 i18n → courses → content → content-ext,拿到 reg() 注册的全部字符串。
   (不能用正则去扒:题库的 key 是运行时 buildSpots 拼出来的。) */
function loadStrings() {
  const files = ["js/i18n.js", "js/courses.js", "js/content.js", "js/content-ext.js"];
  const ctx = {
    console,
    localStorage: { getItem: () => null, setItem: () => {} },
    navigator: { languages: ["en"], language: "en" },
    document: {
      documentElement: {},
      querySelectorAll: () => [],
      querySelector: () => null,
      createElement: () => ({ setAttribute() {}, getAttribute: () => null }),
      head: { appendChild() {} },
    },
    window: undefined,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  // ⚠ 源码顶层用的是 const/let → **不会**挂到 context 上(只有 var/函数会)。
  //   必须把捕获代码**拼在同一个 script 尾部**,那时它们还在词法作用域里(preflop 同款做法)。
  const bundle =
    files.map((f) => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n;\n") +
    "\n;(function(){" +
    "  try{ if(typeof registerContentStrings==='function') registerContentStrings(); }catch(e){}" +
    // 题库字符串是 buildSpots 运行时注册的 → 必须真取一遍每课的题目
    "  try{ if(typeof getQuestions==='function' && typeof COURSES!=='undefined'){" +
    "    COURSES.forEach(function(c){ try{ getQuestions(c.id); }catch(e){} });" +
    "  } }catch(e){}" +
    "  globalThis.__STR = STR;" +
    "})();";
  vm.runInContext(bundle, ctx, { filename: "i18n-bundle.js" });
  const STR = ctx.__STR;
  if (!STR || !STR.en) throw new Error("没拿到 STR.en —— 加载顺序或 VM 环境有问题");
  return STR.en;
}

const fp = (s) => crypto.createHash("sha1").update(String(s)).digest("hex").slice(0, 10);
const placeholders = (s) => (String(s).match(/\{(\w+)\}/g) || []).sort().join(",");
const htmlTags = (s) => (String(s).match(/<\/?[a-z][^>]*>/gi) || []).map((x) => x.toLowerCase()).sort().join(",");

function cmdExport(outDir) {
  const en = loadStrings();
  const keys = Object.keys(en).sort();
  const src = {};
  const meta = {};
  for (const k of keys) {
    src[k] = en[k];
    meta[k] = fp(en[k]);
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "src.json"), JSON.stringify(src, null, 1));
  fs.writeFileSync(path.join(outDir, "src.meta.json"), JSON.stringify(meta, null, 1));
  const chars = keys.reduce((a, k) => a + String(en[k]).length, 0);
  console.log("导出 " + keys.length + " 条 / " + chars + " 英文字符 → " + outDir);
  console.log("  src.json(待译)  src.meta.json(英文源指纹,回填时校验)");
}

/* 校验一份译文,返回错误数组。硬规则,一条不过就不生成文件。 */
function validate(code, en, meta, tr) {
  const errs = [];
  const keys = Object.keys(en);
  const missing = keys.filter((k) => !(k in tr) || tr[k] === "" || tr[k] === null);
  const extra = Object.keys(tr).filter((k) => !(k in en));
  if (missing.length) errs.push("缺 " + missing.length + " 条: " + missing.slice(0, 8).join(", ") + (missing.length > 8 ? " …" : ""));
  if (extra.length) errs.push("多出 " + extra.length + " 条(key 不存在): " + extra.slice(0, 8).join(", "));

  for (const k of keys) {
    if (!(k in tr)) continue;
    const s = en[k], d = String(tr[k]);
    // 占位符必须一字不差(丢了 {rec} 反馈就没答案了)
    if (placeholders(s) !== placeholders(d)) {
      errs.push(k + ": 占位符不一致 en=[" + placeholders(s) + "] " + code + "=[" + placeholders(d) + "]");
    }
    // HTML 标签必须一致(<b> 之类)
    if (htmlTags(s) !== htmlTags(d)) {
      errs.push(k + ": HTML 标签不一致");
    }
    // 换行结构必须保留(paywall.pitch 靠 \n 分条渲染,拼成一行就毁了)
    if ((s.match(/\n/g) || []).length !== (d.match(/\n/g) || []).length) {
      errs.push(k + ": 换行数不一致(有些文案靠 \\n 分条渲染)");
    }
    // 非 CJK 语言的译文里不该出现中文(说明抄了中文源)。⚠ ja 用汉字,不能用这条查 ja。
    if (code !== "ja" && code !== "zh" && /[一-鿿]/.test(d)) {
      errs.push(k + ": 译文里有中文字符");
    }
    // 原样照抄英文(长句才判,短的术语如 "GTO"/"MDF" 本来就不译)
    if (d === s && s.length > 25) {
      errs.push(k + ": 与英文完全相同(疑似漏译)");
    }
  }
  return errs;
}

function cmdBuild(code, trPath) {
  const en = loadStrings();
  const tr = JSON.parse(fs.readFileSync(trPath, "utf8"));
  const errs = validate(code, en, null, tr);
  if (errs.length) {
    console.error("✖ " + code + " 校验未通过(" + errs.length + " 条),拒绝生成:");
    errs.slice(0, 25).forEach((e) => console.error("   " + e));
    if (errs.length > 25) console.error("   … 还有 " + (errs.length - 25) + " 条");
    process.exit(1);
  }
  // 连英文源指纹一起写进 locale 文件:日后源文本改了,i18n-check 能指出「这条需重译」
  const meta = {};
  for (const k of Object.keys(en)) meta[k] = fp(en[k]);
  const out =
    "/* " + code + " — generated by tools/i18n-export.js。键与 js/i18n.js 的英文源一一对应。\n" +
    "   勿手改:改了会与 SRC 指纹对不上,i18n-check 会报「需重译」。 */\n" +
    "I18N_REGISTER(" + JSON.stringify(code) + ", {\n" +
    " T: " + JSON.stringify(tr, null, 1) + ",\n" +
    " SRC: " + JSON.stringify(meta) + "\n" +
    "});\n";
  const dst = path.join(ROOT, "js", "locales", code + ".js");
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, out);
  console.log("✔ " + dst + " (" + Object.keys(tr).length + " 条)");
}

function cmdCheck() {
  const en = loadStrings();
  const dir = path.join(ROOT, "js", "locales");
  if (!fs.existsSync(dir)) {
    console.log("js/locales/ 还不存在(尚未翻译任何语言)");
    return;
  }
  let bad = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
    const code = f.replace(/\.js$/, "");
    const ctx = { I18N_REGISTER: (c, d) => (ctx._d = d) };
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), ctx, { filename: f });
    const T = (ctx._d && ctx._d.T) || {};
    const SRC = (ctx._d && ctx._d.SRC) || {};
    const errs = validate(code, en, null, T);
    // 源文本变了 → 该 key 的译文已过期(题库 key 移位 / 改了英文文案)
    const stale = Object.keys(en).filter((k) => SRC[k] && SRC[k] !== fp(en[k]));
    if (stale.length) errs.push("英文源已变、译文过期的 key: " + stale.length + " 条 → " + stale.slice(0, 6).join(", "));
    const cov = ((Object.keys(T).filter((k) => k in en).length / Object.keys(en).length) * 100).toFixed(1);
    if (errs.length) {
      bad++;
      console.log("✖ " + code + "  覆盖 " + cov + "%");
      errs.slice(0, 10).forEach((e) => console.log("    " + e));
    } else {
      console.log("✔ " + code + "  覆盖 " + cov + "%  (" + Object.keys(T).length + " 条)");
    }
  }
  process.exit(bad ? 1 : 0);
}

const [cmd, a, b] = process.argv.slice(2);
if (cmd === "export") cmdExport(a || path.join(ROOT, "_i18n"));
else if (cmd === "build") {
  if (!a || !b) throw new Error("用法: build <code> <translated.json>");
  cmdBuild(a, b);
} else if (cmd === "check") cmdCheck();
else {
  console.log("用法:\n  node tools/i18n-export.js export <outDir>\n  node tools/i18n-export.js build <code> <translated.json>\n  node tools/i18n-export.js check");
  process.exit(1);
}
