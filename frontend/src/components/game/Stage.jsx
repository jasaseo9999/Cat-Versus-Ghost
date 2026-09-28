import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { STAGE_W, STAGE_H } from "../../game/data";

const useStageScale = () => {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, []);
  return scale;
};

export const Stage = ({ children }) => {
  const scale = useStageScale();
  return (
    <div className="stage-viewport" data-testid="game-stage-viewport" onContextMenu={(e) => e.preventDefault()}>
      <div className="stage" style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}>
        {children}
      </div>
      <div className="rotate-hint" data-testid="rotate-device-hint">
        <Smartphone size={64} className="text-amber-300" />
        <p className="font-display text-2xl text-amber-200">Putar layar ke landscape</p>
        <p className="text-sm text-slate-300">untuk pengalaman main terbaik</p>
      </div>
    </div>
  );
};
