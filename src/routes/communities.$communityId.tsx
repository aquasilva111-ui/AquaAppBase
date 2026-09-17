import { createFileRoute } from "@tanstack/react-router";
import { CommunityPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/communities/$communityId")({
  component: () => <CommunityPage communityId={Route.useParams().communityId} />,
});
