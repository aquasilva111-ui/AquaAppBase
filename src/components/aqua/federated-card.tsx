import { ArrowUpRight, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyNote } from "@/components/aqua/shell";
import type { AquaContentObject } from "@/lib/aqua/content/types";
import { ORIGIN_LABEL, SOURCE_CAPABILITIES } from "@/lib/aqua/sources/registry";
import { cn, formatCount, formatRelative } from "@/lib/utils";

/**
 * Renderer for federated objects. Read-only by capability: instead of fake
 * like/reply buttons it shows the real external engagement and a link to
 * the canonical object on its own network (§25, §37).
 */
export function FederatedCard({ object }: { object: AquaContentObject }) {
  const caps = SOURCE_CAPABILITIES[object.origin];
  const { author } = object;
  const engagement = object.engagement;
  const externalLink =
    (object.sourceMetadata?.externalLink as string | undefined) ??
    (object.sourceMetadata?.externalTitle as string | undefined);

  return (
    <article className="glass-card p-4">
      <header className="flex items-center gap-2.5">
        {author.avatar ? (
          <img src={author.avatar} alt="" className="size-9 rounded-full object-cover" />
        ) : (
          <span className="flex size-9 items-center justify-center rounded-full bg-foam text-sm font-semibold text-nazar">
            {(author.displayName ?? author.handle).slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{author.displayName ?? author.handle}</p>
          <p className="truncate text-xs text-muted-foreground">
            @{author.handle} · {formatRelative(object.createdAt)}
          </p>
        </div>
        <Badge tone="quiet">via {ORIGIN_LABEL[object.origin]}</Badge>
      </header>

      {object.text && <p className="mt-3 text-[15px] leading-relaxed">{object.text}</p>}

      {object.media && object.media.length > 0 && (
        <div
          className={cn(
            "mt-3 grid gap-2",
            object.media.length > 1 ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {object.media.slice(0, 4).map((m, i) => (
            <img
              key={i}
              src={m.url}
              alt={m.alt ?? ""}
              loading="lazy"
              className="aspect-4/3 w-full rounded-2xl object-cover"
            />
          ))}
        </div>
      )}

      {externalLink && typeof externalLink === "string" && externalLink.startsWith("http") && (
        <a
          href={externalLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block truncate rounded-2xl bg-foam p-3 text-sm text-nazar"
        >
          {(object.sourceMetadata?.externalTitle as string) ?? externalLink}
        </a>
      )}

      {object.replyTo && (
        <p className="mt-2 text-xs text-muted-foreground">Reply in a thread on {ORIGIN_LABEL[object.origin]}</p>
      )}

      <footer className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        {engagement && (
          <>
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3.5" /> {formatCount(engagement.likes ?? 0)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-3.5" /> {formatCount(engagement.replies ?? 0)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Repeat2 className="size-3.5" /> {formatCount(engagement.reposts ?? 0)}
            </span>
            <span className="text-[11px]">· on {ORIGIN_LABEL[object.origin]}</span>
          </>
        )}
        <span className="flex-1" />
        {!caps.like && object.canonicalUrl && (
          <a
            href={object.canonicalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-nazar hover:underline"
          >
            Open <ArrowUpRight className="size-3.5" />
          </a>
        )}
      </footer>
    </article>
  );
}

function useAtSearch(q: string) {
  const [state, setState] = useState<{
    loading: boolean;
    error: boolean;
    objects: AquaContentObject[];
  }>({ loading: false, error: false, objects: [] });

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setState({ loading: false, error: false, objects: [] });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/fed/at?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!cancelled) setState({ loading: false, error: false, objects: data.objects ?? [] });
      } catch {
        if (!cancelled) setState({ loading: false, error: true, objects: [] });
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  return state;
}

/**
 * One search, every network: AQUA results stay above; objects from the open
 * network arrive normalized, with their origin visible (§29).
 */
export function FederatedSearchResults({ q }: { q: string }) {
  const { loading, error, objects } = useAtSearch(q);
  if (!q.trim()) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-2 font-semibold">
        Open network{" "}
        <span className="text-xs font-normal text-muted-foreground">via AT Protocol · read-only</span>
      </h2>
      {loading && <EmptyNote>Searching the open network…</EmptyNote>}
      {error && (
        <EmptyNote>
          The AT Protocol network is unreachable right now. AQUA keeps working — local results
          above.
        </EmptyNote>
      )}
      {!loading && !error && objects.length === 0 && (
        <EmptyNote>Nothing on the open network for this search.</EmptyNote>
      )}
      {!loading && !error && objects.length > 0 && (
        <div className="space-y-3">
          {objects.map((o) => (
            <FederatedCard key={o.id} object={o} />
          ))}
        </div>
      )}
    </section>
  );
}
