import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Camera,
  Clapperboard,
  Cpu,
  Film,
  Landmark,
  Library,
  LineChart,
  Megaphone,
  Music,
  Radio,
  ShoppingBag,
  Store,
  Users,
  Wallet,
  Waypoints,
  Wrench,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAqua } from "@/lib/aqua/store";
import type { ModuleId } from "@/lib/aqua/types";
import { cn } from "@/lib/utils";
import { Pin } from "lucide-react";

const GROUPS: { title: string; items: { id: ModuleId; label: string; to: string; icon: typeof BookOpen; ready: boolean }[] }[] = [
  {
    title: "Social",
    items: [
      { id: "communities", label: "Communities", to: "/communities", icon: Users, ready: true },
      { id: "events", label: "Events", to: "/discover", icon: Calendar, ready: true },
      { id: "profiles", label: "Profiles", to: "/search", icon: Users, ready: true },
    ],
  },
  {
    title: "Knowledge",
    items: [
      { id: "wiki", label: "Wiki", to: "/wiki", icon: Library, ready: true },
      { id: "books", label: "Books", to: "/books", icon: BookOpen, ready: true },
      { id: "articles", label: "Articles", to: "/wiki", icon: Library, ready: true },
    ],
  },
  {
    title: "Media",
    items: [
      { id: "photos", label: "Photos", to: "/studio/media", icon: Camera, ready: true },
      { id: "videos", label: "Videos", to: "/videos", icon: Film, ready: true },
      { id: "music", label: "Music", to: "/feed/music", icon: Music, ready: true },
      { id: "live", label: "Live", to: "/direction/live", icon: Radio, ready: false },
    ],
  },
  {
    title: "Economy",
    items: [
      { id: "marketplace", label: "Marketplace", to: "/marketplace", icon: ShoppingBag, ready: true },
      { id: "commerce", label: "Commerce", to: "/commerce", icon: Store, ready: true },
      { id: "wallet", label: "Wallet", to: "/direction/wallet", icon: Wallet, ready: false },
      { id: "ads", label: "Ads", to: "/direction/ads", icon: Megaphone, ready: false },
      { id: "monetization", label: "Monetization", to: "/direction/monetization", icon: Landmark, ready: false },
    ],
  },
  {
    title: "Tools",
    items: [
      { id: "ai", label: "AI", to: "/direction/ai", icon: Cpu, ready: false },
      { id: "analytics", label: "Analytics", to: "/analytics", icon: LineChart, ready: true },
      { id: "media", label: "Media Library", to: "/studio/media", icon: Clapperboard, ready: true },
      { id: "scheduler", label: "Scheduler", to: "/direction/scheduler", icon: Calendar, ready: false },
      { id: "connections", label: "Connections", to: "/direction/connections", icon: Waypoints, ready: false },
    ],
  },
];

export function AppDrawer() {
  const open = useAqua((s) => s.drawerOpen);
  const setOpen = useAqua((s) => s.setDrawerOpen);
  const pinned = useAqua((s) => s.pinned);
  const togglePin = useAqua((s) => s.togglePin);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[86dvh] w-[min(720px,calc(100vw-1.5rem))] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Apps</DialogTitle>
          <DialogDescription>
            Compact when idle. Pin what you actually use — the rest stays in the drawer.
          </DialogDescription>
        </DialogHeader>
        {pinned.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Pinned</p>
            <div className="flex flex-wrap gap-2">
              {pinned.map((id) => {
                const item = GROUPS.flatMap((g) => g.items).find((i) => i.id === id);
                if (!item) return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={id}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="glass-capsule inline-flex h-10 items-center gap-2 px-3 text-sm"
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        <div className="space-y-5">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {group.title}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isPinned = pinned.includes(item.id);
                  return (
                    <div key={item.id} className="glass relative rounded-2xl p-1">
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-sm hover:bg-white/50"
                      >
                        <Icon className="size-4 text-deep" />
                        <span className="min-w-0">
                          <span className="block truncate">{item.label}</span>
                          {!item.ready && (
                            <span className="block text-[11px] text-muted-foreground">Direction</span>
                          )}
                        </span>
                      </Link>
                      <button
                        type="button"
                        aria-label={isPinned ? "Unpin" : "Pin"}
                        onClick={() => togglePin(item.id)}
                        className={cn(
                          "absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full",
                          isPinned ? "text-primary" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Pin className={cn("size-3.5", isPinned && "fill-primary")} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Wrench className="size-3.5" />
          Studio, analytics and commerce share the same profile, media and events.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export { GROUPS as DRAWER_GROUPS };
