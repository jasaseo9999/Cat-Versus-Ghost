const KEY = "cvg_progress_v1";
const DEFAULT = { unlocked: 1, stars: {}, bestEndless: 0, bestWave: 0, name: "", muted: false };

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
