export type TrackKind = "music" | "podcast" | "radio";

export interface Track {
  id: string;
  title: string;
  artistId: string;
  cover: string;
  /** seconds; Infinity for live streams */
  duration: number;
  /** seeds the generative engine and the orb tint */
  hue: number;
  kind: TrackKind;
  live?: boolean;
  /** feed post that features this track */
  postId?: string;
}

export const tracks: Track[] = [
  {
    id: "t-midnight",
    title: "Midnight Ocean",
    artistId: "samuel",
    cover: "/aqua/harbor.jpg",
    duration: 236,
    hue: 215,
    kind: "music",
  },
  {
    id: "t-caustics",
    title: "Caustics",
    artistId: "nia",
    cover: "/aqua/caustics.jpg",
    duration: 252,
    hue: 185,
    kind: "music",
    postId: "p11",
  },
  {
    id: "t-tidelines",
    title: "Tide Lines",
    artistId: "marina",
    cover: "/aqua/pavilion.jpg",
    duration: 201,
    hue: 160,
    kind: "music",
  },
  {
    id: "t-techfuture",
    title: "Tech & Future — Ep. 12",
    artistId: "elise",
    cover: "/aqua/lab.jpg",
    duration: 1080,
    hue: 265,
    kind: "podcast",
  },
  {
    id: "t-radio",
    title: "AQUA Radio",
    artistId: "atlas",
    cover: "/aqua/desk.jpg",
    duration: Infinity,
    hue: 45,
    kind: "radio",
    live: true,
  },
];

export function getTrack(id: string | undefined): Track | undefined {
  return tracks.find((t) => t.id === id);
}

export function trackForPost(postId: string): Track | undefined {
  return tracks.find((t) => t.postId === postId);
}

export function trackForCover(src: string): Track | undefined {
  return tracks.find((t) => t.cover === src);
}
