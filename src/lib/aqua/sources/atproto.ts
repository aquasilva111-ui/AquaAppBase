import type {
  AquaContentObject,
  NormalizedAuthor,
  NormalizedMedia,
  RelationReference,
} from "@/lib/aqua/content/types";

/**
 * AT Protocol adapter — normalization of app.bsky.feed post views coming
 * from a public AppView. Pure functions: no fetching here, no React. The
 * server route fetches; this maps protocol records to AquaContentObjects,
 * preserving AT URIs, DIDs and reply/quote relations (§13).
 */

export interface AtPostView {
  uri: string;
  cid?: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record?: {
    $type?: string;
    text?: string;
    createdAt?: string;
    langs?: string[];
    reply?: { parent?: { uri?: string }; root?: { uri?: string } };
    facets?: unknown[];
  };
  embed?: {
    $type?: string;
    images?: { thumb?: string; fullsize?: string; alt?: string; aspectRatio?: { width: number; height: number } }[];
    external?: { uri?: string; title?: string; description?: string; thumb?: string };
    record?: { uri?: string };
    media?: AtPostView["embed"];
  };
  replyCount?: number;
  repostCount?: number;
  likeCount?: number;
  indexedAt?: string;
}

function atAuthor(author: AtPostView["author"]): NormalizedAuthor {
  return {
    id: author.did,
    origin: "AT_PROTOCOL",
    handle: author.handle,
    displayName: author.displayName,
    avatar: author.avatar,
    host: "bsky.social",
    profileUrl: `https://bsky.app/profile/${author.handle}`,
    federated: true,
  };
}

function atRelation(uri: string | undefined): RelationReference | undefined {
  return uri ? { origin: "AT_PROTOCOL", uri } : undefined;
}

function atMedia(embed: AtPostView["embed"]): NormalizedMedia[] {
  const images = embed?.images ?? embed?.media?.images ?? [];
  return images
    .filter((img) => img.fullsize || img.thumb)
    .map((img) => ({
      url: img.fullsize ?? img.thumb ?? "",
      alt: img.alt,
      type: "image" as const,
      width: img.aspectRatio?.width,
      height: img.aspectRatio?.height,
    }));
}

export function normalizeAtPost(post: AtPostView): AquaContentObject | null {
  if (!post?.uri || !post.author?.did) return null;
  const rkey = post.uri.split("/").pop();
  const handle = post.author.handle || post.author.did;
  const media = atMedia(post.embed);
  const external = post.embed?.external ?? post.embed?.media?.external;
  const quoteUri = post.embed?.record?.uri;

  return {
    id: `at:${post.uri}`,
    origin: "AT_PROTOCOL",
    type: media.length > 1 ? "IMAGE_GALLERY" : media.length === 1 ? "IMAGE" : "TEXT",
    canonicalUri: post.uri,
    canonicalUrl: rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : undefined,
    author: atAuthor(post.author),
    text: post.record?.text,
    media: media.length ? media : undefined,
    replyTo: atRelation(post.record?.reply?.parent?.uri),
    quoteOf: atRelation(quoteUri),
    createdAt: post.record?.createdAt ?? post.indexedAt ?? new Date().toISOString(),
    engagement: {
      likes: post.likeCount ?? 0,
      replies: post.replyCount ?? 0,
      reposts: post.repostCount ?? 0,
    },
    engagementOrigin: "external",
    sourceMetadata: {
      cid: post.cid,
      langs: post.record?.langs,
      hasFacets: Boolean(post.record?.facets?.length),
      externalLink: external?.uri,
      externalTitle: external?.title,
    },
  };
}
