import { createFileRoute } from "@tanstack/react-router";
import { FeedView } from "@/components/aqua/feed-view";

export const Route = createFileRoute("/")({
  component: () => <FeedView lane="for-you" />,
});
