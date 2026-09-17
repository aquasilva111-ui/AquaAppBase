import { useMemo, useState } from "react";
import { LaneNav, EmptyNote } from "@/components/aqua/shell";
import { PostCard } from "@/components/aqua/post-card";
import { getProfile, ME_ID } from "@/lib/aqua/catalog";
import { LANES, rankFeed } from "@/lib/aqua/feed";
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
  const following = useMemo(() => {
    const set = new Set(me.following);
    for (const id of Object.keys(extraFollows)) set.add(id);
    for (const id of Object.keys(unfollows)) set.delete(id);
    return [...set];
  }, [extraFollows, unfollows, me.following]);

  const posts = useMemo(
    () => rankFeed(lane, following),
    [lane, following, added, liked],
  );
  const [shown, setShown] = useState(8);
  const visible = posts.slice(0, shown);
  const home = lane === "for-you" || lane === "following";

  return (
    <div>
      {home ? null : (
        <LaneNav
          current={lane}
          items={LANES.map((l) => ({ id: l.id, label: l.label, href: LANE_HREF[l.id] }))}
        />
      )}
      <div className="space-y-3">
        {visible.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {visible.length === 0 && (
          <EmptyNote>Nothing in this lane yet. Follow someone, or publish from the plus.</EmptyNote>
        )}
        {shown < posts.length && (
          <div className="flex justify-center pt-2">
            <Button variant="secondary" onClick={() => setShown((n) => n + 8)}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
