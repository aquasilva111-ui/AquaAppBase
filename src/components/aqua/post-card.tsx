import { Link } from "@tanstack/react-router";
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Repeat2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookCard, ProductCard } from "@/components/aqua/cards";
import { CommentThread } from "@/components/aqua/comments";
import { ProfileAvatar } from "@/components/aqua/mark";
import {
  getArticle,
  getBook,
  getCommunity,
  getMedia,
  getProduct,
  getProfile,
} from "@/lib/aqua/catalog";
import { useAqua } from "@/lib/aqua/store";
import type { Post } from "@/lib/aqua/types";
import { cn, formatCount, formatRelative } from "@/lib/utils";
import { useState } from "react";

export function PostCard({ post }: { post: Post }) {
  const author = getProfile(post.authorId);
  const liked = useAqua((s) => Boolean(s.liked[post.id]));
  const saved = useAqua((s) => Boolean(s.saved[post.id]));
  const reposted = useAqua((s) => Boolean(s.reposted[post.id]));
  const toggleLike = useAqua((s) => s.toggleLike);
  const toggleSave = useAqua((s) => s.toggleSave);
  const toggleRepost = useAqua((s) => s.toggleRepost);
  const [openComments, setOpenComments] = useState(false);
  const extraComments = useAqua(
    (s) => s.comments.filter((c) => c.targetType === "post" && c.targetId === post.id).length,
  );
  if (!author) return null;

  const likes = post.likes + (liked ? 1 : 0);
  const saves = post.saves + (saved ? 1 : 0);
  const reposts = post.reposts + (reposted ? 1 : 0);
  const comments = Math.max(post.comments, extraComments);
  const community = post.communityId ? getCommunity(post.communityId) : undefined;
  const assets = (post.mediaIds ?? []).map(getMedia).filter(Boolean);

  return (
    <article className="glass-card p-4">
      <header className="flex items-center gap-2.5">
        <Link to="/u/$username" params={{ username: author.handle }}>
          <ProfileAvatar profile={author} size="sm" />
        </Link>
        <Link
          to="/u/$username"
          params={{ username: author.handle }}
          className="text-sm font-semibold"
        >
          @{author.handle}
        </Link>
        <span className="text-sm text-muted-foreground">· {formatRelative(post.createdAt)}</span>
        {community && (
          <Link
            to="/communities/$communityId"
            params={{ communityId: community.id }}
            className="text-xs text-nazar"
          >
            {community.name}
          </Link>
        )}
        <button type="button" aria-label="More" className="ml-auto flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foam">
          <MoreHorizontal className="size-4" />
        </button>
      </header>

      {post.external && !assets.length && (
        <Badge tone="quiet" className="mt-3">
          Referenced via {post.external.platform}
        </Badge>
      )}

      {post.text && <p className="mt-3 text-[15px] leading-relaxed">{linkify(post.text)}</p>}

      {assets.length >= 2 && (
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {assets.slice(0, 2).map((asset) => (
            <img
              key={asset!.id}
              src={asset!.src}
              alt={asset!.alt}
              className="aspect-4/3 w-full rounded-2xl object-cover"
            />
          ))}
        </div>
      )}
      {assets.length === 1 && (
        <img
          src={assets[0]!.src}
          alt={assets[0]!.alt}
          className="mt-3 aspect-4/3 w-full rounded-2xl object-cover"
        />
      )}

      {post.ref?.type === "book" && getBook(post.ref.id) && (
        <div className="mt-3">
          <BookCard book={getBook(post.ref.id)!} compact />
        </div>
      )}
      {post.ref?.type === "product" && getProduct(post.ref.id) && (
        <div className="mt-3">
          <ProductCard product={getProduct(post.ref.id)!} />
        </div>
      )}
      {post.ref?.type === "article" && getArticle(post.ref.id) && (
        <Link
          to="/wiki/$articleId"
          params={{ articleId: post.ref.id }}
          className="mt-3 block rounded-2xl bg-foam p-3"
        >
          <p className="text-xs tracking-wide text-nazar uppercase">Wiki</p>
          <p className="font-display text-lg">{getArticle(post.ref.id)!.title}</p>
          <p className="text-sm text-muted-foreground">{getArticle(post.ref.id)!.excerpt}</p>
        </Link>
      )}

      <footer className="mt-2 flex items-center gap-1 px-0.5 text-muted-foreground">
        <Action active={liked} label={formatCount(likes)} onClick={() => toggleLike(post.id)}>
          <Heart className="size-[18px] fill-primary text-primary" />
        </Action>
        <Action label={formatCount(comments)} onClick={() => setOpenComments((v) => !v)}>
          <MessageCircle className="size-[18px]" />
        </Action>
        <Action active={reposted} label={formatCount(reposts)} onClick={() => toggleRepost(post.id)}>
          <Repeat2 className={cn("size-[18px]", reposted && "text-ok")} />
        </Action>
        <span className="flex-1" />
        <Action active={saved} label="" onClick={() => toggleSave(post.id)}>
          <Bookmark className={cn("size-[18px]", saved && "fill-nazar text-nazar")} />
        </Action>
      </footer>

      {openComments && (
        <div className="mt-4 border-t border-foreground/8 pt-3">
          <CommentThread targetType="post" targetId={post.id} />
        </div>
      )}
    </article>
  );
}

function linkify(text: string) {
  const parts = text.split(/(#[\p{L}\d_]+)/u);
  return parts.map((part, i) =>
    part.startsWith("#") ? (
      <Link key={i} to="/search" search={{ q: part }} className="text-nazar">
        {part}
      </Link>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function Action({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 min-w-11 items-center gap-1.5 rounded-full px-2 text-xs tabular-nums hover:bg-foam",
        active && "text-foreground",
      )}
    >
      {children}
      {label}
    </button>
  );
}
