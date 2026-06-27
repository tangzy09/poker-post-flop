/* courses.js — 30-lesson curriculum metadata */
const COURSES = [
  { id: "c1", order: 1, free: true, drillCount: 8, titleKey: "c1.title", subKey: "c1.sub", concepts: ["pot_odds", "mdf"] },
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
  { id: "c13", order: 13, free: true, drillCount: 12, titleKey: "c13.title", subKey: "c13.sub", concepts: ["sizing", "mdf"] },
  { id: "c14", order: 14, free: true, drillCount: 12, titleKey: "c14.title", subKey: "c14.sub", concepts: ["blockers", "bluff"] },
  { id: "c15", order: 15, free: true, drillCount: 12, titleKey: "c15.title", subKey: "c15.sub", concepts: ["facing_raise"] },
  { id: "c16", order: 16, free: true, drillCount: 12, titleKey: "c16.title", subKey: "c16.sub", concepts: ["3bet_pot", "spr"] },
  { id: "c17", order: 17, free: true, drillCount: 12, titleKey: "c17.title", subKey: "c17.sub", concepts: ["pot_control"] },
  { id: "c18", order: 18, free: true, drillCount: 12, titleKey: "c18.title", subKey: "c18.sub", concepts: ["turn_defense"] },
  { id: "c19", order: 19, free: true, drillCount: 12, titleKey: "c19.title", subKey: "c19.sub", concepts: ["float", "delayed"] },
  { id: "c20", order: 20, free: true, drillCount: 12, titleKey: "c20.title", subKey: "c20.sub", concepts: ["overbet"] },
  { id: "c21", order: 21, free: true, drillCount: 12, titleKey: "c21.title", subKey: "c21.sub", concepts: ["donk"] },
  { id: "c22", order: 22, free: true, drillCount: 12, titleKey: "c22.title", subKey: "c22.sub", concepts: ["thin_value"] },
  { id: "c23", order: 23, free: true, drillCount: 12, titleKey: "c23.title", subKey: "c23.sub", concepts: ["semi_bluff", "draws"] },
  { id: "c24", order: 24, free: true, drillCount: 12, titleKey: "c24.title", subKey: "c24.sub", concepts: ["river_defense"] },
  { id: "c25", order: 25, free: true, drillCount: 12, titleKey: "c25.title", subKey: "c25.sub", concepts: ["multiway"] },
  { id: "c26", order: 26, free: true, drillCount: 12, titleKey: "c26.title", subKey: "c26.sub", concepts: ["exploit"] },
  { id: "c27", order: 27, free: true, drillCount: 12, titleKey: "c27.title", subKey: "c27.sub", concepts: ["tournament", "icm"] },
  { id: "c28", order: 28, free: true, drillCount: 12, titleKey: "c28.title", subKey: "c28.sub", concepts: ["line_plan"] },
  { id: "c29", order: 29, free: true, drillCount: 12, titleKey: "c29.title", subKey: "c29.sub", concepts: ["special_board"] },
  { id: "c30", order: 30, free: true, drillCount: 12, titleKey: "c30.title", subKey: "c30.sub", concepts: ["capstone"] },
];

function courseDrillCount(course) {
  return course.drillCount || 24;
}

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
