import { createFileRoute } from "@tanstack/react-router";
import { DiscoverPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/discover")({
  component: DiscoverPage,
});
