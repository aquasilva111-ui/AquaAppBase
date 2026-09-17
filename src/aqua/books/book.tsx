import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { PersonChip } from "@/components/aqua/cards";
import { EmptyNote } from "@/components/aqua/shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { chapterOf, getBook, getProfile, isEpubBook } from "@/lib/aqua/catalog";
import { useAqua } from "@/lib/aqua/store";

export function BookDetail({ bookId }: { bookId: string }) {
  const book = getBook(bookId);
  const cursor = useAqua((s) => s.reading[bookId]);
  if (!book) return <EmptyNote>Book not found.</EmptyNote>;
  const author = getProfile(book.authorId);
  const imported = isEpubBook(book);
  const start = book.chapters[0];
  const resume = cursor ? chapterOf(book, cursor.chapterId) : start;

  return (
    <div>
      <div className="glass-card flex flex-col gap-5 p-5 sm:flex-row">
        <img src={book.cover} alt="" className="mx-auto h-64 w-44 rounded-lg object-cover sm:mx-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <p className="text-xs tracking-[0.16em] text-nazar uppercase">{book.language}</p>
            <Badge tone={imported ? "quiet" : "primary"}>{imported ? "Imported EPUB" : "Native blocks"}</Badge>
          </div>
          <h1 className="font-display mt-1 text-3xl font-medium">{book.title}</h1>
          <p className="text-muted-foreground">{book.subtitle}</p>
          {author && (
            <div className="mt-3">
              <PersonChip profile={author} />
            </div>
          )}
          <p className="mt-4 text-sm leading-relaxed">{book.synopsis}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {resume && (
              <Button asChild>
                <Link to="/read/$bookId/$chapterId" params={{ bookId: book.id, chapterId: resume.id }}>
                  {cursor ? "Continue" : imported ? "Open EPUB" : "Start reading"}
                </Link>
              </Button>
            )}
            {author && (
              <Button variant="secondary" asChild>
                <Link to="/u/$username" params={{ username: author.handle }}>
                  Author profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {!imported && (
        <ol className="mt-4 space-y-2">
          {book.chapters.map((ch) => (
            <li key={ch.id}>
              <Link
                to="/read/$bookId/$chapterId"
                params={{ bookId: book.id, chapterId: ch.id }}
                className="glass-card flex items-center justify-between p-4"
              >
                <span>
                  <span className="text-xs text-muted-foreground">Chapter {ch.number}</span>
                  <span className="block font-medium">{ch.title}</span>
                  <span className="text-xs text-muted-foreground">{ch.blocks.length} blocks</span>
                </span>
                <BookOpen className="size-4 text-nazar" />
              </Link>
            </li>
          ))}
        </ol>
      )}
      {imported && (
        <p className="mt-4 text-sm text-muted-foreground">
          The EPUB is the source of truth. AQUA will remember your CFI on this profile — not a copy of the file.
        </p>
      )}
    </div>
  );
}
