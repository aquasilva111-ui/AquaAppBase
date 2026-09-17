import { createFileRoute } from "@tanstack/react-router";
import { BookDetail } from "@/aqua/books";

export const Route = createFileRoute("/book/$bookId")({
  component: () => <BookDetail bookId={Route.useParams().bookId} />,
});
