/* courses.js — 12-lesson curriculum metadata */
const COURSES = [
  { id: "c1", order: 1, free: true, titleKey: "c1.title", subKey: "c1.sub", concepts: ["pot_odds", "mdf"] },
  { id: "c2", order: 2, free: true, titleKey: "c2.title", subKey: "c2.sub", concepts: ["implied_odds", "reverse_implied"] },
  { id: "c3", order: 3, free: true, titleKey: "c3.title", subKey: "c3.sub", concepts: ["range_advantage", "nut_advantage"] },
  { id: "c4", order: 4, free: true, titleKey: "c4.title", subKey: "c4.sub", concepts: ["board_texture", "dry", "wet"] },
  { id: "c5", order: 5, free: true, titleKey: "c5.title", subKey: "c5.sub", concepts: ["cbet", "ip"] },
  { id: "c6", order: 6, free: true, titleKey: "c6.title", subKey: "c6.sub", concepts: ["cbet_defense", "oop"] },
  { id: "c7", order: 7, free: true, titleKey: "c7.title", subKey: "c7.sub", concepts: ["polarization", "bluffcatch", "mdf"] },
  { id: "c8", order: 8, free: true, titleKey: "c8.title", subKey: "c8.sub", concepts: ["indifference", "mixed"] },
  { id: "c9", order: 9, free: true, titleKey: "c9.title", subKey: "c9.sub", concepts: ["turn", "barrel"] },
  { id: "c10", order: 10, free: true, titleKey: "c10.title", subKey: "c10.sub", concepts: ["river", "value", "bluff"] },
  { id: "c11", order: 11, free: true, titleKey: "c11.title", subKey: "c11.sub", concepts: ["check_raise", "probe"] },
  { id: "c12", order: 12, free: true, titleKey: "c12.title", subKey: "c12.sub", concepts: ["spr", "commitment"] },
];

function courseById(id) {
  return COURSES.find((c) => c.id === id);
}

const PRO_KEY = "pokerPostFlopPro";
const PRO_KEY_LEGACY = "postflopPro";

function isProUnlocked() {
  try {
    const legacy = localStorage.getItem(PRO_KEY_LEGACY);
    if (legacy && !localStorage.getItem(PRO_KEY)) localStorage.setItem(PRO_KEY, legacy);
    return localStorage.getItem(PRO_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function canAccessCourse(course) {
  return course.free || isProUnlocked();
}
