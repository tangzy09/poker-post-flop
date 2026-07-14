'use strict';
/*
 * seo-len-check.js — 生成物的 title/desc 有效宽度体检(CJK×2),给 SEO 生成器上锁。
 *   node tools/seo-len-check.js      → 超标返回非 0
 *
 * 为什么需要:SEO 阈值(title 30–60 / desc 70–155)按**显示宽度**算,中文一个字顶两个。
 * 生成器若按 .length 截断,中文页必然溢出(实测 32 页 title 超长、16 页 desc 超长)。
 * ⚠ 量之前必须**解码 HTML 实体**:`&amp;` 在 SERP 里显示为 `&`(1 字符),按 5 个字符算会假超标。
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
/* ⚠ 首页与 calc 页是**手写的**(不由 gen-seo-pages 生成),第一次做长度体检时正是它们漏网:
   首页 title=74 / desc=241(全站最重要的页,却被 SERP 拦腰截断)。所以这里必须连它们一起量。 */
const DIRS = ['courses', 'terms', 'calc'];
const SINGLE = ['index.html'];
const CJK = /[⺀-鿿　-ヿ가-힯＀-￯]/;

const effLen = (s) => [...String(s)].reduce((a, c) => a + (CJK.test(c) ? 2 : 1), 0);
const decode = (s) =>
  String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");

const LIMITS = { titleMin: 30, titleMax: 60, descMin: 70, descMax: 155 };

let pages = 0;
const bad = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { walk(p); continue; }
    if (!f.name.endsWith('.html')) continue;
    const html = fs.readFileSync(p, 'utf8');
    if (/<meta name="robots"[^>]*noindex/i.test(html)) continue; // noindex 页不进索引,不体检
    pages++;
    const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
    const desc = decode((html.match(/name="description" content="([^"]*)"/) || [])[1] || '');
    const te = effLen(title), de = effLen(desc);
    const errs = [];
    if (te > LIMITS.titleMax) errs.push(`title ${te} > ${LIMITS.titleMax}`);
    if (te < LIMITS.titleMin) errs.push(`title ${te} < ${LIMITS.titleMin}`);
    if (de > LIMITS.descMax) errs.push(`desc ${de} > ${LIMITS.descMax}`);
    if (de < LIMITS.descMin) errs.push(`desc ${de} < ${LIMITS.descMin}`);
    if (errs.length) bad.push(`${path.relative(ROOT, p).replace(/\\/g, '/')}  —  ${errs.join(', ')}`);
  }
}
DIRS.forEach((d) => walk(path.join(ROOT, d)));
// 单独的手写页(首页):不在任何目录里,得点名
for (const f of SINGLE) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const html = fs.readFileSync(p, 'utf8');
  pages++;
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
  const desc = decode((html.match(/name="description" content="([^"]*)"/) || [])[1] || '');
  const te = effLen(title), de = effLen(desc);
  const errs = [];
  if (te > LIMITS.titleMax) errs.push(`title ${te} > ${LIMITS.titleMax}`);
  if (te < LIMITS.titleMin) errs.push(`title ${te} < ${LIMITS.titleMin}`);
  if (de > LIMITS.descMax) errs.push(`desc ${de} > ${LIMITS.descMax}`);
  if (de < LIMITS.descMin) errs.push(`desc ${de} < ${LIMITS.descMin}`);
  if (errs.length) bad.push(`${f}  —  ${errs.join(', ')}`);
}

console.log(`seo-len-check: ${pages} 页(HTML 实体已解码,CJK 按 2 计)`);
if (bad.length) {
  console.log(`✖ ${bad.length} 页超出 SEO 区间:`);
  bad.slice(0, 20).forEach((b) => console.log('   ' + b));
  if (bad.length > 20) console.log(`   … 还有 ${bad.length - 20} 页`);
  process.exit(1);
}
console.log('✔ 全部 title(30–60) / desc(70–155) 达标');
