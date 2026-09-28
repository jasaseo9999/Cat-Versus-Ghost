import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BG_LAYOUT, CATS, CAT_ORDER, COLLECTION_ORDER, DECK_MAX, getLevel, getLocation } from "../game/data";
import { createGame, step, placeCat, removeCat, feedCat, collectOrb, cardState, getBoss } from "../game/engine";
import { play, unlockAudio, isMuted, setMuted, music } from "../game/audio";
import { loadProgress, saveProgress, completeLevel, recordEndless, isCatUnlocked } from "../game/storage";
import { Stage } from "../components/game/Stage";
import { Board } from "../components/game/Board";
import { Hud, Banner } from "../components/game/Hud";
import { CardDeck } from "../components/game/CardDeck";
import { IntroModal, PauseModal, WinModal, LoseModal, EndlessOverModal } from "../components/game/GameModals";

const Background = ({ loc, phase, dark }) => (
  <>
    <img src={loc.bg.night} alt="" className="bg-img" style={{ ...BG_LAYOUT, filter: dark ? "brightness(0.55) saturate(0.6) hue-rotate(20deg)" : "none" }} data-testid="game-bg" data-location={loc.id} />
    <img src={loc.bg.day} alt="" className="bg-img" style={{ ...BG_LAYOUT, opacity: phase === "day" && !dark ? 1 : 0 }} />
  </>
);

const Fog = () => (
  <>
    <div className="fog-layer slow" style={{ top: 150, height: 250 }} />
    <div className="fog-layer" style={{ top: 380, height: 320 }} data-testid="fog-overlay" />
  </>
);

const defaultLoadout = (available) => {
  const saved = (loadProgress().loadout || []).filter((id) => available.includes(id));
  const rest = available.filter((id) => !saved.includes(id));
  return [...saved, ...rest].slice(0, DECK_MAX);
};

export default function GamePage({ mode }) {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const level = mode === "story" ? getLevel(levelId) : null;
  const sRef = useRef(null);
  const [, force] = useReducer((x) => x + 1, 0);
  const [phase, setPhase] = useState("intro");
  const [tool, setTool] = useState(null);
  const [hover, setHover] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [muted, setMutedState] = useState(isMuted());
  const [result, setResult] = useState(null);
  const [musicOn, setMusicOn] = useState(music.isOn());
  const [loadout, setLoadout] = useState([]);
  const loadoutRef = useRef([]);
  const loc = getLocation(level?.loc || 1);

  const available = useMemo(() => {
    const p = loadProgress();
    return [...(level ? level.cards : CAT_ORDER), ...COLLECTION_ORDER.filter((id) => isCatUnlocked(id, p))];
  }, [level]);

  const reset = useCallback((startNow) => {
    sRef.current = createGame({ mode, level, cards: loadoutRef.current, upgrades: loadProgress().upgrades });
    setTool(null);
    setResult(null);
    setPhase(startNow ? "playing" : "intro");
    force();
  }, [mode, level]);

  useEffect(() => {
    if (mode === "story" && (!level || level.num > loadProgress().unlocked)) {
      navigate("/levels", { replace: true });
      return;
    }
    const lo = defaultLoadout(available);
    loadoutRef.current = lo;
    setLoadout(lo);
    reset(false);
  }, [mode, levelId]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = useCallback((s) => {
    if (s.status === "won") {
      const before = loadProgress();
      completeLevel(level.num, s.lives);
      const newCat = COLLECTION_ORDER.find((id) => CATS[id].unlock === level.num && !isCatUnlocked(id, before));
      setResult({ type: "won", stars: s.lives, kills: s.kills, newCat });
    } else if (mode === "endless") {
      const p = recordEndless(s.score, s.endlessWave);
      setResult({ type: "endless", score: s.score, wave: s.endlessWave, kills: s.kills, best: p.bestEndless });
    } else setResult({ type: "lost" });
    setTool(null);
    setPhase("over");
  }, [level, mode]);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    let raf;
    let last = performance.now();
    const loop = (now) => {
      const s = sRef.current;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      for (let i = 0; i < speed; i++) step(s, dt);
      s.sfx.splice(0).forEach(play);
      music.setMood(getBoss(s) ? "boss" : "calm");
      force();
      if (s.status !== "playing") {
        finish(s);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, speed, finish]);

  useEffect(() => {
    if (phase === "playing" && musicOn && !muted) music.start();
    else music.stop();
  }, [phase, musicOn, muted]);

  useEffect(() => () => music.stop(), []);

  useEffect(() => {
    const onVis = () => document.hidden && setPhase((p) => (p === "playing" ? "paused" : p));
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const flush = () => sRef.current.sfx.splice(0).forEach(play);

  const selectCat = useCallback((type) => {
    const s = sRef.current;
    if (phase !== "playing") return;
    if (tool?.kind === "cat" && tool.type === type) { setTool(null); return; }
    const st = cardState(s, type);
    if (!st.affordable || !st.ready) { play("error"); return; }
    play("select");
    setTool({ kind: "cat", type });
  }, [phase, tool]);

  const selectTool = useCallback((kind) => {
    if (phase !== "playing") return;
    play("select");
    setTool((t) => (t?.kind === kind ? null : { kind }));
  }, [phase]);

  const onTile = useCallback((r, c) => {
    const s = sRef.current;
    if (phase !== "playing" || !tool) return;
    if (tool.kind === "cat") {
      if (s.grid[r][c]) play("error");
      else if (placeCat(s, tool.type, r, c) === "ok") setTool(null);
    } else if (tool.kind === "shovel") {
      if (removeCat(s, r, c)) setTool(null);
    } else if (tool.kind === "snack") {
      feedCat(s, r, c);
    }
    flush();
  }, [phase, tool]);

  const onOrb = useCallback((id) => {
    if (phase !== "playing") return;
    collectOrb(sRef.current, id);
    flush();
  }, [phase]);

  const onHover = useCallback((h) => setHover(h), []);

  useEffect(() => {
    if (!window.location.search.includes("debug=1")) return undefined;
    window.__cvg = { state: () => sRef.current, step, music };
    return () => { delete window.__cvg; };
  }, []);

  const toggleMute = () => { setMuted(!muted); setMutedState(!muted); };
  const toggleMusic = () => { music.setOn(!musicOn); setMusicOn(!musicOn); };
  const toggleLoadout = (id) => {
    play("click");
    setLoadout((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < DECK_MAX ? [...cur, id] : cur;
      loadoutRef.current = next;
      return next;
    });
  };
  const start = () => {
    unlockAudio();
    play("click");
    const ordered = available.filter((id) => loadout.includes(id));
    loadoutRef.current = ordered;
    sRef.current.cards = ordered;
    saveProgress({ loadout: ordered });
    music.setMood("calm");
    setPhase("playing");
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      const s = sRef.current;
      if (!s) return;
      if (e.key === "Escape") {
        if (tool) setTool(null);
        else setPhase((p) => (p === "playing" ? "paused" : p === "paused" ? "playing" : p));
        return;
      }
      if (phase !== "playing") return;
      const n = Number(e.key);
      if (n >= 1 && n <= s.cards.length) selectCat(s.cards[n - 1]);
      else if (e.key.toLowerCase() === "s") selectTool("shovel");
      else if (e.key.toLowerCase() === "f") selectTool("snack");
      else if (e.key === " ") { e.preventDefault(); setPhase("paused"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, tool, selectCat, selectTool]);

  const s = sRef.current;
  if (!s) return null;
  const dark = s.t < s.darkMoonUntil;

  return (
    <Stage>
      <div
        className={`scene ${s.t < s.shakeUntil ? "shake" : ""}`}
        data-testid="game-scene"
        data-status={s.status}
        onContextMenu={(e) => { e.preventDefault(); setTool(null); }}
      >
        <Background loc={loc} phase={s.phase} dark={dark} />
        <Board s={s} tool={tool} hover={hover} onTile={onTile} onHover={onHover} onOrb={onOrb} />
        {loc.fog && <Fog />}
        {dark && <div className="darkmoon-overlay" style={{ zIndex: 110 }} data-testid="dark-moon-overlay" />}
        {s.t < s.flashUntil && <div className="house-flash" />}
        <Hud
          s={s}
          speed={speed}
          muted={muted}
          onMute={toggleMute}
          onSpeed={() => setSpeed((v) => (v === 1 ? 2 : 1))}
          onPause={() => phase === "playing" && setPhase("paused")}
        />
        <CardDeck s={s} tool={tool} onSelectCat={selectCat} onTool={selectTool} />
        <Banner banner={s.banner} />

        {phase === "intro" && (
          <IntroModal
            level={level}
            available={available}
            selected={loadout}
            onToggle={toggleLoadout}
            onStart={start}
            onBack={() => navigate(level ? "/levels" : "/")}
          />
        )}
        {phase === "paused" && (
          <PauseModal
            muted={muted}
            onMute={toggleMute}
            musicOn={musicOn}
            onMusic={toggleMusic}
            onResume={() => setPhase("playing")}
            onRestart={() => reset(true)}
            onQuit={() => navigate(level ? "/levels" : "/")}
          />
        )}
        {result?.type === "won" && (
          <WinModal
            level={level}
            stars={result.stars}
            kills={result.kills}
            newCat={result.newCat}
            onNext={() => navigate(`/play/${level.num + 1}`)}
            onRetry={() => reset(true)}
            onLevels={() => navigate("/levels")}
          />
        )}
        {result?.type === "lost" && <LoseModal onRetry={() => reset(true)} onLevels={() => navigate("/levels")} />}
        {result?.type === "endless" && (
          <EndlessOverModal result={result} onRetry={() => reset(true)} onMenu={() => navigate("/")} onBoard={() => navigate("/leaderboard")} />
        )}
      </div>
    </Stage>
  );
}
