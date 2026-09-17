import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});
