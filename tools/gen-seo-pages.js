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
const TERMS = require('./seo-terms.js');

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

/* ——— title/desc 长度:SEO 阈值按**显示宽度**算,CJK 一个字顶两个 ———
   title 30–60、desc 70–155(有效宽度)。按 .length 截中文必然溢出:
   30 个中文 = effLen 60,看着才 30 个字符。 */
const effLen = (s) => [...String(s)].reduce((a, c) => a + (/[⺀-鿿　-ヿ가-힯＀-￯]/.test(c) ? 2 : 1), 0);
/* 按有效宽度截断,尽量断在词/句边界,超了才加省略号 */
function clampEff(s, max) {
  s = String(s).trim();
  if (effLen(s) <= max) return s;
  let out = '', w = 0;
  for (const ch of s) {
    const cw = /[⺀-鿿　-ヿ가-힯＀-￯]/.test(ch) ? 2 : 1;
    if (w + cw > max - 1) break; // 留 1 位给省略号
    out += ch; w += cw;
  }
  // 英文尽量断在词边界(中文没有空格,原样截)
  const sp = out.lastIndexOf(' ');
  if (sp > max * 0.6) out = out.slice(0, sp);
  return out.replace(/[\s,;:—-]+$/, '') + '…';
}
/* 组标题:优先「名 — 中缀 | 品牌」;超 60 就先丢中缀,再截名字。
   ⚠ 同时保下限:短名字必须留着品牌后缀,否则会掉到 <30 变 too-short(截上限时最容易忘的一半)。 */
function buildTitle(name, mid, brand, max = 60) {
  const full = `${name} — ${mid} | ${brand}`;
  if (effLen(full) <= max) return full;
  const noMid = `${name} | ${brand}`;
  if (effLen(noMid) <= max) return noMid;
  const room = max - effLen(` | ${brand}`);
  return `${clampEff(name, room)} | ${brand}`;
}

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
    // 中缀与品牌分开:title 超 60 时 buildTitle 会先丢中缀,再截名字(而不是粗暴截尾)。
    // 原来的 'Texas Hold’em Postflop Lesson | Postflop Coach' 光后缀就 46 字符,且 "Postflop" 一个标题里出现 3 次。
    titleMid: 'Postflop Poker Lesson',
    termMid: 'Postflop Poker Term',
    descTail: (n) => `Free heads-up postflop poker lesson with ${n} verified practice drills and computed feedback. No signup.`,
    sample: 'Sample drill from this lesson', board: 'Board', hand: 'Your hand', bestAction: 'Best action',
    why: 'Why', cta: (n) => `Practice all ${n} questions free →`,
    prev: '← Previous lesson', next: 'Next lesson →', home: 'All 30 lessons', faqH: 'FAQ',
    glossary: 'Poker Glossary', example: 'Worked example', learnMore: (t) => `Full lesson: ${t} →`,
    backGlossary: '← All postflop terms',
    glossaryTitle: 'Postflop Poker Glossary', ctaTerm: 'Train these spots free →',
    glossaryIntro: 'Plain-English definitions of the postflop poker concepts this trainer drills — pot odds, MDF, c-bets, ranges and more — each with the formula, a worked example, and a link to the full lesson.',
    method: 'Every answer in the 699-question bank is independently verified (adversarial blind-solve) before publication.',
    sister: 'Also train preflop: Preflop Camp (GTO preflop trainer by the same maker)',
    breadcrumbHome: 'Postflop Coach',
  },
  zh: {
    locale: 'zh-CN', dir: 'zh/', brand: '翻后训练营', brandLong: '翻后训练营 — 免费单挑德州扑克翻牌后训练器',
    lesson: (o) => `第 ${o} 课`, questions: (n) => `${n} 道练习题`,
    titleMid: '德州扑克翻牌后教学',
    termMid: '翻后扑克术语',
    descTail: (n) => `免费单挑德州扑克翻后课程,附 ${n} 道验证过的实战练习题与计算式讲解,无需注册。`,
    sample: '本课样题', board: '公共牌', hand: '你的手牌', bestAction: '最佳行动',
    why: '为什么', cta: (n) => `免费练全部 ${n} 题 →`,
    prev: '← 上一课', next: '下一课 →', home: '全部 30 课', faqH: '常见问题',
    glossary: '扑克术语表', example: '算例', learnMore: (t) => `完整课程:${t} →`,
    backGlossary: '← 全部翻后术语',
    glossaryTitle: '翻后扑克术语表', ctaTerm: '免费练这些局面 →',
    glossaryIntro: '用大白话讲清这个训练器所练的翻后扑克概念——底池赔率、MDF、持续下注、范围优势等——每个都带公式、算例和通往完整课程的链接。',
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
.lead{font-size:1.12rem;color:#f1f5ee;margin:.2em 0 1em}
.termlist a{font-weight:700}.termlist p{margin:.2em 0 1.1em;color:#8fa79a;font-size:.95rem}
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
<title>${esc(buildTitle(title, l.titleMid, l.brand))}</title>
<meta name="description" content="${esc(clampEff(`${sub}${lang === 'zh' ? '。' : ' — '}${l.descTail(nQ)}`, 152))}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${urlEn}">
<link rel="alternate" hreflang="zh" href="${urlZh}">
<link rel="alternate" hreflang="x-default" href="${urlEn}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)} — ${l.brand}">
<meta property="og:description" content="${esc(clampEff(sub, 152))}">
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

// —— 术语长尾页(pillar-spoke)——
function termHead(lang, l, name, desc, url, urlEn, urlZh, jsonld) {
  return `<!DOCTYPE html>
<html lang="${l.locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(buildTitle(name, l.termMid, l.brand))}</title>
<meta name="description" content="${esc(clampEff(desc, 152))}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${urlEn}">
<link rel="alternate" hreflang="zh" href="${urlZh}">
<link rel="alternate" hreflang="x-default" href="${urlEn}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(name)} — ${l.brand}">
<meta property="og:description" content="${esc(clampEff(desc, 152))}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og-image.png">
<script type="application/ld+json">${jsonld}</script>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">`;
}

function termPageHtml(lang, term, prevT, nextT) {
  const l = L[lang];
  const slug = term.slug;
  const urlEn = `${SITE}/terms/${slug}.html`;
  const urlZh = `${SITE}/terms/zh/${slug}.html`;
  const url = lang === 'zh' ? urlZh : urlEn;
  const glossaryUrl = `${SITE}/terms/${lang === 'zh' ? 'zh/' : ''}`;
  const name = term.term[lang];
  const short = term.short[lang];
  const rc = COURSES.find((c) => c.id === term.course);
  const rcSlug = SLUGS[term.course];
  const rcTitle = rc ? T(lang, rc.titleKey) : '';
  const courseHref = (lang === 'zh' ? '../../courses/zh/' : '../courses/') + rcSlug + '.html';
  const home = lang === 'zh' ? '../../' : '../';
  const faq = term.faq || [];
  const faqHtml = faq.length ? `<h2>${l.faqH}</h2>` + faq.map((f) => `<details class="faq"><summary>${esc(f.q[lang])}</summary><p>${esc(f.a[lang])}</p></details>`).join('') : '';
  const jsonld = JSON.stringify([
    { '@context': 'https://schema.org', '@type': 'DefinedTerm', name, description: short, inLanguage: l.locale,
      inDefinedTermSet: { '@type': 'DefinedTermSet', name: l.glossaryTitle, url: glossaryUrl } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: l.breadcrumbHome, item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: l.glossaryTitle, item: glossaryUrl },
      { '@type': 'ListItem', position: 3, name, item: url },
    ] },
    ...(faq.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q[lang], acceptedAnswer: { '@type': 'Answer', text: f.a[lang] } })) }] : []),
  ]);
  /* ⚠ 内链一律用**目录形式** `./`,绝不用 `index.html`:
     canonical 与 sitemap 用的都是 `/terms/`,若内链写 `index.html`,爬虫就会把
     `/terms/index.html` 当成**另一个 URL**(实测:入度 12、不在 sitemap、hreflang 互指判定失败,
     6 个 error 全出在这)。同一页两个 URL = 内链权重被分走 + Google 困惑。 */
  const relNav = `<div class="navrow">` +
    (prevT ? `<a href="${prevT.slug}.html">← ${esc(prevT.term[lang])}</a>` : '<span></span>') +
    (nextT ? `<a href="${nextT.slug}.html">${esc(nextT.term[lang])} →</a>` : '<span></span>') + `</div>`;
  return termHead(lang, l, name, short, url, urlEn, urlZh, jsonld) + `
<p class="eyebrow"><a href="${home}">${l.brandLong}</a><span class="langsw"><a href="${lang === 'zh' ? urlEn : urlZh}">${lang === 'zh' ? 'EN' : '中文'}</a></span></p>
<p class="eyebrow"><a href="./">${l.glossary}</a></p>
<h1>${esc(name)}</h1>
<p class="lead">${esc(short)}</p>
<p>${term.body[lang]}</p>
<h2>${l.example}</h2><div class="panel">${term.example[lang]}</div>
${faqHtml}
<p style="margin-top:18px"><a href="${courseHref}">${esc(l.learnMore(rcTitle))}</a></p>
<a class="cta" href="${home}">${l.ctaTerm}</a>
${relNav}
<p class="eyebrow" style="margin-top:18px"><a href="./">${l.backGlossary}</a></p>
<div class="foot"><p>${l.method}</p></div>
</div>
</body>
</html>
`;
}

function glossaryIndexHtml(lang) {
  const l = L[lang];
  const urlEn = `${SITE}/terms/`;
  const urlZh = `${SITE}/terms/zh/`;
  const url = lang === 'zh' ? urlZh : urlEn;
  const home = lang === 'zh' ? '../../' : '../';
  const jsonld = JSON.stringify([
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: l.glossaryTitle, description: l.glossaryIntro, url, inLanguage: l.locale },
    { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: TERMS.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.term[lang], url: `${url}${t.slug}.html` })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: l.breadcrumbHome, item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: l.glossaryTitle, item: url },
    ] },
  ]);
  const items = TERMS.map((t) => `<div class="termlist"><a href="${t.slug}.html">${esc(t.term[lang])}</a><p>${esc(t.short[lang])}</p></div>`).join('\n');
  return termHead(lang, l, l.glossaryTitle, l.glossaryIntro, url, urlEn, urlZh, jsonld) + `
<p class="eyebrow"><a href="${home}">${l.brandLong}</a><span class="langsw"><a href="${lang === 'zh' ? urlEn : urlZh}">${lang === 'zh' ? 'EN' : '中文'}</a></span></p>
<h1>${l.glossaryTitle}</h1>
<p class="lead">${l.glossaryIntro}</p>
${items}
<a class="cta" href="${home}">${l.ctaTerm}</a>
<p class="eyebrow" style="margin-top:18px"><a href="${home}">${l.home}</a></p>
<div class="foot"><p>${l.method}</p></div>
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

// 术语长尾页 + 术语表 pillar
const outTerms = path.join(root, 'terms');
const outTermsZh = path.join(root, 'terms', 'zh');
fs.mkdirSync(outTermsZh, { recursive: true });
fs.writeFileSync(path.join(outTerms, 'index.html'), glossaryIndexHtml('en'));
fs.writeFileSync(path.join(outTermsZh, 'index.html'), glossaryIndexHtml('zh'));
urls.push({ loc: SITE + '/terms/', priority: '0.7' });
urls.push({ loc: SITE + '/terms/zh/', priority: '0.7' });
TERMS.forEach((t, i) => {
  const prevT = TERMS[i - 1] || null;
  const nextT = TERMS[i + 1] || null;
  fs.writeFileSync(path.join(outTerms, t.slug + '.html'), termPageHtml('en', t, prevT, nextT));
  fs.writeFileSync(path.join(outTermsZh, t.slug + '.html'), termPageHtml('zh', t, prevT, nextT));
  urls.push({ loc: `${SITE}/terms/${t.slug}.html`, priority: '0.7' });
  urls.push({ loc: `${SITE}/terms/zh/${t.slug}.html`, priority: '0.7' });
});

// 独立免费工具页(手写静态页,非从数据生成,仅登记进 sitemap)
urls.push({ loc: `${SITE}/calc/equity-calculator.html`, priority: '0.7' });
urls.push({ loc: `${SITE}/calc/zh/equity-calculator.html`, priority: '0.7' });

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join('\n') +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);

fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`done — ${courses.length}×2 course pages, ${TERMS.length}×2 term pages + glossary, sitemap (${urls.length} urls), robots.txt`);
