import { Heart, Pause, Sun, Moon, Volume2, VolumeX, FastForward, Skull, Crown, Ghost } from "lucide-react";
import { START_LIVES, GHOSTS } from "../../game/data";
import { getBoss, waveProgress } from "../../game/engine";

const WaveBar = ({ s }) => {
  const endless = s.mode === "endless";
  const pct = waveProgress(s);
  const label = endless
    ? `Endless Night · Gelombang ${Math.max(1, s.endlessWave)}`
    : s.wave < 0 ? "Bersiap..." : `Gelombang ${s.wave + 1}/${s.totalWaves}`;
  return (
    <div className="hud-pill absolute bottom-2 right-3 w-[400px] px-4 pb-2.5 pt-1" data-testid="hud-wave-progress" style={{ zIndex: 145 }}>
      <div className="mb-1 flex items-center justify-between">
        <span className="font-display text-base text-white" data-testid="hud-wave-label">{label}</span>
        {endless ? (
          <span className="font-display text-base text-amber-300" data-testid="hud-score">Skor {s.score}</span>
        ) : (
          <span className="text-xs font-semibold text-slate-300">{s.level.num}. {s.level.name}</span>
        )}
      </div>
      {!endless && (
        <div className="wave-track">
          <div className="wave-fill" style={{ width: `${pct * 100}%` }} />
          {s.waveMarks.slice(1).map((m, i) => (
            <span key={i} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${m.at * 100}%` }}>
              {m.boss ? <Crown size={18} className="text-fuchsia-300" fill="#a855f7" /> : m.big ? <Skull size={16} className="text-rose-300" /> : <span className="block h-3 w-1 rounded bg-white/60" />}
            </span>
          ))}
          <Ghost size={20} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" style={{ left: `${pct * 100}%` }} fill="#e0e7ff" />
        </div>
      )}
    </div>
  );
};

const BossBar = ({ boss }) => (
  <div className="hud-pill absolute bottom-2 left-3 flex w-[440px] items-center gap-3 border-fuchsia-500 px-3 py-1.5" data-testid="boss-health-bar" style={{ zIndex: 145 }}>
    <img src={GHOSTS.boss.img} alt="" className="h-11 w-11 rounded-full border-2 border-fuchsia-400 bg-purple-950 object-contain p-0.5" />
    <div className="flex-1">
      <div className="font-display text-sm text-fuchsia-200" style={{ textShadow: "0 2px 0 #3b0764" }}>King Phantom Catnapper</div>
      <div className="boss-track"><div className="boss-fill" style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }} /></div>
    </div>
  </div>
);

export const Hud = ({ s, onPause, speed, onSpeed, muted, onMute }) => {
  const boss = getBoss(s);
  const dark = s.t < s.darkMoonUntil;
  const night = s.phase === "night";
  return (
    <>
      <WaveBar s={s} />
      {boss && <BossBar boss={boss} />}
      <div className="absolute right-3 top-3 flex items-center gap-2" style={{ zIndex: 145 }}>
        <div
          className={`hud-pill flex items-center gap-1.5 px-3 py-2 ${dark ? "border-fuchsia-500" : ""}`}
          data-testid="hud-day-night-indicator"
          data-phase={s.phase}
        >
          {night ? <Moon size={20} className="text-indigo-200" fill="#c7d2fe" /> : <Sun size={20} className="text-amber-300" />}
          <span className="font-display text-sm">{dark ? "Dark Moon" : night ? "Malam" : "Siang"}</span>
        </div>
        <div className="hud-pill flex items-center gap-1 px-3 py-2" data-testid="hud-lives" data-lives={s.lives}>
          {Array.from({ length: START_LIVES }).map((_, i) => (
            <Heart key={i} size={20} className={i < s.lives ? "text-rose-500" : "text-slate-600"} fill={i < s.lives ? "#f43f5e" : "transparent"} />
          ))}
        </div>
        <button type="button" className={`gbtn gbtn-icon ${speed > 1 ? "gbtn-amber" : "gbtn-ghost"}`} onClick={onSpeed} data-testid="hud-speed-button" aria-label="Kecepatan">
          <FastForward size={20} />
        </button>
        <button type="button" className="gbtn gbtn-icon gbtn-ghost" onClick={onMute} data-testid="hud-mute-button" aria-label="Suara">
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button type="button" className="gbtn gbtn-icon gbtn-purple" onClick={onPause} data-testid="hud-pause-button" aria-label="Jeda">
          <Pause size={20} fill="#fff" />
        </button>
      </div>
    </>
  );
};

export const Banner = ({ banner }) =>
  banner ? (
    <div key={banner.id} className={`banner ${banner.kind}`} data-testid="game-banner">{banner.text}</div>
  ) : null;
