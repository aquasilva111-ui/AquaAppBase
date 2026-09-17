import { createFileRoute } from "@tanstack/react-router";
import { StudioPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/studio")({
  component: StudioPage,
});
