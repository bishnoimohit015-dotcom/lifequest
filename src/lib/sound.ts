/** Tiny WebAudio feedback blips. No assets, fails silently anywhere the
 *  AudioContext API is unavailable. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, startAt: number, duration: number, gainValue = 0.05) {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t0 = c.currentTime + startAt;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(gainValue, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  } catch {
    // ignore
  }
}

export const sounds = {
  complete() {
    tone(660, 0, 0.09);
  },
  undo() {
    tone(392, 0, 0.08, 0.035);
  },
  levelUp() {
    tone(523.25, 0, 0.12);
    tone(783.99, 0.11, 0.18);
  },
  achievement() {
    tone(659.25, 0, 0.1);
    tone(880, 0.09, 0.16);
  },
};
