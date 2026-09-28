import { A, CATS, SNACK_COST } from "../../game/data";
import { cardState } from "../../game/engine";

const CARD_BG = {
  solar: "linear-gradient(180deg,#fcd34d,#d97706)",
  claw: "linear-gradient(180deg,#fb7185,#be123c)",
  bubble: "linear-gradient(180deg,#7dd3fc,#2563eb)",
  laser: "linear-gradient(180deg,#e879f9,#7e22ce)",
  ninja: "linear-gradient(180deg,#818cf8,#312e81)",
  hunter: "linear-gradient(180deg,#5eead4,#047857)",
  samurai: "linear-gradient(180deg,#f87171,#7f1d1d)",
  wizard: "linear-gradient(180deg,#a78bfa,#4c1d95)",
  detective: "linear-gradient(180deg,#fdba74,#9a3412)",
  vampire: "linear-gradient(180deg,#fb7185,#4c0519)",
  robot: "linear-gradient(180deg,#67e8f9,#155e75)",
};

const CatCard = ({ type, index, s, selected, onSelect }) => {
  const C = CATS[type];
  const st = cardState(s, type);
  return (
    <button
      type="button"
      data-testid={`card-cat-${type}`}
      data-affordable={st.affordable}
      data-ready={st.ready}
      className={`cat-card ${selected ? "selected" : ""} ${!st.affordable || !st.ready ? "poor" : ""}`}
      style={{ background: CARD_BG[type] }}
      onPointerDown={(e) => {
        e.preventDefault();
        onSelect(type);
      }}
      title={`${C.name} — ${C.role}`}
    >
      <span className="key-hint">{index + 1}</span>
      <span className="card-name">{C.name.replace(" Cat", "")}</span>
      <img src={C.img} alt={C.name} draggable={false} />
      <span className="card-cost"><img src={A("moon_orb")} alt="" style={{ width: 16, height: 16, margin: 0 }} />{C.cost}</span>
      {st.cdPct > 0 && <span className="cd-overlay" style={{ height: `${st.cdPct * 100}%` }} />}
    </button>
  );
};

const ToolButton = ({ testid, img, label, selected, onClick }) => (
  <button
    type="button"
    data-testid={testid}
    className={`tool-btn ${selected ? "selected" : ""}`}
    onPointerDown={(e) => {
      e.preventDefault();
      onClick();
    }}
  >
    <img src={img} alt={label} draggable={false} />
    <span>{label}</span>
  </button>
);

const HINTS = {
  cat: (t) => `Pilih petak kosong untuk menempatkan ${CATS[t].name}`,
  shovel: () => "Pilih kucing yang ingin dipindahkan dari halaman",
  snack: () => `Beri snack ke kucing (${SNACK_COST} Moonlight): mood Happy & bebas dari Possession`,
};

export const CardDeck = ({ s, tool, onSelectCat, onTool }) => (
  <>
    {tool && (
      <div className="absolute left-3 top-[122px] rounded-full bg-slate-950/85 px-4 py-1 text-sm font-semibold text-amber-100 shadow-lg" style={{ zIndex: 141 }} data-testid="tool-hint">
        {HINTS[tool.kind](tool.type)} · <span className="text-slate-400">Esc / klik kanan untuk batal</span>
      </div>
    )}
    <div className="deck" style={{ top: 6, left: 8 }} data-testid="card-deck">
      <div className="flex w-[86px] flex-col items-center justify-center rounded-2xl bg-slate-950/70 px-1" data-testid="hud-moonlight-counter">
        <img src={A("moon_orb")} alt="" className="h-12 w-12" style={{ filter: "drop-shadow(0 0 10px #fde047)" }} />
        <div className="font-display text-2xl leading-none text-amber-300" data-testid="hud-moonlight-value">{s.moonlight}</div>
        <div className="text-[9px] font-semibold uppercase tracking-wider text-amber-200/70">Moonlight</div>
      </div>
      {s.cards.map((type, i) => (
        <CatCard key={type} type={type} index={i} s={s} selected={tool?.kind === "cat" && tool.type === type} onSelect={onSelectCat} />
      ))}
      <div className="mx-1 h-20 w-[3px] self-center rounded bg-amber-500/40" />
      <ToolButton testid="tool-snack" img={A("snack_fish")} label={`Snack ${SNACK_COST}`} selected={tool?.kind === "snack"} onClick={() => onTool("snack")} />
      <ToolButton testid="tool-shovel" img={A("shovel_paw")} label="Sekop" selected={tool?.kind === "shovel"} onClick={() => onTool("shovel")} />
    </div>
  </>
);
