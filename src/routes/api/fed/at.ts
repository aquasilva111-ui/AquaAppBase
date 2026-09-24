import { createFileRoute } from "@tanstack/react-router";
import { normalizeAtPost, type AtPostView } from "@/lib/aqua/sources/atproto";
import { SOURCE_CAPABILITIES } from "@/lib/aqua/sources/registry";

/**
 * AT Protocol read-only gateway (§10/§15).
 *
 * The browser never talks to the network directly: this route is the only
 * place that fetches, from the public Bluesky AppView (searchPosts and
 * getAuthorFeed are unauthenticated reads), with a timeout and a capped
 * result count. If the network is down, AQUA keeps working — the client
 * renders an honest "unavailable" note (§44).
 */

const APPVIEW = "https://api.bsky.app";
const SEARCH = `${APPVIEW}/xrpc/app.bsky.feed.searchPosts`;
const AUTHOR_FEED = `${APPVIEW}/xrpc/app.bsky.feed.getAuthorFeed`;
const TIMEOUT_MS = 8000;
const MAX_RESULTS = 20;

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { accept: "application/json", "user-agent": "aqua-study/0.1 (+read-only)" },
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return res.json();
}

function normalizeList(data: unknown): ReturnType<typeof normalizeAtPost>[] {
  const posts = (data as { posts?: AtPostView[]; feed?: { post?: AtPostView }[] }) ?? {};
  const raw: AtPostView[] = posts.posts ?? (posts.feed ?? []).map((f) => f.post!).filter(Boolean);
  return raw.map(normalizeAtPost).filter((o) => o !== null);
}

export const Route = createFileRoute("/api/fed/at")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
        const handle = (url.searchParams.get("handle") ?? "").trim().slice(0, 80);

        if (!q && !handle) {
          return Response.json({ objects: [], capabilities: SOURCE_CAPABILITIES.AT_PROTOCOL });
        }

        try {
          const upstream = handle
            ? `${AUTHOR_FEED}?actor=${encodeURIComponent(handle)}&limit=${MAX_RESULTS}`
            : `${SEARCH}?q=${encodeURIComponent(q)}&limit=${MAX_RESULTS}&sort=top`;
          const data = await fetchJson(upstream);
          return Response.json({
            objects: normalizeList(data),
            capabilities: SOURCE_CAPABILITIES.AT_PROTOCOL,
          });
        } catch {
          return Response.json(
            { error: "at_unavailable", objects: [], capabilities: SOURCE_CAPABILITIES.AT_PROTOCOL },
            { status: 502 },
          );
        }
      },
    },
  },
});
