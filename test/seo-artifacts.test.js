/* seo-artifacts.test.js — 生成物同步锁:
   slug 表 ↔ courses/ 静态页 ↔ sitemap.xml ↔ index.html SEO 块 四方必须对应。
   加课/改名后忘跑 gen-seo-pages / gen-seo-block 时,这里直接红,而不是线上 404。 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const SLUGS = require(path.join(root, "tools", "seo-slugs.js"));
const TERMS = require(path.join(root, "tools", "seo-terms.js"));
const SITE = "https://post-flop-coach.ai-speeds.com";

function loadCourses() {
  const ctx = { window: {}, console };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, "js/courses.js"), "utf8") + ";globalThis.__C=COURSES;", ctx);
  return ctx.__C.filter((c) => !c.placement);
}

test("every non-placement course has a frozen slug and both en/zh pages on disk", () => {
  const courses = loadCourses();
  for (const c of courses) {
    const slug = SLUGS[c.id];
    assert.ok(slug, `course ${c.id} 缺 slug(tools/seo-slugs.js)`);
    assert.ok(fs.existsSync(path.join(root, "courses", slug + ".html")), `缺 courses/${slug}.html — 跑 node tools/gen-seo-pages.js`);
    assert.ok(fs.existsSync(path.join(root, "courses", "zh", slug + ".html")), `缺 courses/zh/${slug}.html — 跑 node tools/gen-seo-pages.js`);
  }
  // slug 表反向:没有指向不存在课程的孤儿 slug
  const ids = new Set(courses.map((c) => c.id));
  for (const id of Object.keys(SLUGS)) {
    assert.ok(ids.has(id), `slug 表含孤儿课程 ${id}`);
  }
});

test("sitemap.xml lists root + 2/course + glossary + 2/term, all resolving to files", () => {
  const courses = loadCourses();
  const sm = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  // 根 + 2×课程 + 2×术语表 pillar(en/zh)+ 2×术语页 + 2×工具页(calc en/zh)
  assert.equal(locs.length, 1 + courses.length * 2 + 2 + TERMS.length * 2 + 2, "sitemap URL 数不符 — 跑 gen-seo-pages");
  for (const loc of locs) {
    assert.ok(loc.startsWith(SITE), "sitemap 出现异站 URL: " + loc);
    const rel = loc.slice(SITE.length).replace(/^\//, "");
    if (!rel) continue; // 根
    const fp = rel.endsWith("/") ? rel + "index.html" : rel; // 目录 URL 映射到 index.html
    assert.ok(fs.existsSync(path.join(root, fp)), `sitemap 指向不存在的文件: ${fp}`);
  }
});

test("term pages: frozen slug, en/zh on disk, paired hreflang, self canonical, FAQPage", () => {
  const seen = new Set();
  for (const t of TERMS) {
    assert.ok(t.slug && !seen.has(t.slug), `术语 slug 缺失或重复: ${t.slug}`);
    seen.add(t.slug);
    for (const [rel] of [["terms/" + t.slug + ".html"], ["terms/zh/" + t.slug + ".html"]]) {
      assert.ok(fs.existsSync(path.join(root, rel)), `缺 ${rel} — 跑 node tools/gen-seo-pages.js`);
      const page = fs.readFileSync(path.join(root, rel), "utf8");
      assert.match(page, /hreflang="en"/, rel + " 缺 hreflang en");
      assert.match(page, /hreflang="zh"/, rel + " 缺 hreflang zh");
      assert.match(page, /"@type":"FAQPage"/, rel + " 缺 FAQPage JSON-LD");
      const canon = (page.match(/rel="canonical" href="([^"]+)"/) || [])[1];
      assert.equal(canon, SITE + "/" + rel, rel + " canonical 应自指");
    }
  }
  assert.ok(fs.existsSync(path.join(root, "terms", "index.html")), "缺术语表 pillar terms/index.html");
  assert.ok(fs.existsSync(path.join(root, "terms", "zh", "index.html")), "缺术语表 pillar terms/zh/index.html");
});

test("equity calculator tool pages: en/zh on disk, self canonical, paired hreflang, loads engine", () => {
  for (const rel of ["calc/equity-calculator.html", "calc/zh/equity-calculator.html"]) {
    assert.ok(fs.existsSync(path.join(root, rel)), `缺 ${rel}`);
    const page = fs.readFileSync(path.join(root, rel), "utf8");
    assert.match(page, /hreflang="en"/, rel + " 缺 hreflang en");
    assert.match(page, /hreflang="zh"/, rel + " 缺 hreflang zh");
    assert.match(page, /src="[^"]*js\/equity\.js"/, rel + " 未加载 equity.js 引擎");
    const canon = (page.match(/rel="canonical" href="([^"]+)"/) || [])[1];
    assert.equal(canon, SITE + "/" + rel, rel + " canonical 应自指");
  }
});

test("index.html SEO block links every course page and matches the course count", () => {
  const courses = loadCourses();
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const block = (html.match(/<!--SEO-->([\s\S]*?)<!--\/SEO-->/) || [])[1];
  assert.ok(block, "index.html 缺 <!--SEO--> 静态块 — 跑 node tools/gen-seo-block.js");
  const links = [...block.matchAll(/href="(courses\/[^"]+)"/g)].map((m) => m[1]);
  assert.equal(
    links.filter((l) => l.startsWith("courses/zh/")).length,
    courses.length,
    "SEO 块中文课程链接数 ≠ 课程数 — 跑 gen-seo-block"
  );
  for (const l of links) {
    assert.ok(fs.existsSync(path.join(root, l)), `SEO 块指向不存在的文件: ${l}`);
  }
});

test("course pages carry paired hreflang and self canonical", () => {
  // 抽查首尾两课,防生成模板回归
  const courses = loadCourses();
  for (const c of [courses[0], courses[courses.length - 1]]) {
    const slug = SLUGS[c.id];
    for (const [rel, lang] of [["courses/" + slug + ".html", "en"], ["courses/zh/" + slug + ".html", "zh"]]) {
      const page = fs.readFileSync(path.join(root, rel), "utf8");
      assert.match(page, /hreflang="en"/, rel + " 缺 hreflang en");
      assert.match(page, /hreflang="zh"/, rel + " 缺 hreflang zh");
      const canon = (page.match(/rel="canonical" href="([^"]+)"/) || [])[1];
      const expect = SITE + "/" + rel.replace(/\\/g, "/");
      assert.equal(canon, expect, rel + " canonical 应自指");
    }
  }
});

/* title/desc 有效宽度锁:SEO 阈值按显示宽度算(CJK×2),生成器若按 .length 截断,
   中文页必然溢出(实测曾 32 页 title 超长 / 16 页 desc 超长)。
   ⚠ 量之前先解码 HTML 实体:&amp; 在 SERP 里是 1 个字符,按 5 个算会假超标。 */
test("生成的 title/desc 落在 SEO 区间(CJK 按 2 计)", () => {
  const CJK = /[⺀-鿿　-ヿ가-힯＀-￯]/;
  const effLen = (s) => [...String(s)].reduce((a, c) => a + (CJK.test(c) ? 2 : 1), 0);
  const decode = (s) => String(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");

  const bad = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) { walk(p); continue; }
      if (!f.name.endsWith(".html")) continue;
      const html = fs.readFileSync(p, "utf8");
      if (/<meta name="robots"[^>]*noindex/i.test(html)) continue;
      const t = effLen(decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ""));
      const d = effLen(decode((html.match(/name="description" content="([^"]*)"/) || [])[1] || ""));
      if (t > 60 || t < 30 || d > 155 || d < 70) {
        bad.push(path.relative(root, p).replace(/\\/g, "/") + " (title=" + t + " desc=" + d + ")");
      }
    }
  };
  walk(path.join(root, "courses"));
  walk(path.join(root, "terms"));
  assert.equal(bad.length, 0, "超出 SEO 区间的页:\n  " + bad.slice(0, 10).join("\n  "));
});

/* 内链一律用目录形式:写 index.html 会让同一页多出一个 URL(/terms/index.html),
   分走内链权重、并让 hreflang 互指判定失败(实测 6 个 error 全出在这)。 */
test("生成物内链不含 index.html(会造成重复 URL)", () => {
  const offenders = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) { walk(p); continue; }
      if (!f.name.endsWith(".html")) continue;
      const html = fs.readFileSync(p, "utf8");
      if (/href="[^"]*index\.html"/.test(html)) offenders.push(path.relative(root, p).replace(/\\/g, "/"));
    }
  };
  walk(path.join(root, "courses"));
  walk(path.join(root, "terms"));
  assert.equal(offenders.length, 0, "内链写了 index.html 的页(应改成 ./):\n  " + offenders.slice(0, 8).join("\n  "));
});
