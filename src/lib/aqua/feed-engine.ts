import type { ContentOrigin } from "./content/types";
import { rankFeed } from "./feed";
import type { FeedLane, Post, PostKind } from "./types";

/**
 * The single Feed Engine (§5). Selection is decoupled from presentation:
 * a FeedRequest says WHAT (contentFilters), WHY/FROM WHERE (rankingMode,
 * sourceFilters) and HOW it will be consumed (experienceMode) — the renderer
 * never re-ranks, the ranker never renders.
 *
 * Today only AQUA_NATIVE objects flow through; federated sources plug in at
 * `sourceFilters` once their adapters feed the graph (§7).
 */

export type ExperienceMode =
  | "social"
  | "threads"
  | "shorts"
  | "video"
  | "visual"
  | "editorial";

export interface FeedRequest {
  experienceMode: ExperienceMode;
  rankingMode: FeedLane;
  contentFilters?: PostKind[];
  sourceFilters?: ContentOrigin[];
  cursor?: string;
}

export function runFeed(req: FeedRequest, following: string[]): Post[] {
  let list = rankFeed(req.rankingMode, following);
  if (req.contentFilters?.length) {
    const allowed = new Set(req.contentFilters);
    list = list.filter((p) => allowed.has(p.kind));
  }
  // sourceFilters: every object here is AQUA_NATIVE today; federated
  // adapters join the graph in later phases without changing this call.
  return list;
}
