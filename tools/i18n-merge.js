/* 把 _i18n/out/<code>-<batch>.json 合并成 _i18n/out/<code>.json,并对齐源 key。
   用法: node tools/i18n-merge.js de ja es
   合并后必须再跑 `node tools/i18n-export.js build <code> _i18n/out/<code>.json` 过校验闸。 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "_i18n", "out");
const src = JSON.parse(fs.readFileSync(path.join(ROOT, "_i18n", "src.json"), "utf8"));
const srcKeys = Object.keys(src);
const BATCHES = ["ui", "learn", "lbl1", "lbl2", "opt", "stem1", "stem2", "fb1", "fb2", "fb3"];

let bad = 0;
for (const code of process.argv.slice(2)) {
  const merged = {};
  const missingFiles = [];
  for (const b of BATCHES) {
    const f = path.join(OUT, code + "-" + b + ".json");
    if (!fs.existsSync(f)) {
      missingFiles.push(b);
      continue;
    }
    const o = JSON.parse(fs.readFileSync(f, "utf8"));
    for (const k of Object.keys(o)) {
      if (k in merged) console.log("  ⚠ " + code + " 重复 key(后者覆盖): " + k);
      merged[k] = o[k];
    }
  }
  if (missingFiles.length) {
    console.log("✖ " + code + " 缺批次文件: " + missingFiles.join(", "));
    bad++;
    continue;
  }
  const missing = srcKeys.filter((k) => !(k in merged));
  const extra = Object.keys(merged).filter((k) => !srcKeys.includes(k));
  const dst = path.join(OUT, code + ".json");
  fs.writeFileSync(dst, JSON.stringify(merged, null, 1));
  const status = missing.length || extra.length ? "✖" : "✔";
  if (missing.length || extra.length) bad++;
  console.log(
    status + " " + code + ": " + Object.keys(merged).length + "/" + srcKeys.length + " 条" +
      (missing.length ? "  缺 " + missing.length + " 条: " + missing.slice(0, 5).join(", ") : "") +
      (extra.length ? "  多 " + extra.length + " 条: " + extra.slice(0, 5).join(", ") : "")
  );
}
process.exit(bad ? 1 : 0);
