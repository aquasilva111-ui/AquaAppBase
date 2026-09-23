import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Bookmark, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FollowButton, PersonChip } from "@/components/aqua/cards";
import { CommentThread } from "@/components/aqua/comments";
import { EmptyNote, PageTitle } from "@/components/aqua/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getProfile } from "@/lib/aqua/catalog";
import { PHOTO_TAGS, photoPins, relatedPins, searchPins } from "@/lib/aqua/photos";
import { useAqua } from "@/lib/aqua/store";
import type { PhotoPin } from "@/lib/aqua/types";
import { cn, formatCount } from "@/lib/utils";

const RATIO_CLASS: Record<PhotoPin["ratio"], string> = {
  photo: "aspect-[3/4]",
  square: "aspect-square",
  wide: "aspect-[4/3]",
};

function useAllPins(): PhotoPin[] {
  const addedPins = useAqua((s) => s.addedPins);
  return useMemo(() => [...addedPins, ...photoPins], [addedPins]);
}

export function PinCard({ pin }: { pin: PhotoPin }) {
  const saved = useAqua((s) => Boolean(s.savedPins[pin.id]));
  const toggleSavePin = useAqua((s) => s.toggleSavePin);
  const author = getProfile(pin.authorId);

  return (
    <div className="group mb-3 break-inside-avoid">
      <div className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-border)] transition-shadow duration-200 hover:shadow-[var(--shadow-border-hover)]">
        <Link to="/photo/$photoId" params={{ photoId: pin.id }} aria-label={pin.title}>
          <img
            src={pin.src}
            alt={pin.alt}
            loading="lazy"
            decoding="async"
            className={cn("w-full object-cover", RATIO_CLASS[pin.ratio])}
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-deep/35 via-transparent to-deep/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <button
          type="button"
          onClick={() => {
            toggleSavePin(pin.id);
            if (!saved) toast("Saved to your board");
          }}
          className={cn(
            "absolute top-2 right-2 h-8 rounded-full px-3 text-xs font-semibold shadow-sm transition-all",
            saved
              ? "bg-nazar text-primary-foreground"
              : "bg-card/95 text-nazar opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        >
          {saved ? "Saved" : "Save"}
        </button>
        {pin.link && (
          <a
            href={pin.link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="glass-capsule absolute bottom-2 left-2 inline-flex h-7 max-w-[70%] items-center gap-1 px-2.5 text-[11px] font-medium text-nazar opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            <ArrowUpRight className="size-3 shrink-0" />
            <span className="truncate">{pin.link.replace(/^https?:\/\//, "")}</span>
          </a>
        )}
      </div>
      <div className="px-1 pt-2">
        <Link
          to="/photo/$photoId"
          params={{ photoId: pin.id }}
          className="block truncate text-sm font-medium"
        >
          {pin.title}
        </Link>
        {author && (
          <p className="truncate text-xs text-muted-foreground">
            {author.name} · {formatCount(pin.saves + (saved ? 1 : 0))} saves
          </p>
        )}
      </div>
    </div>
  );
}

export function PinMasonry({ pins }: { pins: PhotoPin[] }) {
  if (pins.length === 0) {
    return <EmptyNote>No pins here yet. Be the first to add one.</EmptyNote>;
  }
  return <div className="columns-2 gap-3 sm:columns-3">{pins.map((p) => <PinCard key={p.id} pin={p} />)}</div>;
}

function NewPinDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const addPin = useAqua((s) => s.addPin);
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const valid = title.trim().length > 0 && src.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(560px,calc(100vw-1.5rem))] rounded-3xl">
        <DialogHeader>
          <DialogTitle>New pin</DialogTitle>
          <DialogDescription>
            No upload in this study — point to an image URL. AQUA stores the relation; the file stays
            where it lives.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            addPin({
              title: title.trim(),
              description: description.trim() || undefined,
              src: src.trim(),
              alt: title.trim(),
              ratio: "photo",
              tags: tags.length > 0 ? tags : ["Studio"],
              link: link.trim() || undefined,
            });
            toast("Pin added to the board");
            onOpenChange(false);
            setTitle("");
            setSrc("");
            setDescription("");
            setLink("");
            setTags([]);
          }}
        >
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <Input
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            placeholder="Image URL — /aqua/harbor.jpg or https://…"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
          />
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Source link (optional)"
          />
          <div className="flex flex-wrap gap-1.5">
            {PHOTO_TAGS.map((tag) => {
              const on = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags(on ? tags.filter((t) => t !== tag) : [...tags, tag])}
                  className={cn(
                    "h-8 rounded-full px-3 text-xs font-medium",
                    on ? "bg-nazar text-primary-foreground" : "bg-card shadow-[var(--shadow-border)]",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <Button type="submit" disabled={!valid} className="w-full">
            Add pin
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PhotosPage() {
  const all = useAllPins();
  const savedPins = useAqua((s) => s.savedPins);
  const [tag, setTag] = useState<string>("All");
  const [q, setQ] = useState("");
  const [newOpen, setNewOpen] = useState(false);

  const visible = useMemo(() => {
    let list = all;
    if (tag === "Saved") list = list.filter((p) => savedPins[p.id]);
    else if (tag !== "All") list = list.filter((p) => p.tags.includes(tag));
    return searchPins(list, q);
  }, [all, tag, q, savedPins]);

  const chips = ["All", ...PHOTO_TAGS, "Saved"];

  return (
    <div>
      <PageTitle
        kicker="Media"
        title="Photos"
        body="A pinboard on the graph. Saves stay on this device; sources stay where they live."
        action={
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="size-4" />
            New pin
          </Button>
        }
      />
      <div className="mb-4 flex items-center gap-2">
        <div className="no-scrollbar flex flex-1 gap-1 overflow-x-auto">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setTag(c)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm",
                tag === c
                  ? "bg-nazar text-primary-foreground"
                  : "bg-card text-foreground shadow-[var(--shadow-border)]",
              )}
            >
              {c === "Saved" && <Bookmark className={cn("size-3.5", tag === "Saved" && "fill-current")} />}
              {c}
            </button>
          ))}
        </div>
        <div className="relative hidden w-44 sm:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter pins…"
            className="h-9 rounded-full border-0 bg-card pl-9 shadow-[var(--shadow-border)]"
          />
        </div>
      </div>
      <PinMasonry pins={visible} />
      <NewPinDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

export function PhotoDetailPage({ photoId }: { photoId: string }) {
  const all = useAllPins();
  const saved = useAqua((s) => Boolean(s.savedPins[photoId]));
  const toggleSavePin = useAqua((s) => s.toggleSavePin);
  const navigate = useNavigate();

  const pin = all.find((p) => p.id === photoId);
  if (!pin) return <EmptyNote>Pin not found.</EmptyNote>;

  const author = getProfile(pin.authorId);
  const related = relatedPins(pin, all);

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate({ to: "/photos" })}
        className="icon-ring mb-4"
        aria-label="Back to photos"
      >
        <ArrowLeft className="size-4" />
      </button>

      <div className="glass-card overflow-hidden md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <img src={pin.src} alt={pin.alt} className="h-full max-h-[70dvh] w-full object-cover" />
        <div className="flex flex-col p-5">
          <div className="flex items-center gap-2">
            {pin.link && (
              <a
                href={pin.link}
                target="_blank"
                rel="noreferrer"
                className="glass-capsule inline-flex h-9 items-center gap-1.5 px-3 text-xs font-medium text-nazar"
              >
                <ArrowUpRight className="size-3.5" />
                {pin.link.replace(/^https?:\/\//, "")}
              </a>
            )}
            <Button
              className="ml-auto"
              variant={saved ? "secondary" : "default"}
              onClick={() => {
                toggleSavePin(pin.id);
                if (!saved) toast("Saved to your board");
              }}
            >
              <Bookmark className={cn("size-4", saved && "fill-current")} />
              {saved ? "Saved" : "Save"}
            </Button>
          </div>

          <h1 className="font-display mt-4 text-3xl font-medium tracking-tight">{pin.title}</h1>
          {pin.description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pin.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pin.tags.map((t) => (
              <Badge key={t} tone="foam">
                {t}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatCount(pin.saves + (saved ? 1 : 0))} saves
          </p>

          {author && (
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-foreground/8 pt-4">
              <PersonChip profile={author} />
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {formatCount(author.followers)} followers
                </span>
                <FollowButton profile={author} />
              </div>
            </div>
          )}

          <div className="mt-5 border-t border-foreground/8 pt-4">
            <CommentThread targetType="photo" targetId={pin.id} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-center font-display text-2xl font-medium">More like this</h2>
          <PinMasonry pins={related} />
        </section>
      )}
    </div>
  );
}
