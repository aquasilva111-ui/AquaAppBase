import { createFileRoute } from "@tanstack/react-router";
import { BooksLibrary } from "@/aqua/books";

export const Route = createFileRoute("/books/library")({
  component: BooksLibrary,
});
