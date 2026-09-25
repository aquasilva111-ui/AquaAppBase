import type {
  AquaContentObject,
  NormalizedAuthor,
  NormalizedMedia,
} from "@/lib/aqua/content/types";

/**
 * ActivityPub adapter — ActivityStreams 2.0 parsing and normalization (§22).
 * Pure functions: no fetch, no React. Actor URIs and object URIs are
 * preserved as canonical identity (§23); remote HTML is flattened to text,
 * never rendered raw (§39).
 */

export interface ApActor {
  id: string;
  type?: string;
  preferredUsername?: string;
  name?: string;
  summary?: string;
  url?: string;
  icon?: { url?: string };
  outbox?: string;
}

export interface ApAttachment {
  type?: string;
  mediaType?: string;
  url?: string;
  name?: string;
  width?: number;
  height?: number;
}

export interface ApLink {
  href?: string;
  mediaType?: string;
  height?: number;
  type?: string;
}

export interface ApObject {
  id?: string;
  type?: string;
  attributedTo?: string | { id?: string }[];
  content?: string;
  name?: string;
  summary?: string;
  url?: string | ApLink | ApLink[];
  icon?: { url?: string } | { url?: string }[];
  inReplyTo?: string | null;
  published?: string;
  updated?: string;
  duration?: string;
  attachment?: ApAttachment[];
  sensitive?: boolean;
}

export interface ApActivity {
  id?: string;
  type?: string;
  actor?: string;
  object?: ApObject | string;
  published?: string;
}

export function apActorHost(actor: ApActor): string {
  try {
    return new URL(actor.id).hostname;
  } catch {
    return "";
  }
}

export function apAuthor(actor: ApActor): NormalizedAuthor {
  const host = apActorHost(actor);
  return {
    id: actor.id,
    origin: "ACTIVITYPUB",
    handle: actor.preferredUsername ? `${actor.preferredUsername}@${host}` : actor.id,
    displayName: actor.name ?? actor.preferredUsername,
    avatar: actor.icon?.url,
    host,
    profileUrl: actor.url ?? actor.id,
    federated: true,
  };
}

export function apContentToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function apLinks(url: ApObject["url"]): ApLink[] {
  if (!url) return [];
  if (typeof url === "string") return [{ href: url }];
  const list = Array.isArray(url) ? url : [url];
  return list.filter((l) => l?.href);
}

function apPoster(icon: ApObject["icon"]): string | undefined {
  const list = !icon ? [] : Array.isArray(icon) ? icon : [icon];
  return list.find((i) => i?.url)?.url;
}

/** PeerTube-style duration: "PT4441S" → seconds. */
function apDurationSeconds(duration: string | undefined): number | undefined {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?$/.exec(duration ?? "");
  if (!m) return undefined;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

function apMedia(obj: ApObject): NormalizedMedia[] {
  const fromAttachments = (obj.attachment ?? [])
    .filter(
      (a) =>
        a.url &&
        (a.mediaType?.startsWith("image/") ||
          a.mediaType?.startsWith("video/") ||
          a.type === "Image" ||
          a.type === "Video"),
    )
    .map((a) => ({
      url: a.url!,
      alt: a.name,
      type:
        a.mediaType?.startsWith("video/") || a.type === "Video"
          ? ("video" as const)
          : ("image" as const),
      width: a.width,
      height: a.height,
    }));
  // PeerTube lists playable files as video/* links in `url`, not attachments.
  const fromLinks = apLinks(obj.url)
    .filter((l) => l.mediaType?.startsWith("video/"))
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    .slice(0, 1)
    .map((l) => ({
      url: l.href!,
      type: "video" as const,
      height: l.height,
    }));
  return [...fromLinks, ...fromAttachments];
}

export function apCanonicalPageUrl(url: ApObject["url"]): string | undefined {
  const links = apLinks(url);
  return links.find((l) => !l.mediaType || l.mediaType === "text/html")?.href ?? links[0]?.href;
}

const CONTENT_TYPES = new Set(["Note", "Article", "Image", "Video", "Document"]);

export function normalizeApItem(
  item: ApActivity | ApObject,
  actor: ApActor,
): AquaContentObject | null {
  const activity = item as ApActivity;

  if (activity.type === "Announce" && typeof activity.object === "string") {
    if (!activity.id) return null;
    return {
      id: `ap:${activity.id}`,
      origin: "ACTIVITYPUB",
      type: "EXTERNAL_REFERENCE",
      canonicalUri: activity.id,
      author: apAuthor(actor),
      repostOf: { origin: "ACTIVITYPUB", uri: activity.object },
      createdAt: activity.published ?? new Date().toISOString(),
    };
  }

  const obj = (
    activity.type === "Create" && typeof activity.object === "object"
      ? activity.object
      : item
  ) as ApObject;
  if (!obj?.id || !CONTENT_TYPES.has(obj.type ?? "")) return null;

  const media = apMedia(obj);
  const text = obj.content ? apContentToText(obj.content) : (obj.name ?? obj.summary);
  const durationSeconds = apDurationSeconds(obj.duration);
  const poster = apPoster(obj.icon);

  return {
    id: `ap:${obj.id}`,
    origin: "ACTIVITYPUB",
    type:
      obj.type === "Video" || media.some((m) => m.type === "video")
        ? "VIDEO"
        : obj.type === "Article"
          ? "ARTICLE"
          : media.length > 1
            ? "IMAGE_GALLERY"
            : media.length === 1 || obj.type === "Image"
              ? "IMAGE"
              : "TEXT",
    canonicalUri: obj.id,
    canonicalUrl: apCanonicalPageUrl(obj.url) ?? obj.id,
    author: apAuthor(actor),
    text,
    media: media.length ? media : undefined,
    replyTo: obj.inReplyTo ? { origin: "ACTIVITYPUB", uri: obj.inReplyTo } : undefined,
    createdAt: obj.published ?? activity.published ?? new Date().toISOString(),
    updatedAt: obj.updated,
    sourceMetadata: {
      apType: obj.type,
      sensitive: obj.sensitive,
      durationSeconds,
      poster,
      title: obj.name,
    },
  };
}
