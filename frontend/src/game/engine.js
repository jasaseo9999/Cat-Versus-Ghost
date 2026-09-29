import { CATS, GHOSTS, ROWS, COLS, EVO_DMG, EVO_HP, EVO_XP, EVO_NAMES, SNACK_COST, START_LIVES, BOSS_SKILLS, CAT_ORDER, UPG_DMG, UPG_HP, UPG_PROD } from "./data";

const DEFAULT_BOSS_SKILLS = ["storm", "possession", "darkmoon"];

const END_X = 9.35;
const SPAWN_X = 9.85;
let uid = 1;
const nid = () => uid++;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

function buildQueue(waves, startDelay) {
  const q = [];
  waves.forEach((wv, wi) => {
    const list = shuffle(Object.entries(wv.ghosts).flatMap(([type, n]) => Array(n).fill(type)));
    if (wv.boss) list.unshift("boss");
    list.forEach((type, i) => {
      const gap = wv.big ? rnd(1.1, 1.8) : rnd(3.5, 6);
      q.push({
        type, row: type === "boss" ? 2 : Math.floor(Math.random() * ROWS),
        wave: wi, waveStart: i === 0, night: !!wv.night, big: !!wv.big, boss: !!wv.boss,
        delay: i === 0 ? (wi === 0 ? startDelay : 12) : type === "boss" || list[i - 1] === "boss" ? 5 : gap,
      });
    });
  });
  return q;
}

export function createGame({ mode, level, cards, upgrades = {} }) {
  const endless = mode === "endless";
  const queue = endless ? [] : buildQueue(level.waves, level.num === 1 ? 24 : 20);
  const s = {
    mode, level, t: 0, status: "playing",
    moonlight: endless ? 250 : level.startMoon, lives: START_LIVES,
    cats: [], ghosts: [], projectiles: [], beams: [], orbs: [], fx: [],
    grid: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
    cardReady: {}, cards: cards?.length ? cards : endless ? CAT_ORDER : level.cards, upg: upgrades,
    bossHpMult: level?.bossHp || 1, bossSkills: level?.bossSkills || DEFAULT_BOSS_SKILLS,
    nextSky: 5, phase: endless ? "day" : (level.waves[0].night ? "night" : "day"),
    darkMoonUntil: 0, shakeUntil: 0, flashUntil: 0, banner: null,
    queue, qi: 0, nextSpawnAt: queue[0]?.delay ?? 0, totalWaves: endless ? 0 : level.waves.length,
    waveMarks: [], wave: -1, hpScale: 1, endlessWave: 0,
    score: 0, kills: 0, bossId: null, sfx: [],
  };
  if (!endless) {
    let idx = 0;
    level.waves.forEach((wv) => {
      s.waveMarks.push({ id: `wave-${s.waveMarks.length}`, at: idx / queue.length, big: !!wv.big, boss: !!wv.boss });
      idx += Object.values(wv.ghosts).reduce((a, b) => a + b, 0) + (wv.boss ? 1 : 0);
    });
  }
  return s;
}

const sfx = (s, name) => s.sfx.push(name);
const addFx = (s, kind, x, y, extra = {}) => s.fx.push({ id: nid(), kind, x, y, until: s.t + (extra.dur || 0.8), ...extra });
const banner = (s, text, kind = "info", dur = 2.2) => { s.banner = { id: nid(), text, kind, until: s.t + dur }; };

export const moodOf = (c, t) => {
  if (CATS[c.type].immune) return "normal";
  if (t < c.possessedUntil) return "possessed";
  if (t < c.angryUntil) return "angry";
  if (c.fullness >= 60) return "happy";
  if (c.fullness < 30) return "sleepy";
  return "normal";
};
const rateMult = (m) => (m === "angry" ? 0.6 : m === "sleepy" ? 1.7 : 1);

const aliveGhosts = (s) => s.ghosts.filter((g) => !g.dead).length;

function spawnGhost(s, type, row, x = SPAWN_X + rnd(0, 0.3)) {
  const G = GHOSTS[type];
  const dayMult = s.phase === "day" && type !== "boss" ? 0.8 : 1;
  const hp = Math.round(G.hp * dayMult * (type === "boss" ? (1 + (s.hpScale - 1) * 0.5) * s.bossHpMult : s.hpScale));
  const g = {
    id: nid(), type, row, rows: type === "boss" ? [1, 2, 3] : [row], x,
    hp, maxHp: hp, shield: G.shield ? Math.round(G.shield * s.hpScale) : 0, maxShield: G.shield ? Math.round(G.shield * s.hpScale) : 0,
    speed: G.speed * rnd(0.92, 1.08), biteAt: 0, slowUntil: 0, stunUntil: 0, hitUntil: 0, leapUntil: 0,
    dashed: false, enraged: false, revealed: false, eating: false, dead: false,
    nextAbility: s.t + (G.abilityEvery || 0), born: s.t, bob: Math.random() * 3,
  };
  if (type === "boss") {
    g.nextSkill = s.t + 9; g.skillIdx = 0; g.castUntil = 0;
    s.bossId = g.id;
  }
  s.ghosts.push(g);
  return g;
}

function planEndlessWave(s) {
  const n = ++s.endlessWave;
  if (n > 1) {
    s.score += 30 * (n - 1);
    addFx(s, "text", 4.5, 2, { text: `Bonus Gelombang +${30 * (n - 1)}`, dur: 1.6, cls: "gold" });
  }
  const boss = n % 8 === 0;
  const night = boss || Math.floor((n - 1) / 2) % 2 === 1;
  const big = n % 4 === 0;
  s.hpScale = 1 + 0.07 * (n - 1);
  if (n >= 16) s.bossSkills = LATE_BOSS_SKILLS;
  const pool = endlessPool(n);
  const list = Array.from({ length: 3 + Math.round(n * 1.7) }, () => pick(pool));
  if (boss) list.unshift("boss");
  list.forEach((type, i) => s.queue.push(endlessEntry(n, type, i, { night, big, boss })));
  if (s.qi === s.queue.length - list.length) s.nextSpawnAt = s.t + s.queue[s.qi].delay;
}

const LATE_BOSS_SKILLS = ["storm", "graverise", "possession", "darkmoon"];
// [first endless wave, ghost types added to the spawn pool]
const ENDLESS_UNLOCKS = [
  [2, ["speed"]], [3, ["shield"]], [4, ["doll", "lamp"]], [5, ["invisible"]], [6, ["tv", "shield"]],
  [7, ["pocong"]], [8, ["tuyul"]], [9, ["kuntilanak"]], [10, ["nisan", "pocong"]],
];
const endlessPool = (n) => ENDLESS_UNLOCKS.reduce((pool, [from, types]) => (n >= from ? [...pool, ...types] : pool), ["basic", "basic"]);

function endlessEntry(n, type, i, { night, big, boss }) {
  const gapMax = Math.max(1.6, 4.8 - n * 0.15);
  const row = type === "boss" ? 2 : Math.floor(Math.random() * ROWS);
  let delay = n === 1 ? 18 : 9;
  if (i > 0) delay = big ? rnd(1, 1.8) : rnd(gapMax * 0.5, gapMax);
  return { type, row, wave: n - 1, waveStart: i === 0, night, big, boss, delay };
}

function onWaveStart(s, e) {
  s.wave = e.wave;
  const wantNight = e.night;
  if (wantNight !== (s.phase === "night")) {
    s.phase = wantNight ? "night" : "day";
    sfx(s, wantNight ? "night" : "day");
    banner(s, wantNight ? "Malam Tiba! Hantu Makin Banyak" : "Siang Datang, Hantu Melemah", wantNight ? "night" : "day", 2.6);
    return;
  }
  sfx(s, "wave");
  if (e.boss) banner(s, "Raja Hantu Datang!", "boss", 2.8);
  else if (e.big) banner(s, "Gelombang Besar Datang!", "danger", 2.4);
  else banner(s, `Gelombang ${e.wave + 1}`, "info", 1.8);
}

function updateSpawner(s) {
  if (s.mode === "endless" && s.qi >= s.queue.length) {
    const last = s.queue.length ? s.queue[s.queue.length - 1] : null;
    if (!last || aliveGhosts(s) <= 1 || s.t > s.lastSpawnAt + 25) planEndlessWave(s);
  }
  if (s.qi >= s.queue.length || s.t < s.nextSpawnAt) return;
  const e = s.queue[s.qi];
  if (e.waveStart && s.qi > 0 && aliveGhosts(s) > 1 && s.t < s.nextSpawnAt + 22) return;
  if (e.waveStart) onWaveStart(s, e);
  spawnGhost(s, e.type, e.row);
  s.lastSpawnAt = s.t;
  s.qi++;
  const nx = s.queue[s.qi];
  if (nx) s.nextSpawnAt = s.t + nx.delay;
}

function updateReveal(s) {
  const active = s.cats.filter((c) => s.t >= c.possessedUntil);
  const seeRows = new Set(active.filter((c) => c.type === "hunter" || c.type === "detective").map((c) => c.row));
  const markRows = new Set(active.filter((c) => c.type === "detective").map((c) => c.row));
  const near = (set, g) => g.rows.some((r) => set.has(r) || set.has(r - 1) || set.has(r + 1));
  for (const g of s.ghosts) {
    g.marked = markRows.size > 0 && near(markRows, g);
    if (GHOSTS[g.type].invisible) g.revealed = near(seeRows, g);
  }
}

const canTarget = (g, hunter) => !GHOSTS[g.type].invisible || g.revealed || hunter;

function targetsInRow(s, row, fromX, hunter) {
  return s.ghosts
    .filter((g) => !g.dead && g.rows.includes(row) && g.x > fromX - 0.25 && g.x < END_X && canTarget(g, hunter))
    .sort((a, b) => a.x - b.x);
}

function gainXp(s, c, n) {
  if (!c || c.hp <= 0) return;
  c.xp += n;
  if (c.evo < 2 && c.xp >= EVO_XP[c.evo]) {
    c.evo += 1;
    c.maxHp = Math.round(CATS[c.type].hp * EVO_HP[c.evo] * (1 + UPG_HP * (s.upg[c.type] || 0)));
    c.hp = c.maxHp;
    addFx(s, "evolve", c.col + 0.5, c.row, { text: `${EVO_NAMES[c.evo]}!`, dur: 1.4 });
    sfx(s, "evolve");
  }
}

function killGhost(s, g, src) {
  g.dead = true;
  s.kills += 1;
  s.score += GHOSTS[g.type].points;
  addFx(s, "poof", g.x, g.row, { big: g.type === "boss", dur: g.type === "boss" ? 1.6 : 0.7 });
  sfx(s, g.type === "boss" ? "bossDie" : "poof");
  gainXp(s, src, g.type === "boss" ? 12 : 1);
  if (src?.type === "vampire" && src.hp > 0) {
    s.moonlight += 10;
    addFx(s, "orbText", g.x, g.row - 0.3, { text: "+10", dur: 0.9 });
  }
  if (g.type === "nisan") [-0.1, 0.25].forEach((dx) => spawnGhost(s, "mini", g.row, g.x + dx));
  if (g.type === "boss") {
    s.bossId = null;
    s.darkMoonUntil = 0;
    s.cats.forEach((c) => { c.possessedUntil = 0; });
    banner(s, "Raja Hantu Dikalahkan!", "win", 3);
  }
}

function hurtGhost(s, g, dmg, src) {
  if (g.dead) return;
  if (g.type === "boss" && src?.type === "hunter") dmg *= CATS.hunter.bossMult;
  if (g.marked) dmg *= CATS.detective.markMult;
  if (g.shield > 0) {
    g.shield -= dmg;
    dmg *= 0.25;
    if (g.shield <= 0) {
      g.shield = 0;
      addFx(s, "shieldBreak", g.x, g.row, { dur: 0.7 });
      sfx(s, "shield");
    }
  }
  g.hp -= dmg;
  g.hitUntil = s.t + 0.12;
  if (g.hp <= 0) killGhost(s, g, src);
}

function spawnOrb(s, kind, x, y, value, ty) {
  s.orbs.push({ id: nid(), kind, x, y, ty: ty ?? y, value, born: s.t, expire: s.t + (kind === "sky" ? 11 : 12) });
}

function attackClaw(s, c, C, dmg, cx) {
  const g = targetsInRow(s, c.row, cx, false).find((x) => x.x - cx <= C.reach);
  if (!g) return false;
  hurtGhost(s, g, GHOSTS[g.type].flying ? dmg * 0.4 : dmg, c);
  addFx(s, "slash", Math.max(g.x - 0.2, cx + 0.3), c.row, { dur: 0.3 });
  sfx(s, "claw");
  return true;
}

function attackLaser(s, c, C, dmg, cx) {
  const list = targetsInRow(s, c.row, cx, false);
  if (!list.length) return false;
  list.forEach((g) => hurtGhost(s, g, dmg, c));
  s.beams.push({ id: nid(), kind: "laser", row: c.row, x0: cx + 0.25, x1: END_X + 0.4, until: s.t + 0.28 });
  sfx(s, "laser");
  return true;
}

function attackNinja(s, c, C, dmg, cx) {
  const rows = [c.row - 1, c.row, c.row + 1].filter((r) => r >= 0 && r < ROWS);
  if (!rows.some((r) => targetsInRow(s, r, cx, false).length)) return false;
  rows.forEach((r) => s.projectiles.push({
    id: nid(), kind: "shuriken", row: r, y0: c.row, xs: cx + 0.3, x: cx + 0.3, v: 6.5, dmg, pierce: C.pierce, hits: [], src: c,
  }));
  sfx(s, "shuriken");
  return true;
}

function attackSamurai(s, c, C, dmg, cx) {
  const list = targetsInRow(s, c.row, cx, false).filter((x) => x.x - cx <= C.reach);
  if (!list.length) return false;
  list.forEach((g) => hurtGhost(s, g, dmg, c));
  addFx(s, "katana", cx + 0.75, c.row, { dur: 0.35 });
  sfx(s, "katana");
  return true;
}

const inSpellArea = (g, target, row) =>
  !g.dead && Math.abs(g.x - target.x) <= 0.9 && g.rows.some((r) => Math.abs(r - row) <= 1) && canTarget(g, false);

function attackWizard(s, c, C, dmg) {
  const target = s.ghosts.filter((g) => !g.dead && g.x < END_X && canTarget(g, false)).sort((a, b) => a.x - b.x)[0];
  if (!target) return false;
  const row = target.type === "boss" ? 2 : target.row;
  s.ghosts.filter((g) => inSpellArea(g, target, row)).forEach((g) => {
    hurtGhost(s, g, dmg, c);
    if (g.type !== "boss") g.stunUntil = Math.max(g.stunUntil, s.t + 1);
  });
  addFx(s, "moonspell", target.x, row, { dur: 0.75 });
  sfx(s, "magic");
  return true;
}

function drainHeal(s, c, dmg) {
  s.cats.forEach((o) => {
    if (o.hp <= 0 || Math.abs(o.row - c.row) + Math.abs(o.col - c.col) > 1) return;
    o.hp = Math.min(o.maxHp, o.hp + dmg * (o === c ? 0.5 : 0.25));
  });
}

function beamAttack(s, c, dmg, cx, range, kind) {
  const g = targetsInRow(s, c.row, cx, false).find((x) => x.x - cx <= range);
  if (!g) return false;
  hurtGhost(s, g, dmg, c);
  s.beams.push({ id: nid(), kind, row: c.row, x0: cx + 0.3, x1: g.x, until: s.t + 0.3 });
  if (kind === "drain") drainHeal(s, c, dmg);
  sfx(s, kind);
  return true;
}

const PROJ_SPEED = { bubble: 4.8, rocket: 5.5, spirit: 6 };

function shoot(s, c, C, dmg, cx, kind) {
  const hunter = kind === "spirit";
  if (!targetsInRow(s, c.row, cx, hunter).length) return false;
  s.projectiles.push({
    id: nid(), kind, row: c.row, y0: c.row, xs: cx + 0.3, x: cx + 0.3,
    v: PROJ_SPEED[kind], dmg, pierce: 1, hits: [], hunter, slow: C.slow || 0, src: c,
  });
  sfx(s, kind);
  return true;
}

// Attack per cat type; returns true when the cat actually fired.
const ATTACKS = {
  claw: attackClaw,
  laser: attackLaser,
  ninja: attackNinja,
  samurai: attackSamurai,
  wizard: attackWizard,
  vampire: (s, c, C, dmg, cx) => beamAttack(s, c, dmg, cx, C.range, "drain"),
  detective: (s, c, C, dmg, cx) => beamAttack(s, c, dmg, cx, Infinity, "glass"),
  bubble: (s, c, C, dmg, cx) => shoot(s, c, C, dmg, cx, "bubble"),
  hunter: (s, c, C, dmg, cx) => shoot(s, c, C, dmg, cx, "spirit"),
  robot: (s, c, C, dmg, cx) => shoot(s, c, C, dmg, cx, "rocket"),
};

const fireCat = (s, c, C, mult) => ATTACKS[c.type](s, c, C, C.dmg * mult, c.col + 0.5);

function updateSolar(s, c, C, m, dt) {
  if (s.t < s.darkMoonUntil) { c.prodAt += dt; return; }
  if (s.t < c.prodAt) return;
  spawnOrb(s, "solar", c.col + 0.85 + rnd(-0.05, 0.15), c.row - 0.45, 25 + c.evo * 10, c.row - 0.2);
  const base = s.phase === "night" ? C.produceNight : C.produceDay;
  c.prodAt = s.t + (base * rateMult(m) * (m === "happy" ? 0.85 : 1)) / (1 + UPG_PROD * (s.upg[c.type] || 0));
  c.attackUntil = s.t + 0.6;
  sfx(s, "produce");
  gainXp(s, c, 1);
}

function attackMult(s, c, C, m) {
  const night = s.phase === "night" && C.nightBoost ? 1.25 : 1;
  return (m === "happy" ? 1.2 : 1) * EVO_DMG[c.evo] * night * (1 + UPG_DMG * (s.upg[c.type] || 0));
}

function updateAttacker(s, c, C, m) {
  if (s.t < c.cd) return;
  if (fireCat(s, c, C, attackMult(s, c, C, m))) {
    c.cd = s.t + C.rate * rateMult(m);
    c.attackUntil = s.t + 0.28;
  } else c.cd = s.t + 0.1;
}

function updateCats(s, dt) {
  for (const c of s.cats) {
    const C = CATS[c.type];
    if (!C.immune) c.fullness = Math.max(0, c.fullness - dt * 0.5);
    if (s.t < c.possessedUntil || s.t < c.stunUntil) continue;
    const m = moodOf(c, s.t);
    if (c.type === "solar") updateSolar(s, c, C, m, dt);
    else updateAttacker(s, c, C, m);
  }
}

function updateProjectiles(s, dt) {
  for (const p of s.projectiles) {
    p.x += p.v * dt;
    if (p.x > END_X + 0.6) { p.dead = true; continue; }
    for (const g of s.ghosts) {
      if (g.dead || !g.rows.includes(p.row) || p.hits.includes(g.id) || !canTarget(g, p.hunter)) continue;
      const reach = g.type === "boss" ? 0.7 : 0.32;
      if (Math.abs(g.x - p.x) < reach && g.x < END_X + 0.1) {
        hurtGhost(s, g, p.dmg, p.src);
        if (p.slow) g.slowUntil = s.t + p.slow;
        p.hits.push(g.id);
        addFx(s, p.kind === "bubble" ? "splash" : "hit", p.x, p.row, { dur: 0.35 });
        sfx(s, "hit");
        p.pierce -= 1;
        if (p.pierce <= 0) { p.dead = true; break; }
      }
    }
  }
}

function killCat(s, c) {
  c.hp = 0;
  s.grid[c.row][c.col] = null;
  addFx(s, "catGone", c.col + 0.5, c.row, { dur: 0.8 });
  sfx(s, "catDie");
}

function findBlocker(s, g) {
  const front = g.x - (g.type === "boss" ? 0.75 : 0.35);
  let best = null;
  for (const c of s.cats) {
    if (c.hp <= 0 || !g.rows.includes(c.row)) continue;
    if (front <= c.col + 0.85 && g.x >= c.col + 0.2 && (!best || c.col > best.col)) best = c;
  }
  return best;
}

const BOSS_ACTIONS = {
  storm: (s, g, enraged) => {
    for (let i = 0; i < (enraged ? 6 : 4); i++) spawnGhost(s, "mini", Math.floor(Math.random() * ROWS), g.x - 0.4 + rnd(0, 0.8));
  },
  possession: (s, g, enraged) => {
    const pool = shuffle(s.cats.filter((c) => c.hp > 0 && c.type !== "solar" && !CATS[c.type].immune && s.t >= c.possessedUntil));
    pool.slice(0, enraged ? 3 : 2).forEach((c) => {
      c.possessedUntil = s.t + 7;
      addFx(s, "possess", c.col + 0.5, c.row, { dur: 1 });
    });
  },
  graverise: (s, g, enraged) => {
    shuffle([0, 1, 2, 3, 4]).slice(0, enraged ? 3 : 2).forEach((r) => spawnGhost(s, "nisan", r, g.x - 0.6 + rnd(-0.2, 0.2)));
  },
  darkmoon: (s) => { s.darkMoonUntil = s.t + 9; },
};

function bossThink(s, g) {
  if (g.x > END_X - 0.3 || s.t < g.nextSkill) return;
  const sk = s.bossSkills[g.skillIdx % s.bossSkills.length];
  const enraged = g.hp < g.maxHp * 0.5;
  g.skillIdx += 1;
  g.castUntil = s.t + 1.2;
  BOSS_ACTIONS[sk](s, g, enraged);
  banner(s, BOSS_SKILLS[sk].name, "boss", 2);
  sfx(s, "boss");
  g.nextSkill = s.t + (enraged ? 9 : 13);
}

function dollAbility(s, g) {
  if (g.enraged || g.hp >= g.maxHp * 0.5) return;
  g.enraged = true;
  addFx(s, "text", g.x, g.row - 0.3, { text: "MENGAMUK!", cls: "red", dur: 1.1 });
  sfx(s, "giggle");
}

const catDistance = (g, c) => g.x - (c.col + 0.5);

function tvAbility(s, g, G) {
  if (s.t < g.nextAbility || g.x >= END_X) return;
  g.nextAbility = s.t + G.abilityEvery;
  const target = s.cats
    .filter((c) => c.hp > 0 && c.row === g.row && catDistance(g, c) > 0 && catDistance(g, c) < 3.5)
    .sort((a, b) => b.col - a.col)[0];
  if (!target) return;
  target.stunUntil = s.t + 2.5;
  s.beams.push({ id: nid(), kind: "static", row: g.row, x0: target.col + 0.5, x1: g.x - 0.2, until: s.t + 0.45 });
  sfx(s, "static");
}

const canHeal = (g, o) =>
  o !== g && !o.dead && o.type !== "boss" && Math.abs(o.row - g.row) <= 1 && Math.abs(o.x - g.x) <= 1.5 && o.hp < o.maxHp;

function lampAbility(s, g, G) {
  if (s.t < g.nextAbility) return;
  g.nextAbility = s.t + G.abilityEvery;
  const targets = s.ghosts.filter((o) => canHeal(g, o));
  targets.forEach((o) => {
    o.hp = Math.min(o.maxHp, o.hp + 35);
    addFx(s, "heal", o.x, o.row, { dur: 0.8 });
  });
  if (targets.length) sfx(s, "heal");
}

function screamAbility(s, g, G) {
  if (s.t < g.nextAbility || g.x >= END_X) return;
  g.nextAbility = s.t + G.abilityEvery;
  s.cats
    .filter((c) => c.hp > 0 && c.row === g.row && !CATS[c.type].immune && catDistance(g, c) > -0.5 && catDistance(g, c) < 4)
    .forEach((c) => {
      c.fullness = Math.max(0, c.fullness - 45);
      c.angryUntil = 0;
      addFx(s, "text", c.col + 0.5, c.row - 0.3, { text: "Hiii!", cls: "cyan", dur: 0.9 });
    });
  s.beams.push({ id: nid(), kind: "scream", row: g.row, x0: Math.max(0, g.x - 4), x1: g.x - 0.3, until: s.t + 0.6 });
  sfx(s, "scream");
}

// Special ability per ghost type, run every tick before movement.
const GHOST_ABILITIES = { doll: dollAbility, tv: tvAbility, lamp: lampAbility, kuntilanak: screamAbility, boss: bossThink };

function ghostSpeed(s, g, G) {
  let sp = g.speed;
  if (G.hop) {
    g.hopping = (s.t - g.born + g.bob) % 1.4 < 0.4;
    if (!g.hopping) sp = 0;
  }
  if (s.t < g.slowUntil) sp *= 0.5;
  if (g.enraged) sp *= 1.9;
  return sp;
}

function leapOver(s, g, cat) {
  g.dashed = true;
  g.x = cat.col - 0.05;
  g.leapUntil = s.t + 0.4;
  addFx(s, "text", g.x, g.row - 0.3, { text: "Wuss!", cls: "cyan", dur: 0.8 });
  sfx(s, "dash");
}

function stealMoonlight(s, g) {
  if (s.moonlight <= 0) return;
  const st = Math.min(10, s.moonlight);
  s.moonlight -= st;
  addFx(s, "text", g.x, g.row - 0.4, { text: `-${st}`, cls: "red", dur: 0.8 });
  sfx(s, "steal");
}

function bite(s, g, G, cat) {
  cat.hp -= G.dmg;
  cat.hitUntil = s.t + 0.15;
  cat.angryUntil = s.t + 4;
  g.biteAt = s.t + G.biteRate;
  sfx(s, "bite");
  if (g.type === "tuyul") stealMoonlight(s, g);
  if (cat.hp <= 0) killCat(s, cat);
}

// Returns false when the ghost leapt this tick (skips the house check, like before).
function moveOrBite(s, g, G, dt) {
  const blocker = findBlocker(s, g);
  if (!blocker) {
    g.eating = false;
    g.x -= ghostSpeed(s, g, G) * dt;
    return true;
  }
  if (g.type === "speed" && !g.dashed) {
    leapOver(s, g, blocker);
    return false;
  }
  g.eating = true;
  if (s.t >= g.biteAt) bite(s, g, G, blocker);
  return true;
}

function reachHouse(s, g) {
  g.dead = true;
  s.lives = g.type === "boss" ? 0 : s.lives - 1;
  if (g.type === "tuyul") s.moonlight = Math.max(0, s.moonlight - 50);
  s.shakeUntil = s.t + 0.45;
  s.flashUntil = s.t + 0.5;
  sfx(s, "hurt");
  banner(s, "Hantu Masuk Rumah!", "danger", 1.6);
}

function updateGhosts(s, dt) {
  for (const g of s.ghosts) {
    if (g.dead) continue;
    const G = GHOSTS[g.type];
    GHOST_ABILITIES[g.type]?.(s, g, G);
    if (s.t < g.stunUntil || !moveOrBite(s, g, G, dt)) continue;
    if (g.x < -0.3) reachHouse(s, g);
  }
}

function updateOrbs(s, dt) {
  const dark = s.t < s.darkMoonUntil;
  if (dark) s.nextSky += dt;
  else if (s.t >= s.nextSky) {
    spawnOrb(s, "sky", rnd(0.6, 8.4), -0.7, 25, rnd(0.2, 4.3));
    s.nextSky = s.t + (s.phase === "night" ? 7 : 11);
  }
  for (const o of s.orbs) {
    if (o.y < o.ty) o.y = Math.min(o.ty, o.y + dt * (o.kind === "sky" ? 0.85 : 2));
    if (s.t > o.expire) o.dead = true;
  }
}

function cleanup(s) {
  s.ghosts = s.ghosts.filter((g) => !g.dead);
  s.cats = s.cats.filter((c) => c.hp > 0);
  s.projectiles = s.projectiles.filter((p) => !p.dead);
  s.orbs = s.orbs.filter((o) => !o.dead);
  s.fx = s.fx.filter((f) => f.until > s.t);
  s.beams = s.beams.filter((b) => b.until > s.t);
  if (s.banner && s.banner.until < s.t) s.banner = null;
}

function checkEnd(s) {
  if (s.lives <= 0) {
    s.lives = 0;
    s.status = "lost";
    sfx(s, "lose");
    return;
  }
  if (s.mode === "story" && s.qi >= s.queue.length && s.ghosts.length === 0) {
    s.status = "won";
    sfx(s, "win");
  }
}

export function step(s, dt) {
  if (s.status !== "playing") return;
  dt = Math.min(dt, 0.05);
  s.t += dt;
  updateSpawner(s);
  updateReveal(s);
  updateCats(s, dt);
  updateProjectiles(s, dt);
  updateGhosts(s, dt);
  updateOrbs(s, dt);
  cleanup(s);
  checkEnd(s);
}

export const cardState = (s, type) => {
  const C = CATS[type];
  const ready = s.cardReady[type] || 0;
  const cdLeft = Math.max(0, ready - s.t);
  return { affordable: s.moonlight >= C.cost, cdPct: cdLeft > 0 ? cdLeft / C.cooldown : 0, ready: cdLeft <= 0 };
};

export function placeCat(s, type, row, col) {
  const C = CATS[type];
  if (s.grid[row][col]) return "occupied";
  if (s.t < (s.cardReady[type] || 0)) {
    addFx(s, "text", col + 0.5, row, { text: "Belum siap!", cls: "red", dur: 0.9 });
    sfx(s, "error");
    return "cooldown";
  }
  if (s.moonlight < C.cost) {
    addFx(s, "text", col + 0.5, row, { text: "Moonlight kurang!", cls: "red", dur: 0.9 });
    sfx(s, "error");
    return "cost";
  }
  s.moonlight -= C.cost;
  s.cardReady[type] = s.t + C.cooldown;
  const hp = Math.round(C.hp * (1 + UPG_HP * (s.upg[type] || 0)));
  const c = {
    id: nid(), type, row, col, hp, maxHp: hp, cd: s.t + 0.5, prodAt: s.t + 6,
    fullness: 75, angryUntil: 0, possessedUntil: 0, stunUntil: 0, hitUntil: 0, attackUntil: 0,
    xp: 0, evo: 0, placedAt: s.t,
  };
  s.cats.push(c);
  s.grid[row][col] = c.id;
  addFx(s, "dust", col + 0.5, row, { dur: 0.6 });
  sfx(s, "place");
  return "ok";
}

export function removeCat(s, row, col) {
  const c = s.cats.find((x) => x.row === row && x.col === col && x.hp > 0);
  if (!c) return false;
  c.hp = 0;
  s.grid[row][col] = null;
  s.cats = s.cats.filter((x) => x.hp > 0);
  addFx(s, "dust", col + 0.5, row, { dur: 0.6 });
  sfx(s, "shovel");
  return true;
}

export function feedCat(s, row, col) {
  const c = s.cats.find((x) => x.row === row && x.col === col && x.hp > 0);
  if (!c) return false;
  if (s.moonlight < SNACK_COST) {
    addFx(s, "text", col + 0.5, row, { text: "Moonlight kurang!", cls: "red", dur: 0.9 });
    sfx(s, "error");
    return false;
  }
  s.moonlight -= SNACK_COST;
  c.fullness = 100;
  c.possessedUntil = 0;
  c.stunUntil = 0;
  c.hp = Math.min(c.maxHp, c.hp + c.maxHp * 0.15);
  addFx(s, "heart", col + 0.5, row, { dur: 1 });
  sfx(s, "snack");
  return true;
}

export function collectOrb(s, id) {
  const o = s.orbs.find((x) => x.id === id);
  if (!o || o.dead) return;
  o.dead = true;
  s.moonlight += o.value;
  addFx(s, "orbText", o.x, o.y, { text: `+${o.value}`, dur: 0.9 });
  sfx(s, "orb");
}

export const getBoss = (s) => (s.bossId ? s.ghosts.find((g) => g.id === s.bossId) : null);

export const waveProgress = (s) => {
  if (s.mode === "endless") return 0;
  return s.queue.length ? s.qi / s.queue.length : 0;
};
