import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { EpubPane } from "@/aqua/books/epub-pane";
import { CommentThread } from "@/components/aqua/comments";
import { EmptyNote } from "@/components/aqua/shell";
import { Button } from "@/components/ui/button";
import { chapterOf, getBook, getMedia, isEpubBook } from "@/lib/aqua/catalog";
import { useAqua } from "@/lib/aqua/store";
import { cn } from "@/lib/utils";

export function Reader({ bookId, chapterId }: { bookId: string; chapterId: string }) {
  const book = getBook(bookId);
  if (!book) return <EmptyNote>Book not found.</EmptyNote>;
  if (isEpubBook(book) && book.epubUrl) {
    return (
      <div>
        <p className="text-xs tracking-[0.16em] text-nazar uppercase">Imported EPUB</p>
        <h1 className="font-display mt-1 text-3xl font-medium">{book.title}</h1>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Engine: epub.js. AQUA stores the CFI on this profile. The file stays in storage.
        </p>
        <EpubPane url={book.epubUrl} bookId={book.id} />
        <div className="mt-4 flex justify-between">
          <Button variant="secondary" asChild>
            <Link to="/book/$bookId" params={{ bookId }}>
              Back to book
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <a href={book.epubUrl} download>
              Download file
            </a>
          </Button>
        </div>
      </div>
    );
  }
  return <NativeReader bookId={bookId} chapterId={chapterId} />;
}

function NativeReader({ bookId, chapterId }: { bookId: string; chapterId: string }) {
  const book = getBook(bookId)!;
  const setReading = useAqua((s) => s.setReading);
  const highlights = useAqua((s) => s.highlights);
  const toggleHighlight = useAqua((s) => s.toggleHighlight);
  const [openBlock, setOpenBlock] = useState<string | null>(null);
  const chapter = chapterOf(book, chapterId);
  if (!chapter) return <EmptyNote>Chapter not found.</EmptyNote>;
  const idx = book.chapters.findIndex((c) => c.id === chapter.id);
  const prev = book.chapters[idx - 1];
  const next = book.chapters[idx + 1];
  const totalBlocks = book.chapters.reduce((n, c) => n + c.blocks.length, 0);
  const before = book.chapters.slice(0, idx).reduce((n, c) => n + c.blocks.length, 0);

  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-xs tracking-[0.16em] text-nazar uppercase">Native · {book.title}</p>
      <h1 className="font-display mt-2 text-3xl font-medium">{chapter.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Chapter {chapter.number} · {chapter.blocks.length} blocks · tap a paragraph to mark and comment
      </p>
      <div className="mt-8 space-y-6 font-display text-[18px] leading-8">
        {chapter.blocks.map((block, i) => {
          const abs = before + i + 1;
          if (block.type === "HEADING")
            return (
              <h2 key={block.id} className="text-2xl">
                {block.text}
              </h2>
            );
          if (block.type === "QUOTE")
            return (
              <blockquote key={block.id} className="border-l-2 border-nazar pl-4 italic">
                {block.text}
              </blockquote>
            );
          if (block.type === "DIVIDER") return <hr key={block.id} className="border-foreground/10" />;
          if (block.type === "IMAGE" && block.mediaId) {
            const media = getMedia(block.mediaId);
            return media ? (
              <img key={block.id} src={media.src} alt={media.alt} className="w-full rounded-2xl" />
            ) : null;
          }
          if (block.type === "AUTHOR_NOTE")
            return (
              <p key={block.id} className="rounded-2xl bg-foam p-4 font-sans text-sm">
                {block.text}
              </p>
            );
          const on = Boolean(highlights[block.id]);
          return (
            <div key={block.id}>
              <p
                onPointerUp={() => {
                  toggleHighlight(block.id);
                  setReading(book.id, {
                    chapterId: chapter.id,
                    blockId: block.id,
                    progress: abs / totalBlocks,
                  });
                  setOpenBlock(block.id);
                }}
                className={cn("cursor-text font-sans text-[17px] leading-8", on && "bg-iris/35")}
              >
                <span className="mr-2 font-sans text-[11px] text-muted-foreground">{abs}</span>
                {block.text}
              </p>
              {openBlock === block.id && (
                <div className="mt-2 rounded-2xl bg-foam p-3">
                  <p className="mb-2 font-sans text-xs text-nazar">Comment on block {abs}</p>
                  <CommentThread targetType="block" targetId={block.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <nav className="mt-8 flex justify-between gap-3">
        {prev ? (
          <Button variant="secondary" asChild>
            <Link to="/read/$bookId/$chapterId" params={{ bookId, chapterId: prev.id }}>
              Previous
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild>
            <Link to="/read/$bookId/$chapterId" params={{ bookId, chapterId: next.id }}>
              Next chapter
            </Link>
          </Button>
        ) : (
          <Button variant="secondary" asChild>
            <Link to="/book/$bookId" params={{ bookId }}>
              Back to book
            </Link>
          </Button>
        )}
      </nav>
    </article>
  );
}
