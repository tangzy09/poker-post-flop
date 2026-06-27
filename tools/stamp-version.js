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
html = html.replace(/src="((?:js|data)\/[^"?]+\.js)(\?v=[^"]*)?"/g, `src="$1?v=${version}"`);

fs.writeFileSync(indexPath, html, "utf8");
console.log("Stamped index.html asset version:", version);
