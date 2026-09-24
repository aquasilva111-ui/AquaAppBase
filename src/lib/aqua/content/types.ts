/**
 * Normalized content layer — one object, many experiences.
 * Sources produce AquaContentObjects; the feed engine selects them;
 * renderers decide how they are consumed. SOURCE ≠ FEED ≠ EXPERIENCE.
 */

export type ContentOrigin =
  | "AQUA_NATIVE"
  | "AT_PROTOCOL"
  | "ACTIVITYPUB"
  | "WEB"
  | "EXTERNAL_API";

export type AquaContentType =
  | "TEXT"
  | "IMAGE"
  | "IMAGE_GALLERY"
  | "VIDEO"
  | "AUDIO"
  | "ARTICLE"
  | "BOOK"
  | "PRODUCT"
  | "PROJECT"
  | "POLL"
  | "EVENT"
  | "EXTERNAL_REFERENCE";

export interface NormalizedAuthor {
  /** origin-scoped id: AQUA profile id, AT DID, AP actor URI… */
  id: string;
  origin: ContentOrigin;
  handle: string;
  displayName?: string;
  avatar?: string;
  host?: string;
  profileUrl?: string;
  federated: boolean;
}

export interface NormalizedMedia {
  url: string;
  alt?: string;
  type: "image" | "video" | "audio";
  width?: number;
  height?: number;
}

export interface RelationReference {
  origin: ContentOrigin;
  uri: string;
}

export interface AquaContentObject {
  id: string;
  origin: ContentOrigin;
  type: AquaContentType;
  canonicalUri?: string;
  canonicalUrl?: string;
  author: NormalizedAuthor;
  text?: string;
  media?: NormalizedMedia[];
  replyTo?: RelationReference;
  quoteOf?: RelationReference;
  repostOf?: RelationReference;
  createdAt: string;
  updatedAt?: string;
  engagement?: {
    likes?: number;
    replies?: number;
    reposts?: number;
    shares?: number;
  };
  /** where the engagement numbers come from — never mix the two silently */
  engagementOrigin?: "external" | "aqua";
  /** protocol-specific fields, preserved untouched */
  sourceMetadata?: Record<string, unknown>;
}

export interface SourceCapabilities {
  read: boolean;
  reply: boolean;
  like: boolean;
  repost: boolean;
  follow: boolean;
  publish: boolean;
}
