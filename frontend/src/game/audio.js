import { loadProgress, saveProgress } from "./storage";

let ctx = null;
let master = null;
let muted = loadProgress().muted;
const last = {};

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone({ type = "sine", f0, f1, dur = 0.15, vol = 0.2, delay = 0 }) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.03);
}

function noise({ dur = 0.1, vol = 0.15, freq = 1200, q = 1, delay = 0, type = "bandpass" }) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + delay;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

const arp = (notes, step = 0.1, type = "triangle", vol = 0.18) =>
  notes.forEach((f, i) => tone({ type, f0: f, dur: step * 1.8, vol, delay: i * step }));

const SFX = {
  click: () => tone({ type: "triangle", f0: 660, f1: 880, dur: 0.07, vol: 0.12 }),
  select: () => tone({ type: "triangle", f0: 520, f1: 780, dur: 0.09, vol: 0.14 }),
  error: () => tone({ type: "square", f0: 220, f1: 160, dur: 0.14, vol: 0.08 }),
  orb: () => { tone({ f0: 880, f1: 1320, dur: 0.12, vol: 0.18 }); tone({ f0: 1320, f1: 1760, dur: 0.14, vol: 0.12, delay: 0.06 }); },
  produce: () => tone({ f0: 1200, f1: 1600, dur: 0.18, vol: 0.06 }),
  place: () => { noise({ dur: 0.08, vol: 0.2, freq: 300 }); tone({ type: "triangle", f0: 700, f1: 520, dur: 0.12, vol: 0.12, delay: 0.04 }); tone({ type: "triangle", f0: 520, f1: 900, dur: 0.16, vol: 0.12, delay: 0.14 }); },
  shovel: () => noise({ dur: 0.18, vol: 0.2, freq: 500, q: 0.6 }),
  claw: () => { noise({ dur: 0.09, vol: 0.18, freq: 3500, q: 0.8 }); tone({ type: "sawtooth", f0: 900, f1: 250, dur: 0.1, vol: 0.05 }); },
  laser: () => tone({ type: "sawtooth", f0: 1600, f1: 260, dur: 0.26, vol: 0.07 }),
  bubble: () => tone({ f0: 280, f1: 760, dur: 0.12, vol: 0.12 }),
  shuriken: () => tone({ type: "triangle", f0: 1500, f1: 900, dur: 0.1, vol: 0.08 }),
  spirit: () => { tone({ f0: 500, f1: 950, dur: 0.18, vol: 0.1 }); tone({ f0: 750, f1: 1400, dur: 0.18, vol: 0.06, delay: 0.03 }); },
  hit: () => noise({ dur: 0.05, vol: 0.12, freq: 900 }),
  poof: () => { tone({ f0: 620, f1: 120, dur: 0.28, vol: 0.12 }); noise({ dur: 0.2, vol: 0.1, freq: 1800, q: 0.5 }); },
  bite: () => tone({ type: "square", f0: 190, f1: 90, dur: 0.08, vol: 0.06 }),
  catDie: () => { tone({ type: "triangle", f0: 800, f1: 300, dur: 0.35, vol: 0.14 }); tone({ type: "triangle", f0: 500, f1: 200, dur: 0.4, vol: 0.1, delay: 0.1 }); },
  hurt: () => { tone({ type: "sawtooth", f0: 220, f1: 55, dur: 0.5, vol: 0.14 }); noise({ dur: 0.3, vol: 0.2, freq: 200 }); },
  shield: () => { noise({ dur: 0.2, vol: 0.22, freq: 2500, q: 2 }); tone({ type: "square", f0: 1100, f1: 400, dur: 0.18, vol: 0.06 }); },
  static: () => noise({ dur: 0.35, vol: 0.14, freq: 4000, q: 0.3, type: "highpass" }),
  heal: () => arp([660, 880], 0.07, "sine", 0.07),
  giggle: () => arp([900, 1100, 900, 1200], 0.06, "square", 0.04),
  dash: () => noise({ dur: 0.2, vol: 0.12, freq: 2200, q: 0.4 }),
  snack: () => { tone({ type: "triangle", f0: 700, f1: 500, dur: 0.12, vol: 0.12 }); tone({ type: "triangle", f0: 600, f1: 1000, dur: 0.18, vol: 0.12, delay: 0.12 }); },
  evolve: () => arp([523, 659, 784, 1047, 1319], 0.08, "triangle", 0.14),
  wave: () => { tone({ type: "sawtooth", f0: 220, f1: 330, dur: 0.5, vol: 0.06 }); tone({ type: "sawtooth", f0: 165, f1: 247, dur: 0.5, vol: 0.05 }); },
  night: () => arp([392, 311, 262, 196], 0.18, "sine", 0.12),
  day: () => arp([262, 330, 392, 523], 0.14, "sine", 0.12),
  boss: () => { tone({ type: "sawtooth", f0: 110, f1: 40, dur: 0.9, vol: 0.14 }); tone({ f0: 55, f1: 35, dur: 1.1, vol: 0.2 }); },
  bossDie: () => { noise({ dur: 0.8, vol: 0.25, freq: 400, q: 0.4 }); arp([392, 523, 659, 784, 1047], 0.12, "triangle", 0.16); },
  win: () => arp([523, 659, 784, 1047, 784, 1047, 1319], 0.12, "triangle", 0.16),
  lose: () => arp([392, 349, 311, 262, 196], 0.2, "sawtooth", 0.07),
};

export function play(name) {
  if (muted || !SFX[name]) return;
  const now = performance.now();
  if (last[name] && now - last[name] < 45) return;
  last[name] = now;
  try {
    SFX[name]();
  } catch {
    /* audio unavailable */
  }
}

export const unlockAudio = () => getCtx();
export const isMuted = () => muted;
export function setMuted(v) {
  muted = v;
  saveProgress({ muted: v });
}
