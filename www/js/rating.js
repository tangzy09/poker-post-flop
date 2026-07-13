/* rating.js — 求好评:幸福度打分引擎 + 禁火区 + 写评论深链邀请。
   设计依据见全局 skill `app-ratings-feedback`。三条铁律:
   1) 绝不做「给我们打分」按钮去调 requestReview —— Google 明禁 CTA 触发(配额用完点了没反应);
      要按钮就用 openStoreForReview()(深链,不是 API,必有反应)。
   2) 绝不做前置问题(「喜欢吗?」「会给 5 星吗?」)或满意度分流 —— Google 明文禁止,Apple 大概率拒。
   3) 系统 3 次/年、且弹没弹不可知 ⇒ 请求次数不是 KPI,真值只看商店后台每周新增评分数与 90 天均分。
   状态存 Engine.store.review(随进度一起持久化);web 端一律不弹(见 PRODUCT.md)。 */

const RATE_CFG = {
  iosAppId: "6787552890",
  androidPackage: "com.pokerpostflop.trainer",
  threshold: 16, // 幸福度阈值
  minDaysInstalled: 3,
  minSessions: 3,
  cooldownDays: 90, // 自管冷却,比系统限额保守
  maxPerYear: 3, // 对齐苹果 3 次/365 天,别浪费配额
};

/* 事件分值 + 衰减天数(过了衰减期不再计分) */
const RATE_SCORES = {
  app_open: { pts: 1, decayDays: 1 },
  drill_done: { pts: 3, decayDays: 2 }, // 完成一轮训练
  grade_high: { pts: 6, decayDays: 7 }, // 课程拿 S/A
  daily_done: { pts: 3, decayDays: 2 }, // 完成每日训练
  streak_day: { pts: 1, decayDays: 7 }, // 连续训练天数
  personal_best: { pts: 5, decayDays: 7 }, // 刷新最高连击
  srs_graduate: { pts: 4, decayDays: 7 }, // 复习卡毕业出盒
  subscribed: { pts: 10, decayDays: 14 },
};

reg("rate.inviteTitle", "Mind writing one line?", "愿意写一句话吗?");
reg(
  "rate.inviteBody",
  "A short review helps other players find this trainer. Takes 20 seconds.",
  "一句短评能帮更多牌手找到这个训练器,20 秒的事。"
);
reg("rate.inviteCta", "Write a review", "去写评价");
reg("rate.inviteLater", "Not now", "以后再说");

var Rating = (function () {
  function st() {
    if (typeof Engine === "undefined" || !Engine.store) return null;
    if (!Engine.store.review) Engine.store.review = { installedAt: Date.now(), sessions: 0, events: [], asked: [], invitedWrite: false };
    return Engine.store.review;
  }

  function version() {
    return typeof Feedback !== "undefined" ? Feedback.diagnostics().version : "dev";
  }

  /** 每次启动调一次 */
  function boot() {
    const s = st();
    if (!s) return;
    s.sessions = (s.sessions || 0) + 1;
    s.events = (s.events || []).filter((e) => Date.now() - e.t < 30 * 864e5); // 老事件早已衰减,顺手裁掉
    Engine.save();
    track("app_open");
  }

  /** 在核心动作发生处调用 */
  function track(key) {
    const s = st();
    if (!s || !RATE_SCORES[key]) return;
    s.events = (s.events || []).concat({ k: key, t: Date.now() });
    Engine.save();
  }

  /** 幸福度 = Σ 未过衰减期的事件分 */
  function score() {
    const s = st();
    if (!s) return 0;
    const now = Date.now();
    return (s.events || []).reduce((sum, e) => {
      const cfg = RATE_SCORES[e.k];
      if (!cfg) return sum;
      return (now - e.t) / 864e5 <= cfg.decayDays ? sum + cfg.pts : sum;
    }, 0);
  }

  /* 禁火区分两层,别混(混了会互相打架):
     - envBlocked:环境/情绪类 —— 现在这个时刻不该打扰。评分弹窗和写评论邀请卡都要过这一关。
     - quotaBlocked:弹药配额类 —— 只管「原生评分弹窗」的节流。写评论邀请卡不能受它约束:
       邀请卡的前提恰恰是「刚吃过一次弹窗」,若也查冷却期,它就永远显示不出来。 */
  function envBlocked(ctx) {
    ctx = ctx || {};
    const now = Date.now();
    if (navigator.onLine === false) return "offline";
    if (window.__lastError && now - window.__lastError.at < 5 * 60e3) return "recent_error"; // 刚报错过
    if (window.__lastPaywallAt && now - window.__lastPaywallAt < 5 * 60e3) return "paywall"; // 刚撞付费墙
    if (document.getElementById("paywall") || document.getElementById("fbk-ov") || document.querySelector(".intro-ov")) return "modal_conflict";
    if (!Engine.store.seenIntro) return "onboarding";
    if (ctx.frustrated) return "frustrated"; // 本轮表现差 = 挫败中,别在这时候要好评
    return null;
  }

  function quotaBlocked() {
    const s = st();
    if (!s) return "no_store";
    const now = Date.now();
    if ((now - (s.installedAt || now)) / 864e5 < RATE_CFG.minDaysInstalled) return "too_new";
    if ((s.sessions || 0) < RATE_CFG.minSessions) return "too_few_sessions";

    const asked = s.asked || [];
    if (asked.some((a) => a.version === version())) return "asked_this_version";
    const last = asked[asked.length - 1];
    if (last && (now - last.t) / 864e5 < RATE_CFG.cooldownDays) return "cooldown";
    if (asked.filter((a) => (now - a.t) / 864e5 < 365).length >= RATE_CFG.maxPerYear) return "yearly_quota";
    return null;
  }

  /** 评分弹窗要同时过两关。返回原因字符串(可调试),可开火返回 null。 */
  function blockedReason(ctx) {
    if (!st()) return "no_store";
    return envBlocked(ctx) || quotaBlocked();
  }

  /** 在「爽点之后」调用。web 端永远返回 false(没有原生弹窗)。 */
  async function maybeAsk(ctx) {
    const s = st();
    if (!s) return false;
    if (typeof CAP === "undefined" || !CAP.native()) return false;
    const why = blockedReason(ctx);
    if (why) return false;
    if (score() < RATE_CFG.threshold) return false;

    const plugin = CAP.plugin("InAppReview");
    if (!plugin) return false;
    try {
      await plugin.requestReview(); // 弹没弹、打了几星,都不可知 —— 系统黑盒
    } catch (e) {
      return false;
    }
    s.asked = (s.asked || []).concat({ t: Date.now(), version: version() });
    Engine.save();
    return true;
  }

  /* ---------- 写评论邀请(深链,允许有按钮) ----------
     原生弹窗只给星级(13.5% 提交)、几乎不给文字评论(0.07%)。文字好评唯一合规通道 = 深链。
     只对「已吃过一次原生弹窗」的人、在成就时刻邀请一次;卡上不得问「你喜欢吗/给几星」。 */
  function eligibleForInvite() {
    const s = st();
    // 只查 envBlocked:配额那关是弹窗的,邀请卡的前提本就是「已经弹过一次」
    return !!(s && typeof CAP !== "undefined" && CAP.native() && (s.asked || []).length > 0 && !s.invitedWrite && !envBlocked({}));
  }

  function openStore() {
    const s = st();
    if (s) { s.invitedWrite = true; Engine.save(); }
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = ios
      ? "https://apps.apple.com/app/id" + RATE_CFG.iosAppId + "?action=write-review"
      : "market://details?id=" + RATE_CFG.androidPackage;
    window.open(url, "_system");
  }

  function dismissInvite() {
    const s = st();
    if (s) { s.invitedWrite = true; Engine.save(); }
  }

  /** 成就页内嵌的邀请卡 HTML(无则空串)。绝不是「打分按钮」—— 它跳商店写评价页,点了必有反应。 */
  function inviteHtml() {
    if (!eligibleForInvite()) return "";
    return (
      '<div class="rate-invite">' +
      "<h4>" + t("rate.inviteTitle") + "</h4>" +
      "<p>" + t("rate.inviteBody") + "</p>" +
      '<div class="ri-row">' +
      '<button class="ri-later" data-action="rate-later">' + t("rate.inviteLater") + "</button>" +
      '<button class="ri-go" data-action="rate-write">' + t("rate.inviteCta") + "</button>" +
      "</div></div>"
    );
  }

  return { boot, track, score, envBlocked, quotaBlocked, blockedReason, maybeAsk, eligibleForInvite, inviteHtml, openStore, dismissInvite, _cfg: RATE_CFG };
})();

if (typeof window !== "undefined") window.Rating = Rating;
