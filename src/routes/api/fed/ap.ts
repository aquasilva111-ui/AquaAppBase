import { createFileRoute } from "@tanstack/react-router";
import {
  apAuthor,
  normalizeApItem,
  type ApActor,
} from "@/lib/aqua/sources/activitypub";
import { SOURCE_CAPABILITIES } from "@/lib/aqua/sources/registry";

/**
 * ActivityPub read-only gateway (§19, §21).
 *
 * acct:user@host → WebFinger → Actor → public outbox, all server-side with
 * SSRF guards (https only, no literal IPs, no internal hosts, redirects
 * refused, 8s timeout, capped items). Instances requiring HTTP signatures
 * fail honestly with ap_unavailable — unsigned reads are all this gateway
 * claims to do (§49).
 */

const TIMEOUT_MS = 8000;
const MAX_ITEMS = 15;

function assertSafeUrl(raw: string): URL {
  const u = new URL(raw);
  if (u.protocol !== "https:") throw new Error("https only");
  const h = u.hostname.toLowerCase();
  if (
    h === "localhost" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h.endsWith(".localhost") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(h) ||
    h.includes("[")
  ) {
    throw new Error("host not allowed");
  }
  return u;
}

async function apFetch(raw: string): Promise<unknown> {
  const u = assertSafeUrl(raw);
  const res = await fetch(u, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "manual",
    headers: {
      accept:
        'application/activity+json, application/ld+json; profile="https://www.w3.org/ns/activitystreams", application/jrd+json, application/json',
      "user-agent": "aqua-study/0.1 (+read-only federation)",
    },
  });
  if (res.status >= 300 && res.status < 400) throw new Error("redirect refused");
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return res.json();
}

interface ApCollectionPage {
  items?: unknown[];
  orderedItems?: unknown[];
}

interface ApCollection {
  first?: string | ApCollectionPage;
  items?: unknown[];
  orderedItems?: unknown[];
}

export const Route = createFileRoute("/api/fed/ap")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const raw = (url.searchParams.get("acct") ?? "").trim().replace(/^@/, "").slice(0, 120);
        const match = /^([\w.-]+)@([\w.-]+\.[a-zA-Z]{2,})$/.exec(raw);

        if (!match) {
          return Response.json(
            {
              error: "acct_expected",
              objects: [],
              capabilities: SOURCE_CAPABILITIES.ACTIVITYPUB,
            },
            { status: 400 },
          );
        }

        const [, user, host] = match;

        try {
          // §21: WebFinger discovery — never concatenate profile URLs.
          const jrd = (await apFetch(
            `https://${host}/.well-known/webfinger?resource=acct:${user}@${host}`,
          )) as { links?: { rel?: string; type?: string; href?: string }[] };
          const self = jrd.links?.find(
            (l) => l.rel === "self" && (l.type ?? "").includes("activity+json"),
          );
          if (!self?.href) throw new Error("no actor link");

          const actor = (await apFetch(self.href)) as ApActor;
          if (!actor.id || typeof actor.outbox !== "string") throw new Error("no outbox");

          const outbox = (await apFetch(actor.outbox)) as ApCollection;
          let items = outbox.orderedItems ?? outbox.items ?? [];
          const first = outbox.first;
          if (items.length === 0 && typeof first === "string") {
            const page = (await apFetch(first)) as ApCollectionPage;
            items = page.orderedItems ?? page.items ?? [];
          } else if (items.length === 0 && first && typeof first === "object") {
            items = first.orderedItems ?? first.items ?? [];
          }

          const objects = items
            .slice(0, MAX_ITEMS)
            .map((item) => normalizeApItem(item as never, actor))
            .filter((o) => o !== null);

          return Response.json({
            actor: apAuthor(actor),
            objects,
            capabilities: SOURCE_CAPABILITIES.ACTIVITYPUB,
          });
        } catch {
          return Response.json(
            {
              error: "ap_unavailable",
              objects: [],
              capabilities: SOURCE_CAPABILITIES.ACTIVITYPUB,
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
