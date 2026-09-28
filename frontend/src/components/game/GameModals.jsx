import { useState } from "react";
import { Star, Trophy, Play, RotateCcw, Home, ListOrdered, Volume2, VolumeX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CATS, GHOSTS, LEVELS } from "../../game/data";
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

export const IntroModal = ({ level, onStart, onBack }) => (
  <GameModal testid="modal-level-intro">
    <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
      {level ? `Rumah Pinggir Kota · Level ${level.num}` : "Mode Tanpa Akhir"}
    </div>
    <h2 className="font-display mb-4 text-3xl text-white">{level ? level.name : "Endless Night"}</h2>
    <div className="space-y-3">
      {level?.newCat && <Intro img={CATS[level.newCat].img} label="Kucing Baru" name={CATS[level.newCat].name} desc={CATS[level.newCat].desc} accent="text-emerald-300" />}
      {level?.newGhost && <Intro img={GHOSTS[level.newGhost].img} label={level.boss ? "Boss" : "Hantu Baru"} name={GHOSTS[level.newGhost].name} desc={GHOSTS[level.newGhost].desc} accent="text-rose-300" />}
      <p className="rounded-xl bg-indigo-950/70 p-3 text-sm leading-relaxed text-indigo-100">
        {level ? level.tip : "Gelombang hantu tanpa akhir! Siang dan malam bergantian, Raja Hantu muncul setiap 8 gelombang. Kejar skor tertinggi dan masuk papan skor global."}
      </p>
    </div>
    <div className="mt-6 flex gap-3">
      <GameButton variant="green" className="flex-1 text-xl" onClick={onStart} data-testid="btn-level-start"><Play size={22} fill="#fff" /> Mulai!</GameButton>
      <GameButton variant="ghost" onClick={onBack} data-testid="btn-intro-back"><Home size={20} /></GameButton>
    </div>
  </GameModal>
);

export const PauseModal = ({ onResume, onRestart, onQuit, muted, onMute }) => (
  <GameModal testid="modal-pause">
    <h2 className="font-display mb-5 text-center text-4xl">Jeda</h2>
    <div className="flex flex-col gap-3">
      <GameButton variant="green" className="text-xl" onClick={onResume} data-testid="btn-resume"><Play size={22} fill="#fff" /> Lanjutkan</GameButton>
      <GameButton variant="amber" onClick={onRestart} data-testid="btn-restart"><RotateCcw size={20} /> Ulangi Level</GameButton>
      <GameButton variant="blue" onClick={onMute} data-testid="btn-toggle-sound">{muted ? <VolumeX size={20} /> : <Volume2 size={20} />} Suara: {muted ? "Mati" : "Nyala"}</GameButton>
      <GameButton variant="red" onClick={onQuit} data-testid="btn-quit"><Home size={20} /> Keluar</GameButton>
    </div>
  </GameModal>
);

export const WinModal = ({ level, stars, kills, onNext, onRetry, onLevels }) => {
  const hasNext = LEVELS.some((l) => l.num === level.num + 1);
  return (
    <GameModal testid="modal-level-win">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Level {level.num} selesai</div>
        <h2 className="font-display text-4xl text-amber-300">Halaman Aman!</h2>
        <div className="my-4 flex justify-center gap-2" data-testid="win-stars" data-stars={stars}>
          {[0, 1, 2].map((i) => (
            <Star key={i} size={54} className={i < stars ? "text-amber-300" : "text-slate-600"} fill={i < stars ? "#fcd34d" : "transparent"} style={{ animation: `starPop 0.5s ${0.2 + i * 0.15}s both` }} />
          ))}
        </div>
        <p className="text-slate-300">{kills} hantu diusir. {level.boss ? "King Phantom Catnapper kabur ke Kuburan Tua... lokasi berikutnya segera hadir!" : "Para kucing penjaga siap untuk malam berikutnya."}</p>
      </div>
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
