import { createFileRoute } from "@tanstack/react-router";
import { WritePage } from "@/components/aqua/pages";

export const Route = createFileRoute("/write")({
  component: WritePage,
});
