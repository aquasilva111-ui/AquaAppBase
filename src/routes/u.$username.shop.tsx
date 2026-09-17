import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/u/$username/shop")({
  component: () => <ShopPage username={Route.useParams().username} />,
});
