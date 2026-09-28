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
  katana: () => { noise({ dur: 0.14, vol: 0.2, freq: 5000, q: 0.7 }); tone({ type: "triangle", f0: 2200, f1: 900, dur: 0.16, vol: 0.06 }); },
  magic: () => { arp([988, 1319, 1568], 0.05, "sine", 0.08); noise({ dur: 0.3, vol: 0.08, freq: 3000, q: 0.5, delay: 0.1 }); },
  drain: () => tone({ type: "sine", f0: 300, f1: 180, dur: 0.22, vol: 0.08 }),
  glass: () => tone({ type: "sine", f0: 1760, f1: 2100, dur: 0.1, vol: 0.05 }),
  rocket: () => { noise({ dur: 0.25, vol: 0.14, freq: 700, q: 0.4 }); tone({ type: "sawtooth", f0: 300, f1: 900, dur: 0.18, vol: 0.04 }); },
  scream: () => { tone({ type: "sawtooth", f0: 1200, f1: 1800, dur: 0.5, vol: 0.05 }); tone({ type: "sine", f0: 1250, f1: 1700, dur: 0.55, vol: 0.06, delay: 0.03 }); },
  steal: () => arp([880, 660], 0.06, "square", 0.05),
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
  if (v) music.stop();
}

/* ===== Procedural background music ===== */
let musicGain = null;
let musicOn = !loadProgress().musicMuted;
const mus = { timer: null, step: 0, next: 0, mood: "calm" };
const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);

function mnote(n, t, dur, { type = "sine", vol = 0.05, attack = 0.02, release = 0.25, cutoff } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(hz(n), t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.setValueAtTime(vol, t + Math.max(attack, dur - release));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o;
  if (cutoff) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = cutoff;
    o.connect(f);
    node = f;
  }
  node.connect(g).connect(musicGain);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function mhit(t, dur, vol, freq, type) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(musicGain);
  src.start(t);
}

function kick(t) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.16);
  g.gain.setValueAtTime(0.22, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(g).connect(musicGain);
  o.start(t);
  o.stop(t + 0.22);
}

const CALM = {
  bpm: 74,
  chords: [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]],
  masks: [[1, 0, 1, 1, 0, 1, 1, 0], [1, 1, 0, 1, 0, 0, 1, 1]],
  play(step, t, sd) {
    const bar = Math.floor(step / 8) % this.chords.length;
    const c = this.chords[bar];
    const i = step % 8;
    if (i === 0) {
      c.forEach((n) => mnote(n, t, sd * 8, { type: "triangle", vol: 0.018, attack: 0.9, release: 1 }));
      mnote(c[0] - 12, t, sd * 8, { vol: 0.05, attack: 0.3, release: 0.8 });
    }
    const mel = [c[0] + 12, c[2] + 12, c[1] + 12, c[2] + 12, c[0] + 24, c[2] + 12, c[1] + 12, c[2]];
    if (this.masks[Math.floor(step / 8) % 2][i]) mnote(mel[i], t, sd * 2.2, { type: "sine", vol: 0.035, attack: 0.005, release: sd * 2 });
  },
};

const BOSS = {
  bpm: 138,
  chords: [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]],
  play(step, t, sd) {
    const bar = Math.floor(step / 8) % this.chords.length;
    const c = this.chords[bar];
    const i = step % 8;
    mnote(c[0] - 24 + (i % 2 ? 12 : 0), t, sd * 0.9, { type: "sawtooth", vol: 0.05, attack: 0.005, release: 0.08, cutoff: 700 });
    if (i % 2 === 0) kick(t);
    if (i === 2 || i === 6) mhit(t, 0.12, 0.09, 1800, "bandpass");
    mhit(t, 0.04, 0.025, 7000, "highpass");
    if (i === 0 || i === 3 || i === 6) c.forEach((n) => mnote(n + 12, t, sd * 0.8, { type: "square", vol: 0.012, attack: 0.005, release: 0.1, cutoff: 2200 }));
    if (i === 0) c.forEach((n) => mnote(n, t, sd * 8, { type: "sawtooth", vol: 0.008, attack: 0.4, release: 0.5, cutoff: 1200 }));
  },
};

function tick() {
  const cfg = mus.mood === "boss" ? BOSS : CALM;
  const sd = 60 / cfg.bpm / 2;
  while (mus.next < ctx.currentTime + 0.15) {
    cfg.play(mus.step, mus.next, sd);
    mus.next += sd;
    mus.step += 1;
  }
}

export const music = {
  start() {
    const c = getCtx();
    if (!c || mus.timer || !musicOn || muted) return;
    if (!musicGain) {
      musicGain = c.createGain();
      musicGain.connect(master);
    }
    musicGain.gain.cancelScheduledValues(c.currentTime);
    musicGain.gain.setValueAtTime(0.0001, c.currentTime);
    musicGain.gain.exponentialRampToValueAtTime(0.9, c.currentTime + 1.5);
    mus.next = c.currentTime + 0.1;
    mus.step = 0;
    mus.timer = setInterval(tick, 40);
  },
  stop() {
    if (!mus.timer) return;
    clearInterval(mus.timer);
    mus.timer = null;
    const now = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), now);
    musicGain.gain.linearRampToValueAtTime(0.0001, now + 0.4);
  },
  setMood(m) {
    if (mus.mood === m) return;
    mus.mood = m;
    mus.step = 0;
  },
  getMood: () => mus.mood,
  isPlaying: () => !!mus.timer,
  isOn: () => musicOn,
  setOn(v) {
    musicOn = v;
    saveProgress({ musicMuted: !v });
    if (!v) music.stop();
  },
};
