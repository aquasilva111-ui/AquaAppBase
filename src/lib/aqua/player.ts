import { create } from "zustand";
import { persist } from "zustand/middleware";
import { audioEngine } from "./audio-engine";
import { useAqua } from "./store";
import { getTrack, type Track } from "./tracks";

/**
 * Global playback session. Lives in the app shell, not in any page — the
 * queue survives navigation between Social, Books, Marketplace, Studio…
 * Only durable prefs are persisted; playback position is session-only.
 */

export type PlayerStatus = "idle" | "buffering" | "playing" | "paused" | "live" | "error";

export type PlayerAnchor =
  | "header"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "floating";

export interface PlayContext {
  label: string;
  href?: string;
}

interface PlayerState {
  status: PlayerStatus;
  queue: string[];
  index: number;
  expanded: boolean;
  anchor: PlayerAnchor;
  floating: { x: number; y: number } | null;
  volume: number;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  context: PlayContext | null;
  play: (trackId: string, opts?: { queue?: string[]; context?: PlayContext | null }) => void;
  toggle: () => void;
  next: (opts?: { auto?: boolean }) => void;
  prev: () => void;
  close: () => void;
  seek: (t: number) => void;
  setExpanded: (open: boolean) => void;
  setAnchor: (anchor: PlayerAnchor) => void;
  setFloating: (pos: { x: number; y: number } | null) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

function trackEvent(type: "play" | "pause" | "skip" | "complete", trackId: string) {
  useAqua.getState().track({ type, entityType: "track", entityId: trackId });
}

export const usePlayer = create<PlayerState>()(
  persist(
    (set, get) => ({
      status: "idle",
      queue: [],
      index: 0,
      expanded: false,
      anchor: "header",
      floating: null,
      volume: 0.8,
      shuffle: false,
      repeat: "off",
      context: null,

      play: (trackId, opts) => {
        const track = getTrack(trackId);
        if (!track) return;
        const queue = opts?.queue ?? get().queue;
        const inQueue = queue.includes(trackId);
        const nextQueue = opts?.queue ? queue : inQueue ? queue : [trackId];
        const index = Math.max(0, nextQueue.indexOf(trackId));
        set({
          queue: nextQueue,
          index,
          status: "buffering",
          context: opts?.context === undefined ? get().context : opts.context,
        });
        audioEngine.setVolume(get().volume);
        audioEngine.start(track);
        trackEvent("play", trackId);
        const gen = trackId;
        window.setTimeout(() => {
          const s = get();
          if (s.queue[s.index] === gen && s.status === "buffering") {
            set({ status: track.live ? "live" : "playing" });
          }
        }, 550);
      },

      toggle: () => {
        const s = get();
        const track = getTrack(s.queue[s.index]);
        if (s.status === "playing" || s.status === "live" || s.status === "buffering") {
          audioEngine.pause();
          if (track) trackEvent("pause", track.id);
          set({ status: "paused" });
          return;
        }
        if (track) {
          audioEngine.resume();
          set({ status: track.live ? "live" : "playing" });
          if (s.status !== "paused") trackEvent("play", track.id);
          return;
        }
        const first = getTrack("t-midnight");
        if (first) get().play(first.id, { queue: ["t-midnight"], context: { label: "AQUA Music", href: "/feed/music" } });
      },

      next: (opts) => {
        const s = get();
        const track = getTrack(s.queue[s.index]);
        if (opts?.auto && s.repeat === "one" && track) {
          audioEngine.seek(0);
          if (s.status === "paused") {
            audioEngine.resume();
            set({ status: track.live ? "live" : "playing" });
          }
          return;
        }
        if (opts?.auto && track) trackEvent("complete", track.id);
        if (s.queue.length === 0) return;
        let nextIndex: number;
        if (s.shuffle && s.queue.length > 1) {
          do {
            nextIndex = Math.floor(Math.random() * s.queue.length);
          } while (nextIndex === s.index);
        } else {
          nextIndex = s.index + 1;
        }
        if (nextIndex >= s.queue.length) {
          if (s.repeat === "all" || !opts?.auto) {
            nextIndex = 0;
          } else {
            audioEngine.stop();
            set({ status: "idle", expanded: false });
            return;
          }
        }
        const nextTrack = getTrack(s.queue[nextIndex]);
        if (!nextTrack) return;
        if (track) trackEvent("skip", track.id);
        get().play(nextTrack.id, { queue: s.queue });
      },

      prev: () => {
        const s = get();
        if (audioEngine.position() > 3) {
          audioEngine.seek(0);
          return;
        }
        const prevIndex = (s.index - 1 + s.queue.length) % s.queue.length;
        const prevTrack = getTrack(s.queue[prevIndex]);
        if (prevTrack) get().play(prevTrack.id, { queue: s.queue });
      },

      close: () => {
        audioEngine.stop();
        set({ status: "idle", expanded: false });
      },

      seek: (t) => audioEngine.seek(t),
      setExpanded: (expanded) => set({ expanded }),
      setAnchor: (anchor) => set({ anchor, ...(anchor !== "floating" ? { floating: null } : {}) }),
      setFloating: (floating) => set({ floating }),
      setVolume: (v) => {
        audioEngine.setVolume(v);
        set({ volume: v });
      },
      toggleShuffle: () => set({ shuffle: !get().shuffle }),
      cycleRepeat: () =>
        set({ repeat: get().repeat === "off" ? "all" : get().repeat === "all" ? "one" : "off" }),
    }),
    {
      name: "aqua-player-v1",
      partialize: (s) => ({
        queue: s.queue,
        index: s.index,
        anchor: s.anchor,
        volume: s.volume,
        shuffle: s.shuffle,
        repeat: s.repeat,
        context: s.context,
      }),
    },
  ),
);

export function currentTrack(
  s: Pick<PlayerState, "queue" | "index">,
): Track | undefined {
  return getTrack(s.queue[s.index]);
}

if (typeof window !== "undefined") {
  audioEngine.onEnd(() => usePlayer.getState().next({ auto: true }));
}
