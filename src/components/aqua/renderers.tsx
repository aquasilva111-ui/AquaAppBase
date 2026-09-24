import { Link } from "@tanstack/react-router";
import { BookCard, WikiCard } from "@/components/aqua/cards";
import { PostCard } from "@/components/aqua/post-card";
import { EmptyNote } from "@/components/aqua/shell";
import { ProfileAvatar } from "@/components/aqua/mark";
import { getArticle, getBook, getMedia, getProduct, getProfile } from "@/lib/aqua/catalog";
import type { ExperienceMode } from "@/lib/aqua/feed-engine";
import type { Post } from "@/lib/aqua/types";
import { cn, formatCount, formatRelative } from "@/lib/utils";

/**
 * Experience renderers (§4, §51). Each one receives the SAME normalized
 * selection from the feed engine and decides how it is consumed. Renderers
 * never fetch, never rank, never know about protocols.
 */

export interface RendererProps {
  posts: Post[];
}

export function getCompatibleModes(post: Post): ExperienceMode[] {
  const modes: ExperienceMode[] = ["social"];
  if (post.kind === "text" || post.kind === "article" || post.kind === "external" || post.kind === "repost") {
    modes.push("threads");
  }
  if (
    post.mediaIds?.length ||
    post.ref?.type === "book" ||
    post.ref?.type === "product" ||
    post.kind === "gallery" ||
    post.kind === "photo"
  ) {
    modes.push("visual");
  }
  if (
    post.kind === "article" ||
    post.kind === "book" ||
    post.ref?.type === "article" ||
    post.ref?.type === "book" ||
    (post.text?.length ?? 0) > 300
  ) {
    modes.push("editorial");
  }
  return modes;
}

function SocialRenderer({ posts }: RendererProps) {
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function ThreadsRenderer({ posts }: RendererProps) {
  return (
    <div>
      {posts.map((post, i) => {
        const author = getProfile(post.authorId);
        if (!author) return null;
        return (
          <div key={post.id} className="relative flex gap-3 pb-5">
            {i < posts.length - 1 && (
              <span className="absolute top-11 left-[19px] h-[calc(100%-2.75rem)] w-px bg-foreground/12" />
            )}
            <Link to="/u/$username" params={{ username: author.handle }} className="shrink-0">
              <ProfileAvatar profile={author} size="sm" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <Link
                  to="/u/$username"
                  params={{ username: author.handle }}
                  className="font-semibold"
                >
                  {author.name}
                </Link>{" "}
                <span className="text-muted-foreground">
                  @{author.handle} · {formatRelative(post.createdAt)}
                </span>
              </p>
              {post.text && (
                <p className="mt-1 text-[15px] leading-relaxed">{post.text}</p>
              )}
              <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatCount(post.likes)} likes</span>
                <Link
                  to="/post/$postId"
                  params={{ postId: post.id }}
                  className="font-medium text-nazar hover:underline"
                >
                  {formatCount(post.comments)} notes · open thread
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VisualRenderer({ posts }: RendererProps) {
  const tiles = posts.flatMap((post) => {
    const shots = (post.mediaIds ?? []).map(getMedia).filter(Boolean);
    const refBook = post.ref?.type === "book" ? getBook(post.ref.id) : undefined;
    const refProduct = post.ref?.type === "product" ? getProduct(post.ref.id) : undefined;
    const items: { id: string; src: string; alt: string; postId: string }[] = shots.map((m) => ({
      id: `${post.id}:${m!.id}`,
      src: m!.src,
      alt: m!.alt,
      postId: post.id,
    }));
    if (refBook) items.push({ id: `${post.id}-book`, src: refBook.cover, alt: refBook.title, postId: post.id });
    if (refProduct)
      items.push({ id: `${post.id}-product`, src: refProduct.image, alt: refProduct.title, postId: post.id });
    return items;
  });

  if (tiles.length === 0) {
    return <EmptyNote>No visual objects in this selection.</EmptyNote>;
  }

  return (
    <div className="columns-2 gap-3 sm:columns-3">
      {tiles.map((tile) => (
        <Link
          key={tile.id}
          to="/post/$postId"
          params={{ postId: tile.postId }}
          className="mb-3 block break-inside-avoid"
        >
          <img
            src={tile.src}
            alt={tile.alt}
            loading="lazy"
            className="w-full rounded-2xl object-cover"
          />
        </Link>
      ))}
    </div>
  );
}

function EditorialRenderer({ posts }: RendererProps) {
  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const article = post.ref?.type === "article" ? getArticle(post.ref.id) : undefined;
        const book = post.ref?.type === "book" ? getBook(post.ref.id) : undefined;
        const author = getProfile(post.authorId);
        if (article) return <WikiCard key={post.id} article={article} />;
        if (book) return <BookCard key={post.id} book={book} compact />;
        return (
          <Link
            key={post.id}
            to="/post/$postId"
            params={{ postId: post.id }}
            className="glass-card block p-6"
          >
            <p className="text-xs tracking-[0.16em] text-nazar uppercase">
              {author?.name ?? "AQUA"} · {formatRelative(post.createdAt)}
            </p>
            <p className="font-display mt-2 text-xl leading-relaxed">{post.text}</p>
            <p className="mt-3 text-xs font-medium text-nazar">Continue reading</p>
          </Link>
        );
      })}
    </div>
  );
}

function EmptyModeRenderer({ posts }: RendererProps) {
  void posts;
  return (
    <EmptyNote>
      No objects compatible with this mode yet. The graph grows; the renderer is already here.
    </EmptyNote>
  );
}

export const rendererRegistry: Record<ExperienceMode, (props: RendererProps) => React.ReactNode> = {
  social: SocialRenderer,
  threads: ThreadsRenderer,
  visual: VisualRenderer,
  editorial: EditorialRenderer,
  // Registered but not selectable until real video objects exist (§52: no fakes).
  shorts: EmptyModeRenderer,
  video: EmptyModeRenderer,
};

export const EXPERIENCE_MODES: { id: ExperienceMode; label: string }[] = [
  { id: "social", label: "Social" },
  { id: "threads", label: "Threads" },
  { id: "visual", label: "Visual" },
  { id: "editorial", label: "Editorial" },
];

export function ModeRow({
  mode,
  onChange,
}: {
  mode: ExperienceMode;
  onChange: (mode: ExperienceMode) => void;
}) {
  return (
    <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto">
      {EXPERIENCE_MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={cn(
            "inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-sm",
            mode === m.id
              ? "bg-nazar text-primary-foreground"
              : "bg-card text-foreground shadow-[var(--shadow-border)]",
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
