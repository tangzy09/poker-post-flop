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
  // 根 + 2×课程 + 2×术语表 pillar(en/zh)+ 2×术语页
  assert.equal(locs.length, 1 + courses.length * 2 + 2 + TERMS.length * 2, "sitemap URL 数不符 — 跑 gen-seo-pages");
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
