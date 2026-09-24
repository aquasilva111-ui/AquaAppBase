import { createFileRoute } from "@tanstack/react-router";
import { SavedPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
});
