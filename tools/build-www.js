const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const www = path.join(root, "www");

// 拷贝清单不手写:从 index.html 解析全部 <script src="js/... | data/...">,
// 手维护清单曾漏掉 explain.js 导致安卓包计算式反馈静默失效。
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scripts = [...html.matchAll(/src="((?:js|data)\/[^"?]+\.js)/g)].map((m) => m[1]);
if (scripts.length < 10) throw new Error("index.html 解析出的脚本异常少(" + scripts.length + "),中止");
const copy = ["index.html", ...new Set(scripts)];

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });

for (const rel of copy) {
  const src = path.join(root, rel);
  if (!fs.existsSync(src)) throw new Error("index.html 引用了不存在的文件: " + rel);
  const dst = path.join(www, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

/* ⚠ locale 文件(ja/de/es)是**懒加载**的 —— 它们没有 <script> 标签,上面那段解析拿不到。
   不显式补拷,原生包里 js/locales/ 整个不存在 → ensureLocale 加载失败 → 多语言**静默回落英文**
   (web 上一切正常,只有 app 坏,是最难发现的那类 bug)。
   这与本文件开头注释里记的 explain.js 那次事故是同一类:清单漏文件 = 静默失效。 */
const localesDir = path.join(root, "js", "locales");
let localeFiles = [];
if (fs.existsSync(localesDir)) {
  localeFiles = fs.readdirSync(localesDir).filter((f) => f.endsWith(".js"));
  fs.cpSync(localesDir, path.join(www, "js", "locales"), { recursive: true });
}

/* 护栏:i18n.js 声明发货的语言,必须真有 locale 文件(en/zh 内联在 i18n.js 里,不需要文件)。
   防的是「把语言加进 I18N_SUPPORTED 却忘了 locale 文件」→ 用户选了德语却看到英文。 */
const i18nSrc = fs.readFileSync(path.join(root, "js", "i18n.js"), "utf8");
const supM = i18nSrc.match(/I18N_SUPPORTED\s*=\s*\[([^\]]+)\]/);
if (supM) {
  const INLINE = ["en", "zh"];
  const declared = supM[1].split(",").map((s) => s.trim().replace(/['"]/g, "")).filter(Boolean);
  const missing = declared.filter((l) => !INLINE.includes(l) && !localeFiles.includes(l + ".js"));
  if (missing.length) {
    throw new Error(
      "I18N_SUPPORTED 声明了 [" + missing.join(", ") + "],但 js/locales/ 里没有对应文件 —— " +
        "打进原生包会静默回落英文。要么补 locale 文件,要么先把语言从 I18N_SUPPORTED 拿掉。"
    );
  }
}

console.log("www/ built (" + copy.length + " files): " + copy.slice(1).join(", "));
if (localeFiles.length) console.log("  + js/locales/: " + localeFiles.join(", "));
