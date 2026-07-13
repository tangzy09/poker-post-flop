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
  /* ⚠ **凡是调 reg() 的文件都必须在这里**,漏一个 = 那批文案永远不会被翻译,
     而且 i18n-check 还会报「100% 覆盖」(它只覆盖你导出的那些)——只有真机/截图才看得出来。
     feedback.js / rating.js 就是这么漏掉的(视觉验收时发现底部一行英文)。
     加了新的 reg() 文件?**回来把它加进这个清单**。 */
  const files = [
    "js/i18n.js",
    "js/courses.js",
    "js/content.js",
    "js/content-ext.js",
    "js/feedback.js",
    "js/rating.js",
  ];

  /* 自动护栏:扫 js/ 下所有调 reg()/_r() 的文件,不在上面清单里就**直接报错**。
     光靠人记「加文件要回来改清单」是靠不住的 —— 上面那条注释就是漏了两个文件之后才写的。 */
  const all = fs.readdirSync(path.join(ROOT, "js")).filter((f) => f.endsWith(".js"));
  const registrars = all.filter((f) => {
    const src = fs.readFileSync(path.join(ROOT, "js", f), "utf8");
    return /^\s*(reg|_r)\(/m.test(src); // 行首的 reg( / _r( = 在注册字符串
  });
  const missed = registrars.filter((f) => !files.includes("js/" + f));
  if (missed.length) {
    throw new Error(
      "这些文件里有 reg() 注册的文案,却不在导出清单里 → 永远不会被翻译:\n  " +
        missed.map((f) => "js/" + f).join("\n  ") +
        "\n把它们加进 tools/i18n-export.js 的 files[]。"
    );
  }
  /* VM shim:够跑完所有注册 reg() 的文件即可。文件多了(feedback.js 会 addEventListener、
     rating.js 会摸 Capacitor)就往这里加,别去改产品代码。 */
  const noop = () => {};
  const el = () => ({
    setAttribute: noop, getAttribute: () => null, addEventListener: noop,
    appendChild: noop, remove: noop, classList: { add: noop, remove: noop, toggle: noop },
    style: {}, dataset: {},
  });
  const ctx = {
    console,
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    navigator: { languages: ["en"], language: "en" },
    document: {
      documentElement: {},
      body: el(),
      querySelectorAll: () => [],
      querySelector: () => null,
      getElementById: () => null,
      createElement: el,
      addEventListener: noop,
      head: { appendChild: noop },
    },
    addEventListener: noop,
    setTimeout: noop,
    fetch: () => Promise.resolve({ ok: false }),
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
/* 数字按**出现顺序**取(不排序):顺序变了意味着句子里的数值对应错了。
   ⚠ 德语小数逗号 "1,5" 会被拆成 1 和 5 → 与源的 1.5 对不上、被拦下。这是**故意的**:
   代码算出来的数字全是点号,题干里写 1,5 会导致同屏两种格式,应统一成 1.5。 */
const numList = (s) => String(s).match(/\d+(?:\.\d+)?/g) || [];
/* a 是否为 b 的子序列(同序、可跳过) —— 源数字必须全在译文里,译文可以多 */
const isSubseq = (a, b) => {
  let i = 0;
  for (const x of b) if (i < a.length && x === a[i]) i++;
  return i === a.length;
};
/* ⚠ 只查**会改变数学结论**的符号:不等号 + EV 正负号。
   不查 `+` `%` `−`(单独出现时):
     - "3+ hands" → "mindestens 3 Hände"、"range + position" → "Range- und Position…"
       都是**正确翻译**(+ 在这里是「以上」「和」的语义,不是运算符),查了全是误报;
     - 数值本身由 nums() 保证,%/+ 丢不掉真数字。
   EV 符号归一化:源里 ASCII `-EV` 与 Unicode `−EV` 混用,视为等价。
   ⚠ 前置断言 (?<![A-Za-z0-9]) 不可省:否则 `highest-EV`(最高EV)、德语复合词 `Chip-EV` 里的**连字符**
   会被当成负号,报一堆假错。真正的 ±EV 前面一定是空格或标点。 */
const syms = (s) =>
  (String(s)
    .replace(/<\/?[a-z][^>]*>/gi, "") // ⚠ 先剥掉 HTML 标签:<br> 的尖括号不是不等号,漏了这步会满屏假错
    .replace(/(?<![A-Za-z0-9])[-−]EV/g, "−EV")
    .match(/[≥≤<>]|(?<![A-Za-z0-9])(?:−EV|\+EV)/g) || [])
    .sort()
    .join("");

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
    /* ⚠ 数字:**源里的每个数字都必须原样、同序地出现在译文里**(子序列检查) —— 产品的命根子:
       讲解里的 outs / 胜率 / 赔率 / 底池,错一个数就是**在教用户错的数学**。
       用「子序列」而不是「完全相同」,因为译文**多出数字是合法的**:
         英文 "to hit on one card" 用的是英文数词,日语自然写法是「1 枚で」;
         "four-straight textures" → 「4 枚ストレート」。这些都对。
       但源里的 19% 如果在译文里变成 20%,子序列立刻断裂 → 拦下。 */
    if (!isSubseq(numList(s), numList(d))) {
      errs.push(k + ": 源数字丢失或被改 en=[" + numList(s).join(";") + "] " + code + "=[" + numList(d).join(";") + "]");
    }
    /* 数学符号:**只拦「符号被改成另一个符号」**(≥ 变 < / −EV 变 +EV = 结论被改),
       不拦「符号被译成词」——教学正文里 ">50% of villain's range" 译成
       "más del 50% del range"(超过50%)、"3+ hands" 译成 "mindestens 3 Hände" 都是**好翻译**,
       数值本身由 nums() 保证还在。判据:译文里有符号、且与源的符号集不同 → 报错。 */
    if (syms(d) && syms(s) !== syms(d)) {
      errs.push(k + ": 数学符号被改 en=[" + syms(s) + "] " + code + "=[" + syms(d) + "]");
    }
    // 非 CJK 语言的译文里不该出现中文(说明抄了中文源)。
    // ⚠ 两个例外:① ja 本来就用汉字;② **英文源自己含中文的**(如 lang.toggle 的值就是「中文」——
    //   那是语言切换按钮上显示的语言名,任何语言下都该是「中文」)。
    if (code !== "ja" && code !== "zh" && /[一-鿿]/.test(d) && !/[一-鿿]/.test(s)) {
      errs.push(k + ": 译文里有中文字符");
    }
    // 原样照抄英文 = 疑似漏译。但**很多条目本来就不该译**:
    //   "Minimum Defense Frequency (MDF)" / "Pot Odds, MDF & Implied Odds" / "MDF = 1 − 100/(100+100) = 50%"
    //   —— 全是术语、缩写、公式。判据:源里得有**普通英文功能词**(the/you/is/and…),才算是真句子。
    const FUNC = /\b(the|is|are|a|an|you|your|to|and|of|for|with|on|in|but|that|this|it|not|when|if)\b/gi;
    if (d === s && s.length > 25 && (s.match(FUNC) || []).length >= 2) {
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
