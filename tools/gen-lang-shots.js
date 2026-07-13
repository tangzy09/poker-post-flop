'use strict';
/*
 * gen-lang-shots.js — 逐语言逐屏截图,给 UI i18n 做 HARD GATE(溢出/压字/露键/占位符残留)。
 *
 *   node tools/gen-lang-shots.js de            → _langshots/de-*.png
 *   node tools/gen-lang-shots.js de ja es      → 多语言一起
 *
 * ⚠ 「首页每种语言都正常」≠ 没问题:**溢出往往藏在二级界面**(选项按钮 / 计算式反馈 / 付费墙),
 *   那里文案最长。德语比英文长 30–40%。所以每屏都截,**每张都必须人肉 Read 看**——
 *   「脚本说生成了 N 张」不算验收,文件存在 ≠ 图对。
 *
 * 两处必不可少的注入(否则出残图,preflop 已血泪验证):
 *   ① PRESEED —— <head> 预置 localStorage(seenIntro=1 压掉首启引导 + 语言键直接以该语言启动)
 *   ② pinApp(W) —— Chromium headless 有 ~480 CSS px **最小窗口宽度**:窄窗时布局视口被钳在 480,
 *      而截图画布按 window-size×scale 裁 → 右侧连同语言下拉一起被切掉。窄于 480 时把 #app
 *      强制成目标宽度并左对齐。
 * 产物 _langshots/ 不入库。
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const CANDIDATES = [
  process.env.CHROME_BIN,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].filter(Boolean);
const BROWSER = CANDIDATES.find((p) => { try { return fs.existsSync(p); } catch (e) { return false; } });
if (!BROWSER) { console.log('SKIP gen-lang-shots: 未找到 Chrome/Edge。'); process.exit(0); }

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '_langshots');
const APP = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const W = 430, H = 932, SCALE = 2;

const pinApp = (w) => (w < 480
  ? `<style>#app{left:0!important;right:auto!important;margin:0!important;width:${w}px!important;max-width:${w}px!important}</style>`
  : '');
/* 进度键 pokerPostFlop_v1(seenIntro 压掉首启引导) / 语言键 pokerPostFlopLang。
   __PRESEED__ 是注入成功的哨兵,gen 时会断言它在(见下)。
   ⚠ locale 是**异步**懒加载的(动态 <script>),headless 可能在它加载完之前就截图 →
   拍到英文。所以这里**把 locale 文件内容同步内联**进 <head>,setLang 时 LOCALES[code] 已就位,
   ensureLocale 走同步分支,零时序风险。 */
const preseed = (code) => {
  const localeFile = path.join(ROOT, 'js', 'locales', code + '.js');
  const inline = fs.existsSync(localeFile) ? fs.readFileSync(localeFile, 'utf8') : '';
  return (
    `<script>/*__PRESEED__*/try{localStorage.setItem("pokerPostFlop_v1",JSON.stringify({seenIntro:true,onboardingSeen:true}));` +
    `localStorage.setItem("pokerPostFlopLang",${JSON.stringify(code)});}catch(e){}</script>` +
    // i18n.js 尚未加载 → 先把注册函数存起来,等 I18N_REGISTER 真身出现后再喂给它
    (inline
      ? `<script>window.__PENDING_LOCALE=[];window.I18N_REGISTER=function(c,d){window.__PENDING_LOCALE.push([c,d]);};</script>` +
        `<script>${inline}</script>`
      : '')
  );
};
/* i18n.js 加载后,把上面暂存的译文灌进真正的 LOCALES(在 </body> 前执行) */
const FLUSH_LOCALE =
  'if(window.__PENDING_LOCALE&&typeof I18N_REGISTER==="function"){' +
  ' window.__PENDING_LOCALE.forEach(function(p){I18N_REGISTER(p[0],p[1]);});}';

// 场景:每个都要能触发到「文案最长」的地方
const SCENES = [
  { key: 'courses', js: '' },                                    // 课程列表 + Pro 卡 + 语言下拉
  // 做题屏:**选项按钮**是最容易被长文案撑爆的地方
  { key: 'drill', js: "Engine.startCourse('c2','drill');render();" },
  // 反馈屏:计算式反馈(fb.* 模板)在这里渲染 —— 本次 i18n 改造的核心
  { key: 'feedback', js: "Engine.startCourse('c2','drill');render();setTimeout(function(){try{var q=Engine.currentQuestions()[Engine.qIdx];submitChoice((q.options&&q.options[0].id)||'fold');}catch(e){}},200);" },
  // action 题的反馈(听牌/MDF 模板走这条)
  { key: 'feedback2', js: "Engine.startCourse('c5','drill');render();setTimeout(function(){try{submitChoice('fold');}catch(e){}},200);" },
  { key: 'learn', js: "Engine.startCourse('c2','learn');render();" },   // Learn 原理页(长教学文本)
  // 付费墙:必须模拟**原生**环境。web 分支只显示「去 app 下载」,看不到 pitch 的 4 条卖点
  // (那是靠 \n 分条渲染的,最容易在翻译里被拼成一行)。
  {
    key: 'paywall',
    js: "window.Capacitor={isNativePlatform:function(){return true;},getPlatform:function(){return 'ios';},Plugins:{}};" +
        "try{showPaywall();}catch(e){}",
  },
  { key: 'stats', js: "Engine.screen='stats';render();" },              // 统计/漏洞(长标签)
];

function shoot(html, outPath) {
  const tmp = path.join(ROOT, '_langshot_tmp.html');
  fs.writeFileSync(tmp, html);
  try { fs.rmSync(outPath, { force: true }); } catch (e) {}
  const args = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=' + SCALE,
    '--screenshot=' + outPath, '--window-size=' + W + ',' + H, '--virtual-time-budget=8000',
    'file:///' + tmp.replace(/\\/g, '/')];
  try { execFileSync(BROWSER, args, { stdio: 'ignore' }); } catch (e) { /* headless 偶发非零退出但图已写 */ }
  finally { try { fs.rmSync(tmp, { force: true }); } catch (e) {} }
  return fs.existsSync(outPath);
}

const codes = process.argv.slice(2);
if (!codes.length) { console.error('用法: node tools/gen-lang-shots.js <lang…>  例: node tools/gen-lang-shots.js de ja es'); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

let ok = 0, fail = 0;
for (const code of codes) {
  for (const s of SCENES) {
    // ⚠ preseed 必须注入到**所有脚本之前**(engine.js 一加载就读 localStorage)。
    //   别按 charset 字符串去 replace —— 大小写/自闭合稍有出入就静默不注入,
    //   结果是「图生成了但语言没切、引导浮层还在」。直接锚 <head> 开标签最稳。
    let html = APP.replace('<head>', '<head>' + preseed(code));
    if (!html.includes('__PRESEED__')) throw new Error('preseed 未注入 —— <head> 没匹配上');
    html = html
      .replace('</head>', pinApp(W) + '</head>')
      // 顺序很重要:先把暂存的译文灌进 LOCALES,再 setLang(此时 ensureLocale 走同步分支、立即生效),
      // 最后才跑场景脚本。中间留一拍让 render 完成。
      .replace(
        '</body>',
        `<script>setTimeout(function(){try{${FLUSH_LOCALE}setLang(${JSON.stringify(code)});}catch(e){}` +
          `setTimeout(function(){try{${s.js}}catch(e){}},250);},300);</script></body>`
      );
    const out = path.join(OUT, `${code}-${s.key}.png`);
    const good = shoot(html, out);
    console.log((good ? '  ✓ ' : '  ✗ ') + `${code}-${s.key}` + (good ? ` ${Math.round(fs.statSync(out).size / 1024)}KB` : ''));
    good ? ok++ : fail++;
  }
}
console.log(`\ngen-lang-shots: ${ok} 张${fail ? ` / ${fail} 失败` : ''} → _langshots/`);
console.log('⚠ 现在**逐张 Read 看**:溢出 / 压字 / 露 key / {占位符} 残留 / 语言不对。文件存在 ≠ 图对。');
