import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Star, Crown } from "lucide-react";
import { A, LEVELS, LOCATIONS, CATS, GHOSTS, levelLabel } from "../game/data";
import { loadProgress } from "../game/storage";
import { play } from "../game/audio";

const LevelNode = ({ level, unlocked, stars, onPlay }) => (
  <button
    type="button"
    disabled={!unlocked}
    onClick={onPlay}
    data-testid={`level-node-${level.num}`}
    className={`level-node relative flex w-full flex-col items-center gap-1 rounded-2xl border-[3px] p-3 text-center ${
      unlocked ? "border-amber-400 bg-indigo-950/85 shadow-[0_6px_0_rgba(0,0,0,0.4)]" : "cursor-not-allowed border-slate-600 bg-slate-900/80 opacity-70"
    }`}
  >
    <div className={`font-display flex h-12 w-12 items-center justify-center rounded-full text-lg ${level.boss ? "bg-fuchsia-600" : "bg-amber-400 text-indigo-950"}`}>
      {!unlocked ? <Lock size={20} /> : level.boss ? <Crown size={24} /> : levelLabel(level)}
    </div>
    <div className="font-display text-sm leading-tight text-white">{level.name}</div>
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star key={i} size={14} className={i < stars ? "text-amber-300" : "text-slate-600"} fill={i < stars ? "#fcd34d" : "transparent"} />
      ))}
    </div>
    {unlocked && (
      <img src={level.newCat ? CATS[level.newCat].img : GHOSTS[level.newGhost].img} alt="" className="card-sprite-bob absolute -right-2 -top-4 h-10 w-10 object-contain" />
    )}
  </button>
);

export default function LevelSelect() {
  const navigate = useNavigate();
  const p = loadProgress();
  const totalStars = Object.values(p.stars).reduce((a, b) => a + b, 0);
  const open = LOCATIONS.filter((l) => l.open);
  const soon = LOCATIONS.filter((l) => !l.open);
  return (
    <div className="scroll-page bg-[#0d0a26] px-4 py-5 sm:px-10" data-testid="level-select-page">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button type="button" className="gbtn gbtn-ghost gbtn-icon" onClick={() => navigate("/")} data-testid="btn-back-home" aria-label="Kembali">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display flex-1 text-3xl sm:text-4xl">Mode Cerita</h1>
          <div className="flex items-center gap-2 rounded-full bg-indigo-950 px-4 py-2 font-display text-amber-300" data-testid="total-stars">
            <Star size={18} fill="#fcd34d" /> {totalStars}/{LEVELS.length * 3}
          </div>
        </div>

        <div className="space-y-6">
          {open.map((loc) => {
            const levels = LEVELS.filter((l) => l.loc === loc.id);
            const locked = levels[0].num > p.unlocked;
            return (
              <section key={loc.id} className={`relative overflow-hidden rounded-3xl border-[3px] ${locked ? "border-slate-600" : "border-amber-400/80"}`} data-testid={`location-card-${loc.id}`} data-locked={locked}>
                <img src={loc.img} alt={loc.name} className={`absolute inset-0 h-full w-full object-cover ${locked ? "grayscale-[60%]" : ""}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a26]/95 via-[#0d0a26]/60 to-[#0d0a26]/20" />
                <div className="relative p-5 sm:p-8">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Lokasi {loc.id}</div>
                  <h2 className="font-display mb-1 text-2xl sm:text-3xl">{loc.name}</h2>
                  <p className="mb-5 text-sm text-slate-300">
                    {locked ? "Kalahkan Raja Hantu di level 1-6 untuk membuka lokasi ini." : loc.fog ? "Kuburan berkabut penuh hantu khas: Pocong, Tuyul, Kuntilanak & Hantu Nisan." : "Halaman rumah tempat para kucing penjaga pertama kali berjaga."}
                  </p>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {levels.map((lv) => (
                      <LevelNode
                        key={lv.num}
                        level={lv}
                        unlocked={lv.num <= p.unlocked}
                        stars={p.stars[lv.num] || 0}
                        onPlay={() => { play("click"); navigate(`/play/${lv.num}`); }}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <h3 className="font-display mb-3 mt-8 text-xl text-indigo-200">Lokasi Berikutnya</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {soon.map((loc) => (
            <div key={loc.id} className="relative overflow-hidden rounded-2xl border-2 border-slate-700" data-testid={`location-card-${loc.id}`}>
              <img src={loc.img} alt={loc.name} className="h-32 w-full object-cover opacity-60 grayscale-[40%] sm:h-40" />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#0d0a26] via-[#0d0a26]/40 to-transparent p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Lokasi {loc.id}</div>
                <div className="font-display text-base">{loc.name}</div>
              </div>
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-bold text-amber-200">
                <Lock size={12} /> Segera Hadir
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
          <img src={A("moon_orb")} alt="" className="h-6 w-6" /> Selesaikan level untuk membuka level berikutnya. Bintang = sisa nyawa rumah.
        </div>
      </div>
    </div>
  );
}
