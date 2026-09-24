import type { Track } from "./tracks";

/**
 * AQUA audio engine — Web Audio generative core.
 *
 * The study ships no audio files, so each track is synthesized from its id:
 * a slow detuned pad plus a pentatonic pluck pattern, scheduled with a
 * lookahead loop. The same AudioContext feeds an AnalyserNode, which is
 * what the media orb visualizes. Live tracks simply never reach their end.
 */

const LOOKAHEAD_MS = 120;
const SCHEDULE_AHEAD_S = 0.35;

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CHORDS: number[][] = [
  [0, 3, 7, 10],
  [-2, 2, 5, 8],
  [-4, 0, 3, 7],
  [-5, -1, 2, 5],
];
const PLUCK_SCALE = [0, 3, 5, 7, 10, 12, 15];

class GenerativeEngine {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;
  private timer: number | null = null;
  private raf = 0;
  private generation = 0;
  private rng: () => number = Math.random;
  private baseFreq = 196;
  private startedAt = 0;
  private offset = 0;
  private nextChordAt = 0;
  private nextNoteAt = 0;
  private chordStep = 0;
  private playing = false;
  private track: Track | null = null;
  private volume = 0.8;
  private timeSubs = new Set<(t: number) => void>();
  private endSubs = new Set<() => void>();

  private ensure(): AudioContext {
    if (!this.ac) {
      this.ac = new AudioContext();
      this.master = this.ac.createGain();
      this.master.gain.value = this.volume;
      this.analyser = this.ac.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.82;
      this.master.connect(this.analyser);
      this.analyser.connect(this.ac.destination);
    }
    if (this.ac.state === "suspended") void this.ac.resume();
    return this.ac;
  }

  get current(): Track | null {
    return this.track;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  start(track: Track, offset = 0) {
    const ac = this.ensure();
    this.stopScheduling();
    this.track = track;
    this.rng = mulberry32(hashSeed(track.id));
    this.baseFreq = 164.81 * Math.pow(2, (track.hue % 12) / 12);
    this.offset = offset;
    this.startedAt = ac.currentTime;
    this.chordStep = 0;
    this.nextChordAt = ac.currentTime + 0.05;
    this.nextNoteAt = ac.currentTime + 0.4;
    this.playing = true;
    const gen = ++this.generation;
    this.master!.gain.cancelScheduledValues(ac.currentTime);
    this.master!.gain.setTargetAtTime(this.volume, ac.currentTime, 0.12);
    this.timer = window.setInterval(() => {
      if (gen === this.generation) this.schedule();
    }, LOOKAHEAD_MS);
    this.schedule();
    this.tick(gen);
  }

  pause() {
    if (!this.playing || !this.ac) return;
    this.offset = this.position();
    this.playing = false;
    this.generation++;
    this.stopScheduling();
    this.master!.gain.setTargetAtTime(0, this.ac.currentTime, 0.08);
  }

  resume() {
    if (this.track) this.start(this.track, this.offset);
  }

  stop() {
    this.playing = false;
    this.generation++;
    this.stopScheduling();
    if (this.ac && this.master) {
      this.master.gain.setTargetAtTime(0, this.ac.currentTime, 0.06);
    }
    this.track = null;
    this.offset = 0;
  }

  seek(t: number) {
    if (!this.track || !Number.isFinite(this.track.duration)) return;
    const clamped = Math.max(0, Math.min(t, this.track.duration));
    if (this.playing) this.start(this.track, clamped);
    else this.offset = clamped;
  }

  position(): number {
    if (!this.track) return 0;
    if (!this.playing || !this.ac) return this.offset;
    const pos = this.offset + this.ac.currentTime - this.startedAt;
    return Number.isFinite(this.track.duration) ? Math.min(pos, this.track.duration) : pos;
  }

  /** average spectrum energy 0..1 — drives the orb */
  level(): number {
    if (!this.analyser || !this.playing) return 0;
    if (!this.freqData) this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(this.freqData);
    let sum = 0;
    for (const v of this.freqData) sum += v;
    return sum / this.freqData.length / 255;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.ac && this.master && this.playing) {
      this.master.gain.setTargetAtTime(v, this.ac.currentTime, 0.05);
    }
  }

  onTime(cb: (t: number) => void): () => void {
    this.timeSubs.add(cb);
    return () => this.timeSubs.delete(cb);
  }

  onEnd(cb: () => void): () => void {
    this.endSubs.add(cb);
    return () => this.endSubs.delete(cb);
  }

  private stopScheduling() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  private tick(gen: number) {
    const loop = () => {
      if (gen !== this.generation) return;
      const pos = this.position();
      for (const cb of this.timeSubs) cb(pos);
      if (this.track && Number.isFinite(this.track.duration) && pos >= this.track.duration) {
        this.pause();
        for (const cb of this.endSubs) cb();
        return;
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private schedule() {
    const ac = this.ac!;
    const ahead = ac.currentTime + SCHEDULE_AHEAD_S;
    while (this.nextChordAt < ahead) {
      this.pad(this.nextChordAt);
      this.nextChordAt += 4;
    }
    while (this.nextNoteAt < ahead) {
      if (this.rng() > 0.35) this.pluck(this.nextNoteAt);
      this.nextNoteAt += 0.5;
    }
  }

  private pad(when: number) {
    const ac = this.ac!;
    const degrees = CHORDS[this.chordStep % CHORDS.length];
    this.chordStep++;
    for (const d of degrees) {
      const freq = this.baseFreq * Math.pow(2, d / 12);
      for (const detune of [-4, 3]) {
        const osc = ac.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const g = ac.createGain();
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(0.045, when + 1.2);
        g.gain.setTargetAtTime(0, when + 3.1, 0.5);
        osc.connect(g).connect(this.master!);
        osc.start(when);
        osc.stop(when + 4.6);
      }
    }
  }

  private pluck(when: number) {
    const ac = this.ac!;
    const d = PLUCK_SCALE[Math.floor(this.rng() * PLUCK_SCALE.length)];
    const freq = this.baseFreq * 2 * Math.pow(2, d / 12);
    const osc = ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1600 + this.rng() * 1400;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.07 + this.rng() * 0.04, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.9);
    osc.connect(filter).connect(g).connect(this.master!);
    osc.start(when);
    osc.stop(when + 1);
  }
}

export const audioEngine = new GenerativeEngine();
