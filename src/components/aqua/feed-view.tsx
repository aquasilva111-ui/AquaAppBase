import { useMemo, useState } from "react";
import { LaneNav, EmptyNote } from "@/components/aqua/shell";
import { getCompatibleModes, ModeRow, rendererRegistry } from "@/components/aqua/renderers";
import { getProfile, ME_ID } from "@/lib/aqua/catalog";
import { runFeed, type ExperienceMode } from "@/lib/aqua/feed-engine";
import { LANES } from "@/lib/aqua/feed";
import { useAqua } from "@/lib/aqua/store";
import type { FeedLane } from "@/lib/aqua/types";
import { Button } from "@/components/ui/button";

const LANE_HREF: Record<FeedLane, string> = {
  "for-you": "/",
  following: "/feed/following",
  connected: "/feed/connected",
  communities: "/feed/communities",
  trending: "/feed/trending",
  books: "/feed/books",
  articles: "/feed/articles",
  music: "/feed/music",
  marketplace: "/feed/marketplace",
};

export function FeedView({ lane }: { lane: FeedLane }) {
  const extraFollows = useAqua((s) => s.extraFollows);
  const unfollows = useAqua((s) => s.unfollows);
  const added = useAqua((s) => s.addedPosts.length);
  const liked = useAqua((s) => Object.keys(s.liked).length);
  const me = getProfile(ME_ID)!;
  const [mode, setMode] = useState<ExperienceMode>("social");
  const following = useMemo(() => {
    const set = new Set(me.following);
    for (const id of Object.keys(extraFollows)) set.add(id);
    for (const id of Object.keys(unfollows)) set.delete(id);
    return [...set];
  }, [extraFollows, unfollows, me.following]);

  // Selection happens once per ranking mode; switching experience mode only
  // filters for compatibility and re-renders — the query is not destroyed (§32).
  const posts = useMemo(
    () => runFeed({ experienceMode: mode, rankingMode: lane }, following),
    [lane, following, added, liked, mode],
  );
  const compatible = useMemo(
    () => (mode === "social" ? posts : posts.filter((p) => getCompatibleModes(p).includes(mode))),
    [posts, mode],
  );
  const [shown, setShown] = useState(8);
  const visible = compatible.slice(0, shown);
  const home = lane === "for-you" || lane === "following";
  const Renderer = rendererRegistry[mode];

  return (
    <div>
      <ModeRow
        mode={mode}
        onChange={(m) => {
          setMode(m);
          setShown(8);
        }}
      />
      {home ? null : (
        <LaneNav
          current={lane}
          items={LANES.map((l) => ({ id: l.id, label: l.label, href: LANE_HREF[l.id] }))}
        />
      )}
      <Renderer posts={visible} />
      {visible.length === 0 && (
        <EmptyNote>Nothing in this lane yet. Follow someone, or publish from the plus.</EmptyNote>
      )}
      {shown < compatible.length && (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" onClick={() => setShown((n) => n + 8)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
