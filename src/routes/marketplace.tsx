import { createFileRoute } from "@tanstack/react-router";
import { MarketplacePage } from "@/components/aqua/pages";

export const Route = createFileRoute("/marketplace")({
  component: MarketplacePage,
});
