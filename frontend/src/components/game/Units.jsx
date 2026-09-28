import { Heart, PawPrint, Zap, Star } from "lucide-react";
import { BOARD, CATS, GHOSTS, A } from "../../game/data";
import { moodOf } from "../../game/engine";

export const px = (x) => BOARD.x + x * BOARD.cw;
export const feetY = (row) => BOARD.y + (row + 1) * BOARD.rh - 8;
export const centerY = (y) => BOARD.y + (y + 0.5) * BOARD.rh;

const MOOD_LABEL = { happy: "^^", angry: "!!", sleepy: "Zz", possessed: "??" };

const HpBar = ({ pct, kind, shieldPct = 0 }) => (
  <div className={`hpbar ${kind}`}>
    <i style={{ width: `${Math.max(0, pct) * 100}%` }} />
    {shieldPct > 0 && <span className="shield" style={{ width: `${shieldPct * 100}%` }} />}
  </div>
);

export const CatUnit = ({ c, t }) => {
  const mood = moodOf(c, t);
  const stunned = t < c.stunUntil;
  const cls = [
    "unit cat-unit", `cm-${mood}`, `evo-${c.evo}`,
    t < c.hitUntil && "is-hit", t < c.attackUntil && "is-attack", stunned && "is-stunned", t - c.placedAt < 0.5 && "placed",
  ].filter(Boolean).join(" ");
  return (
    <div
      data-testid={`cat-unit-${c.row}-${c.col}`}
      data-mood={mood}
      data-evo={c.evo}
      className={cls}
      style={{ left: px(c.col + 0.5), top: feetY(c.row), zIndex: 20 + c.row * 10 }}
    >
      <div className="unit-shadow" />
      <img src={CATS[c.type].img} alt={CATS[c.type].name} className="sprite" draggable={false} />
      {c.hp < c.maxHp && <HpBar pct={c.hp / c.maxHp} kind="cat" />}
      {mood !== "normal" && (
        <div className={`mood-bubble mood-${mood}`} data-testid={`cat-mood-${c.row}-${c.col}`}>{MOOD_LABEL[mood]}</div>
      )}
      {c.evo > 0 && (
        <div className="evo-badge">
          {Array.from({ length: c.evo }).map((_, i) => <Star key={i} size={9} fill="#fde047" color="#fde047" />)}
        </div>
      )}
      {stunned && <Zap size={18} className="stun-icon" fill="#fde047" />}
    </div>
  );
};

export const GhostUnit = ({ g, t }) => {
  const G = GHOSTS[g.type];
  const invisible = G.invisible;
  const size = G.size;
  const img = g.type === "shield" && g.shield <= 0 ? A("ghost_basic") : G.img;
  const cls = [
    "unit ghost-unit",
    t < g.hitUntil && "is-hit", t < g.slowUntil && "is-slowed", g.eating && "is-eating", t < g.leapUntil && "is-leap",
    g.enraged && "is-enraged", t < g.stunUntil && "is-stunned", t < (g.castUntil || 0) && "is-casting",
    t - g.born < 0.8 && "enter", invisible && (g.revealed ? "revealed-ghost" : "hidden-ghost"),
  ].filter(Boolean).join(" ");
  const row = g.type === "boss" ? 3 : g.row;
  return (
    <div
      data-testid={`ghost-unit-${g.id}`}
      data-ghost-type={g.type}
      className={cls}
      style={{ left: px(g.x), top: feetY(row) + (g.type === "boss" ? 6 : 0), width: size, height: size, zIndex: 25 + row * 10 }}
    >
      {!invisible && <div className="unit-shadow" />}
      <img src={img} alt={G.name} className="sprite" style={{ width: size, height: size }} draggable={false} />
      {g.type !== "boss" && (g.hp < g.maxHp || g.shield < g.maxShield) && (!invisible || g.revealed) && (
        <HpBar pct={g.hp / g.maxHp} kind="ghost" shieldPct={g.maxShield ? g.shield / g.maxShield : 0} />
      )}
    </div>
  );
};

const Shuriken = () => (
  <svg viewBox="0 0 24 24" className="proj-shuriken">
    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="2.4" fill="#334155" />
  </svg>
);

export const Projectile = ({ p }) => {
  const k = Math.min(1, (p.x - p.xs) / 0.9);
  const y = p.y0 + (p.row - p.y0) * k;
  return (
    <div className="proj" style={{ left: px(p.x), top: centerY(y) - 6, zIndex: 100 }} data-testid={`projectile-${p.kind}`}>
      {p.kind === "bubble" && <div className="proj-bubble" />}
      {p.kind === "shuriken" && <Shuriken />}
      {p.kind === "spirit" && <div className="proj-spirit"><PawPrint size={18} /></div>}
    </div>
  );
};

export const Beam = ({ b }) => (
  <div
    className={`beam beam-${b.kind}`}
    style={{ left: px(b.x0), width: px(b.x1) - px(b.x0), top: centerY(b.row) - 8, zIndex: 99 }}
  />
);

export const Orb = ({ o, t, onCollect }) => (
  <button
    type="button"
    data-testid={`moon-orb-${o.id}`}
    className={`orb ${o.kind} ${o.expire - t < 2.5 ? "expiring" : ""}`}
    style={{ left: px(o.x), top: centerY(o.y) }}
    onPointerDown={(e) => {
      e.stopPropagation();
      onCollect(o.id);
    }}
    aria-label="Kumpulkan Moonlight"
  >
    <img src={A("moon_orb")} alt="" draggable={false} />
  </button>
);

export const Fx = ({ f }) => {
  const style = { left: px(f.x), top: centerY(f.y) - 10 };
  switch (f.kind) {
    case "text":
      return <div className={`fx fx-text ${f.cls || ""}`} style={style}>{f.text}</div>;
    case "orbText":
      return <div className="fx fx-orbText" style={style}>{f.text}</div>;
    case "poof":
      return <div className={`fx fx-poof ${f.big ? "big" : ""}`} style={{ ...style, top: f.big ? centerY(2) : style.top }} />;
    case "slash":
      return <div className="fx fx-slash" style={style}><i /><i /><i /></div>;
    case "heal":
      return <div className="fx fx-heal" style={style}>+</div>;
    case "heart":
      return <div className="fx fx-heart" style={style}><Heart size={30} fill="#f472b6" /></div>;
    case "evolve":
      return (
        <>
          <div className="fx fx-evolve" style={style} />
          <div className="fx fx-evolve-text" style={{ ...style, top: style.top - 40 }}>{f.text}</div>
        </>
      );
    default:
      return <div className={`fx fx-${f.kind}`} style={style} />;
  }
};
