const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const www = path.join(root, "www");

const copy = [
  "index.html",
  "js/i18n.js",
  "js/courses.js",
  "js/content.js",
  "js/equity.js",
  "js/range-chart.js",
  "js/table.js",
  "js/engine.js",
  "js/app.js",
  "data/solved-spots.js",
];

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });
fs.mkdirSync(path.join(www, "js"), { recursive: true });
fs.mkdirSync(path.join(www, "data"), { recursive: true });

for (const rel of copy) {
  const src = path.join(root, rel);
  const dst = path.join(www, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

console.log("www/ built (" + copy.length + " files)");
