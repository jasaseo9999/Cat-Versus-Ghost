import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLevel, getLocation } from "../game/data";
import { createGame } from "../game/engine";
import { play, unlockAudio, isMuted, setMuted, music } from "../game/audio";
import { loadProgress } from "../game/storage";
import {
  useLoadout, useGameLoop, useGameMusic, useAutoPause, useDebugHook, useGameControls, useGameKeys, settleGame,
} from "../hooks/useGameSession";
import { Stage } from "../components/game/Stage";
import { Board } from "../components/game/Board";
import { Hud, Banner } from "../components/game/Hud";
import { CardDeck } from "../components/game/CardDeck";
import { Scenery } from "../components/game/Scenery";
import { GameOverlays } from "../components/game/GameOverlays";

export default function GamePage({ mode }) {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const level = mode === "story" ? getLevel(levelId) : null;
  const locked = mode === "story" && (!level || level.num > loadProgress().unlocked);
  const sRef = useRef(null);
  const [, force] = useReducer((x) => x + 1, 0);
  const [phase, setPhase] = useState("intro");
  const [tool, setTool] = useState(null);
  const [hover, setHover] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [muted, setMutedState] = useState(isMuted());
  const [musicOn, setMusicOn] = useState(music.isOn());
  const [result, setResult] = useState(null);
  const lo = useLoadout(level);
  const { loadoutRef, commit } = lo;

  const reset = useCallback((startNow) => {
    sRef.current = createGame({ mode, level, cards: loadoutRef.current, upgrades: loadProgress().upgrades });
    setTool(null);
    setResult(null);
    setPhase(startNow ? "playing" : "intro");
    force();
  }, [mode, level, loadoutRef]);

  useEffect(() => {
    if (locked) navigate("/levels", { replace: true });
    else reset(false);
  }, [locked, navigate, reset]);

  const onEnd = useCallback((s) => {
    setResult(settleGame(s, level, mode));
    setTool(null);
    setPhase("over");
  }, [level, mode]);

  useGameLoop(sRef, phase === "playing", speed, force, onEnd);
  useGameMusic(phase === "playing" && musicOn && !muted);
  useAutoPause(setPhase);
  useDebugHook(sRef);
  const controls = useGameControls(sRef, phase, tool, setTool);
  useGameKeys({ sRef, phase, tool, setTool, setPhase, ...controls });

  const actions = {
    start: () => {
      unlockAudio();
      play("click");
      sRef.current.cards = commit();
      music.setMood("calm");
      setPhase("playing");
    },
    resume: () => setPhase("playing"),
    pause: () => phase === "playing" && setPhase("paused"),
    restart: () => reset(true),
    go: navigate,
    toggleMute: () => { setMuted(!muted); setMutedState(!muted); },
    toggleMusic: () => { music.setOn(!musicOn); setMusicOn(!musicOn); },
    toggleSpeed: () => setSpeed((v) => (v === 1 ? 2 : 1)),
  };

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
        <Scenery loc={getLocation(level?.loc || 1)} phase={s.phase} dark={dark} flash={s.t < s.flashUntil} />
        <Board s={s} tool={tool} hover={hover} onTile={controls.onTile} onHover={setHover} onOrb={controls.onOrb} />
        <Hud s={s} speed={speed} muted={muted} onMute={actions.toggleMute} onSpeed={actions.toggleSpeed} onPause={actions.pause} />
        <CardDeck s={s} tool={tool} onSelectCat={controls.selectCat} onTool={controls.selectTool} />
        <Banner banner={s.banner} />
        <GameOverlays phase={phase} result={result} level={level} lo={lo} muted={muted} musicOn={musicOn} actions={actions} />
      </div>
    </Stage>
  );
}
