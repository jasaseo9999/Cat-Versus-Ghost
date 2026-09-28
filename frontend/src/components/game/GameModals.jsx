import { useState } from "react";
import { Star, Trophy, Play, RotateCcw, Home, ListOrdered, Volume2, VolumeX, Loader2, Music, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CATS, GHOSTS, LEVELS, DECK_MAX, getLocation, levelLabel } from "../../game/data";
import { loadProgress, saveProgress } from "../../game/storage";
import { submitScore } from "../../lib/api";
import { GameButton } from "./GameButton";

export const GameModal = ({ testid, children }) => (
  <div className="gmodal-backdrop" data-testid={testid}>
    <div className="panel gmodal">{children}</div>
  </div>
);

const Intro = ({ img, label, name, desc, accent }) => (
  <div className="flex items-center gap-4 rounded-2xl border-2 border-white/10 bg-white/5 p-3">
    <img src={img} alt={name} className="card-sprite-bob h-20 w-20 object-contain" />
    <div>
      <div className={`text-xs font-bold uppercase tracking-wider ${accent}`}>{label}</div>
      <div className="font-display text-lg">{name}</div>
      <p className="text-sm leading-snug text-slate-300">{desc}</p>
    </div>
  </div>
);

const Loadout = ({ available, selected, onToggle }) => (
  <div data-testid="loadout-picker">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Pilih Pasukan</span>
      <span className="font-display text-sm text-slate-300" data-testid="loadout-count">{selected.length}/{Math.min(DECK_MAX, available.length)}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {available.map((id) => {
        const on = selected.includes(id);
        return (
          <button type="button" key={id} className={`loadout-chip ${on ? "on" : "off"}`} onClick={() => onToggle(id)} data-testid={`loadout-chip-${id}`} data-selected={on}>
            <img src={CATS[id].img} alt={CATS[id].name} />
            <span>{CATS[id].name.replace(" Cat", "")}</span>
            <span className="text-amber-300">{CATS[id].cost}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export const IntroModal = ({ level, onStart, onBack, available, selected, onToggle }) => (
  <GameModal testid="modal-level-intro">
    <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
      {level ? `${getLocation(level.loc).name} · Level ${levelLabel(level)}` : "Mode Tanpa Akhir"}
    </div>
    <h2 className="font-display mb-4 text-3xl text-white">{level ? level.name : "Endless Night"}</h2>
    <div className="space-y-3">
      {level?.newCat && <Intro img={CATS[level.newCat].img} label="Kucing Baru" name={CATS[level.newCat].name} desc={CATS[level.newCat].desc} accent="text-emerald-300" />}
      {level?.newGhost && <Intro img={GHOSTS[level.newGhost].img} label={level.boss ? "Boss" : "Hantu Baru"} name={GHOSTS[level.newGhost].name} desc={GHOSTS[level.newGhost].desc} accent="text-rose-300" />}
      <p className="rounded-xl bg-indigo-950/70 p-3 text-sm leading-relaxed text-indigo-100">
        {level ? level.tip : "Gelombang hantu tanpa akhir! Siang dan malam bergantian, Raja Hantu muncul setiap 8 gelombang. Kejar skor tertinggi dan masuk papan skor global."}
      </p>
      <Loadout available={available} selected={selected} onToggle={onToggle} />
    </div>
    <div className="mt-6 flex gap-3">
      <GameButton variant="green" className="flex-1 text-xl" onClick={onStart} disabled={!selected.length} data-testid="btn-level-start"><Play size={22} fill="#fff" /> Mulai!</GameButton>
      <GameButton variant="ghost" onClick={onBack} data-testid="btn-intro-back"><Home size={20} /></GameButton>
    </div>
  </GameModal>
);

export const PauseModal = ({ onResume, onRestart, onQuit, muted, onMute, musicOn, onMusic }) => (
  <GameModal testid="modal-pause">
    <h2 className="font-display mb-5 text-center text-4xl">Jeda</h2>
    <div className="flex flex-col gap-3">
      <GameButton variant="green" className="text-xl" onClick={onResume} data-testid="btn-resume"><Play size={22} fill="#fff" /> Lanjutkan</GameButton>
      <GameButton variant="amber" onClick={onRestart} data-testid="btn-restart"><RotateCcw size={20} /> Ulangi Level</GameButton>
      <div className="flex gap-3">
        <GameButton variant="blue" className="flex-1" onClick={onMute} data-testid="btn-toggle-sound">{muted ? <VolumeX size={20} /> : <Volume2 size={20} />} Suara: {muted ? "Mati" : "Nyala"}</GameButton>
        <GameButton variant="blue" className="flex-1" onClick={onMusic} data-testid="btn-toggle-music"><Music size={20} /> Musik: {musicOn ? "Nyala" : "Mati"}</GameButton>
      </div>
      <GameButton variant="red" onClick={onQuit} data-testid="btn-quit"><Home size={20} /> Keluar</GameButton>
    </div>
  </GameModal>
);

const WIN_TEXT = {
  6: "King Phantom Catnapper kabur ke Kuburan Tua! Kejar dia di lokasi berikutnya.",
  12: "Kuburan Tua aman! Raja hantu melarikan diri lagi... lokasi berikutnya segera hadir.",
};

export const WinModal = ({ level, stars, kills, newCat, onNext, onRetry, onLevels }) => {
  const hasNext = LEVELS.some((l) => l.num === level.num + 1);
  return (
    <GameModal testid="modal-level-win">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Level {levelLabel(level)} selesai</div>
        <h2 className="font-display text-4xl text-amber-300">Halaman Aman!</h2>
        <div className="my-4 flex justify-center gap-2" data-testid="win-stars" data-stars={stars}>
          {[0, 1, 2].map((i) => (
            <Star key={i} size={54} className={i < stars ? "text-amber-300" : "text-slate-600"} fill={i < stars ? "#fcd34d" : "transparent"} style={{ animation: `starPop 0.5s ${0.2 + i * 0.15}s both` }} />
          ))}
        </div>
        <p className="text-slate-300">{kills} hantu diusir. {WIN_TEXT[level.num] || "Para kucing penjaga siap untuk malam berikutnya."}</p>
        <p className="mt-1 text-xs text-amber-200/80">Bintang bisa dipakai di Bengkel Kucing untuk upgrade permanen.</p>
      </div>
      {newCat && (
        <div className="mt-4 flex items-center gap-4 rounded-2xl border-2 border-amber-400 bg-amber-500/10 p-3" data-testid="win-new-cat">
          <img src={CATS[newCat].img} alt={CATS[newCat].name} className="card-sprite-bob h-20 w-20 object-contain" />
          <div>
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-300"><Sparkles size={14} /> Kucing Koleksi Terbuka!</div>
            <div className="font-display text-xl">{CATS[newCat].name}</div>
            <p className="text-sm text-slate-300">{CATS[newCat].role} — bisa dipilih di Pasukan mulai sekarang.</p>
          </div>
        </div>
      )}
      <div className="mt-6 flex gap-3">
        {hasNext && <GameButton variant="green" className="flex-1" onClick={onNext} data-testid="btn-next-level"><Play size={20} fill="#fff" /> Level Berikutnya</GameButton>}
        <GameButton variant="amber" className={hasNext ? "" : "flex-1"} onClick={onRetry} data-testid="btn-retry"><RotateCcw size={20} /> {hasNext ? "" : "Ulangi"}</GameButton>
        <GameButton variant="purple" className={hasNext ? "" : "flex-1"} onClick={onLevels} data-testid="btn-back-levels"><Home size={20} /> {hasNext ? "" : "Pilih Level"}</GameButton>
      </div>
    </GameModal>
  );
};

export const LoseModal = ({ onRetry, onLevels }) => (
  <GameModal testid="modal-level-lose">
    <div className="text-center">
      <h2 className="font-display text-4xl text-rose-300">Hantu Masuk Rumah!</h2>
      <p className="mt-3 text-slate-300">Energi kehidupan rumah dicuri. Atur ulang pasukan kucingmu dan coba lagi!</p>
    </div>
    <div className="mt-6 flex gap-3">
      <GameButton variant="green" className="flex-1" onClick={onRetry} data-testid="btn-retry"><RotateCcw size={20} /> Coba Lagi</GameButton>
      <GameButton variant="purple" onClick={onLevels} data-testid="btn-back-levels"><Home size={20} /> Pilih Level</GameButton>
    </div>
  </GameModal>
);

export const EndlessOverModal = ({ result, onRetry, onMenu, onBoard }) => {
  const [name, setName] = useState(loadProgress().name || "");
  const [sending, setSending] = useState(false);
  const [rank, setRank] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSending(true);
    try {
      const res = await submitScore({ name: name.trim().slice(0, 16), score: result.score, wave: result.wave, kills: result.kills });
      saveProgress({ name: name.trim().slice(0, 16) });
      setRank(res.rank);
      toast.success(`Skor terkirim! Peringkat #${res.rank}`);
    } catch {
      toast.error("Gagal mengirim skor. Coba lagi.");
    } finally {
      setSending(false);
    }
  };
  return (
    <GameModal testid="modal-leaderboard">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Endless Night berakhir</div>
        <h2 className="font-display text-5xl text-amber-300" data-testid="endless-final-score">{result.score}</h2>
        <p className="mt-1 text-slate-300">Gelombang {result.wave} · {result.kills} hantu · Rekor: {result.best}</p>
      </div>
      {rank ? (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-emerald-900/50 p-3 font-display text-xl text-emerald-200" data-testid="leaderboard-rank">
          <Trophy size={24} /> Peringkat Global #{rank}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 flex gap-2">
          <input
            data-testid="leaderboard-name-input"
            value={name}
            maxLength={16}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama penjaga..."
            className="flex-1 rounded-xl border-2 border-amber-400/60 bg-slate-950/70 px-4 py-3 text-lg text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
          />
          <GameButton variant="amber" type="submit" disabled={sending || !name.trim()} data-testid="leaderboard-submit-button">
            {sending ? <Loader2 size={20} className="animate-spin" /> : <Trophy size={20} />} Kirim
          </GameButton>
        </form>
      )}
      <div className="mt-5 flex gap-3">
        <GameButton variant="green" className="flex-1" onClick={onRetry} data-testid="btn-retry"><RotateCcw size={20} /> Main Lagi</GameButton>
        <GameButton variant="blue" onClick={onBoard} data-testid="btn-view-leaderboard"><ListOrdered size={20} /></GameButton>
        <GameButton variant="purple" onClick={onMenu} data-testid="btn-back-menu"><Home size={20} /></GameButton>
      </div>
    </GameModal>
  );
};
