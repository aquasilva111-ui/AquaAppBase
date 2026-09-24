import { useEffect, useRef } from "react";
import { useAqua } from "@/lib/aqua/store";

export function EpubPane({ url, bookId }: { url: string; bookId: string }) {
  const host = useRef<HTMLDivElement>(null);
  const setReading = useAqua((s) => s.setReading);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    let destroy = () => {};

    void import("epubjs").then(({ default: ePub }) => {
      if (cancelled || !host.current) return;
      const book = ePub(url);
      const rendition = book.renderTo(host.current, {
        width: "100%",
        height: "100%",
        spread: "none",
        flow: "scrolled-doc",
      });
      rendition.themes.default({
        body: {
          fontFamily:
            '"Helvetica Now Display", "Helvetica Neue", "Helvetica Display", Helvetica, Arial, sans-serif',
          fontSize: "1.15rem",
          lineHeight: "1.75",
          color: "#1c2430",
          padding: "0 8%",
        },
      });
      const saved = useAqua.getState().reading[bookId]?.blockId;
      void rendition.display(saved && saved.startsWith("epubcfi") ? saved : undefined);
      const onRelocated = (loc: { start?: { cfi?: string; percentage?: number } }) => {
        const cfi = loc.start?.cfi;
        if (!cfi) return;
        setReading(bookId, {
          chapterId: "epub",
          blockId: cfi,
          progress: loc.start?.percentage ?? 0,
        });
      };
      rendition.on("relocated", onRelocated);
      destroy = () => {
        rendition.destroy();
      };
    });

    return () => {
      cancelled = true;
      destroy();
    };
  }, [url, bookId, setReading]);

  return <div ref={host} className="epub-host h-[72vh] w-full overflow-auto rounded-2xl bg-card" />;
}
