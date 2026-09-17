import { createFileRoute } from "@tanstack/react-router";
import { FeedView } from "@/components/aqua/feed-view";
import type { FeedLane } from "@/lib/aqua/types";

export const Route = createFileRoute("/feed/$lane")({
  component: FeedLanePage,
});

function FeedLanePage() {
  const { lane } = Route.useParams();
  const allowed: FeedLane[] = [
    "for-you",
    "following",
    "connected",
    "communities",
    "trending",
    "books",
    "articles",
    "music",
    "marketplace",
  ];
  const current = allowed.includes(lane as FeedLane) ? (lane as FeedLane) : "for-you";
  return <FeedView lane={current} />;
}
