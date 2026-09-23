import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Camera,
  ChevronDown,
  Clapperboard,
  Compass,
  Flame,
  Home,
  ImageIcon,
  Mail,
  MessageCircle,
  Music2,
  Newspaper,
  Play,
  Plus,
  Radio,
  Search,
  Sparkles,
  Store,
  UserRound,
  Wallet,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { Composer } from "@/components/aqua/composer";
import { AppDrawer } from "@/components/aqua/drawer";
import { NazarMark, ProfileAvatar } from "@/components/aqua/mark";
import { Input } from "@/components/ui/input";
import { books, getProfile, media } from "@/lib/aqua/catalog";
import { useAqua } from "@/lib/aqua/store";
import { cn } from "@/lib/utils";

const me = getProfile("samuel")!;

const PILLS: { label: string; to: string; icon: typeof BookOpen }[] = [
  { label: "Profiles", to: "/search", icon: UserRound },
  { label: "AI", to: "/direction/ai", icon: Sparkles },
  { label: "Books", to: "/books", icon: BookOpen },
  { label: "Photos", to: "/photos", icon: ImageIcon },
  { label: "Videos", to: "/feed/music", icon: Play },
  { label: "Movies", to: "/direction/live", icon: Clapperboard },
  { label: "Live", to: "/direction/live", icon: Radio },
  { label: "Camera", to: "/studio", icon: Camera },
  { label: "Marketplace", to: "/marketplace", icon: Store },
  { label: "Wallet", to: "/direction/wallet", icon: Wallet },
  { label: "Messages", to: "/messages", icon: Mail },
  { label: "News", to: "/feed/articles", icon: Newspaper },
];

const TRENDING = ["#aquaapp", "#personae", "#waves", "#merchants", "#beautytrending"];

export function AppShell() {
  const setHydrated = useAqua((s) => s.setHydrated);
  useEffect(() => {
    useAqua.persist.rehydrate();
    setHydrated();
  }, [setHydrated]);

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="mx-auto max-w-[1240px] px-3 pt-16 pb-28 lg:px-6 lg:pt-6 lg:pb-10">
        <DesktopHeader />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[168px_minmax(0,1fr)_268px]">
          <SidePills />
          <main className="min-w-0">
            <Outlet />
          </main>
          <RightRail />
        </div>
      </div>
      <MobileTop />
      <BottomNav />
      <Composer />
      <AppDrawer />
      <Toaster position="top-center" richColors={false} />
    </div>
  );
}

function DesktopHeader() {
  return (
    <div className="mb-6 hidden items-center gap-6 lg:grid lg:grid-cols-[168px_minmax(0,1fr)_268px]">
      <Link to="/" aria-label="AQUA home" className="ml-1 w-fit">
        <NazarMark className="size-12" title="AQUA" />
      </Link>
      <FeedChrome />
      <TopActions />
    </div>
  );
}

function TopActions() {
  const setComposer = useAqua((s) => s.setComposerOpen);
  const unread = useAqua((s) => s.notifications.filter((n) => n.unread).length);
  return (
    <div className="flex items-center justify-end gap-2">
      <button type="button" aria-label="Create" onClick={() => setComposer(true)} className="icon-ring">
        <Plus className="size-4" />
      </button>
      <Link to="/notifications" aria-label="Notifications" className="icon-ring relative">
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 size-2 rounded-full bg-tide ring-2 ring-card" />
        )}
      </Link>
      <Link
        to="/u/$username"
        params={{ username: "samuel" }}
        aria-label="Your profile"
        className="flex items-center gap-1"
      >
        <ProfileAvatar profile={me} size="sm" />
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </Link>
    </div>
  );
}

function SidePills() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="sticky top-6 hidden h-fit flex-col gap-2.5 lg:flex">
      {PILLS.map((pill) => {
        const Icon = pill.icon;
        const active = pathname === pill.to || pathname.startsWith(pill.to + "/");
        return (
          <Link key={pill.to + pill.label} to={pill.to} className="pill-nav" data-active={active}>
            <Icon />
            {pill.label}
          </Link>
        );
      })}
    </aside>
  );
}

function RightRail() {
  const [playing, setPlaying] = useState(false);
  const tiles = [
    ...books.map((b) => ({ id: b.id, src: b.cover, alt: b.title, href: `/book/${b.id}` })),
    ...media
      .filter((m) => m.aspect !== "cover")
      .slice(0, 3)
      .map((m) => ({ id: m.id, src: m.src, alt: m.alt, href: "/books" })),
  ].slice(0, 6);
  const vinyls = media.filter((m) => m.aspect !== "cover").slice(0, 6);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 space-y-4">
        <section className="glass-card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-nazar">
            <Flame className="size-4 fill-nazar" /> Trending Topics
          </h2>
          <ul className="mt-2">
            {TRENDING.map((tag, i) => (
              <li key={tag} className={cn(i > 0 && "border-t border-foreground/6")}>
                <Link
                  to="/search"
                  search={{ q: tag }}
                  className="flex h-10 items-center gap-1 text-sm text-nazar hover:opacity-80"
                >
                  <span className="font-medium">{tag}</span>
                  <ArrowUpRight className="size-3.5 text-tide" />
                  <span className="ml-auto text-muted-foreground">···</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-nazar">
            <BookOpen className="size-4" /> #Books and Articles
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {tiles.map((t) => (
              <a key={t.id} href={t.href} className="block">
                <img src={t.src} alt={t.alt} className="aspect-square w-full rounded-xl object-cover" />
              </a>
            ))}
          </div>
        </section>

        <section className="glass-card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-nazar">
            <Music2 className="size-4" /> #Music
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid flex-1 grid-cols-3 gap-2">
              {vinyls.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className="vinyl aspect-square"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={`Play ${v.alt}`}
                >
                  <img src={v.src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((p) => !p)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full shadow-[0_0_0_1.5px_var(--color-tide)] text-tide"
            >
              {playing ? (
                <span className="block h-2.5 w-2.5 rounded-sm bg-tide" />
              ) : (
                <Play className="size-4 fill-tide" />
              )}
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
}

function MobileTop() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 lg:hidden">
      <div className="pointer-events-auto glass-capsule mx-auto flex h-12 max-w-lg items-center gap-2 px-2">
        <Link to="/" aria-label="AQUA home" className="shrink-0">
          <NazarMark className="size-8" />
        </Link>
        <form
          className="min-w-0 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const query = q.trim();
            if (query) navigate({ to: "/search", search: { q: query } });
            else navigate({ to: "/discover" });
          }}
        >
          <label className="sr-only" htmlFor="aqua-search-m">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="aqua-search-m"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="h-9 border-0 bg-transparent pl-9 shadow-none"
            />
          </div>
        </form>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const setComposer = useAqua((s) => s.setComposerOpen);
  const items = [
    { to: "/", label: "Home" as const },
    { to: "/discover", label: "Search" as const },
    { to: "__create", label: "Create" as const },
    { to: "/messages", label: "Messages" as const },
    { to: "/u/samuel", label: "Profile" as const },
  ];
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden">
      <div className="pointer-events-auto glass-capsule mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {items.map((item) => {
          const active =
            item.to === "/"
              ? pathname === "/" || pathname.startsWith("/feed")
              : item.to !== "__create" &&
                (pathname === item.to || pathname.startsWith(item.to + "/"));
          if (item.to === "__create") {
            return (
              <button
                key="create"
                type="button"
                aria-label="Create"
                onClick={() => setComposer(true)}
                className="flex size-12 items-center justify-center rounded-full bg-nazar text-primary-foreground"
              >
                <Plus className="size-5" />
              </button>
            );
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={cn(
                "flex size-12 items-center justify-center rounded-full",
                active ? "text-nazar" : "text-muted-foreground",
              )}
            >
              {item.label === "Home" && <Home className="size-5" />}
              {item.label === "Search" && <Compass className="size-5" />}
              {item.label === "Messages" && <MessageCircle className="size-5" />}
              {item.label === "Profile" && <ProfileAvatar profile={me} size="sm" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function FeedChrome() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isFeed = pathname === "/" || pathname.startsWith("/feed/following") || pathname === "/feed/following";
  const isForYou = pathname === "/feed/for-you";

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-4 text-[15px]">
        <Link to="/" className={isFeed && !isForYou ? "tab-feed" : "pb-2 text-muted-foreground"}>
          Feed
        </Link>
        <span className="h-4 w-px bg-foreground/15" />
        <Link
          to="/feed/$lane"
          params={{ lane: "for-you" }}
          className={cn("pb-2", isForYou ? "tab-feed" : "text-muted-foreground")}
        >
          For You
        </Link>
      </div>
      <form
        className="max-w-[280px] flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          const query = q.trim();
          if (query) navigate({ to: "/search", search: { q: query } });
          else navigate({ to: "/discover" });
        }}
      >
        <label className="sr-only" htmlFor="aqua-search">
          Search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="aqua-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="h-10 rounded-full border-0 bg-card pl-10 shadow-[0_0_0_1px_rgb(28_36_48/0.1)]"
          />
        </div>
      </form>
    </div>
  );
}

export function PageTitle({
  kicker,
  title,
  body,
  action,
}: {
  kicker?: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        {kicker && (
          <p className="text-xs font-medium tracking-[0.16em] text-nazar uppercase">{kicker}</p>
        )}
        <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">{title}</h1>
        {body && <p className="mt-1 max-w-xl text-sm text-muted-foreground">{body}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <div className="glass-card p-6 text-sm text-muted-foreground">{children}</div>;
}

export function LaneNav({
  items,
  current,
}: {
  items: { id: string; label: string; href: string }[];
  current: string;
}) {
  return (
    <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.href}
          className={cn(
            "inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-sm",
            current === item.id
              ? "bg-nazar text-primary-foreground"
              : "bg-card text-foreground shadow-[var(--shadow-border)]",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
