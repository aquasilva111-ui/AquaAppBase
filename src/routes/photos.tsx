import { createFileRoute } from "@tanstack/react-router";
import { PhotosPage } from "@/components/aqua/photos";

export const Route = createFileRoute("/photos")({
  component: PhotosPage,
});
