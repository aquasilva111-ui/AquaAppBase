import { createFileRoute } from "@tanstack/react-router";
import { ShortsModePage } from "@/components/aqua/video-modes";

export const Route = createFileRoute("/shorts")({
  component: ShortsModePage,
});
