/* explain.js — computed, bilingual feedback for both correct and wrong answers.
   Reuses a self-contained hand evaluator to inject real numbers (outs / equity /
   pot odds / MDF). Returns a string in the current language, or null to let
   engine.feedbackFor fall back to the hand-written reasonKey text.
   Loads after i18n.js; uses globals curLang()/t(). */
(function () {
  var RANK = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
  function lang() { return (typeof curLang === "function" ? curLang() : "zh"); }
  function L(zh, en) { return lang() === "en" ? en : zh; }

  function rset(cards) { var s = new Set(cards.map(function (c) { return RANK[c[0]]; })); if (s.has(14)) s.add(1); return s; }
  function hasStr(set) { for (var lo = 1; lo <= 10; lo++) { var ok = true; for (var r = lo; r < lo + 5; r++) if (!set.has(r)) { ok = false; break; } if (ok) return true; } return false; }
  function straightOutRanks(all) {
    var b = rset(all); if (hasStr(b)) return null; var out = [];
    for (var r = 2; r <= 14; r++) { if (b.has(r)) continue; var s = new Set(b); s.add(r); if (r === 14) s.add(1); if (hasStr(s)) out.push(r); }
    return out;
  }
  function evalSpot(board, hand) {
    var all = board.concat(hand), rc = {}, sc = {}, i;
    for (i = 0; i < all.length; i++) { rc[all[i][0]] = (rc[all[i][0]] || 0) + 1; sc[all[i][1]] = (sc[all[i][1]] || 0) + 1; }
    var trips = Object.keys(rc).filter(function (r) { return rc[r] === 3; });
    var quads = Object.keys(rc).filter(function (r) { return rc[r] === 4; });
    var pairs = Object.keys(rc).filter(function (r) { return rc[r] === 2; });
    var flush = Object.keys(sc).find(function (s) { return sc[s] >= 5; });
    var str = hasStr(rset(all)), cat = "high";
    if (quads.length) cat = "quads";
    else if (trips.length && (pairs.length || trips.length > 1)) cat = "full house";
    else if (flush) cat = "flush"; else if (str) cat = "straight"; else if (trips.length) cat = "trips";
    else if (pairs.length >= 2) cat = "two pair"; else if (pairs.length === 1) cat = "pair";
    var fd = null, nut = false;
    if (!flush) Object.keys(sc).forEach(function (s) {
      if (sc[s] === 4 && board.filter(function (c) { return c[1] === s; }).length >= 2) {
        fd = s; nut = hand.some(function (c) { return c[0] === "A" && c[1] === s; });
      }
    });
    var isSet = hand.length === 2 && hand[0][0] === hand[1][0] && trips.indexOf(hand[0][0]) >= 0;
    return { cat: isSet ? "set" : cat, fd: fd, nut: nut, sRanks: straightOutRanks(all), rc: rc };
  }

  var TOCOME = { flop: 2, turn: 1, river: 0 };
  function drawTags(ev) {
    var o = 0, tags = [];
    if (ev.fd) { o += 9; tags.push((ev.nut ? L("坚果", "nut ") : "") + L("同花听", "flush draw") + "(9)"); }
    if (ev.sRanks && ev.sRanks.length) {
      var so = 0;
      ev.sRanks.forEach(function (r) {
        var rk = Object.keys(RANK).find(function (k) { return RANK[k] === r; }) || String(r);
        var cards = 4 - (ev.rc[rk] || 0); if (ev.fd) cards -= 1;
        so += Math.max(cards, 0);
      });
      tags.push((so >= 7 ? L("两头顺听", "open-ender") : L("卡顺", "gutshot")) + "(" + so + ")");
      o += so;
    }
    return { outs: o, tags: tags };
  }
  function eq(outs, toCome) { return toCome >= 2 ? Math.min(outs * 4, 90) : outs * 2; }
  function potOdds(pot, bet) { return { need: Math.round((bet / (pot + 2 * bet)) * 100), ratio: +((pot + bet) / bet).toFixed(1) }; }
  function mdf(pot, bet) { return Math.round((1 - bet / (pot + bet)) * 100); }

  var ACT = { fold: ["弃牌", "fold"], call: ["跟注", "call"], raise: ["加注", "raise"], bet: ["下注", "bet"], check: ["过牌", "check"], jam: ["全下", "jam"] };
  function actName(a) { return ACT[a] ? L(ACT[a][0], ACT[a][1]) : a; }
  function rec(q) { return q.correct.map(actName).join("/"); }
  var CAT = {
    set: ["三条(set)", "a set"], "two pair": ["两对", "two pair"], trips: ["三条", "trips"],
    straight: ["顺子", "a straight"], flush: ["同花", "a flush"], "full house": ["葫芦", "a full house"],
    quads: ["四条", "quads"], pair: ["一对", "one pair"], high: ["高牌", "high card"],
  };
  function catName(c) { return CAT[c] ? L(CAT[c][0], CAT[c][1]) : c; }
  var STRONG = { set: 1, trips: 1, "two pair": 1, straight: 1, flush: 1, "full house": 1, quads: 1 };

  function tag(ok) { return ok ? "✓ " : "✗ "; }

  // ---- CHOICE (concept / math) ----
  function explainChoice(q, choice, ok) {
    var stem = t(q.stemKey);
    var m = stem.match(/[Pp]ot (?:is )?(\d+)[^\d]*?bets?\s*(\d+)/) || stem.match(/底池\s*(\d+)[^\d]*?下注\s*(\d+)/);
    var corrLbl = t(q.options.find(function (o) { return o.id === q.correct[0]; }).labelKey);
    if (m) {
      var pot = +m[1], bet = +m[2], od = potOdds(pot, bet), d = mdf(pot, bet);
      var calc = L(
        "下注后底池 " + pot + "+" + bet + "=" + (pot + bet) + "，跟 " + bet + " → " + (pot + bet) + ":" + bet + " = " + od.ratio + ":1（需胜率 " + od.need + "%）；防守方 MDF = 1−" + bet + "/" + (pot + bet) + " = " + d + "%。",
        "After the bet the pot is " + pot + "+" + bet + "=" + (pot + bet) + "; calling " + bet + " → " + (pot + bet) + ":" + bet + " = " + od.ratio + ":1 (needs " + od.need + "% equity); defender MDF = 1−" + bet + "/" + (pot + bet) + " = " + d + "%."
      );
      if (ok) return tag(true) + calc + L("「" + corrLbl + "」正确。", " “" + corrLbl + "” is right.");
      var picked = t(q.options.find(function (o) { return o.id === choice; }).labelKey);
      return tag(false) + L("你选了「" + picked + "」。", "You picked “" + picked + "”. ") + calc + L("按此应选「" + corrLbl + "」。", " The answer is “" + corrLbl + "”.");
    }
    // non-math concept MCQ: affirm on correct (fills the gap); defer to reasonKey on wrong
    if (ok) return tag(true) + L("「" + corrLbl + "」正确。", "“" + corrLbl + "” is correct.");
    return null;
  }

  // ---- ACTION (post-flop board+hand) ----
  function explainAction(q, choice, ok) {
    var s = q.spot; if (!s) return null;
    var b = (s.board || []).filter(Boolean), hero = s.hero || {}, h = (hero.hand || []).filter(Boolean);
    if (h.length < 2 || b.length < 3) return null; // range / malformed → fallback
    var ev = evalSpot(b, h), toCome = TOCOME[s.street || "flop"];
    var foldRight = q.correct.indexOf("fold") >= 0;
    var valueRight = q.correct.indexOf("bet") >= 0 || q.correct.indexOf("raise") >= 0;
    var hasDraw = (ev.fd || (ev.sRanks && ev.sRanks.length)) && !STRONG[ev.cat];

    // 1) draw spot facing a bet — compare ONE-card equity (rule of 2) to the price.
    //    Borderline draws are decided by implied / reverse-implied odds, not raw odds,
    //    so never assert a false "eq > need" / "eq < need" inequality.
    if (toCome > 0 && hasDraw) {
      var d = drawTags(ev);
      var oneCard = Math.min(d.outs * 2 + (d.outs >= 9 ? 1 : 0), 59); // ≈ one-card hit %
      var od = s.bet ? potOdds(s.pot, s.bet) : null;
      // 已成对子 + 听牌:如实说明摊牌价值,并标注 outs 仅计听牌(不编对子改进的具体数字)
      var pairNote = ev.cat === "pair"
        ? L("；另持一对有摊牌价值（outs 仅计听牌，实际更强）", "; you also hold a pair for showdown value (outs count the draw only — you are stronger than the raw number)")
        : "";
      var head = L(
        "你的牌是 " + d.tags.join(" + ") + "，约 " + d.outs + " 个 outs（一张牌≈" + oneCard + "% 命中）",
        "You hold " + d.tags.join(" + ") + " — about " + d.outs + " outs (≈" + oneCard + "% to hit on one card)"
      ) + pairNote;
      if (od) head += L("，面对 " + s.bet + " 注（底池 " + s.pot + "）需 " + od.need + "%（" + od.ratio + ":1）", ", and facing " + s.bet + " into " + s.pot + " you need " + od.need + "% (" + od.ratio + ":1)");
      head += L("。", ". ");
      var clears = od && oneCard >= od.need;
      var tailZh, tailEn;
      if (!od) {
        tailZh = ok ? "带强听牌主动下注（半诈唬）兼具弃牌率与命中价值 —— " + rec(q) + " 正确。" : "这是半诈唬下注/继续的好局面 —— 正确是 " + rec(q) + "。";
        tailEn = ok ? "Betting a strong draw (semi-bluff) combines fold equity with your outs — " + rec(q) + " is right." : "This is a semi-bluff spot — the answer is " + rec(q) + ".";
      } else if (foldRight && !clears) {
        tailZh = oneCard + "% < 所需 " + od.need + "%，价格不够，" + (ok ? "弃牌正确（" + rec(q) + "）。" : "跟注是 −EV —— 正确是 " + rec(q) + "。");
        tailEn = oneCard + "% < the " + od.need + "% needed, so " + (ok ? "folding is right (" + rec(q) + ")." : "calling is −EV — the answer is " + rec(q) + ".");
      } else if (foldRight) {
        tailZh = "原始赔率虽够，但这类弱/被压制的同花听命中常输大池（反向隐含赔率）或无位置面对大注 —— " + (ok ? "弃牌正确（" + rec(q) + "）。" : "正确是 " + rec(q) + "。");
        tailEn = "The raw odds are there, but a weak/dominated draw loses a big pot when it hits (reverse implied) or is OOP vs a big bet — " + (ok ? "folding is right (" + rec(q) + ")." : "the answer is " + rec(q) + ".");
      } else if (clears) {
        tailZh = oneCard + "% ≥ 所需 " + od.need + "%，" + (ok ? "继续是明确 +EV（" + rec(q) + "）。" : "弃牌丢掉 +EV 的继续 —— 正确是 " + rec(q) + "。");
        tailEn = oneCard + "% ≥ the " + od.need + "% needed, so " + (ok ? "continuing is clearly +EV (" + rec(q) + ")." : "folding spills a +EV continue — the answer is " + rec(q) + ".");
      } else {
        tailZh = "单张 " + oneCard + "% 虽不足 " + od.need + "%，但靠隐含赔率与半诈唬弃牌率 —— " + (ok ? "继续（" + rec(q) + "）。" : "正确是 " + rec(q) + "。");
        tailEn = "The one-card " + oneCard + "% is short of " + od.need + "%, but implied odds plus semi-bluff fold equity favor continuing — " + (ok ? rec(q) + " is right." : "the answer is " + rec(q) + ".");
      }
      return tag(ok) + head + L(tailZh, tailEn);
    }

    // 2) river bluff-catch — MDF
    if ((s.street === "river" || s.street === "turn") && s.bet && q.correct.indexOf("call") >= 0 && (ev.cat === "pair" || ev.cat === "two pair")) {
      var D = mdf(s.pot, s.bet), need = potOdds(s.pot, s.bet).need;
      var bcZh = "你持" + catName(ev.cat) + "作抓诈牌；对方下注极化，MDF = 1−" + s.bet + "/" + (s.pot + s.bet) + " = " + D + "%，只需约 " + need + "% 胜率即可跟。";
      var bcEn = "You hold " + catName(ev.cat) + " as a bluff-catcher; vs a polarized bet, MDF = 1−" + s.bet + "/" + (s.pot + s.bet) + " = " + D + "%, and you only need ~" + need + "% to call.";
      if (ok && choice === "call") return tag(true) + L(bcZh + " 跟注正确。", bcEn + " Calling is right.");
      if (choice === "fold") return tag(false) + L(bcZh + " 弃牌让对手诈唬自动盈利 —— 应跟。", bcEn + " Folding lets every bluff auto-profit — call.");
      if (choice === "raise") return tag(false) + L(bcZh + " 加注把抓诈牌变诈唬，只赶走更差 —— 应跟。", bcEn + " Raising turns a bluff-catcher into a bluff that only folds out worse — call.");
    }

    // 3) strong made hand
    if (STRONG[ev.cat]) {
      var c = catName(ev.cat);
      if (valueRight) {
        if (ok) return tag(true) + L("你成" + c + "，" + rec(q) + "取价值并保护，向更差的牌与听牌收费。", "You have " + c + " — " + rec(q) + " for value and protection, charging worse hands and draws.");
        return tag(false) + L("你成" + c + "，被动打法损失价值与保护 —— 正确是 " + rec(q) + "。", "You have " + c + "; the passive line forfeits value/protection — the answer is " + rec(q) + ".");
      }
      if (ok) return tag(true) + L("你成" + c + "，" + rec(q) + " 是这手牌在该牌面的最佳线。", "You have " + c + " — " + rec(q) + " is the best line on this texture.");
      return null; // unusual; defer to reasonKey
    }

    // 4) weak made / air facing a bet, fold is right — pot-odds insufficient
    if (foldRight && s.bet && (ev.cat === "pair" || ev.cat === "high")) {
      var od2 = potOdds(s.pot, s.bet), cw = catName(ev.cat);
      var z = "你只有" + cw + "，面对 " + s.bet + " 注需约 " + od2.need + "% 胜率，而你基本只赢诈唬、命中也常被压制";
      var en = "You only have " + cw + "; vs " + s.bet + " you need ~" + od2.need + "%, but you mostly beat only bluffs and stay dominated when you improve";
      if (ok) return tag(true) + L(z + " → 弃牌正确（" + rec(q) + "）。", en + " → folding is right (" + rec(q) + ").");
      return tag(false) + L(z + "，跟注长期赔付 —— 正确是 " + rec(q) + "。", en + ", so calling bleeds chips — the answer is " + rec(q) + ".");
    }

    // 5) correct but not specifically computed → light affirm; wrong → defer
    if (ok) return tag(true) + L(rec(q) + " 是该局面的最佳选择。", rec(q) + " is the best choice here.");
    return null;
  }

  function explainFeedback(q, choice, ok) {
    try {
      if (!q) return null;
      if (q.type === "choice") return explainChoice(q, choice, ok);
      if (q.type === "action") return explainAction(q, choice, ok);
    } catch (e) { /* never break feedback */ }
    return null;
  }

  if (typeof window !== "undefined") window.explainFeedback = explainFeedback;
  if (typeof module !== "undefined" && module.exports) module.exports = { explainFeedback: explainFeedback };
})();
