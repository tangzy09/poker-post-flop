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

console.log("www/ built (" + copy.length + " files): " + copy.slice(1).join(", "));
