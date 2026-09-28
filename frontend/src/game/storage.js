import { CATS, UPG_COST, UPG_MAX, ENDLESS_STAR_WAVES, ENDLESS_STAR_MAX } from "./data";

const KEY = "cvg_progress_v1";
const DEFAULT = { unlocked: 1, stars: {}, bestEndless: 0, bestWave: 0, name: "", muted: false, musicMuted: false, upgrades: {}, loadout: null };

export function loadProgress() {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveProgress(patch) {
  const next = { ...loadProgress(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function completeLevel(num, stars) {
  const p = loadProgress();
  return saveProgress({
    stars: { ...p.stars, [num]: Math.max(p.stars[num] || 0, stars) },
    unlocked: Math.max(p.unlocked, num + 1),
  });
}

export function recordEndless(score, wave) {
  const p = loadProgress();
  return saveProgress({ bestEndless: Math.max(p.bestEndless, score), bestWave: Math.max(p.bestWave, wave) });
}

export const isCatUnlocked = (id, p) => !CATS[id].collection || p.unlocked > CATS[id].unlock;

const costUpTo = (lv) => UPG_COST.slice(0, lv).reduce((a, b) => a + b, 0);

export function starBalance(p) {
  const level = Object.values(p.stars).reduce((a, b) => a + b, 0);
  const endless = Math.min(ENDLESS_STAR_MAX, Math.floor(p.bestWave / ENDLESS_STAR_WAVES));
  const spent = Object.values(p.upgrades).reduce((a, lv) => a + costUpTo(lv), 0);
  return { level, endless, total: level + endless, spent, available: level + endless - spent };
}

export function upgradeCat(id) {
  const p = loadProgress();
  const lv = p.upgrades[id] || 0;
  if (lv >= UPG_MAX || !isCatUnlocked(id, p) || starBalance(p).available < UPG_COST[lv]) return null;
  return saveProgress({ upgrades: { ...p.upgrades, [id]: lv + 1 } });
}

export const resetUpgrades = () => saveProgress({ upgrades: {} });
