import type { PhotoPin } from "./types";

/**
 * Photos module — a pinboard on the AQUA graph.
 * Inspiration: the Pinterest loop (browse → save → related), translated to
 * AQUA rules: no upload backend in this study, so a pin stores the relation
 * (author, source link, tags) — the file itself can live elsewhere.
 */

export const PHOTO_TAGS = [
  "Water",
  "Architecture",
  "Ceramics",
  "Studio",
  "Research",
  "Textile",
] as const;

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400_000).toISOString();
}

export const photoPins: PhotoPin[] = [
  {
    id: "pin-harbor-dawn",
    authorId: "marina",
    title: "Harbor, first light",
    description: "Mist before the boats wake. One frame, no filter — the north does the grading.",
    src: "/aqua/harbor.jpg",
    alt: "Misty northern harbor at dawn",
    ratio: "photo",
    tags: ["Water"],
    saves: 1240,
    createdAt: daysAgo(2),
  },
  {
    id: "pin-pavilion",
    authorId: "marina",
    title: "Pavilion over the pool",
    description: "Glass meeting still water. Architecture that refuses to own the view.",
    src: "/aqua/pavilion.jpg",
    alt: "Glass pavilion over a reflecting pool",
    ratio: "wide",
    tags: ["Architecture", "Water"],
    link: "https://example.com/costa-prints",
    saves: 986,
    createdAt: daysAgo(4),
  },
  {
    id: "pin-foam-bowl",
    authorId: "luca",
    title: "Bowl, Foam — tide line glaze",
    description: "Thrown this week. The celadon keeps a line you only see when the room is quiet.",
    src: "/aqua/ceramic.jpg",
    alt: "Porcelain bowl with seafoam glaze",
    ratio: "square",
    tags: ["Ceramics", "Studio"],
    saves: 512,
    createdAt: daysAgo(3),
  },
  {
    id: "pin-caustics",
    authorId: "nia",
    title: "Caustics study, pale tile",
    description: "Underwater light doing the arrangement. Reference frames for the listening sketch.",
    src: "/aqua/caustics.jpg",
    alt: "Underwater light caustics on pale tile",
    ratio: "photo",
    tags: ["Water", "Studio"],
    saves: 1730,
    createdAt: daysAgo(1),
  },
  {
    id: "pin-lab-samples",
    authorId: "elise",
    title: "Elbe mouth transect, samples",
    description: "Neuston net hauls, spring. The record is a preprint — methods in the wiki, no badge.",
    src: "/aqua/lab.jpg",
    alt: "Seawater samples in laboratory glassware",
    ratio: "photo",
    tags: ["Research", "Water"],
    saves: 214,
    createdAt: daysAgo(6),
  },
  {
    id: "pin-desk",
    authorId: "samuel",
    title: "The desk holds the glass",
    description: "It does not own the sentence. Morning setup for block drafting.",
    src: "/aqua/desk.jpg",
    alt: "Writer desk with glass of water and open notebook",
    ratio: "photo",
    tags: ["Studio"],
    saves: 388,
    createdAt: daysAgo(5),
  },
  {
    id: "pin-linen",
    authorId: "luca",
    title: "Mist stripe runner, folded",
    description: "Oyster linen, one sea-mist stripe. The listing lives on Mercado Libre; this is the relation.",
    src: "/aqua/linen.jpg",
    alt: "Folded linen runner and ceramic cup",
    ratio: "square",
    tags: ["Textile", "Ceramics"],
    link: "https://example.com/mercadolibre-linen",
    saves: 156,
    createdAt: daysAgo(8),
  },
  {
    id: "pin-print-framed",
    authorId: "marina",
    title: "Glass architecture, framed",
    description: "Archival pigment print. Edition of twenty, numbered on the back — not on the image.",
    src: "/aqua/print.jpg",
    alt: "Framed print of glass architecture",
    ratio: "square",
    tags: ["Architecture"],
    saves: 429,
    createdAt: daysAgo(9),
  },
  {
    id: "pin-community-studio",
    authorId: "nia",
    title: "Sunday at Hamburg Makers",
    description: "Books, glass vases, and a quiet corner. Bring a cup or a draft.",
    src: "/aqua/community.jpg",
    alt: "Bright community studio with books and glass vases",
    ratio: "wide",
    tags: ["Studio"],
    saves: 267,
    createdAt: daysAgo(7),
  },
  {
    id: "pin-capsulas-cover",
    authorId: "samuel",
    title: "Cápsulas de Água — cloth cover",
    description: "Foam-white cloth, a ribbon the color of harbor water. The edition is in the shop.",
    src: "/aqua/book-capsulas.jpg",
    alt: "Cover of Cápsulas de Água",
    ratio: "photo",
    tags: ["Studio", "Textile"],
    saves: 305,
    createdAt: daysAgo(10),
  },
  {
    id: "pin-mares-cover",
    authorId: "marina",
    title: "A Costura das Marés — cover stitch",
    description: "The tide as a stitch, the harbor as a hem. Poetry that behaves like fabric.",
    src: "/aqua/book-mares.jpg",
    alt: "Cover of A Costura das Marés",
    ratio: "photo",
    tags: ["Textile", "Water"],
    saves: 518,
    createdAt: daysAgo(11),
  },
  {
    id: "pin-graph-cover",
    authorId: "elise",
    title: "Graph of the Living Sea",
    description: "A monograph you read as a thread. Cover study — depth bands, no certificate.",
    src: "/aqua/book-graph.jpg",
    alt: "Cover of Graph of the Living Sea",
    ratio: "square",
    tags: ["Research"],
    saves: 142,
    createdAt: daysAgo(12),
  },
];

const pinById = new Map(photoPins.map((p) => [p.id, p]));

export function getSeedPin(id: string) {
  return pinById.get(id);
}

/** Pins related by shared tags, most-shared first. Honest stand-in for a recommender. */
export function relatedPins(pin: PhotoPin, all: PhotoPin[], limit = 6): PhotoPin[] {
  return all
    .filter((p) => p.id !== pin.id)
    .map((p) => ({ p, shared: p.tags.filter((t) => pin.tags.includes(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.p.saves - a.p.saves)
    .slice(0, limit)
    .map((x) => x.p);
}

export function searchPins(all: PhotoPin[], query: string): PhotoPin[] {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)),
  );
}
