import { createFileRoute } from "@tanstack/react-router";
import { PostPage } from "@/components/aqua/pages";

export const Route = createFileRoute("/post/$postId")({
  component: () => <PostPage postId={Route.useParams().postId} />,
});
