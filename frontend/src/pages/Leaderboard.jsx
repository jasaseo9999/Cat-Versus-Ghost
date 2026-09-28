import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Moon, Loader2, Crown } from "lucide-react";
import { fetchScores } from "../lib/api";
import { loadProgress } from "../game/storage";

const RANK_COLORS = ["#fde047", "#e2e8f0", "#fdba74"];

export default function Leaderboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);
  const p = loadProgress();

  useEffect(() => {
    fetchScores(20).then(setRows).catch(() => setError(true));
  }, []);

  return (
    <div className="scroll-page bg-[#0d0a26] px-4 py-5 sm:px-10" data-testid="leaderboard-page">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center gap-3">
          <button type="button" className="gbtn gbtn-ghost gbtn-icon" onClick={() => navigate("/")} data-testid="btn-back-home" aria-label="Kembali">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display flex-1 text-3xl sm:text-4xl">Papan Skor</h1>
          <button type="button" className="gbtn gbtn-purple" onClick={() => navigate("/endless")} data-testid="btn-play-endless">
            <Moon size={20} /> Main
          </button>
        </div>
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-indigo-950/80 p-4 text-sm text-indigo-100" data-testid="personal-best">
          <Trophy size={20} className="text-amber-300" /> Rekor pribadimu: <b className="font-display text-amber-300">{p.bestEndless}</b> (gelombang {p.bestWave})
        </div>
        <div className="panel overflow-hidden">
          {!rows && !error && (
            <div className="flex items-center justify-center gap-2 p-10 text-slate-400"><Loader2 className="animate-spin" /> Memuat...</div>
          )}
          {error && <div className="p-10 text-center text-rose-300" data-testid="leaderboard-error">Gagal memuat papan skor.</div>}
          {rows && rows.length === 0 && (
            <div className="p-10 text-center text-slate-400" data-testid="leaderboard-empty">Belum ada skor. Jadilah penjaga malam pertama!</div>
          )}
          {rows?.map((r, i) => (
            <div key={r.id} className="flex items-center gap-4 border-b border-white/5 px-5 py-3 last:border-0" data-testid={`leaderboard-row-${i}`}>
              <div className="font-display w-10 text-center text-2xl" style={{ color: RANK_COLORS[i] || "#94a3b8" }}>
                {i === 0 ? <Crown size={26} className="mx-auto" fill="#fde047" /> : r.rank}
              </div>
              <div className="flex-1">
                <div className="font-display text-lg">{r.name}</div>
                <div className="text-xs text-slate-400">Gelombang {r.wave} · {r.kills} hantu</div>
              </div>
              <div className="font-display text-2xl text-amber-300">{r.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
