import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ME_ID,
  messages as seedMessages,
  posts as seedPosts,
  seedComments,
} from "./catalog";
import type {
  AquaEvent,
  CartItem,
  ChatMessage,
  Comment,
  ModuleId,
  NotificationItem,
  PhotoPin,
  Post,
} from "./types";

export interface ReadingCursor {
  chapterId: string;
  blockId: string;
  progress: number;
}

interface AquaState {
  hydrated: boolean;
  liked: Record<string, true>;
  saved: Record<string, true>;
  reposted: Record<string, true>;
  extraFollows: Record<string, true>;
  unfollows: Record<string, true>;
  joined: Record<string, true>;
  addedPosts: Post[];
  addedPins: PhotoPin[];
  savedPins: Record<string, true>;
  comments: Comment[];
  extraMessages: ChatMessage[];
  cart: CartItem[];
  reading: Record<string, ReadingCursor>;
  highlights: Record<string, true>;
  events: AquaEvent[];
  pinned: ModuleId[];
  notifications: NotificationItem[];
  composerOpen: boolean;
  drawerOpen: boolean;
  setHydrated: () => void;
  setComposerOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  toggleRepost: (postId: string) => void;
  toggleFollow: (profileId: string) => void;
  toggleJoin: (communityId: string) => void;
  addComment: (comment: Omit<Comment, "id" | "at" | "authorId">) => void;
  addPost: (post: Omit<Post, "id" | "createdAt" | "authorId" | "likes" | "comments" | "reposts" | "saves">) => void;
  addPin: (pin: Omit<PhotoPin, "id" | "createdAt" | "authorId" | "saves">) => void;
  toggleSavePin: (pinId: string) => void;
  sendMessage: (threadId: string, text: string) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearOrigin: (productIds: string[]) => void;
  setReading: (bookId: string, cursor: ReadingCursor) => void;
  toggleHighlight: (blockId: string) => void;
  track: (event: Omit<AquaEvent, "id" | "at">) => void;
  togglePin: (id: ModuleId) => void;
  markAllRead: () => void;
}

function nid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultNotifications: NotificationItem[] = [
  { id: "n1", text: "Marina Costa commented on Cápsulas de Água", at: new Date(Date.now() - 3600_000).toISOString(), href: "/book/b-capsulas", unread: true },
  { id: "n2", text: "Elise Nakamura cited your graph note in a preprint", at: new Date(Date.now() - 4 * 3600_000).toISOString(), href: "/wiki/w-micro", unread: true },
  { id: "n3", text: "Luca Voss followed you", at: new Date(Date.now() - 9 * 3600_000).toISOString(), href: "/u/luca", unread: false },
  { id: "n4", text: "Hamburg Makers, Sunday 15:00 — Studio cups & type", at: new Date(Date.now() - 12 * 3600_000).toISOString(), href: "/communities/makers", unread: false },
];

export const useAqua = create<AquaState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      liked: {},
      saved: {},
      reposted: {},
      extraFollows: {},
      unfollows: {},
      joined: { mare: true },
      addedPosts: [],
      addedPins: [],
      savedPins: {},
      comments: seedComments,
      extraMessages: [],
      cart: [],
      reading: {},
      highlights: {},
      events: [],
      pinned: ["books", "marketplace", "wiki"],
      notifications: defaultNotifications,
      composerOpen: false,
      drawerOpen: false,
      setHydrated: () => set({ hydrated: true }),
      setComposerOpen: (composerOpen) => set({ composerOpen }),
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
      toggleLike: (postId) => {
        const liked = { ...get().liked };
        if (liked[postId]) delete liked[postId];
        else {
          liked[postId] = true;
          get().track({ type: "like", entityType: "post", entityId: postId });
        }
        set({ liked });
      },
      toggleSave: (postId) => {
        const saved = { ...get().saved };
        if (saved[postId]) delete saved[postId];
        else {
          saved[postId] = true;
          get().track({ type: "save", entityType: "post", entityId: postId });
        }
        set({ saved });
      },
      toggleRepost: (postId) => {
        const reposted = { ...get().reposted };
        if (reposted[postId]) delete reposted[postId];
        else {
          reposted[postId] = true;
          get().track({ type: "repost", entityType: "post", entityId: postId });
        }
        set({ reposted });
      },
      toggleFollow: (profileId) => {
        if (profileId === ME_ID) return;
        const extraFollows = { ...get().extraFollows };
        const unfollows = { ...get().unfollows };
        if (unfollows[profileId]) {
          delete unfollows[profileId];
        } else if (extraFollows[profileId]) {
          delete extraFollows[profileId];
        } else {
          extraFollows[profileId] = true;
        }
        set({ extraFollows, unfollows });
      },
      toggleJoin: (communityId) => {
        const joined = { ...get().joined };
        if (joined[communityId]) delete joined[communityId];
        else joined[communityId] = true;
        set({ joined });
      },
      addComment: (comment) => {
        const row: Comment = {
          ...comment,
          id: nid("c"),
          at: new Date().toISOString(),
          authorId: ME_ID,
        };
        set({ comments: [...get().comments, row] });
        get().track({ type: "comment", entityType: comment.targetType, entityId: comment.targetId });
      },
      addPost: (post) => {
        const row: Post = {
          ...post,
          id: nid("p"),
          authorId: ME_ID,
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: 0,
          reposts: 0,
          saves: 0,
        };
        set({ addedPosts: [row, ...get().addedPosts] });
      },
      addPin: (pin) => {
        const row: PhotoPin = {
          ...pin,
          id: nid("pin"),
          authorId: ME_ID,
          createdAt: new Date().toISOString(),
          saves: 0,
        };
        set({ addedPins: [row, ...get().addedPins] });
      },
      toggleSavePin: (pinId) => {
        const savedPins = { ...get().savedPins };
        if (savedPins[pinId]) delete savedPins[pinId];
        else {
          savedPins[pinId] = true;
          get().track({ type: "save", entityType: "photo", entityId: pinId });
        }
        set({ savedPins });
      },
      sendMessage: (threadId, text) => {
        const row: ChatMessage = {
          id: nid("m"),
          threadId,
          fromId: ME_ID,
          text,
          at: new Date().toISOString(),
        };
        set({ extraMessages: [...get().extraMessages, row] });
      },
      addToCart: (productId) => {
        const cart = [...get().cart];
        const existing = cart.find((c) => c.productId === productId);
        if (existing) existing.qty += 1;
        else cart.push({ productId, qty: 1 });
        set({ cart });
        get().track({ type: "add_to_cart", entityType: "product", entityId: productId });
      },
      removeFromCart: (productId) =>
        set({ cart: get().cart.filter((c) => c.productId !== productId) }),
      setQty: (productId, qty) => {
        if (qty <= 0) return get().removeFromCart(productId);
        set({
          cart: get().cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
        });
      },
      clearOrigin: (productIds) =>
        set({ cart: get().cart.filter((c) => !productIds.includes(c.productId)) }),
      setReading: (bookId, cursor) =>
        set({ reading: { ...get().reading, [bookId]: cursor } }),
      toggleHighlight: (blockId) => {
        const highlights = { ...get().highlights };
        if (highlights[blockId]) delete highlights[blockId];
        else highlights[blockId] = true;
        set({ highlights });
      },
      track: (event) => {
        const row: AquaEvent = {
          ...event,
          id: nid("e"),
          at: new Date().toISOString(),
        };
        set({ events: [...get().events.slice(-199), row] });
      },
      togglePin: (id) => {
        const pinned = get().pinned.includes(id)
          ? get().pinned.filter((x) => x !== id)
          : [...get().pinned, id];
        set({ pinned });
      },
      markAllRead: () =>
        set({
          notifications: get().notifications.map((n) => ({ ...n, unread: false })),
        }),
    }),
    {
      name: "aqua-state-v1",
      partialize: (s) => ({
        liked: s.liked,
        saved: s.saved,
        reposted: s.reposted,
        extraFollows: s.extraFollows,
        unfollows: s.unfollows,
        joined: s.joined,
        addedPosts: s.addedPosts,
        addedPins: s.addedPins,
        savedPins: s.savedPins,
        comments: s.comments,
        extraMessages: s.extraMessages,
        cart: s.cart,
        reading: s.reading,
        highlights: s.highlights,
        events: s.events,
        pinned: s.pinned,
        notifications: s.notifications,
      }),
    },
  ),
);

export function useHydrated() {
  return useAqua((s) => s.hydrated);
}

export function allPosts(): Post[] {
  return [...useAqua.getState().addedPosts, ...seedPosts];
}

export function allMessages(): ChatMessage[] {
  return [...seedMessages, ...useAqua.getState().extraMessages];
}

export function isFollowing(profileId: string, baseFollowing: string[]) {
  const { extraFollows, unfollows } = useAqua.getState();
  if (unfollows[profileId]) return false;
  return extraFollows[profileId] || baseFollowing.includes(profileId);
}
