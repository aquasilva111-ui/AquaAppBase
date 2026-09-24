import { Link } from "@tanstack/react-router";
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { audioEngine } from "@/lib/aqua/audio-engine";
import { getProfile } from "@/lib/aqua/catalog";
import { currentTrack, usePlayer, type PlayerAnchor, type PlayContext } from "@/lib/aqua/player";
import type { Track } from "@/lib/aqua/tracks";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "Live";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** The circle. One surface, several states — idle, playing, buffering, live. */
export function AquaMediaOrb({
  size = 40,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onClick,
  dragging,
}: {
  size?: number;
  dragging?: boolean;
  onPointerDown?: (e: ReactPointerEvent) => void;
  onPointerMove?: (e: ReactPointerEvent) => void;
  onPointerUp?: (e: ReactPointerEvent) => void;
  onClick?: () => void;
}) {
  const status = usePlayer((s) => s.status);
  const track = usePlayer((s) => currentTrack(s));
  const ref = useRef<HTMLButtonElement>(null);
  const active = status === "playing" || status === "live";

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      ref.current?.style.setProperty("--level", audioEngine.level().toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    if (active) raf = requestAnimationFrame(loop);
    else ref.current?.style.setProperty("--level", "0");
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <button
      ref={ref}
      type="button"
      aria-label={track ? `${track.title} — ${active ? "playing" : status}` : "AQUA player"}
      data-active={active || undefined}
      data-buffering={status === "buffering" || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onClick}
      className={cn("aqua-orb", dragging && "cursor-grabbing")}
      style={{ width: size, height: size, ["--orb-hue" as string]: track?.hue ?? 215 }}
    >
      {track ? (
        <img src={track.cover} alt="" className="size-full rounded-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center rounded-full bg-foam text-nazar">
          <Play className="ml-0.5 size-4 fill-nazar" />
        </span>
      )}
      {status === "paused" && track && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/35">
          <Play className="ml-0.5 size-4 fill-white text-white" />
        </span>
      )}
      {status === "buffering" && <span className="aqua-orb-liquid" />}
      {status === "live" && (
        <span className="absolute -top-1 -right-1 rounded-full bg-destructive px-1.5 py-px text-[9px] font-bold tracking-wide text-white uppercase">
          Live
        </span>
      )}
    </button>
  );
}

/** Inline header slot — the orb's default home. */
export function PlayerSlot() {
  const anchor = usePlayer((s) => s.anchor);
  const floating = usePlayer((s) => s.floating);
  const drag = useOrbDrag();
  if (anchor !== "header" || floating) return null;
  return <AquaMediaOrb {...drag} />;
}

const ANCHOR_POINTS: Record<Exclude<PlayerAnchor, "floating">, (w: number, h: number) => { x: number; y: number }> = {
  header: (w) => ({ x: w - 240, y: 8 }),
  "top-left": () => ({ x: 16, y: 72 }),
  "top-right": (w) => ({ x: w - 64, y: 72 }),
  "bottom-left": (_w, h) => ({ x: 16, y: h - 104 }),
  "bottom-right": (w, h) => ({ x: w - 64, y: h - 104 }),
};

const ANCHOR_CLASS: Record<Exclude<PlayerAnchor, "floating" | "header">, string> = {
  "top-left": "top-[72px] left-4",
  "top-right": "top-[72px] right-4",
  "bottom-left": "bottom-24 lg:bottom-6 left-4",
  "bottom-right": "bottom-24 lg:bottom-6 right-4",
};

const PANEL_CLASS: Record<PlayerAnchor, string> = {
  header: "top-16 right-3 lg:top-20 lg:right-6",
  "top-left": "top-[124px] left-4",
  "top-right": "top-[124px] right-4",
  "bottom-left": "bottom-36 lg:bottom-20 left-4",
  "bottom-right": "bottom-36 lg:bottom-20 right-4",
  floating: "top-20 left-1/2 -translate-x-1/2",
};

function nearestAnchor(x: number, y: number): PlayerAnchor {
  const w = window.innerWidth;
  const h = window.innerHeight;
  let best: PlayerAnchor = "header";
  let bestDist = Infinity;
  for (const [anchor, at] of Object.entries(ANCHOR_POINTS) as [Exclude<PlayerAnchor, "floating">, (w: number, h: number) => { x: number; y: number }][]) {
    const p = at(w, h);
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = anchor;
    }
  }
  return best;
}

/**
 * Drag with snap: pointerdown arms the drag, window-level listeners track it
 * (so the orb can remount between header and dock layers mid-drag), and on
 * release it snaps to the nearest anchor. A plain click expands the player.
 */
function useOrbDrag() {
  const setAnchor = usePlayer((s) => s.setAnchor);
  const setFloating = usePlayer((s) => s.setFloating);
  const setExpanded = usePlayer((s) => s.setExpanded);
  const justDragged = useRef(false);

  const onPointerDown = (e: ReactPointerEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;
    const move = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 7) return;
      moved = true;
      setFloating({ x: ev.clientX - 20, y: ev.clientY - 20 });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      if (!moved) return;
      justDragged.current = true;
      window.setTimeout(() => {
        justDragged.current = false;
      }, 120);
      setAnchor(nearestAnchor(ev.clientX - 20, ev.clientY - 20));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  const onClick = () => {
    if (justDragged.current) return;
    setExpanded(!usePlayer.getState().expanded);
  };

  return { onPointerDown, onClick };
}

/** Fixed layer: orb while dragging or docked away from the header, plus the expanded panel. */
export function PlayerDock() {
  const anchor = usePlayer((s) => s.anchor);
  const floating = usePlayer((s) => s.floating);
  const expanded = usePlayer((s) => s.expanded);
  const setExpanded = usePlayer((s) => s.setExpanded);
  const drag = useOrbDrag();

  useMediaSession();

  const showOrb = Boolean(floating) || anchor !== "header";
  const dockClass =
    !floating && anchor !== "floating" && anchor !== "header" ? ANCHOR_CLASS[anchor] : "";

  return (
    <>
      {showOrb && (
        <div
          className={cn("fixed z-50", dockClass)}
          style={floating ? { left: floating.x, top: floating.y } : undefined}
        >
          <AquaMediaOrb dragging={Boolean(floating)} {...drag} />
        </div>
      )}
      {expanded && (
        <>
          <button
            type="button"
            aria-label="Close player"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setExpanded(false)}
          />
          <div className={cn("fixed z-50", PANEL_CLASS[anchor])}>
            <ExpandedPlayer />
          </div>
        </>
      )}
    </>
  );
}

function ExpandedPlayer() {
  const track = usePlayer((s) => currentTrack(s));
  const status = usePlayer((s) => s.status);
  const context = usePlayer((s) => s.context);
  const queue = usePlayer((s) => s.queue);
  const index = usePlayer((s) => s.index);
  const volume = usePlayer((s) => s.volume);
  const shuffle = usePlayer((s) => s.shuffle);
  const repeat = usePlayer((s) => s.repeat);
  const toggle = usePlayer((s) => s.toggle);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const close = usePlayer((s) => s.close);
  const seek = usePlayer((s) => s.seek);
  const setVolume = usePlayer((s) => s.setVolume);
  const setExpanded = usePlayer((s) => s.setExpanded);
  const toggleShuffle = usePlayer((s) => s.toggleShuffle);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);
  const [time, setTime] = useState(0);

  useEffect(() => audioEngine.onTime(setTime), []);

  if (!track) {
    return (
      <div className="glass-card w-[min(330px,calc(100vw-1.5rem))] p-4">
        <p className="text-sm text-muted-foreground">
          Nothing playing yet. Start a track from the feed, a profile, or the #Music rail.
        </p>
      </div>
    );
  }

  const artist = getProfile(track.artistId);
  const active = status === "playing" || status === "live";
  const finite = Number.isFinite(track.duration);
  const progress = finite ? Math.min(1, time / track.duration) : 1;

  return (
    <div className="glass-card w-[min(330px,calc(100vw-1.5rem))] p-4 shadow-[var(--shadow-float)]">
      <div className="flex items-start gap-3">
        <img src={track.cover} alt="" className="size-14 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{track.title}</p>
          {artist && (
            <Link
              to="/u/$username"
              params={{ username: artist.handle }}
              className="block truncate text-sm text-muted-foreground hover:text-nazar"
              onClick={() => setExpanded(false)}
            >
              {artist.name} · AQUA {track.kind === "music" ? "Music" : track.kind === "podcast" ? "Podcast" : "Radio"}
            </Link>
          )}
          {context && (
            <p className="mt-0.5 truncate text-xs text-nazar">
              Playing from {context.href ? (
                <Link to={context.href} onClick={() => setExpanded(false)}>{context.label}</Link>
              ) : (
                context.label
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="Stop and close"
          onClick={close}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-foam"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4">
        <input
          type="range"
          aria-label="Seek"
          min={0}
          max={finite ? track.duration : 1}
          step={0.1}
          value={finite ? time : 1}
          disabled={!finite}
          onChange={(e) => seek(Number(e.target.value))}
          className="aqua-seek w-full"
          style={{ ["--progress" as string]: `${progress * 100}%` }}
        />
        <div className="mt-1 flex justify-between text-xs tabular-nums text-muted-foreground">
          <span>{track.live ? "Ao vivo" : formatTime(time)}</span>
          <span>{formatTime(track.duration)}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1">
        <PlayerButton active={shuffle} label="Shuffle" onClick={toggleShuffle}>
          <Shuffle className="size-4" />
        </PlayerButton>
        <PlayerButton label="Previous" onClick={() => prev()}>
          <SkipBack className="size-5 fill-current" />
        </PlayerButton>
        <button
          type="button"
          aria-label={active ? "Pause" : "Play"}
          onClick={toggle}
          className="mx-1 flex size-12 items-center justify-center rounded-full bg-nazar text-primary-foreground shadow-[var(--shadow-glass)]"
        >
          {active ? (
            <Pause className="size-5 fill-current" />
          ) : (
            <Play className="ml-0.5 size-5 fill-current" />
          )}
        </button>
        <PlayerButton label="Next" onClick={() => next()}>
          <SkipForward className="size-5 fill-current" />
        </PlayerButton>
        <PlayerButton active={repeat !== "off"} label={`Repeat ${repeat}`} onClick={cycleRepeat}>
          {repeat === "one" ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
        </PlayerButton>
      </div>

      <div className="mt-3 flex items-center gap-2 text-muted-foreground">
        <Volume2 className="size-4 shrink-0" />
        <input
          type="range"
          aria-label="Volume"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="aqua-seek w-full"
          style={{ ["--progress" as string]: `${volume * 100}%` }}
        />
        <span className="w-8 text-right text-xs tabular-nums">
          {queue.length > 1 ? `${index + 1}/${queue.length}` : ""}
        </span>
      </div>
    </div>
  );
}

function PlayerButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-full hover:bg-foam",
        active ? "text-nazar" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** Compact row used inside posts, profiles and rails. */
export function TrackRow({ track, context }: { track: Track; context?: PlayContext }) {
  const isCurrent = usePlayer((s) => s.queue[s.index] === track.id);
  const status = usePlayer((s) => s.status);
  const play = usePlayer((s) => s.play);
  const toggle = usePlayer((s) => s.toggle);
  const artist = getProfile(track.artistId);
  const playingThis = isCurrent && (status === "playing" || status === "live");

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-foam p-2.5">
      <img src={track.cover} alt="" className="size-11 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {track.title}
          {track.live && (
            <span className="ml-2 rounded-full bg-destructive px-1.5 py-px text-[9px] font-bold tracking-wide text-white uppercase">
              Live
            </span>
          )}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {artist?.name} · {formatTime(track.duration)}
        </p>
      </div>
      <button
        type="button"
        aria-label={playingThis ? `Pause ${track.title}` : `Play ${track.title}`}
        onClick={() => {
          if (isCurrent) toggle();
          else play(track.id, { context });
        }}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-nazar text-primary-foreground"
      >
        {playingThis ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="ml-0.5 size-4 fill-current" />
        )}
      </button>
    </div>
  );
}

function useMediaSession() {
  const trackId = usePlayer((s) => s.queue[s.index]);
  const status = usePlayer((s) => s.status);
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const track = currentTrack(usePlayer.getState());
    if (track) {
      const artist = getProfile(track.artistId);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: artist?.name ?? "AQUA",
        album: "AQUA",
        artwork: [{ src: track.cover, sizes: "512x512", type: "image/jpeg" }],
      });
    }
    const s = usePlayer.getState();
    navigator.mediaSession.playbackState =
      status === "playing" || status === "live" ? "playing" : status === "paused" ? "paused" : "none";
    const on = (action: MediaSessionAction, handler: (() => void) | null) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        /* unsupported action */
      }
    };
    on("play", () => s.toggle());
    on("pause", () => s.toggle());
    on("previoustrack", () => s.prev());
    on("nexttrack", () => s.next());
  }, [trackId, status]);
}
