import { createFileRoute } from "@tanstack/react-router";
import { CommunitiesPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/communities")({
  component: CommunitiesPage,
});
