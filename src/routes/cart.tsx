import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});
