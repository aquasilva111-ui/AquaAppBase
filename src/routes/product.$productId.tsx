import { createFileRoute } from "@tanstack/react-router";
import { ProductPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/product/$productId")({
  component: () => <ProductPage productId={Route.useParams().productId} />,
});
