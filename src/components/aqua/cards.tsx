import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/aqua/mark";
import {
  getBook,
  getProduct,
  getProfile,
  getStore,
  originLabel,
} from "@/lib/aqua/catalog";
import { useAqua } from "@/lib/aqua/store";
import type { Book, Community, Product, Profile, WikiArticle } from "@/lib/aqua/types";
import { cn, formatCount, formatPrice } from "@/lib/utils";
import { BookOpen, ShoppingBag } from "lucide-react";

export function PersonChip({ profile, className }: { profile: Profile; className?: string }) {
  return (
    <Link
      to="/u/$username"
      params={{ username: profile.handle }}
      className={cn("flex items-center gap-2 rounded-full pr-1", className)}
    >
      <ProfileAvatar profile={profile} size="sm" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium leading-tight">{profile.name}</span>
        <span className="block truncate text-xs text-muted-foreground">@{profile.handle}</span>
      </span>
    </Link>
  );
}

export function BookCover({
  book,
  className,
}: {
  book: Book;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md shadow-glass ring-1 ring-foreground/8",
        className,
      )}
    >
      <img src={book.cover} alt="" className="size-full object-cover" />
    </div>
  );
}

export function BookCard({ book, compact }: { book: Book; compact?: boolean }) {
  const author = getProfile(book.authorId);
  return (
    <Link
      to="/book/$bookId"
      params={{ bookId: book.id }}
      className={cn(
        "glass-card group flex gap-3 p-2 transition-[box-shadow,transform] duration-200 hover:shadow-glass-hover",
        compact ? "items-center" : "flex-col sm:flex-row",
      )}
    >
      <BookCover book={book} className={compact ? "h-16 w-11" : "h-40 w-28 mx-auto sm:mx-0"} />
      <div className="min-w-0 flex-1 p-2">
        <p className="font-display text-lg font-medium leading-snug tracking-tight">{book.title}</p>
        {book.subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">{book.subtitle}</p>
        )}
        {author && (
          <p className="mt-2 text-xs text-muted-foreground">
            {author.name} · {formatCount(book.reads)} reads
          </p>
        )}
        {!compact && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{book.synopsis}</p>}
      </div>
    </Link>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useAqua((s) => s.addToCart);
  const store = getStore(product.storeId);
  const native = product.origin === "AQUA";
  return (
    <article className="glass-card overflow-hidden">
      <Link to="/product/$productId" params={{ productId: product.id }} className="block">
        <img src={product.image} alt="" className="aspect-square w-full object-cover" />
      </Link>
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link to="/product/$productId" params={{ productId: product.id }}>
            <h3 className="font-medium leading-snug">{product.title}</h3>
          </Link>
          <Badge tone="quiet">{originLabel(product.origin)}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{store?.name}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="font-medium tabular-nums">{formatPrice(product.price, product.currency)}</p>
          {native ? (
            <Button size="sm" onClick={() => addToCart(product.id)}>
              <ShoppingBag className="size-3.5" />
              Add
            </Button>
          ) : (
            <Button size="sm" variant="secondary" asChild>
              <a href={product.externalUrl} target="_blank" rel="noreferrer">
                Continue at {originLabel(product.origin)}
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function WikiCard({ article }: { article: WikiArticle }) {
  const author = getProfile(article.authorIds[0] ?? "");
  return (
    <Link to="/wiki/$articleId" params={{ articleId: article.id }} className="glass-card block overflow-hidden">
      {article.cover && (
        <img src={article.cover} alt="" className="h-36 w-full object-cover" />
      )}
      <div className="space-y-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={article.kind === "scientific" ? "primary" : "foam"}>
            {article.kind === "scientific" ? "Scientific" : "Popular"}
          </Badge>
          {article.status && <Badge tone="quiet">{article.status}</Badge>}
        </div>
        <h3 className="font-display text-xl font-medium tracking-tight">{article.title}</h3>
        <p className="text-sm text-muted-foreground">{article.excerpt}</p>
        {author && <p className="text-xs text-muted-foreground">{author.name}</p>}
      </div>
    </Link>
  );
}

export function CommunityCard({ community }: { community: Community }) {
  const joined = useAqua((s) => s.joined[community.id]);
  const toggle = useAqua((s) => s.toggleJoin);
  return (
    <article className="glass-card overflow-hidden">
      <Link to="/communities/$communityId" params={{ communityId: community.id }}>
        <img src={community.cover} alt="" className="h-28 w-full object-cover" />
      </Link>
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <Link to="/communities/$communityId" params={{ communityId: community.id }}>
            <h3 className="font-medium">{community.name}</h3>
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{community.description}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatCount(community.members)} members
            {community.location ? ` · ${community.location}` : ""}
          </p>
        </div>
        <Button size="sm" variant={joined ? "secondary" : "default"} onClick={() => toggle(community.id)}>
          {joined ? "Joined" : "Join"}
        </Button>
      </div>
    </article>
  );
}

export function FollowButton({ profile }: { profile: Profile }) {
  const extra = useAqua((s) => s.extraFollows[profile.id]);
  const un = useAqua((s) => s.unfollows[profile.id]);
  const toggle = useAqua((s) => s.toggleFollow);
  const me = getProfile("samuel");
  if (profile.id === "samuel") return null;
  const following = !un && (extra || Boolean(me?.following.includes(profile.id)));
  return (
    <Button size="sm" variant={following ? "secondary" : "default"} onClick={() => toggle(profile.id)}>
      {following ? "Following" : "Follow"}
    </Button>
  );
}

export function ContinueReading() {
  const reading = useAqua((s) => s.reading);
  const entries = Object.entries(reading);
  if (!entries.length) return null;
  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Continue reading
      </p>
      {entries.map(([bookId, cursor]) => {
        const book = getBook(bookId);
        if (!book) return null;
        return (
          <Link
            key={bookId}
            to="/read/$bookId/$chapterId"
            params={{ bookId, chapterId: cursor.chapterId }}
            className="glass-card flex items-center gap-3 p-2"
          >
            <BookCover book={book} className="h-14 w-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{book.title}</p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-foam">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.round(cursor.progress * 100)}%` }}
                />
              </div>
            </div>
            <BookOpen className="size-4 text-muted-foreground" />
          </Link>
        );
      })}
    </div>
  );
}
