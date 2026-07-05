/* purchases.js — RevenueCat (Capacitor) 适配层。移植自 pokerPreFlop/js/purchases.js,保持同构。
   zero-build 友好:原生壳里 RevenueCat 插件把自己挂到 window.Capacitor.Plugins.Purchases,
   直接用全局 bridge 调用,不需要 import / 打包(经典脚本 + file:// 可跑)。
   - 原生 (Android/iOS):走真实 IAP,购买状态写进 Engine.store.proEntitled,isProUnlocked() 据此判断。
   - 浏览器:没有 bridge → 空跑(按 PRODUCT.md,web 测试期全解锁;正式上线后 web 收费触点只做
     App 下载引导,永不接支付)。

   捆绑策略(PRODUCT.md):与翻前训练营共用 RevenueCat project(projab0f2fdf)与 entitlement
   'pro'——本 app 的产品挂到同一 entitlement。上架前需在 RevenueCat dashboard 给本 app
   (com.pokerpostflop.trainer)建 app config、传 IAP/SA 凭据,取 appl_/goog_ 公开 key 填下面。
   ⚠ 产品 id 必须带 postflop_ 前缀(postflop_pro_monthly / postflop_pro_yearly)——Apple/Play
   产品 id 账号级唯一,裸 pro_* 已被 Mando/preflop 占用(见 skill appstore-connect-iap-api 坑⑦)。
   定价以 preflop/js/purchases.js 头注释为唯一事实源(2026-07:年 $29.99 / 月 $4.99)。 */
(function(){
 const USE_TEST_STORE = false;
 const RC_API_KEY = {
  test:    'test_REPLACE_ME',   // ← RevenueCat Test Store key(沙盒跑通购买;同 project 可复用 preflop 的)
  android: 'goog_REPLACE_ME',   // ← 本 app 在 RevenueCat 的 Google Play 公开 key(上架时填)
  ios:     'appl_REPLACE_ME',
 };
 const ENTITLEMENT = 'pro';     // 与 preflop 共用同一 entitlement = 捆绑解锁
 const MATCH = {
  sub:  { types:['MONTHLY','WEEKLY','TWO_MONTH','THREE_MONTH','SIX_MONTH'], ids:['postflop_pro_monthly','pro_monthly','monthly'] },
  year: { types:['ANNUAL'], ids:['postflop_pro_yearly','pro_yearly','pro_annual','annual','yearly'] },
 };

 const cap=CAP.cap, native=CAP.native;           // 共享桥接 helper(见 js/cap.js)
 function plugin(){ return CAP.plugin('Purchases'); }
 function apiKey(){ if(USE_TEST_STORE) return RC_API_KEY.test; const c=cap(); const p=c&&c.getPlatform&&c.getPlatform(); return p==='ios'?RC_API_KEY.ios:RC_API_KEY.android; }

 const Pay = {
  get native(){ return native(); },
  yearTrialDays: 0,

  /* 启动时调一次:配置 SDK + 拉当前购买状态刷新解锁缓存 */
  async init(){
   if(!native()) return;
   const P=plugin(); if(!P) return;
   try{ await P.configure({ apiKey: apiKey() }); await Pay.refresh(); await Pay._sniffTrial(); }
   catch(e){ console.warn('RC init', e); }
  },

  async refresh(){
   const P=plugin(); if(!P) return false;
   try{ const r=await P.getCustomerInfo(); return Pay._apply(r&&r.customerInfo); }
   catch(e){ console.warn('RC refresh', e); return false; }
  },

  /* 识别年订免费试用 + 商店真实标价(非美元区显示与扣款一致) */
  async _sniffTrial(){
   const P=plugin(); if(!P) return;
   try{
    const offs=await P.getOfferings();
    const pkgs=(offs && offs.current && offs.current.availablePackages) || [];
    const y=pkgs.find(p=>p.packageType==='ANNUAL' || /year|annual/i.test((p.product&&p.product.identifier)||p.identifier||''));
    const m=pkgs.find(p=>p.packageType==='MONTHLY' || /month/i.test((p.product&&p.product.identifier)||p.identifier||''));
    if(y&&y.product&&y.product.priceString) Pay.yearPrice=y.product.priceString;
    if(m&&m.product&&m.product.priceString) Pay.subPrice=m.product.priceString;
    const prod=y&&y.product;
    if(!prod) return;
    let days=0;
    const ip=prod.introPrice;
    if(ip && ip.price===0){ const n=ip.periodNumberOfUnits||0, u=(''+(ip.periodUnit||'')).toUpperCase();
     days = u==='DAY'?n : u==='WEEK'?n*7 : u==='MONTH'?n*30 : n; }
    const fp=prod.defaultOption && prod.defaultOption.freePhase;
    if(!days && fp){ const bp=fp.billingPeriod||{}; const n=bp.value||0, u=(''+(bp.unit||'')).toUpperCase();
     days = u==='DAY'?n : u==='WEEK'?n*7 : u==='MONTH'?n*30 : n; }
    Pay.yearTrialDays = days||0;
   }catch(e){ console.warn('RC trial sniff', e); }
  },

  _apply(info){
   const on = !!(info && info.entitlements && info.entitlements.active && info.entitlements.active[ENTITLEMENT]);
   try{ Engine.store.proEntitled = on; Engine.save(); }catch(e){}
   try{ if(typeof render==='function') render(); }catch(e){}
   return on;
  },

  /* 购买:kind = 'sub'(月) | 'year'(年)。浏览器不收费:直接 true(测试期 web 本就全解锁) */
  async buy(kind){
   if(!native()) return true;
   const P=plugin(); if(!P) return false;
   try{
    const offs=await P.getOfferings();
    const pkgs=(offs && offs.current && offs.current.availablePackages) || [];
    const m=MATCH[kind]||MATCH.sub;
    const lc=s=>(''+(s||'')).toLowerCase();
    const ids=m.ids.map(lc);
    const pkg=pkgs.find(p=>{
     const pt=p.packageType, pid=lc(p.product&&p.product.identifier), kid=lc(p.identifier);
     return (pt && m.types.indexOf(pt)>=0) || ids.indexOf(pid)>=0 || ids.indexOf(kid)>=0;
    });
    if(!pkg){ console.warn('RC: 当前 Offering 找不到匹配 package', kind, pkgs); return false; }
    const r=await P.purchasePackage({ aPackage: pkg });
    return Pay._apply(r&&r.customerInfo);
   }catch(e){
    if(e && (e.userCancelled || /cancel/i.test(''+(e.message||e.code)))) return 'cancel';
    console.warn('RC buy', e); return false;
   }
  },

  /* 恢复购买(商店审核要求;换设备/重装后凭账号恢复) */
  async restore(){
   if(!native()) return true;
   const P=plugin(); if(!P) return false;
   try{ const r=await P.restorePurchases(); return Pay._apply(r&&r.customerInfo); }
   catch(e){ console.warn('RC restore', e); return false; }
  },
 };

 if(typeof window!=='undefined') window.Pay = Pay;
})();
