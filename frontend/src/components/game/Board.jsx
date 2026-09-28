import { memo } from "react";
import { BOARD, ROWS, COLS, CATS } from "../../game/data";
import { CatUnit, GhostUnit, Projectile, Beam, Orb, Fx, px, feetY } from "./Units";

const Tiles = memo(({ active, hover, hoverClass, onTile, onHover }) => {
  const tiles = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const isHover = hover && hover[0] === r && hover[1] === c;
      tiles.push(
        <div
          key={`${r}-${c}`}
          data-testid={`grid-tile-${r}-${c}`}
          className={`tile ${isHover ? hoverClass : ""}`}
          style={{ left: BOARD.x + c * BOARD.cw + 2, top: BOARD.y + r * BOARD.rh + 2, width: BOARD.cw - 4, height: BOARD.rh - 4 }}
          onPointerDown={(e) => {
            e.preventDefault();
            onTile(r, c);
          }}
          onPointerEnter={() => onHover([r, c])}
        />,
      );
    }
  }
  return (
    <div className={active ? "tiles-active" : ""} onPointerLeave={() => onHover(null)} style={{ position: "absolute", inset: 0, zIndex: 5 }}>
      {tiles}
    </div>
  );
});
Tiles.displayName = "Tiles";

const Preview = ({ type, r, c }) => (
  <div className="unit cat-unit" style={{ left: px(c + 0.5), top: feetY(r), zIndex: 19, opacity: 0.5 }}>
    <img src={CATS[type].img} alt="" className="sprite" style={{ animation: "none" }} />
  </div>
);

export const Board = ({ s, tool, hover, onTile, onHover, onOrb }) => {
  let hoverClass = "";
  const occupied = hover && s.grid[hover[0]][hover[1]];
  if (tool && hover) {
    if (tool.kind === "cat") hoverClass = occupied ? "hover-bad" : "hover-ok";
    else hoverClass = occupied ? "hover-target" : "hover-bad";
  }
  return (
    <>
      <Tiles active={!!tool} hover={hover} hoverClass={hoverClass} onTile={onTile} onHover={onHover} />
      {tool?.kind === "cat" && hover && !occupied && <Preview type={tool.type} r={hover[0]} c={hover[1]} />}
      {s.beams.map((b) => <Beam key={b.id} b={b} />)}
      {s.cats.map((c) => <CatUnit key={c.id} c={c} t={s.t} />)}
      {s.ghosts.map((g) => <GhostUnit key={g.id} g={g} t={s.t} />)}
      {s.projectiles.map((p) => <Projectile key={p.id} p={p} />)}
      {s.fx.map((f) => <Fx key={f.id} f={f} />)}
      {s.orbs.map((o) => <Orb key={o.id} o={o} t={s.t} onCollect={onOrb} />)}
    </>
  );
};
