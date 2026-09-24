import { Link } from "@tanstack/react-router";
import { BookCard } from "@/components/aqua/cards";
import { PageTitle } from "@/components/aqua/shell";
import { books, getBook, getProfile, isEpubBook } from "@/lib/aqua/catalog";
import { useAqua } from "@/lib/aqua/store";
import type { Book, Chapter, ReadingBlock } from "@/lib/aqua/types";

interface HighlightEntry {
  book: Book;
  chapter: Chapter;
  block: ReadingBlock;
}

function collectHighlights(ids: string[]): HighlightEntry[] {
  const entries: HighlightEntry[] = [];
  for (const id of ids) {
    for (const book of books) {
      for (const chapter of book.chapters) {
        const block = chapter.blocks.find((b) => b.id === id);
        if (block?.text) entries.push({ book, chapter, block });
      }
    }
  }
  return entries;
}

export function BooksLibrary() {
  const reading = useAqua((s) => s.reading);
  const highlights = useAqua((s) => s.highlights);
  const native = books.filter((b) => !isEpubBook(b));
  const imported = books.filter(isEpubBook);
  const resumes = Object.entries(reading)
    .map(([id, cursor]) => ({ book: getBook(id), cursor }))
    .filter((x) => x.book);
  const highlightEntries = collectHighlights(Object.keys(highlights));

  return (
    <div>
      <PageTitle
        kicker="Publishing"
        title="Books"
        body="Native books are blocks. Imported EPUBs keep the file in storage. AQUA stores who read, how far, which block."
      />

      {resumes.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-nazar uppercase">Continue</h2>
          <div className="grid gap-3">
            {resumes.map(({ book, cursor }) => {
              if (!book) return null;
              const author = getProfile(book.authorId);
              const chapter = book.chapters.find((c) => c.id === cursor.chapterId) ?? book.chapters[0];
              if (!chapter) return null;
              return (
                <Link
                  key={book.id}
                  to="/read/$bookId/$chapterId"
                  params={{ bookId: book.id, chapterId: chapter.id }}
                  className="glass-card flex items-center gap-3 p-3"
                >
                  <img src={book.cover} alt="" className="h-16 w-11 rounded object-cover" />
                  <span className="min-w-0">
                    <span className="block font-medium">{book.title}</span>
                    <span className="block text-sm text-muted-foreground">
                      {author?.name} · {Math.round(cursor.progress * 100)}%
                      {isEpubBook(book) ? " · CFI saved" : ` · ${chapter.title}`}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {highlightEntries.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-nazar uppercase">Highlights</h2>
          <div className="grid gap-3">
            {highlightEntries.map(({ book, chapter, block }) => (
              <Link
                key={block.id}
                to="/read/$bookId/$chapterId"
                params={{ bookId: book.id, chapterId: chapter.id }}
                className="glass-card block p-4"
              >
                <p className="border-l-2 border-iris pl-3 text-sm italic">{block.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {book.title} · {chapter.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-1 text-sm font-semibold tracking-wide text-nazar uppercase">Native AQUA</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Source of truth = blocks. Comment on the paragraph. Resume on the block, not the page.
        </p>
        <div className="grid gap-3">
          {native.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold tracking-wide text-nazar uppercase">Imported</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Source of truth = the EPUB in media storage. epub.js reads it. We store the CFI, not a second binary.
        </p>
        <div className="grid gap-3">
          {imported.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </section>
    </div>
  );
}
