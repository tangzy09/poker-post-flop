/* coach.js — profile, leak analysis, training plan (local aggregation, vs reference lines) */
const Coach = {
  MIN_PROFILE_Q: 20,

  LEAK_META: {
    too_tight: { color: "#34b074", descKey: "leakDesc.too_tight" },
    too_loose: { color: "#d23b46", descKey: "leakDesc.too_loose" },
    sizing: { color: "#e8c66a", descKey: "leakDesc.sizing" },
    range_blind: { color: "#7f9cff", descKey: "leakDesc.range_blind" },
    street_plan: { color: "#c8a0ff", descKey: "leakDesc.street_plan" },
    concept_gap: { color: "#9aa3b5", descKey: "leakDesc.concept_gap" },
    texture: { color: "#5ec4a8", descKey: "leakDesc.texture" },
    cbet: { color: "#ff9f68", descKey: "leakDesc.cbet" },
    indifference: { color: "#b8a0ff", descKey: "leakDesc.indifference" },
    mdf: { color: "#6eb5ff", descKey: "leakDesc.mdf" },
    other: { color: "#9aa3b5", descKey: "leakDesc.other" },
  },

  leakLabel(leak) {
    return t("leak." + leak) || leak;
  },

  leakMeta(leak) {
    return this.LEAK_META[leak] || this.LEAK_META.other;
  },

  questionById(qid) {
    for (const c of COURSES) {
      const q = getQuestions(c.id).find((x) => x.id === qid);
      if (q) return { question: q, courseId: c.id };
    }
    return null;
  },

  questionTitle(courseId, qid) {
    const course = courseById(courseId);
    const num = qid.replace(courseId + "-q", "");
    return course ? t(course.titleKey) + " · " + t("coach.qNum", { n: num }) : qid;
  },

  courseAccuracy(store, courseId) {
    const s = (store.statsByCourse || {})[courseId];
    if (!s || !s.h) return null;
    return s.c / s.h;
  },

  aggregateLeaks(store) {
    // 口径 = 累计答错次数(statsByLeak.h−c),与统计页热图一致。
    // 旧口径基于 reviewPile 现存记录:错题在 SRS 盒 4 毕业被删后,「最大漏洞」会随掌握
    // 而消失甚至归空,与旁边按累计算的热图同屏自相矛盾。摸底 pseudoStore 无 statsByLeak,
    // 保留 reviewPile 回退。
    const counts = {};
    let total = 0;
    const byLeak = store.statsByLeak;
    if (byLeak && Object.keys(byLeak).length) {
      for (const k of Object.keys(byLeak)) {
        const n = Math.max(0, (byLeak[k].h || 0) - (byLeak[k].c || 0));
        if (n > 0) {
          counts[k] = n;
          total += n;
        }
      }
    } else {
      (store.reviewPile || []).forEach((r) => {
        const k = r.leak || "other";
        const n = r.wrong || 1;
        counts[k] = (counts[k] || 0) + n;
        total += n;
      });
    }
    const order = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return { counts, total, order, topKey: order[0] || null };
  },

  topMissed(store, limit) {
    return [...(store.reviewPile || [])]
      .sort((a, b) => (b.wrong || 1) - (a.wrong || 1))
      .slice(0, limit || 5);
  },

  buildProfile(store) {
    const totalQ = store.stats?.totalQ || 0;
    if (totalQ < this.MIN_PROFILE_Q) {
      return { ready: false, need: this.MIN_PROFILE_Q, have: totalQ };
    }

    const acc = store.stats.totalQ ? Math.round((store.stats.correctQ / store.stats.totalQ) * 100) : 0;
    const leaks = this.aggregateLeaks(store);
    let tight = 0;
    let loose = 0;
    (store.reviewPile || []).forEach((r) => {
      const n = r.wrong || 1;
      if (r.leak === "too_tight") tight += n;
      else if (r.leak === "too_loose") loose += n;
    });

    let styleKey = "profBalanced";
    let styleColor = "var(--gold)";
    if (tight + loose >= 5) {
      if (tight >= loose * 1.6) {
        styleKey = "profTight";
        styleColor = "#34b074";
      } else if (loose >= tight * 1.6) {
        styleKey = "profLoose";
        styleColor = "#d23b46";
      }
    } else {
      styleKey = "profPending";
      styleColor = "var(--muted)";
    }

    const courseRows = COURSES.map((c) => {
      const a = this.courseAccuracy(store, c.id);
      return a != null ? { id: c.id, titleKey: c.titleKey, acc: Math.round(a * 100), h: store.statsByCourse[c.id].h } : null;
    }).filter(Boolean);

    courseRows.sort((a, b) => b.acc - a.acc);
    const best = courseRows[0] || null;
    const worst = courseRows.length > 1 ? courseRows[courseRows.length - 1] : null;

    const streets = ["flop", "turn", "river", "concept"];
    const streetRows = streets
      .map((st) => {
        const s = (store.statsByStreet || {})[st];
        if (!s || s.h < 5) return null;
        return { street: st, acc: Math.round((s.c / s.h) * 100), h: s.h };
      })
      .filter(Boolean);
    streetRows.sort((a, b) => a.acc - b.acc);
    const weakStreet = streetRows[0] || null;
    const strongStreet = streetRows.length > 1 ? streetRows[streetRows.length - 1] : null;

    return {
      ready: true,
      acc,
      totalQ,
      styleKey,
      styleColor,
      tightPct: tight + loose ? Math.round((tight / (tight + loose)) * 100) : null,
      loosePct: tight + loose ? Math.round((loose / (tight + loose)) * 100) : null,
      best,
      worst: worst && best && worst.id !== best.id ? worst : null,
      weakStreet,
      strongStreet: strongStreet && weakStreet && strongStreet.street !== weakStreet.street ? strongStreet : null,
      topLeak: leaks.topKey ? { key: leaks.topKey, count: leaks.counts[leaks.topKey] } : null,
    };
  },

  buildPlan(store) {
    if (!(store.reviewPile || []).length) return { ready: false, items: [] };

    const groups = {};
    (store.reviewPile || []).forEach((r) => {
      const key = r.courseId + "|" + (r.leak || "other");
      if (!groups[key]) {
        groups[key] = { courseId: r.courseId, leak: r.leak || "other", misses: 0, items: 0 };
      }
      groups[key].misses += r.wrong || 1;
      groups[key].items += 1;
    });

    const items = Object.values(groups).map((g) => {
      const acc = this.courseAccuracy(store, g.courseId);
      const score = g.misses + (acc != null ? (1 - acc) * 5 : 2);
      return {
        courseId: g.courseId,
        leak: g.leak,
        misses: g.misses,
        items: g.items,
        acc: acc != null ? Math.round(acc * 100) : null,
        score,
      };
    });

    items.sort((a, b) => b.score - a.score);
    return { ready: true, items: items.slice(0, 5) };
  },

  reviewByCourse(store) {
    const groups = {};
    (store.reviewPile || []).forEach((r) => {
      if (!groups[r.courseId]) groups[r.courseId] = [];
      groups[r.courseId].push(r);
    });
    return COURSES.filter((c) => groups[c.id])
      .map((c) => ({
        courseId: c.id,
        titleKey: c.titleKey,
        order: c.order,
        items: groups[c.id].sort((a, b) => (b.wrong || 1) - (a.wrong || 1)),
      }))
      .sort((a, b) => {
        const sum = (items) => items.reduce((s, r) => s + (r.wrong || 1), 0);
        return sum(b.items) - sum(a.items) || a.order - b.order;
      });
  },

  courseBarRows(store) {
    const by = store.statsByCourse || {};
    return COURSES.map((c) => {
      const s = by[c.id];
      if (!s || !s.h) return null;
      return {
        courseId: c.id,
        titleKey: c.titleKey,
        order: c.order,
        pct: Math.round((s.c / s.h) * 100),
        h: s.h,
      };
    })
      .filter(Boolean)
      .sort((a, b) => b.pct - a.pct || a.order - b.order);
  },
};
