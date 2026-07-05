'use strict';
/*
 * gen-seo-pages.js — 从题库生成 SEO 课程页(30 课 × en/zh 双套) + sitemap.xml + robots.txt。
 * 每页:关键词 title/description + canonical + hreflang 互指 + 3 节 Learn 原理正文
 *      + 本课样题(真题+正确答案+计算式讲解,独家内容) + prev/next 互链 + CTA 回主 app
 *      + Course/BreadcrumbList JSON-LD(不放编造评分 — 诚实红线适用于 SEO)。
 * 题库/文案更新后重跑:node tools/gen-seo-pages.js
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const SLUGS = require('./seo-slugs.js');
const FAQ = require('./seo-faq.js');

const root = path.join(__dirname, '..');
const SITE = 'https://post-flop-coach.ai-speeds.com';
const files = ['js/i18n.js', 'data/solved-spots.js', 'js/courses.js', 'js/content.js', 'js/content-ext.js', 'js/table.js', 'js/explain.js', 'js/engine.js'];
let code = '';
for (const f of files) code += fs.readFileSync(path.join(root, f), 'utf8') + '\n';
code += 'globalThis.__o={STR,COURSES,getLearn,getQuestions,explainFeedback,setLang};';
const ctx = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, document: { documentElement: {} }, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { STR, COURSES, getLearn, getQuestions, explainFeedback, setLang } = ctx.__o;

const T = (lang, k) => (STR[lang] && STR[lang][k]) || STR.en[k] || k;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SUIT = { s: ['♠', '#1c2822'], h: ['♥', '#c0392b'], d: ['♦', '#c0392b'], c: ['♣', '#1c2822'] };
function cardsHtml(cards) {
  return (cards || []).map((c) => {
    const r = c[0].toUpperCase() === 'T' ? '10' : c[0].toUpperCase();
    const [sym, color] = SUIT[c[1].toLowerCase()];
    return `<span class="card" style="color:${color}">${r}${sym}</span>`;
  }).join(' ');
}

const L = {
  en: {
    locale: 'en', dir: '', brand: 'Postflop Coach', brandLong: 'Postflop Coach — free heads-up postflop poker trainer',
    lesson: (o) => `Lesson ${o}`, questions: (n) => `${n} practice questions`,
    titleTail: 'Texas Hold’em Postflop Lesson | Postflop Coach',
    descTail: (n) => `Free heads-up postflop poker lesson with ${n} verified practice drills and computed feedback. No signup.`,
    sample: 'Sample drill from this lesson', board: 'Board', hand: 'Your hand', bestAction: 'Best action',
    why: 'Why', cta: (n) => `Practice all ${n} questions free →`,
    prev: '← Previous lesson', next: 'Next lesson →', home: 'All 30 lessons', faqH: 'FAQ',
    method: 'Every answer in the 699-question bank is independently verified (adversarial blind-solve) before publication.',
    sister: 'Also train preflop: Preflop Camp (GTO preflop trainer by the same maker)',
    breadcrumbHome: 'Postflop Coach',
  },
  zh: {
    locale: 'zh-CN', dir: 'zh/', brand: '翻后训练营', brandLong: '翻后训练营 — 免费单挑德州扑克翻牌后训练器',
    lesson: (o) => `第 ${o} 课`, questions: (n) => `${n} 道练习题`,
    titleTail: '德州扑克翻牌后教学 | 翻后训练营',
    descTail: (n) => `免费单挑德州扑克翻后课程,附 ${n} 道验证过的实战练习题与计算式讲解,无需注册。`,
    sample: '本课样题', board: '公共牌', hand: '你的手牌', bestAction: '最佳行动',
    why: '为什么', cta: (n) => `免费练全部 ${n} 题 →`,
    prev: '← 上一课', next: '下一课 →', home: '全部 30 课', faqH: '常见问题',
    method: '题库 699 题全部经独立盲解验证(隐藏答案由独立求解流程复核)后才发布。',
    sister: '翻前也要练?同一作者的「翻前训练营」(GTO 翻前训练器)',
    breadcrumbHome: '翻后训练营',
  },
};

const CSS = `
*{box-sizing:border-box}body{margin:0;font-family:"Space Grotesk","Noto Sans SC",system-ui,sans-serif;background:radial-gradient(120% 80% at 50% -10%,#14463a 0%,#0c2a22 45%,#0a201a 100%);color:#f1f5ee;line-height:1.65}
.wrap{max-width:720px;margin:0 auto;padding:28px 20px 60px}
a{color:#e8c66a}h1{font-size:1.5rem;line-height:1.35;margin:.2em 0 .4em}h2{font-size:1.12rem;margin:1.6em 0 .5em;color:#e8c66a}
.eyebrow{color:#8fa79a;font-size:.85rem;margin:0}
.panel{background:#161d18;border:1px solid #28332a;border-radius:14px;padding:16px 18px;margin:14px 0}
.card{display:inline-block;background:#f7f7f2;border-radius:5px;padding:2px 7px;font-weight:700;margin-right:2px}
.act{display:inline-block;background:linear-gradient(180deg,#3fc183,#2a8d5c);color:#fff;font-weight:800;padding:3px 14px;border-radius:999px}
.cta{display:block;text-align:center;background:linear-gradient(180deg,#e8c66a,#b8902f);color:#16110a;font-weight:800;padding:14px;border-radius:12px;text-decoration:none;margin:22px 0}
.navrow{display:flex;justify-content:space-between;gap:10px;font-size:.9rem;margin-top:26px}
.foot{color:#8fa79a;font-size:.8rem;border-top:1px solid #28332a;margin-top:30px;padding-top:14px}
details.faq{background:#161d18;border:1px solid #28332a;border-radius:10px;padding:10px 14px;margin:8px 0}
details.faq summary{cursor:pointer;font-weight:700;color:#f1f5ee}
details.faq p{margin:.6em 0 .2em;color:#cdd8cf}
.langsw{float:right;font-size:.85rem}`;

function pageHtml(lang, course, order, prevC, nextC) {
  const l = L[lang];
  setLang(lang === 'zh' ? 'zh' : 'en');
  const cid = course.id;
  const slug = SLUGS[cid];
  const title = T(lang, course.titleKey);
  const sub = T(lang, course.subKey);
  const slides = getLearn(cid);
  const qs = getQuestions(cid);
  const nQ = qs.length;
  const urlEn = `${SITE}/courses/${slug}.html`;
  const urlZh = `${SITE}/courses/zh/${slug}.html`;
  const url = lang === 'zh' ? urlZh : urlEn;
  const altUrl = lang === 'zh' ? urlEn : urlZh;

  // 样题:第一道 action 题(有牌面)+ explain 正确讲解
  const sq = qs.find((q) => q.type === 'action' && q.spot && q.spot.board);
  let sampleHtml = '';
  if (sq) {
    const why = explainFeedback(sq, sq.correct[0], true);
    sampleHtml =
      `<h2>${l.sample}</h2><div class="panel">` +
      `<p>${esc(T(lang, sq.stemKey))}</p>` +
      `<p>${l.board}: ${cardsHtml(sq.spot.board)}<br>${l.hand}: ${cardsHtml(sq.spot.hero && sq.spot.hero.hand)}</p>` +
      `<p>${l.bestAction}: ` + sq.correct.map((a) => `<span class="act">${esc(T(lang, 'action.' + a))}</span>`).join(' ') + `</p>` +
      (why ? `<p><b>${l.why}:</b> ${esc(why)}</p>` : '') +
      `</div>`;
  }

  const slidesHtml = slides
    .map((s) => `<h2>${esc(T(lang, s.titleKey))}</h2><p>${T(lang, s.bodyKey)}</p>`) // 正文是自家可信 HTML(含 <b>/<br>),不转义
    .join('\n');

  // 每课 FAQ:可见 <details> + FAQPage JSON-LD(问答必须页面可见,只写 JSON-LD 违规)
  const faq = FAQ[cid] || [];
  const faqHtml = faq.length
    ? `<h2>${l.faqH}</h2>` + faq.map((f) => `<details class="faq"><summary>${esc(f.q[lang])}</summary><p>${esc(f.a[lang])}</p></details>`).join('')
    : '';

  const nav =
    `<div class="navrow">` +
    (prevC ? `<a href="${SLUGS[prevC.id]}.html">${l.prev} ${esc(T(lang, prevC.titleKey))}</a>` : '<span></span>') +
    (nextC ? `<a href="${SLUGS[nextC.id]}.html">${l.next} ${esc(T(lang, nextC.titleKey))}</a>` : '<span></span>') +
    `</div>`;

  const jsonld = JSON.stringify([
    {
      '@context': 'https://schema.org', '@type': 'Course',
      name: title, description: `${sub} — ${l.descTail(nQ)}`,
      provider: { '@type': 'Organization', name: l.brand, url: SITE + '/' },
      isAccessibleForFree: true, inLanguage: l.locale,
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT30M' },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: l.breadcrumbHome, item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: title, item: url },
      ],
    },
    ...(faq.length ? [{
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q[lang], acceptedAnswer: { '@type': 'Answer', text: f.a[lang] } })),
    }] : []),
  ]);

  return `<!DOCTYPE html>
<html lang="${l.locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} — ${l.titleTail}</title>
<meta name="description" content="${esc(sub)}${lang==='zh'?'。':' — '}${l.descTail(nQ)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${urlEn}">
<link rel="alternate" hreflang="zh" href="${urlZh}">
<link rel="alternate" hreflang="x-default" href="${urlEn}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)} — ${l.brand}">
<meta property="og:description" content="${esc(sub)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og-image.png">
<script type="application/ld+json">${jsonld}</script>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
<p class="eyebrow"><a href="${lang === 'zh' ? '../../' : '../'}">${l.brandLong}</a><span class="langsw"><a href="${lang === 'zh' ? urlEn : urlZh}">${lang === 'zh' ? 'EN' : '中文'}</a></span></p>
<h1>${esc(title)}</h1>
<p class="eyebrow">${l.lesson(order)} · ${esc(sub)} · ${l.questions(nQ)}</p>
${slidesHtml}
${sampleHtml}
${faqHtml}
<a class="cta" href="${lang === 'zh' ? '../../' : '../'}">${l.cta(nQ)}</a>
${nav}
<p class="eyebrow" style="margin-top:18px"><a href="${lang === 'zh' ? '../../' : '../'}">${l.home}</a></p>
<div class="foot">
<p>${l.method}</p>
<p><a href="https://pre-flop.ai-speeds.com/" rel="noopener">${l.sister}</a></p>
</div>
</div>
</body>
</html>
`;
}

// —— 生成 ——
const courses = COURSES.filter((c) => !c.placement);
const outEn = path.join(root, 'courses');
const outZh = path.join(root, 'courses', 'zh');
fs.mkdirSync(outZh, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const urls = [{ loc: SITE + '/', priority: '1.0' }];
courses.forEach((c, i) => {
  const prevC = courses[i - 1] || null;
  const nextC = courses[i + 1] || null;
  const slug = SLUGS[c.id];
  if (!slug) throw new Error('missing slug for ' + c.id);
  fs.writeFileSync(path.join(outEn, slug + '.html'), pageHtml('en', c, c.order, prevC, nextC));
  fs.writeFileSync(path.join(outZh, slug + '.html'), pageHtml('zh', c, c.order, prevC, nextC));
  urls.push({ loc: `${SITE}/courses/${slug}.html`, priority: '0.8' });
  urls.push({ loc: `${SITE}/courses/zh/${slug}.html`, priority: '0.8' });
});

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join('\n') +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);

fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`done — ${courses.length}×2 course pages, sitemap (${urls.length} urls), robots.txt`);
