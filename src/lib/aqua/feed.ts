import { ME_ID, posts as seedPosts } from "./catalog";
import { useAqua } from "./store";
import type { FeedLane, Post } from "./types";

export function mergePosts(): Post[] {
  return [...useAqua.getState().addedPosts, ...seedPosts];
}

export function rankFeed(lane: FeedLane, following: string[]): Post[] {
  const { saved, liked, joined } = useAqua.getState();
  let list = mergePosts();

  switch (lane) {
    case "following":
      list = list.filter((p) => following.includes(p.authorId) || p.authorId === ME_ID);
      break;
    case "connected":
      list = list.filter((p) => p.kind === "external" || Boolean(p.external));
      break;
    case "communities":
      list = list.filter((p) => p.communityId && joined[p.communityId]);
      break;
    case "books":
      list = list.filter((p) => p.kind === "book" || p.ref?.type === "book");
      break;
    case "articles":
      list = list.filter((p) => p.kind === "article" || p.ref?.type === "article");
      break;
    case "music":
      list = list.filter((p) => p.kind === "music");
      break;
    case "marketplace":
      list = list.filter((p) => p.kind === "product" || p.ref?.type === "product");
      break;
    case "trending":
      list = [...list].sort(
        (a, b) => b.likes + b.reposts * 2 + b.saves - (a.likes + a.reposts * 2 + a.saves),
      );
      return list;
    default:
      break;
  }

  if (lane === "for-you") {
    list = [...list].sort((a, b) => score(b, { liked, saved, following }) - score(a, { liked, saved, following }));
  } else {
    list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return list;
}

function score(
  post: Post,
  ctx: { liked: Record<string, true>; saved: Record<string, true>; following: string[] },
) {
  const recency = Math.max(0, 72 - (Date.now() - +new Date(post.createdAt)) / 3600_000);
  const social = post.likes * 0.15 + post.saves * 0.4 + post.reposts * 0.35 + post.comments * 0.25;
  const followBoost = ctx.following.includes(post.authorId) ? 18 : 0;
  const kindBoost =
    post.kind === "book" || post.kind === "article" ? 8 : post.kind === "product" ? 4 : 0;
  const savedBoost = ctx.saved[post.id] ? -5 : 0;
  return recency * 2 + social + followBoost + kindBoost + savedBoost;
}

export const LANES: { id: FeedLane; label: string }[] = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "connected", label: "Connected" },
  { id: "communities", label: "Communities" },
  { id: "trending", label: "Trending" },
  { id: "books", label: "Books" },
  { id: "articles", label: "Articles" },
  { id: "music", label: "Music" },
  { id: "marketplace", label: "Marketplace" },
];
