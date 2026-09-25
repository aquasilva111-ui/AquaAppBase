import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Heart, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyNote, PageTitle } from "@/components/aqua/shell";
import type { AquaContentObject } from "@/lib/aqua/content/types";
import { ORIGIN_LABEL } from "@/lib/aqua/sources/registry";
import { useAqua } from "@/lib/aqua/store";
import { cn } from "@/lib/utils";

/**
 * Video & Shorts — two experience lenses over the SAME federated video
 * objects (§4, §24, §34). The objects come from the open network via the
 * ActivityPub gateway; nothing is copied into AQUA and every card points
 * back to its canonical origin. Local likes are AQUA-side relations, never
 * sent to the remote network (§35).
 */

const VIDEO_SOURCE = "blender@video.blender.org";

function useFederatedVideos() {
  const [state, setState] = useState<{
    loading: boolean;
    error: boolean;
    videos: AquaContentObject[];
  }>({ loading: true, error: false, videos: [] });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/fed/ap?acct=${encodeURIComponent(VIDEO_SOURCE)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? String(res.status));
        if (!cancelled) {
          setState({
            loading: false,
            error: false,
            videos: (data.objects as AquaContentObject[]).filter(
              (o) => o.type === "VIDEO" && o.media?.some((m) => m.type === "video"),
            ),
          });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: true, videos: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

function formatDuration(seconds: number | undefined): string | null {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}:${String(s).padStart(2, "0")}`;
}

function videoUrl(o: AquaContentObject): string | undefined {
  return o.media?.find((m) => m.type === "video")?.url;
}

function ModeToggle({ current }: { current: "video" | "shorts" }) {
  return (
    <div className="mb-4 flex gap-1">
      {(
        [
          { id: "video", label: "Video", to: "/videos" },
          { id: "shorts", label: "Shorts", to: "/shorts" },
        ] as const
      ).map((m) => (
        <Link
          key={m.id}
          to={m.to}
          className={cn(
            "inline-flex h-9 items-center rounded-full px-3.5 text-sm",
            current === m.id
              ? "bg-nazar text-primary-foreground"
              : "bg-card text-foreground shadow-[var(--shadow-border)]",
          )}
        >
          {m.label}
        </Link>
      ))}
    </div>
  );
}

export function VideoModePage() {
  const { loading, error, videos } = useFederatedVideos();
  return (
    <div>
      <PageTitle
        kicker="Watch"
        title="Video"
        body={`Deliberate watching. These objects live on the open network — played here, owned there. Source: ${VIDEO_SOURCE} via ActivityPub.`}
      />
      <ModeToggle current="video" />
      {loading && <EmptyNote>Fetching videos from the fediverse…</EmptyNote>}
      {error && (
        <EmptyNote>The video source is unreachable right now. AQUA keeps working.</EmptyNote>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {videos.map((v) => (
          <VideoCard key={v.id} object={v} />
        ))}
      </div>
    </div>
  );
}

function VideoCard({ object }: { object: AquaContentObject }) {
  const src = videoUrl(object);
  const poster = object.sourceMetadata?.poster as string | undefined;
  const duration = formatDuration(object.sourceMetadata?.durationSeconds as number | undefined);
  return (
    <article className="glass-card overflow-hidden">
      <div className="relative">
        <video
          src={src}
          poster={poster}
          controls
          preload="none"
          playsInline
          className="aspect-video w-full bg-foreground/5 object-cover"
        />
        {duration && (
          <span className="absolute right-2 bottom-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
            {duration}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold leading-snug">
              {(object.sourceMetadata?.title as string) ?? object.text ?? "Untitled"}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {object.author.displayName ?? object.author.handle} · @{object.author.host}
            </p>
          </div>
          <Badge tone="quiet">via {ORIGIN_LABEL[object.origin]}</Badge>
        </div>
        <a
          href={object.canonicalUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-nazar hover:underline"
        >
          Open at origin <ArrowUpRight className="size-3" />
        </a>
      </div>
    </article>
  );
}

export function ShortsModePage() {
  const { loading, error, videos } = useFederatedVideos();
  return (
    <div>
      <PageTitle
        kicker="Watch"
        title="Shorts"
        body={`Continuous vertical watching — the same objects as Video mode, another lens. Source: ${VIDEO_SOURCE} via ActivityPub.`}
      />
      <ModeToggle current="shorts" />
      {loading && <EmptyNote>Fetching videos from the fediverse…</EmptyNote>}
      {error && (
        <EmptyNote>The video source is unreachable right now. AQUA keeps working.</EmptyNote>
      )}
      {videos.length > 0 && (
        <div className="h-[68dvh] snap-y snap-mandatory space-y-3 overflow-y-auto rounded-[1.35rem]">
          {videos.map((v) => (
            <ShortSlide key={v.id} object={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShortSlide({ object }: { object: AquaContentObject }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const liked = useAqua((s) => Boolean(s.liked[object.id]));
  const toggleLike = useAqua((s) => s.toggleLike);
  const src = videoUrl(object);
  const poster = object.sourceMetadata?.poster as string | undefined;
  const duration = formatDuration(object.sourceMetadata?.durationSeconds as number | undefined);

  // Autoplay while on screen, pause when it leaves the viewport (§SHORTS).
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void el.play().catch(() => setPlaying(false));
        } else {
          el.pause();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-full w-full snap-start overflow-hidden rounded-[1.35rem] bg-foreground/5">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        muted={muted}
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={() => {
          const el = videoRef.current;
          if (!el) return;
          if (el.paused) void el.play();
          else el.pause();
        }}
        className="absolute inset-0 size-full object-contain"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {(object.sourceMetadata?.title as string) ?? "Untitled"}
            </p>
            <p className="truncate text-xs text-white/75">
              @{object.author.handle} · via {ORIGIN_LABEL[object.origin]}
              {duration ? ` · ${duration}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label={liked ? "Unlike" : "Like (saved in AQUA only)"}
              onClick={() => toggleLike(object.id)}
              className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
            >
              <Heart className={cn("size-5", liked && "fill-current")} />
            </button>
            <button
              type="button"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={() => setMuted((m) => !m)}
              className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
            >
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
            <a
              href={object.canonicalUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open at origin"
              className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
            >
              <ArrowUpRight className="size-5" />
            </a>
          </div>
        </div>
      </div>
      {!playing && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur">
            <Play className="ml-1 size-6 fill-current" />
          </span>
        </span>
      )}
    </div>
  );
}
