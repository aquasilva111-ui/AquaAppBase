import { createFileRoute } from "@tanstack/react-router";
import { VideoModePage } from "@/components/aqua/video-modes";

export const Route = createFileRoute("/videos")({
  component: VideoModePage,
});
