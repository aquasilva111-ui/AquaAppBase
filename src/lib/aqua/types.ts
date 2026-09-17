export type Origin =
  | "AQUA"
  | "SHOPIFY"
  | "WOOCOMMERCE"
  | "MERCADO_LIBRE"
  | "ETSY"
  | "AFFILIATE";

export type ExternalPlatform =
  | "Instagram"
  | "TikTok"
  | "X"
  | "YouTube"
  | "Wattpad";

export type PostKind =
  | "text"
  | "photo"
  | "gallery"
  | "book"
  | "article"
  | "product"
  | "music"
  | "repost"
  | "external";

export type ProductType =
  | "PHYSICAL"
  | "DIGITAL"
  | "SERVICE"
  | "BOOK"
  | "AFFILIATE";

export type Monetization =
  | "FREE"
  | "PAID_BOOK"
  | "PAID_CHAPTERS"
  | "SUBSCRIBER_ONLY"
  | "MIXED";

export type BlockType =
  | "PARAGRAPH"
  | "HEADING"
  | "QUOTE"
  | "IMAGE"
  | "AUTHOR_NOTE"
  | "DIVIDER";

export type WikiKind = "popular" | "scientific";

export type WikiStatus = "Preprint" | "Peer Reviewed" | "Institution Verified";

export type AvatarTone = "tide" | "foam" | "kelp" | "ink" | "pearl" | "deep";

export type Role =
  | "user"
  | "creator"
  | "author"
  | "artist"
  | "seller"
  | "researcher"
  | "publisher";

export interface Profile {
  id: string;
  handle: string;
  name: string;
  bio: string;
  location?: string;
  tone: AvatarTone;
  roles: Role[];
  following: string[];
  followers: number;
  joined: string;
}

export interface MediaAsset {
  id: string;
  ownerId: string;
  type: "image";
  src: string;
  alt: string;
  aspect?: "photo" | "square" | "wide" | "cover";
}

export interface ExternalRef {
  platform: ExternalPlatform;
  url: string;
  externalId: string;
}

export interface EntityRef {
  type: "book" | "product" | "article" | "post" | "profile" | "community";
  id: string;
}

export interface Post {
  id: string;
  authorId: string;
  createdAt: string;
  kind: PostKind;
  text?: string;
  mediaIds?: string[];
  ref?: EntityRef;
  external?: ExternalRef;
  communityId?: string;
  likes: number;
  comments: number;
  reposts: number;
  saves: number;
}

export interface ReadingBlock {
  id: string;
  type: BlockType;
  text?: string;
  mediaId?: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  blocks: ReadingBlock[];
}

export interface Book {
  id: string;
  authorId: string;
  title: string;
  subtitle?: string;
  cover: string;
  synopsis: string;
  tags: string[];
  monetization: Monetization;
  chapters: Chapter[];
  reads: number;
  rating: number;
  language: string;
  source?: "native" | "epub";
  epubUrl?: string;
}

export interface Product {
  id: string;
  storeId: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  origin: Origin;
  type: ProductType;
  image: string;
  externalUrl?: string;
  linkedBookId?: string;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  origin: Origin;
}

export interface WikiArticle {
  id: string;
  kind: WikiKind;
  title: string;
  excerpt: string;
  body: string[];
  cover?: string;
  authorIds: string[];
  status?: WikiStatus;
  doi?: string;
  institution?: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  handle: string;
  description: string;
  cover: string;
  members: number;
  location?: string;
}

export interface EventItem {
  id: string;
  title: string;
  when: string;
  where: string;
  communityId?: string;
}

export interface Thread {
  id: string;
  participantIds: string[];
  preview: string;
  at: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  fromId: string;
  text: string;
  at: string;
  ref?: EntityRef;
}

export interface Comment {
  id: string;
  targetType: "post" | "block" | "chapter" | "article" | "product";
  targetId: string;
  authorId: string;
  text: string;
  at: string;
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface AquaEvent {
  id: string;
  type:
    | "impression"
    | "view"
    | "click"
    | "like"
    | "comment"
    | "repost"
    | "save"
    | "read"
    | "product_view"
    | "product_click"
    | "add_to_cart";
  entityType: string;
  entityId: string;
  at: string;
}

export interface NotificationItem {
  id: string;
  text: string;
  at: string;
  href: string;
  unread: boolean;
}

export type FeedLane =
  | "for-you"
  | "following"
  | "connected"
  | "communities"
  | "trending"
  | "books"
  | "articles"
  | "music"
  | "marketplace";

export type ModuleId =
  | "communities"
  | "events"
  | "profiles"
  | "wiki"
  | "books"
  | "articles"
  | "photos"
  | "videos"
  | "music"
  | "live"
  | "marketplace"
  | "commerce"
  | "wallet"
  | "ads"
  | "monetization"
  | "ai"
  | "analytics"
  | "media"
  | "scheduler"
  | "connections";
