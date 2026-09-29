import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Star, ArrowUpCircle, RotateCcw, Crown } from "lucide-react";
import { toast } from "sonner";
import { ALL_CATS, CATS, UPG_MAX, UPG_COST, UPG_DMG, UPG_HP, UPG_PROD, getLevel, levelLabel, ENDLESS_STAR_WAVES } from "../game/data";
import { loadProgress, starBalance, upgradeCat, resetUpgrades, isCatUnlocked } from "../game/storage";
import { play } from "../game/audio";
import { GameButton } from "../components/game/GameButton";

const pct = (v) => `+${Math.round(v * 100)}%`;
const PIPS = Array.from({ length: UPG_MAX }, (_, i) => i + 1);

const bonusText = (id, lv) =>
  id === "solar" ? `${pct(UPG_PROD * lv)} produksi · ${pct(UPG_HP * lv)} HP` : `${pct(UPG_DMG * lv)} damage · ${pct(UPG_HP * lv)} HP`;

const UpgradeCard = ({ id, lv, locked, canAfford, onUpgrade }) => {
  const C = CATS[id];
  const maxed = lv >= UPG_MAX;
  return (
    <div className={`panel flex flex-col gap-3 p-4 ${locked ? "opacity-75" : ""}`} style={{ borderColor: locked ? "#475569" : C.color }} data-testid={`upgrade-card-${id}`}>
      <div className="flex items-center gap-3">
        <img src={C.img} alt={C.name} className={`h-20 w-20 object-contain ${locked ? "grayscale" : "card-sprite-bob"}`} />
        <div className="flex-1">
          <div className="font-display text-lg leading-tight">{C.name}</div>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.color }}>{C.role}</div>
          <div className="mt-2 flex gap-2" data-testid={`upgrade-level-${id}`} data-level={lv}>
            {PIPS.map((n) => <span key={`pip-${n}`} className={`upg-pip ${n <= lv ? "on" : ""}`} />)}
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-black/30 px-3 py-2 text-sm">
        <div className="text-slate-400">Sekarang: <b className="text-white">{lv ? bonusText(id, lv) : "belum ada bonus"}</b></div>
        {!maxed && <div className="text-slate-400">Berikutnya: <b className="text-emerald-300">{bonusText(id, lv + 1)}</b></div>}
      </div>
      {locked ? (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-slate-400">
          <Lock size={16} /> Selesaikan Level {levelLabel(getLevel(C.unlock))}
        </div>
      ) : (
        <GameButton variant={maxed ? "ghost" : "amber"} disabled={maxed || !canAfford} onClick={onUpgrade} data-testid={`upgrade-btn-${id}`}>
          {maxed ? <><Crown size={18} /> Level Maks</> : <><ArrowUpCircle size={18} /> Upgrade <Star size={16} fill="#3b1d05" /> {UPG_COST[lv]}</>}
        </GameButton>
      )}
    </div>
  );
};

export default function Upgrades() {
  const navigate = useNavigate();
  const [p, setP] = useState(loadProgress());
  const [confirm, setConfirm] = useState(false);
  const bal = starBalance(p);

  const doUpgrade = (id) => {
    const next = upgradeCat(id);
    if (!next) { play("error"); return; }
    play("evolve");
    setP(next);
    toast.success(`${CATS[id].name} naik ke level ${next.upgrades[id]}!`);
  };
  const doReset = () => {
    if (!confirm) { setConfirm(true); return; }
    play("shovel");
    setP(resetUpgrades());
    setConfirm(false);
    toast("Semua bintang dikembalikan.");
  };

  return (
    <div className="scroll-page bg-[#0d0a26] px-4 py-5 sm:px-10" data-testid="upgrades-page">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button type="button" className="gbtn gbtn-ghost gbtn-icon" onClick={() => navigate("/")} data-testid="btn-back-home" aria-label="Kembali">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display flex-1 text-3xl sm:text-4xl">Bengkel Kucing</h1>
          <div className="flex items-center gap-2 rounded-full border-2 border-amber-400 bg-indigo-950 px-5 py-2 font-display text-xl text-amber-300" data-testid="star-balance" data-available={bal.available}>
            <Star size={20} fill="#fcd34d" /> {bal.available}
            <span className="text-sm text-slate-400">/ {bal.total}</span>
          </div>
        </div>
        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-indigo-950/70 p-4 text-sm text-indigo-100 sm:flex-row sm:items-center">
          <p className="flex-1">
            Upgrade permanen untuk kucing favoritmu. Bintang didapat dari level cerita (<b>{bal.level}</b>) dan Endless Night — 1 bintang tiap {ENDLESS_STAR_WAVES} gelombang terbaik (<b>{bal.endless}</b>).
          </p>
          <GameButton variant={confirm ? "red" : "ghost"} className="text-sm" onClick={doReset} disabled={!bal.spent} data-testid="btn-reset-upgrades">
            <RotateCcw size={16} /> {confirm ? "Yakin? Klik lagi" : "Reset Upgrade"}
          </GameButton>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_CATS.map((id) => {
            const lv = p.upgrades[id] || 0;
            return (
              <UpgradeCard
                key={id}
                id={id}
                lv={lv}
                locked={!isCatUnlocked(id, p)}
                canAfford={lv < UPG_MAX && bal.available >= UPG_COST[lv]}
                onUpgrade={() => doUpgrade(id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
