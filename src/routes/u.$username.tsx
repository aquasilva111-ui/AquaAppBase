import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/aqua/pages";

export const Route = createFileRoute("/u/$username")({
  component: () => <ProfilePage username={Route.useParams().username} />,
});
