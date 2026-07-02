/* Stamp git short hash into index.html script query strings for cache busting */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");

let version;
try {
  version = execSync("git rev-parse --short HEAD", { cwd: root, encoding: "utf8" }).trim();
} catch {
  version = String(Date.now());
}

let html = fs.readFileSync(indexPath, "utf8");
let count = 0;
html = html.replace(/src="((?:js|data)\/[^"?]+\.js)(\?v=[^"]*)?"/g, (m, p1) => {
  count++;
  return `src="${p1}?v=${version}"`;
});

// 打戳数必须等于 index.html 实际 script 数 —— 正则失配时静默"成功"会重现「手机旧缓存」事故
const expected = (html.match(/<script[^>]*\ssrc="/g) || []).length;
if (count === 0 || count !== expected) {
  console.error(`Stamp FAILED: replaced ${count} but index.html has ${expected} <script src> tags — aborting deploy`);
  process.exit(1);
}

fs.writeFileSync(indexPath, html, "utf8");
console.log(`Stamped index.html asset version: ${version} (${count} scripts)`);
