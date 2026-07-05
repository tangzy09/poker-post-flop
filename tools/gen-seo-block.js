'use strict';
/*
 * gen-seo-block.js — 生成静态 SEO 内容块注入 index.html 的 #screens。
 * 目的:不执行 JS 的爬虫(尤其百度)从「白页」变成「满页主题关键词 + 60 个课程页内链」;
 * app.js 的 render() 首帧原地覆写,真实用户零感知。
 * 用 <!--SEO--> 标记包裹,可重复运行(题库/文案更新后:node tools/gen-seo-block.js)。
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const SLUGS = require('./seo-slugs.js');
const TERMS = require('./seo-terms.js');

const root = path.join(__dirname, '..');
const files = ['js/i18n.js', 'data/solved-spots.js', 'js/courses.js', 'js/content.js', 'js/content-ext.js', 'js/table.js', 'js/engine.js'];
let code = '';
for (const f of files) code += fs.readFileSync(path.join(root, f), 'utf8') + '\n';
code += 'globalThis.__o={STR,COURSES,getQuestions};';
const ctx = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, document: { documentElement: {} }, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(code, ctx);
const { STR, COURSES, getQuestions } = ctx.__o;
const en = (k) => STR.en[k] || k;
const zh = (k) => STR.zh[k] || STR.en[k] || k;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const courses = COURSES.filter((c) => !c.placement);
const totalQ = courses.reduce((n, c) => n + getQuestions(c.id).length, 0);

const lis = courses
  .map((c) => {
    const slug = SLUGS[c.id];
    return `      <li><a href="courses/zh/${slug}.html">${esc(zh(c.titleKey))}</a> — ${esc(zh(c.subKey))} · <a href="courses/${slug}.html" hreflang="en">${esc(en(c.titleKey))}</a></li>`;
  })
  .join('\n');

const block = `<!--SEO-->
    <div id="seo-content" style="max-width:680px;margin:0 auto;padding:24px 18px;line-height:1.7">
      <h1 style="font-size:1.4rem">免费单挑德州扑克翻牌后 GTO 训练 — Free Heads-Up Postflop Poker Trainer</h1>
      <p>翻后训练营(Postflop Coach)是一个免费的在线德州扑克翻牌后决策训练器:30 课循序渐进,${totalQ} 道经独立盲解验证的实战题,覆盖底池赔率、MDF、范围与坚果优势、牌面结构、c-bet、极化与抓诈、转牌开火、河牌价值与诈唬、check-raise、SPR、下注尺寸、阻断牌、面对加注、3-bet 底池、控池、浮动、超池、领打、薄价值、听牌半诈唬、河牌防守、多人底池、剥削性调整、锦标赛 ICM 与多街规划。每道题答对答错都有计算式讲解(outs、胜率、底池赔率、MDF),支持间隔重复复习与每日训练,无需注册、中英双语。</p>
      <p>Postflop Coach is a free online trainer for Texas Hold'em post-flop decisions: 30 progressive lessons and ${totalQ} verified practice spots covering pot odds, MDF, range advantage, board texture, c-betting, polarization, turn barrels, river value/bluffs, check-raises, SPR, bet sizing, blockers, facing raises, 3-bet pots, pot control, floats, overbets, donk bets, thin value, semi-bluffs, river defense, multiway pots, exploits, and tournament ICM. Every answer comes with computed feedback. Free, bilingual, no signup.</p>
      <h2 style="font-size:1.1rem">30 课目录 · All lessons</h2>
      <ul>
${lis}
      </ul>
      <h2 style="font-size:1.1rem"><a href="terms/">扑克术语表 · Postflop poker glossary</a></h2>
      <ul>
${TERMS.map((t) => `      <li><a href="terms/zh/${t.slug}.html">${esc(t.term.zh)}</a> · <a href="terms/${t.slug}.html" hreflang="en">${esc(t.term.en)}</a></li>`).join('\n')}
      </ul>
      <p><a href="https://pre-flop.ai-speeds.com/">翻前训练营 Preflop Camp — 同一作者的免费 GTO 翻前训练器</a></p>
      <noscript><p>本应用需要启用 JavaScript 才能练习;以上课程页为纯静态,可直接阅读。This app requires JavaScript; the lesson pages above are static and readable without it.</p></noscript>
    </div>
    <!--/SEO-->`;

const indexPath = path.join(root, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
if (/<!--SEO-->[\s\S]*<!--\/SEO-->/.test(html)) {
  html = html.replace(/<!--SEO-->[\s\S]*<!--\/SEO-->/, block);
} else {
  const m = html.match(/(<main id="screens">)(\s*<\/main>)/);
  if (!m) throw new Error('找不到空的 #screens 容器');
  html = html.replace(m[0], `${m[1]}\n${block}\n  </main>`);
}
fs.writeFileSync(indexPath, html);
console.log(`done — SEO block injected (${courses.length} lessons, ${totalQ} questions)`);
