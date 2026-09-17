import { createFileRoute } from "@tanstack/react-router";
import { WikiIndex } from "@/components/aqua/pages";

export const Route = createFileRoute("/wiki")({
  component: WikiIndex,
});
