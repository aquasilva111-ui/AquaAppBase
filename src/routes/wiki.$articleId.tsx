import { createFileRoute } from "@tanstack/react-router";
import { WikiPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/wiki/$articleId")({
  component: () => <WikiPage articleId={Route.useParams().articleId} />,
});
