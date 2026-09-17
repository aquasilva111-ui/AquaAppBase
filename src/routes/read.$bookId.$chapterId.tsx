import { createFileRoute } from "@tanstack/react-router";
import { Reader } from "@/aqua/books";

export const Route = createFileRoute("/read/$bookId/$chapterId")({
  component: () => {
    const { bookId, chapterId } = Route.useParams();
    return <Reader bookId={bookId} chapterId={chapterId} />;
  },
});
