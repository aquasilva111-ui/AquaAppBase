import type { ContentOrigin, SourceCapabilities } from "@/lib/aqua/content/types";

/**
 * Honest capabilities per source (§25): the UI must never render a working
 * button that only simulates success. AT Protocol and ActivityPub are
 * read-only here (public AppView / unsigned outbox reads); writes wait for
 * real OAuth / HTTP signatures. Web stays off until implemented.
 */
export const SOURCE_CAPABILITIES: Record<ContentOrigin, SourceCapabilities> = {
  AQUA_NATIVE: { read: true, reply: true, like: true, repost: true, follow: true, publish: true },
  AT_PROTOCOL: { read: true, reply: false, like: false, repost: false, follow: false, publish: false },
  ACTIVITYPUB: { read: true, reply: false, like: false, repost: false, follow: false, publish: false },
  WEB: { read: false, reply: false, like: false, repost: false, follow: false, publish: false },
  EXTERNAL_API: { read: false, reply: false, like: false, repost: false, follow: false, publish: false },
};

export const ORIGIN_LABEL: Record<ContentOrigin, string> = {
  AQUA_NATIVE: "AQUA",
  AT_PROTOCOL: "AT Protocol",
  ACTIVITYPUB: "ActivityPub",
  WEB: "Open Web",
  EXTERNAL_API: "External",
};
