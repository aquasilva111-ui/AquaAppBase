import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { BookCard, FollowButton, PersonChip, ProductCard, WikiCard } from "@/components/aqua/cards";
import { CommentThread } from "@/components/aqua/comments";
import { ProfileAvatar } from "@/components/aqua/mark";
import { PostCard } from "@/components/aqua/post-card";
import { EmptyNote, PageTitle } from "@/components/aqua/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  articles,
  books,
  chapterOf,
  communities,
  events,
  getArticle,
  getBook,
  getProduct,
  getProfile,
  getProfileByHandle,
  getStore,
  media,
  ME_ID,
  messages,
  originLabel,
  products,
  profiles,
  stores,
  threads,
} from "@/lib/aqua/catalog";
import { mergePosts } from "@/lib/aqua/feed";
import { useAqua } from "@/lib/aqua/store";
import { cn, formatCount, formatPrice, formatRelative } from "@/lib/utils";
import { toast } from "sonner";

function useChildRoute(parentPath: string) {
  return useRouterState({
    select: (s) => s.location.pathname.startsWith(parentPath + "/"),
  });
}

export function BooksPage() {
  return (
    <div>
      <PageTitle kicker="Publishing" title="Books" body="Read as a thread. The file can live elsewhere." />
      <div className="grid gap-3">
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </div>
  );
}

export function BookPage({ bookId }: { bookId: string }) {
  const book = getBook(bookId);
  const cursor = useAqua((s) => s.reading[bookId]);
  if (!book) return <EmptyNote>Book not found.</EmptyNote>;
  const author = getProfile(book.authorId);
  const start = book.chapters[0];
  const resume = cursor ? chapterOf(book, cursor.chapterId) : start;
  return (
    <div>
      <div className="glass-card flex flex-col gap-5 p-5 sm:flex-row">
        <img src={book.cover} alt="" className="mx-auto h-64 w-44 rounded-lg object-cover sm:mx-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-[0.16em] text-nazar uppercase">{book.language}</p>
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
                  {cursor ? "Continue" : "Start reading"}
                </Link>
              </Button>
            )}
            <Button variant="secondary" asChild>
              <Link to="/u/$username/shop" params={{ username: author?.handle ?? "samuel" }}>
                Shop edition
              </Link>
            </Button>
          </div>
        </div>
      </div>
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
              </span>
              <BookOpen className="size-4 text-nazar" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ReadPage({ bookId, chapterId }: { bookId: string; chapterId: string }) {
  const book = getBook(bookId);
  const setReading = useAqua((s) => s.setReading);
  const highlights = useAqua((s) => s.highlights);
  const toggleHighlight = useAqua((s) => s.toggleHighlight);
  if (!book) return <EmptyNote>Book not found.</EmptyNote>;
  const chapter = chapterOf(book, chapterId);
  if (!chapter) return <EmptyNote>Chapter not found.</EmptyNote>;
  const idx = book.chapters.findIndex((c) => c.id === chapter.id);
  const prev = book.chapters[idx - 1];
  const next = book.chapters[idx + 1];

  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-xs tracking-[0.16em] text-nazar uppercase">{book.title}</p>
      <h1 className="font-display mt-2 text-3xl font-medium">{chapter.title}</h1>
      <div className="mt-8 space-y-6 text-[17px] leading-8">
        {chapter.blocks.map((block) => {
          if (block.type === "HEADING")
            return (
              <h2 key={block.id} className="font-display text-2xl">
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
          if (block.type === "AUTHOR_NOTE")
            return (
              <p key={block.id} className="rounded-2xl bg-foam p-4 text-sm">
                {block.text}
              </p>
            );
          const on = Boolean(highlights[block.id]);
          return (
            <p
              key={block.id}
              onPointerUp={() => {
                toggleHighlight(block.id);
                setReading(book.id, {
                  chapterId: chapter.id,
                  blockId: block.id,
                  progress: (idx + 1) / book.chapters.length,
                });
              }}
              className={cn("cursor-text", on && "bg-iris/40")}
            >
              {block.text}
            </p>
          );
        })}
      </div>
      <div className="mt-8">
        <CommentThread targetType="chapter" targetId={chapter.id} />
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

export function WikiIndex() {
  const [kind, setKind] = useState<"all" | "popular" | "scientific">("all");
  const list = articles.filter((a) => kind === "all" || a.kind === kind);
  return (
    <div>
      <PageTitle kicker="Knowledge" title="Wiki" body="Popular pages and scientific records. No fake certification." />
      <div className="mb-4 flex gap-2">
        {(["all", "popular", "scientific"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={cn(
              "h-9 rounded-full px-4 text-sm capitalize",
              kind === k ? "bg-nazar text-primary-foreground" : "bg-white shadow-[var(--shadow-border)]",
            )}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        {list.map((a) => (
          <WikiCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}

export function WikiPage({ articleId }: { articleId: string }) {
  const article = getArticle(articleId);
  if (!article) return <EmptyNote>Article not found.</EmptyNote>;
  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-xs tracking-[0.16em] text-nazar uppercase">{article.kind}</p>
      <h1 className="font-display mt-2 text-3xl font-medium">{article.title}</h1>
      <p className="mt-2 text-muted-foreground">{article.excerpt}</p>
      <div className="mt-6 space-y-4 text-[16px] leading-7">
        {article.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-8">
        <CommentThread targetType="article" targetId={article.id} />
      </div>
    </article>
  );
}

export function MarketplacePage() {
  return (
    <div>
      <PageTitle
        kicker="Commerce"
        title="Marketplace"
        body="Each product keeps its origin. Native AQUA can close a cart. Shopify and Mercado Libre stay links."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export function ProductPage({ productId }: { productId: string }) {
  const product = getProduct(productId);
  const addToCart = useAqua((s) => s.addToCart);
  if (!product) return <EmptyNote>Product not found.</EmptyNote>;
  const store = getStore(product.storeId);
  const native = product.origin === "AQUA";
  return (
    <div className="glass-card overflow-hidden">
      <img src={product.image} alt="" className="aspect-video w-full object-cover" />
      <div className="p-5">
        <p className="text-xs text-nazar">{originLabel(product.origin)}</p>
        <h1 className="font-display mt-1 text-3xl font-medium">{product.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
        <p className="mt-4 text-xl font-semibold">{formatPrice(product.price, product.currency)}</p>
        {store && <p className="mt-1 text-xs text-muted-foreground">Sold by {store.name}</p>}
        {native ? (
          <Button
            className="mt-5"
            onClick={() => {
              addToCart(product.id);
              toast("Added to cart");
            }}
          >
            Add to cart
          </Button>
        ) : (
          <a
            href={product.externalUrl}
            className="mt-5 inline-flex h-11 items-center rounded-full bg-nazar px-5 text-sm text-primary-foreground"
            target="_blank"
            rel="noreferrer"
          >
            Open on {originLabel(product.origin)}
          </a>
        )}
      </div>
    </div>
  );
}

export function ProfilePage({ username }: { username: string }) {
  const childActive = useChildRoute(`/u/${username}`);
  const profile = getProfileByHandle(username);
  if (childActive) return <Outlet />;
  if (!profile) return <EmptyNote>Profile not found.</EmptyNote>;
  const authored = books.filter((b) => b.authorId === profile.id);
  const shop = products.filter((p) => p.sellerId === profile.id);
  const posts = mergePosts().filter((p) => p.authorId === profile.id);
  return (
    <div>
      <div className="glass-card p-5">
        <div className="flex items-start gap-4">
          <ProfileAvatar profile={profile} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-medium">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.handle}</p>
            <p className="mt-3 text-sm">{profile.bio}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatCount(profile.followers)} followers · {profile.location}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <FollowButton profile={profile} />
              <Button variant="secondary" asChild>
                <Link to="/u/$username/shop" params={{ username: profile.handle }}>
                  Shop
                </Link>
              </Button>
              {profile.id === ME_ID && (
                <Button variant="secondary" asChild>
                  <Link to="/saved">Saved</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {authored.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-2 font-semibold">Books</h2>
          <div className="grid gap-3">
            {authored.map((b) => (
              <BookCard key={b.id} book={b} compact />
            ))}
          </div>
        </section>
      )}
      {shop.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-2 font-semibold">From the shop</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {shop.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
      <section className="mt-5">
        <h2 className="mb-2 font-semibold">Posts</h2>
        {posts.length === 0 ? (
          <EmptyNote>No posts yet.</EmptyNote>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function ShopPage({ username }: { username: string }) {
  const profile = getProfileByHandle(username);
  if (!profile) return <EmptyNote>Shop not found.</EmptyNote>;
  const list = products.filter((p) => p.sellerId === profile.id);
  return (
    <div>
      <PageTitle kicker={`@${profile.handle}`} title="Shop" />
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export function SearchPage({ q }: { q: string }) {
  const query = q.trim().toLowerCase().replace(/^#/, "");
  const people = query
    ? profiles.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.handle.includes(query) ||
          p.bio.toLowerCase().includes(query),
      )
    : profiles;
  const foundBooks = query
    ? books.filter((b) => b.title.toLowerCase().includes(query) || b.synopsis.toLowerCase().includes(query))
    : books;
  const foundProducts = query
    ? products.filter((p) => p.title.toLowerCase().includes(query))
    : products.slice(0, 4);
  return (
    <div>
      <PageTitle kicker="Find" title={q || "People"} body="Profiles, books, shops — one graph." />
      <div className="space-y-2">
        {people.map((p) => (
          <div key={p.id} className="glass-card flex items-center justify-between p-3">
            <PersonChip profile={p} />
            <FollowButton profile={p} />
          </div>
        ))}
      </div>
      {foundBooks.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-semibold">Books</h2>
          <div className="grid gap-3">
            {foundBooks.map((b) => (
              <BookCard key={b.id} book={b} compact />
            ))}
          </div>
        </section>
      )}
      {foundProducts.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-semibold">Shops</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {foundProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function DiscoverPage() {
  return (
    <div>
      <PageTitle kicker="Explore" title="Discover" body="Communities, events, and people nearby in the graph." />
      <div className="grid gap-3">
        {communities.map((c) => (
          <Link
            key={c.id}
            to="/communities/$communityId"
            params={{ communityId: c.id }}
            className="glass-card overflow-hidden"
          >
            <img src={c.cover} alt="" className="h-28 w-full object-cover" />
            <div className="p-4">
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.description}</p>
            </div>
          </Link>
        ))}
      </div>
      <h2 className="mt-6 mb-2 font-semibold">Events</h2>
      <ul className="space-y-2">
        {events.map((e) => (
          <li key={e.id} className="glass-card p-4">
            <p className="font-medium">{e.title}</p>
            <p className="text-sm text-muted-foreground">
              {e.when} · {e.where}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CommunitiesPage() {
  const childActive = useChildRoute("/communities");
  if (childActive) return <Outlet />;
  return (
    <div>
      <PageTitle kicker="Social" title="Communities" />
      <div className="grid gap-3">
        {communities.map((c) => (
          <Link key={c.id} to="/communities/$communityId" params={{ communityId: c.id }} className="glass-card p-4">
            <p className="font-semibold">{c.name}</p>
            <p className="text-sm text-muted-foreground">{c.description}</p>
            <p className="mt-1 text-xs">{formatCount(c.members)} members</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CommunityPage({ communityId }: { communityId: string }) {
  const community = communities.find((c) => c.id === communityId);
  const joined = useAqua((s) => Boolean(s.joined[communityId]));
  const toggleJoin = useAqua((s) => s.toggleJoin);
  const addedPosts = useAqua((s) => s.addedPosts);
  const feed = useMemo(
    () =>
      mergePosts()
        .filter((p) => p.communityId === communityId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [addedPosts, communityId],
  );
  if (!community) return <EmptyNote>Community not found.</EmptyNote>;
  const communityEvents = events.filter((e) => e.communityId === community.id);
  return (
    <div>
      <img src={community.cover} alt="" className="h-40 w-full rounded-[1.35rem] object-cover" />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium">{community.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{community.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatCount(community.members + (joined ? 1 : 0))} members
            {community.location ? ` · ${community.location}` : ""}
          </p>
        </div>
        <Button onClick={() => toggleJoin(community.id)}>{joined ? "Joined" : "Join"}</Button>
      </div>
      {communityEvents.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-semibold">Events</h2>
          <ul className="space-y-2">
            {communityEvents.map((e) => (
              <li key={e.id} className="glass-card p-4">
                <p className="font-medium">{e.title}</p>
                <p className="text-sm text-muted-foreground">
                  {e.when} · {e.where}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="mt-6">
        <h2 className="mb-2 font-semibold">Posts</h2>
        {feed.length === 0 ? (
          <EmptyNote>No posts in this community yet.</EmptyNote>
        ) : (
          <div className="space-y-3">
            {feed.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function MessagesIndex() {
  const childActive = useChildRoute("/messages");
  if (childActive) return <Outlet />;
  return (
    <div>
      <PageTitle kicker="Chat" title="Messages" />
      <ul className="space-y-2">
        {threads.map((t) => {
          const other = t.participantIds.find((id) => id !== "samuel");
          const profile = other ? getProfile(other) : undefined;
          if (!profile) return null;
          return (
            <li key={t.id}>
              <Link to="/messages/$threadId" params={{ threadId: t.id }} className="glass-card flex items-center gap-3 p-3">
                <ProfileAvatar profile={profile} />
                <span className="min-w-0">
                  <span className="block font-medium">{profile.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">{t.preview}</span>
                </span>
                <span className="ml-auto text-xs text-muted-foreground">{formatRelative(t.at)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ThreadPage({ threadId }: { threadId: string }) {
  const thread = threads.find((t) => t.id === threadId);
  const allExtra = useAqua((s) => s.extraMessages);
  const extra = useMemo(() => allExtra.filter((m) => m.threadId === threadId), [allExtra, threadId]);
  const sendMessage = useAqua((s) => s.sendMessage);
  const [text, setText] = useState("");
  if (!thread) return <EmptyNote>Thread not found.</EmptyNote>;
  const other = getProfile(thread.participantIds.find((id) => id !== "samuel")!);
  const list = [...messages.filter((m) => m.threadId === threadId), ...extra];
  return (
    <div className="flex min-h-[60dvh] flex-col">
      <h1 className="font-display text-2xl">{other?.name ?? "Chat"}</h1>
      <ul className="mt-4 flex-1 space-y-2">
        {list.map((m) => {
          const mine = m.fromId === "samuel";
          return (
            <li key={m.id} className={cn("flex", mine && "justify-end")}>
              <span
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                  mine ? "bg-nazar text-primary-foreground" : "bg-white shadow-[var(--shadow-border)]",
                )}
              >
                {m.text}
              </span>
            </li>
          );
        })}
      </ul>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const t = text.trim();
          if (!t) return;
          sendMessage(threadId, t);
          setText("");
        }}
      >
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}

export function StudioPage() {
  return (
    <div>
      <PageTitle kicker="Create" title="Studio" body="Photos, video sketches, and the files you keep." />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {media.map((m) => (
          <img key={m.id} src={m.src} alt={m.alt} className="aspect-square w-full rounded-2xl object-cover" />
        ))}
      </div>
    </div>
  );
}

export function CartPage() {
  const cart = useAqua((s) => s.cart);
  const setQty = useAqua((s) => s.setQty);
  const removeFromCart = useAqua((s) => s.removeFromCart);
  const clearOrigin = useAqua((s) => s.clearOrigin);
  const lines = cart.map((i) => ({ ...i, product: getProduct(i.productId)! })).filter((l) => l.product);
  const native = lines.filter((l) => l.product.origin === "AQUA");
  const total = native.reduce((n, l) => n + l.product.price * l.qty, 0);
  return (
    <div>
      <PageTitle kicker="Commerce" title="Cart" body="Only AQUA-native items can close here." />
      {lines.length === 0 && <EmptyNote>Cart is empty.</EmptyNote>}
      <ul className="space-y-2">
        {lines.map((l) => (
          <li key={l.productId} className="glass-card flex items-center gap-3 p-3">
            <img src={l.product.image} alt="" className="size-16 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{l.product.title}</p>
              <p className="text-xs text-muted-foreground">{originLabel(l.product.origin)}</p>
            </div>
            <Input
              type="number"
              min={1}
              value={l.qty}
              onChange={(e) => setQty(l.productId, Number(e.target.value) || 1)}
              className="w-16"
            />
            <button type="button" className="text-xs text-muted-foreground" onClick={() => removeFromCart(l.productId)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      {native.length > 0 && (
        <div className="mt-5 flex items-center justify-between">
          <p className="font-semibold">{formatPrice(total)}</p>
          <Button
            onClick={() => {
              clearOrigin(native.map((l) => l.productId));
              toast("Order placed for AQUA-native items");
            }}
          >
            Checkout AQUA items
          </Button>
        </div>
      )}
    </div>
  );
}

export function NotificationsPage() {
  const notes = useAqua((s) => s.notifications);
  const markAllRead = useAqua((s) => s.markAllRead);
  return (
    <div>
      <PageTitle
        kicker="Inbox"
        title="Notifications"
        action={
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            Mark read
          </Button>
        }
      />
      <ul className="space-y-2">
        {notes.map((n) => (
          <li key={n.id}>
            <a href={n.href} className="glass-card block p-4 text-sm">
              {n.unread && <span className="mr-2 inline-block size-2 rounded-full bg-nazar" />}
              {n.text}
              <span className="mt-1 block text-xs text-muted-foreground">{formatRelative(n.at)}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DirectionPage({ layer }: { layer: string }) {
  const copy: Record<string, { title: string; body: string }> = {
    ai: {
      title: "AI",
      body: "Direction, not a product. There is no assistant shipping in this client yet.",
    },
    live: {
      title: "Live & movies",
      body: "Rooms and streams are a later layer. The graph can point to a room when a room exists.",
    },
    wallet: {
      title: "Wallet",
      body: "Payments and payouts are not built. AQUA will not pretend a ledger exists.",
    },
  };
  const c = copy[layer] ?? {
    title: layer,
    body: "This module is direction. The feed, books, and shops are the working surface.",
  };
  return (
    <div>
      <PageTitle kicker="Direction" title={c.title} body={c.body} />
      <EmptyNote>Placeholder on purpose. The tab bar stays Home · Search · + · Chat · Profile.</EmptyNote>
    </div>
  );
}

export function CommercePage() {
  return (
    <div>
      <PageTitle kicker="Sellers" title="Commerce" body="Origin-aware shops. No fake ads manager." />
      <div className="grid gap-3">
        {stores.map((s) => (
          <div key={s.id} className="glass-card p-4">
            <p className="font-semibold">{s.name}</p>
            <p className="text-sm text-muted-foreground">{originLabel(s.origin)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const eventsLog = useAqua((s) => s.events);
  return (
    <div>
      <PageTitle kicker="Studio" title="Analytics" body="Local events on this device. Not a surveillance suite." />
      {eventsLog.length === 0 ? (
        <EmptyNote>No events yet. Read, like, or save something.</EmptyNote>
      ) : (
        <ul className="space-y-2">
          {eventsLog.slice(0, 40).map((e) => (
            <li key={e.id} className="glass-card p-3 text-sm">
              {e.type} · {e.entityType}/{e.entityId}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WritePage() {
  const navigate = useNavigate();
  const addPost = useAqua((s) => s.addPost);
  const [text, setText] = useState("");
  return (
    <div>
      <PageTitle kicker="Create" title="Write" />
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="A short message…" />
      <Button
        className="mt-3"
        onClick={() => {
          if (!text.trim()) return;
          addPost({ kind: "text", text: text.trim() });
          toast("Published");
          navigate({ to: "/" });
        }}
      >
        Publish
      </Button>
    </div>
  );
}

export function PostPage({ postId }: { postId: string }) {
  const addedPosts = useAqua((s) => s.addedPosts);
  const post = useMemo(() => mergePosts().find((p) => p.id === postId), [addedPosts, postId]);
  if (!post) return <EmptyNote>Post not found.</EmptyNote>;
  return (
    <div>
      <PostCard post={post} />
      <section className="glass-card mt-3 p-4">
        <h2 className="mb-3 font-semibold">Notes</h2>
        <CommentThread targetType="post" targetId={post.id} />
      </section>
    </div>
  );
}

export function SavedPage() {
  const saved = useAqua((s) => s.saved);
  const addedPosts = useAqua((s) => s.addedPosts);
  const list = useMemo(
    () => mergePosts().filter((p) => saved[p.id]),
    [saved, addedPosts],
  );
  return (
    <div>
      <PageTitle
        kicker="Collection"
        title="Saved"
        body="Posts you bookmarked. Kept on this device, like everything else here."
      />
      {list.length === 0 ? (
        <EmptyNote>Nothing saved yet. Tap the bookmark on any post.</EmptyNote>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
