import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { books, media, products } from "@/lib/aqua/catalog";
import { useAqua } from "@/lib/aqua/store";
import type { PostKind } from "@/lib/aqua/types";
import { cn } from "@/lib/utils";
import { BookOpen, ImageIcon, ShoppingBag, Type } from "lucide-react";
import { toast } from "sonner";

const KINDS: { id: PostKind; label: string; icon: typeof Type }[] = [
  { id: "text", label: "Text", icon: Type },
  { id: "photo", label: "Photo", icon: ImageIcon },
  { id: "book", label: "Book", icon: BookOpen },
  { id: "product", label: "Product", icon: ShoppingBag },
];

export function Composer() {
  const open = useAqua((s) => s.composerOpen);
  const setOpen = useAqua((s) => s.setComposerOpen);
  const addPost = useAqua((s) => s.addPost);
  const [kind, setKind] = useState<PostKind>("text");
  const [text, setText] = useState("");
  const [mediaId, setMediaId] = useState(media[1]?.id);
  const [bookId, setBookId] = useState(books[0]?.id);
  const [productId, setProductId] = useState(products[0]?.id);

  const mine = useMemo(() => media.filter((m) => m.ownerId === "samuel"), []);

  function publish() {
    const body = text.trim();
    if (kind === "text" && !body) return;
    addPost({
      kind,
      text: body || undefined,
      mediaIds: kind === "photo" && mediaId ? [mediaId] : undefined,
      ref:
        kind === "book" && bookId
          ? { type: "book", id: bookId }
          : kind === "product" && productId
            ? { type: "product", id: productId }
            : undefined,
    });
    setText("");
    setOpen(false);
    toast("Published to your feed");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create</DialogTitle>
          <DialogDescription>
            A post can hold text, a photo from your library, a book, or a product. The object is
            referenced, not duplicated.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => {
            const Icon = k.icon;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm",
                  kind === k.id ? "bg-primary text-primary-foreground" : "bg-white/45 hover:bg-white/70",
                )}
              >
                <Icon className="size-3.5" />
                {k.label}
              </button>
            );
          })}
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write the relation, not the inventory…"
        />
        {kind === "photo" && (
          <div className="grid grid-cols-3 gap-2">
            {mine.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMediaId(m.id)}
                className={cn(
                  "overflow-hidden rounded-xl ring-2 ring-transparent",
                  mediaId === m.id && "ring-primary",
                )}
              >
                <img src={m.src} alt={m.alt} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        {kind === "book" && (
          <select
            className="h-11 w-full rounded-full bg-white/50 px-4 text-sm"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        )}
        {kind === "product" && (
          <select
            className="h-11 w-full rounded-full bg-white/50 px-4 text-sm"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        )}
        <div className="flex justify-end">
          <Button onClick={publish} disabled={kind === "text" && !text.trim()}>
            Publish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
