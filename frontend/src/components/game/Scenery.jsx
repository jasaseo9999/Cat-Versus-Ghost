import { BG_LAYOUT } from "../../game/data";

const DARK_FILTER = "brightness(0.55) saturate(0.6) hue-rotate(20deg)";

const Fog = () => (
  <>
    <div className="fog-layer slow" style={{ top: 150, height: 250 }} />
    <div className="fog-layer" style={{ top: 380, height: 320 }} data-testid="fog-overlay" />
  </>
);

export const Scenery = ({ loc, phase, dark, flash }) => (
  <>
    <img src={loc.bg.night} alt="" className="bg-img" style={{ ...BG_LAYOUT, filter: dark ? DARK_FILTER : "none" }} data-testid="game-bg" data-location={loc.id} />
    <img src={loc.bg.day} alt="" className="bg-img" style={{ ...BG_LAYOUT, opacity: phase === "day" && !dark ? 1 : 0 }} />
    {loc.fog && <Fog />}
    {dark && <div className="darkmoon-overlay" style={{ zIndex: 110 }} data-testid="dark-moon-overlay" />}
    {flash && <div className="house-flash" />}
  </>
);
