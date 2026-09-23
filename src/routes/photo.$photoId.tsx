import { createFileRoute } from "@tanstack/react-router";
import { PhotoDetailPage } from "@/components/aqua/photos";

export const Route = createFileRoute("/photo/$photoId")({
  component: function PhotoRoute() {
    const { photoId } = Route.useParams();
    return <PhotoDetailPage photoId={photoId} />;
  },
});
