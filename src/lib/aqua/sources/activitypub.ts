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

export interface ApObject {
  id?: string;
  type?: string;
  attributedTo?: string;
  content?: string;
  name?: string;
  summary?: string;
  url?: string | { href?: string };
  inReplyTo?: string | null;
  published?: string;
  updated?: string;
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

function apUrl(url: ApObject["url"]): string | undefined {
  if (!url) return undefined;
  return typeof url === "string" ? url : url.href;
}

function apMedia(obj: ApObject): NormalizedMedia[] {
  return (obj.attachment ?? [])
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

  return {
    id: `ap:${obj.id}`,
    origin: "ACTIVITYPUB",
    type:
      obj.type === "Video"
        ? "VIDEO"
        : obj.type === "Article"
          ? "ARTICLE"
          : media.length > 1
            ? "IMAGE_GALLERY"
            : media.length === 1 || obj.type === "Image"
              ? "IMAGE"
              : "TEXT",
    canonicalUri: obj.id,
    canonicalUrl: apUrl(obj.url) ?? obj.id,
    author: apAuthor(actor),
    text,
    media: media.length ? media : undefined,
    replyTo: obj.inReplyTo ? { origin: "ACTIVITYPUB", uri: obj.inReplyTo } : undefined,
    createdAt: obj.published ?? activity.published ?? new Date().toISOString(),
    updatedAt: obj.updated,
    sourceMetadata: { apType: obj.type, sensitive: obj.sensitive },
  };
}
