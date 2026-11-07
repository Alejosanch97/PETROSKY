// Sonidos chiptune generados con Web Audio (sin archivos ni librerías)
let ac = null;
let muted = false;

function audio() {
  if (!ac) {
    const A = window.AudioContext || window.webkitAudioContext;
    if (A) ac = new A();
  }
  if (ac && ac.state === "suspended") ac.resume();
  return ac;
}

function tone(freq, dur, type = "square", vol = 0.06, slide = 0, delay = 0) {
  if (muted) return;
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  start: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, "square", 0.05, 0, i * 0.08)),
  capture: (combo = 1) => {
    tone(600 + combo * 90, 0.08, "square", 0.06);
    tone(900 + combo * 90, 0.1, "square", 0.05, 0, 0.06);
  },
  power: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.1, "triangle", 0.07, 0, i * 0.05)),
  bonus: () => tone(1100, 0.18, "triangle", 0.07, 500),
  defuse: () => tone(300, 0.2, "square", 0.05, 600),
  turn: () => tone(220, 0.03, "square", 0.015),
  die: () => {
    tone(420, 0.5, "sawtooth", 0.07, -360);
    tone(200, 0.6, "square", 0.05, -150, 0.12);
  },
};

export const setMuted = (m) => {
  muted = m;
};
