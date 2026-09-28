import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Moon, Swords, Trophy, Volume2, VolumeX } from "lucide-react";
import { A } from "../game/data";
import { loadProgress } from "../game/storage";
import { play, unlockAudio, isMuted, setMuted } from "../game/audio";
import { GameButton } from "../components/game/GameButton";

const ORBS = [
  { l: "8%", t: "70%", s: 18, d: "0s" }, { l: "30%", t: "20%", s: 12, d: "2s" }, { l: "46%", t: "80%", s: 22, d: "4s" },
  { l: "62%", t: "12%", s: 14, d: "1s" }, { l: "80%", t: "60%", s: 16, d: "3s" }, { l: "90%", t: "25%", s: 10, d: "5s" },
];

export default function MainMenu() {
  const navigate = useNavigate();
  const [muted, setM] = useState(isMuted());
  const p = loadProgress();
  const go = (path) => {
    unlockAudio();
    play("click");
    navigate(path);
  };
  const items = [
    { id: "btn-start-story", label: "Mode Cerita", icon: Swords, variant: "green", path: "/levels" },
    { id: "btn-start-endless", label: "Endless Night", icon: Moon, variant: "purple", path: "/endless" },
    { id: "btn-open-almanac", label: "Buku Kucing", icon: BookOpen, variant: "blue", path: "/almanac" },
    { id: "btn-open-leaderboard", label: "Papan Skor", icon: Trophy, variant: "amber", path: "/leaderboard" },
  ];
  return (
    <div className="menu-bg grain" style={{ backgroundImage: `url(${A("bg_menu")})` }} data-testid="main-menu">
      {ORBS.map((o, i) => (
        <span key={i} className="float-orb" style={{ left: o.l, top: o.t, width: o.s, height: o.s, animationDelay: o.d }} />
      ))}
      <div className="relative z-10 flex h-full flex-col justify-center gap-6 overflow-y-auto px-6 py-6 sm:px-12 lg:px-20">
        <img src={A("game_logo")} alt="Cat Versus Ghost" className="logo-bob reveal-up max-h-[34vh] w-[240px] object-contain object-left sm:w-[300px] lg:w-[380px]" data-testid="game-logo" />
        <p className="reveal-up max-w-md text-sm leading-relaxed text-indigo-100 sm:text-base" style={{ animationDelay: "0.1s" }}>
          Malam bulan purnama tiba. Para hantu keluar dari dunia roh untuk mencuri energi kehidupan. Pimpin pasukan kucing penjaga malam dan lindungi pintu rumah!
        </p>
        <div className="flex w-full max-w-xs flex-col gap-3">
          {items.map((it, i) => (
            <GameButton
              key={it.id}
              variant={it.variant}
              className="reveal-up justify-start text-lg sm:text-xl"
              style={{ animationDelay: `${0.18 + i * 0.08}s` }}
              onClick={() => go(it.path)}
              data-testid={it.id}
            >
              <it.icon size={24} /> {it.label}
            </GameButton>
          ))}
        </div>
        <div className="reveal-up flex flex-wrap items-center gap-3" style={{ animationDelay: "0.55s" }}>
          <button
            type="button"
            className="gbtn gbtn-icon gbtn-ghost"
            onClick={() => { setMuted(!muted); setM(!muted); }}
            data-testid="menu-mute-button"
            aria-label="Suara"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <span className="rounded-full border border-amber-400/40 bg-slate-950/90 px-4 py-2 text-sm text-amber-200 backdrop-blur-md" data-testid="menu-best-score">
            Rekor Endless: <b className="font-display">{p.bestEndless}</b>
          </span>
          <span className="rounded-full border border-emerald-400/40 bg-slate-950/90 px-4 py-2 text-sm text-emerald-200 backdrop-blur-md">
            Level terbuka: <b className="font-display">{Math.min(p.unlocked, 6)}/6</b>
          </span>
        </div>
      </div>
    </div>
  );
}
