import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATS, CAT_ORDER, COLLECTION_ORDER, DECK_MAX } from "../game/data";
import { step, placeCat, removeCat, feedCat, collectOrb, cardState, getBoss } from "../game/engine";
import { play, music } from "../game/audio";
import { loadProgress, saveProgress, completeLevel, recordEndless, isCatUnlocked } from "../game/storage";

const flushSfx = (s) => s.sfx.splice(0).forEach(play);

const defaultLoadout = (available) => {
  const saved = (loadProgress().loadout || []).filter((id) => available.includes(id));
  const rest = available.filter((id) => !saved.includes(id));
  return [...saved, ...rest].slice(0, DECK_MAX);
};

export function useLoadout(level) {
  const available = useMemo(() => {
    const p = loadProgress();
    return [...(level ? level.cards : CAT_ORDER), ...COLLECTION_ORDER.filter((id) => isCatUnlocked(id, p))];
  }, [level]);
  const [loadout, setLoadout] = useState(() => defaultLoadout(available));
  const loadoutRef = useRef(loadout);

  useEffect(() => {
    const lo = defaultLoadout(available);
    loadoutRef.current = lo;
    setLoadout(lo);
  }, [available]);

  const toggle = useCallback((id) => {
    play("click");
    setLoadout((cur) => {
      let next = cur;
      if (cur.includes(id)) next = cur.filter((x) => x !== id);
      else if (cur.length < DECK_MAX) next = [...cur, id];
      loadoutRef.current = next;
      return next;
    });
  }, []);

  const commit = useCallback(() => {
    const ordered = available.filter((id) => loadoutRef.current.includes(id));
    loadoutRef.current = ordered;
    saveProgress({ loadout: ordered });
    return ordered;
  }, [available]);

  return { available, loadout, loadoutRef, toggle, commit };
}

export function settleGame(s, level, mode) {
  if (s.status === "won") {
    const before = loadProgress();
    completeLevel(level.num, s.lives);
    const newCat = COLLECTION_ORDER.find((id) => CATS[id].unlock === level.num && !isCatUnlocked(id, before));
    return { type: "won", stars: s.lives, kills: s.kills, newCat };
  }
  if (mode === "endless") {
    const p = recordEndless(s.score, s.endlessWave);
    return { type: "endless", score: s.score, wave: s.endlessWave, kills: s.kills, best: p.bestEndless };
  }
  return { type: "lost" };
}

export function useGameLoop(sRef, running, speed, onFrame, onEnd) {
  useEffect(() => {
    if (!running) return undefined;
    let raf;
    let last = performance.now();
    const loop = (now) => {
      const s = sRef.current;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      for (let i = 0; i < speed; i++) step(s, dt);
      flushSfx(s);
      music.setMood(getBoss(s) ? "boss" : "calm");
      onFrame();
      if (s.status !== "playing") {
        onEnd(s);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sRef, running, speed, onFrame, onEnd]);
}

export function useGameMusic(playing) {
  useEffect(() => {
    if (playing) music.start();
    else music.stop();
  }, [playing]);
  useEffect(() => () => music.stop(), []);
}

export function useAutoPause(setPhase) {
  useEffect(() => {
    const onVis = () => document.hidden && setPhase((p) => (p === "playing" ? "paused" : p));
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [setPhase]);
}

export function useDebugHook(sRef) {
  useEffect(() => {
    if (!window.location.search.includes("debug=1")) return undefined;
    window.__cvg = { state: () => sRef.current, step, music };
    return () => { delete window.__cvg; };
  }, [sRef]);
}

function applyTool(s, tool, r, c) {
  if (tool.kind === "cat") {
    if (s.grid[r][c]) {
      play("error");
      return false;
    }
    return placeCat(s, tool.type, r, c) === "ok";
  }
  if (tool.kind === "shovel") return removeCat(s, r, c);
  feedCat(s, r, c);
  return false;
}

export function useGameControls(sRef, phase, tool, setTool) {
  const active = phase === "playing";

  const selectCat = useCallback((type) => {
    if (!active) return;
    if (tool?.kind === "cat" && tool.type === type) { setTool(null); return; }
    const st = cardState(sRef.current, type);
    if (!st.affordable || !st.ready) { play("error"); return; }
    play("select");
    setTool({ kind: "cat", type });
  }, [sRef, active, tool, setTool]);

  const selectTool = useCallback((kind) => {
    if (!active) return;
    play("select");
    setTool((t) => (t?.kind === kind ? null : { kind }));
  }, [active, setTool]);

  const onTile = useCallback((r, c) => {
    if (!active || !tool) return;
    if (applyTool(sRef.current, tool, r, c)) setTool(null);
    flushSfx(sRef.current);
  }, [sRef, active, tool, setTool]);

  const onOrb = useCallback((id) => {
    if (!active) return;
    collectOrb(sRef.current, id);
    flushSfx(sRef.current);
  }, [sRef, active]);

  return { selectCat, selectTool, onTile, onOrb };
}

const togglePause = (p) => {
  if (p === "playing") return "paused";
  return p === "paused" ? "playing" : p;
};
const KEY_TOOLS = { s: "shovel", f: "snack" };

function handlePlayKey(e, s, { selectCat, selectTool, setPhase }) {
  const n = Number(e.key);
  const toolKey = KEY_TOOLS[e.key.toLowerCase()];
  if (n >= 1 && n <= s.cards.length) selectCat(s.cards[n - 1]);
  else if (toolKey) selectTool(toolKey);
  else if (e.key === " ") {
    e.preventDefault();
    setPhase("paused");
  }
}

export function useGameKeys({ sRef, phase, tool, setTool, setPhase, selectCat, selectTool }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || !sRef.current) return;
      if (e.key === "Escape") {
        if (tool) setTool(null);
        else setPhase(togglePause);
        return;
      }
      if (phase === "playing") handlePlayKey(e, sRef.current, { selectCat, selectTool, setPhase });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sRef, phase, tool, setTool, setPhase, selectCat, selectTool]);
}
