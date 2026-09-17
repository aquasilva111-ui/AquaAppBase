import { createFileRoute } from "@tanstack/react-router";
import { CommercePage } from "@/components/aqua/pages";

export const Route = createFileRoute("/commerce")({
  component: CommercePage,
});
