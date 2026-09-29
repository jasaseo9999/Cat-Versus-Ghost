import { IntroModal, PauseModal, WinModal, LoseModal, EndlessOverModal } from "./GameModals";

const ResultModal = ({ result, level, actions }) => {
  if (!result) return null;
  if (result.type === "won") {
    return (
      <WinModal
        level={level}
        stars={result.stars}
        kills={result.kills}
        newCat={result.newCat}
        onNext={() => actions.go(`/play/${level.num + 1}`)}
        onRetry={actions.restart}
        onLevels={() => actions.go("/levels")}
      />
    );
  }
  if (result.type === "lost") return <LoseModal onRetry={actions.restart} onLevels={() => actions.go("/levels")} />;
  return <EndlessOverModal result={result} onRetry={actions.restart} onMenu={() => actions.go("/")} onBoard={() => actions.go("/leaderboard")} />;
};

export const GameOverlays = ({ phase, result, level, lo, muted, musicOn, actions }) => {
  const back = level ? "/levels" : "/";
  return (
    <>
      {phase === "intro" && (
        <IntroModal
          level={level}
          available={lo.available}
          selected={lo.loadout}
          onToggle={lo.toggle}
          onStart={actions.start}
          onBack={() => actions.go(back)}
        />
      )}
      {phase === "paused" && (
        <PauseModal
          muted={muted}
          onMute={actions.toggleMute}
          musicOn={musicOn}
          onMusic={actions.toggleMusic}
          onResume={actions.resume}
          onRestart={actions.restart}
          onQuit={() => actions.go(back)}
        />
      )}
      <ResultModal result={result} level={level} actions={actions} />
    </>
  );
};
