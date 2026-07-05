'use strict';
/*
 * gen-ios-shots.js — 生成 App Store 截图(headless Chrome/Edge,无需 Playwright)。
 * 移植自 pokerPreFlop/tools/gen-ios-shots.js,按本站(index.html + 外链 js/)适配。
 *
 *   iPhone 6.9"/6.7" : viewport 430×932 @3x → 1290×2796(APP_IPHONE_67)
 *   iPad 13"/12.9"   : viewport 1024×1366 @2x → 2048×2732(APP_IPAD_PRO_3GEN_129)
 *                      Capacitor 默认 TARGETED_DEVICE_FAMILY=1,2 → iPad 截图必传
 *   付费墙审核图     : showPaywall() 真实渲染(浏览器无 RC → 回落 $29.99/$4.99 = 真实美区价)
 *
 *   运行: node tools/gen-ios-shots.js   输出: store-assets/ios/*.png
 *   en/zh 两套(zh 供 zh-Hans 商店页)。
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const CANDIDATES = [
  process.env.CHROME_BIN,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);
const BROWSER = CANDIDATES.find((p) => { try { return fs.existsSync(p); } catch (e) { return false; } });
if (!BROWSER) { console.log('SKIP gen-ios-shots: 未找到 Chrome/Edge。'); process.exit(0); }

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'store-assets', 'ios');
fs.mkdirSync(OUT, { recursive: true });
// 读 index.html,去掉 script src 的 ?v=<hash>(file:// 下带 query 会找不到文件),脚本才能加载
let APP = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/\?v=[0-9a-f]+/g, '');

// 关首启引导 + 摸底横幅:预置 store(seenIntro/onboardingSeen)+ 语言;再注入脚本删 .intro-ov 兜底
const preseed = (lang) =>
  '<script>try{localStorage.setItem("pokerPostFlop_v1",JSON.stringify({seenIntro:1,onboardingSeen:1}));' +
  'localStorage.setItem("pokerPostFlopLang","' + lang + '");}catch(e){}</script>';
const KILL = 'var _iv=document.querySelector(".intro-ov");if(_iv)_iv.remove();';
// Chromium headless ~480 CSS px 最小窗口宽:窄于 480 时布局视口被钳在 480、右侧被裁。
// 把内容根强制成目标宽度并左对齐(本站内容根是 #app;宽度 430=真机 iPhone 6.9 点宽)。
const pinApp = (W) => W < 480
  ? '<style>#app{left:0!important;right:auto!important;margin:0!important;width:' + W + 'px!important;max-width:' + W + 'px!important}</style>'
  : '';

// 各场景:load 后跳到目标屏。startCourse 已在全局(app.js),render() 重渲。
const SCENES = [
  { key: 'courses',  js: "Engine.screen='courses';render();" },
  { key: 'learn',    js: "Engine.startCourse('c3','learn');render();" },          // c3 首个 learn 含范围图
  { key: 'drill',    js: "Engine.startCourse('c5','drill');render();" },          // c5 = 真牌桌 action spot(board+hand+fold/call/raise)
  { key: 'feedback', js: "Engine.startCourse('c2','drill');render();setTimeout(function(){try{var q=Engine.currentQuestions()[Engine.qIdx];submitChoice((q.correct&&q.correct[0])||'call');}catch(e){}},260);" },  // c2 概念题反馈=有计算式(outs/赔率/MDF)
];

function shoot(html, outPath, W, H, scale) {
  const tmp = path.join(ROOT, '_genshot_' + path.basename(outPath, '.png') + '.html');
  fs.writeFileSync(tmp, html);
  try { fs.rmSync(outPath, { force: true }); } catch (e) {}
  const args = ['--headless=new', '--disable-gpu', '--hide-scrollbars'];
  if (scale > 1) args.push('--force-device-scale-factor=' + scale);
  args.push('--screenshot=' + outPath, '--window-size=' + W + ',' + H, '--virtual-time-budget=7000',
    'file:///' + tmp.replace(/\\/g, '/'));
  try { execFileSync(BROWSER, args, { stdio: 'ignore' }); }
  catch (e) { /* headless 偶发非零退出但图已写 */ }
  finally { try { fs.rmSync(tmp, { force: true }); } catch (e) {} }
  return fs.existsSync(outPath);
}

let ok = 0, fail = 0;
function gen(name, lang, js, W, H, scale) {
  const html = APP
    .replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />' + preseed(lang))
    .replace('</head>', pinApp(W) + '</head>')
    .replace('</body>', '<script>setTimeout(function(){try{' + KILL + js + '}catch(e){}},220);</script></body>');
  const out = path.join(OUT, name + '.png');
  const good = shoot(html, out, W, H, scale);
  console.log((good ? '  ✓ ' : '  ✗ ') + name + (good ? ' ' + Math.round(fs.statSync(out).size / 1024) + 'KB' : ''));
  good ? ok++ : fail++;
}

for (const s of SCENES) gen('iphone67-en-' + s.key, 'en', s.js, 430, 932, 3);
for (const s of SCENES) gen('iphone67-zh-' + s.key, 'zh', s.js, 430, 932, 3);
for (const s of SCENES) gen('ipad129-en-' + s.key, 'en', s.js, 1024, 1366, 2);
for (const s of SCENES) gen('ipad129-zh-' + s.key, 'zh', s.js, 1024, 1366, 2);
gen('iap-paywall-en', 'en', "showPaywall();", 430, 932, 3);
gen('iap-paywall-zh', 'zh', "showPaywall();", 430, 932, 3);

console.log('\ngen-ios-shots: ' + ok + ' 张' + (fail ? ' / ' + fail + ' 失败' : '') + ' → store-assets/ios/');
process.exit(fail ? 1 : 0);
