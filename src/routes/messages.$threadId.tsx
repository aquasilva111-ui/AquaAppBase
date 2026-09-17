import { createFileRoute } from "@tanstack/react-router";
import { ThreadPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/messages/$threadId")({
  component: () => <ThreadPage threadId={Route.useParams().threadId} />,
});
