import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});
