import { createFileRoute } from "@tanstack/react-router";
import { DirectionPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/direction/$layer")({
  component: () => <DirectionPage layer={Route.useParams().layer} />,
});
