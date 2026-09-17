import { createFileRoute } from "@tanstack/react-router";
import { MessagesIndex } from "@/components/aqua/pages";

export const Route = createFileRoute("/messages")({
  component: MessagesIndex,
});
