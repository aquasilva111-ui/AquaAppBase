import type {
  Book,
  ChatMessage,
  Comment,
  Community,
  EventItem,
  MediaAsset,
  Post,
  Product,
  Profile,
  Store,
  Thread,
  WikiArticle,
} from "./types";

export const ME_ID = "samuel";

export const profiles: Profile[] = [
  {
    id: "samuel",
    handle: "samuel",
    name: "A.S Star",
    bio: "Writing the city that stores relationships, not possessions. Hamburg.",
    location: "Hamburg",
    tone: "tide",
    roles: ["user", "creator", "author", "seller"],
    following: ["marina", "elise", "luca", "nia"],
    followers: 12840,
    joined: "2024-03-11",
  },
  {
    id: "marina",
    handle: "marina",
    name: "Marina Costa",
    bio: "Light on water. Photographs and sewn sentences. Lisboa / the North Sea.",
    location: "Lisboa",
    tone: "foam",
    roles: ["user", "creator", "author", "artist"],
    following: ["samuel", "nia"],
    followers: 40211,
    joined: "2023-08-02",
  },
  {
    id: "elise",
    handle: "elise",
    name: "Elise Nakamura",
    bio: "Coastal systems. Graphs, not slogans. Open methods.",
    location: "Kiel",
    tone: "kelp",
    roles: ["user", "researcher", "author"],
    following: ["samuel", "atlas"],
    followers: 8912,
    joined: "2022-01-19",
  },
  {
    id: "luca",
    handle: "luca",
    name: "Luca Voss",
    bio: "Clay, glaze, and the pause before a cup meets a table. Berlin studio.",
    location: "Berlin",
    tone: "pearl",
    roles: ["user", "seller", "artist"],
    following: ["samuel", "marina"],
    followers: 5604,
    joined: "2023-11-04",
  },
  {
    id: "nia",
    handle: "nia",
    name: "Nia Okonkwo",
    bio: "Rooms, voices, and the quiet between tracks. Lagos · Berlin.",
    location: "Berlin",
    tone: "deep",
    roles: ["user", "creator", "artist"],
    following: ["marina", "samuel"],
    followers: 22018,
    joined: "2024-01-07",
  },
  {
    id: "atlas",
    handle: "atlas",
    name: "Atlas Press",
    bio: "A small press for distributed books. We publish relations between pages.",
    location: "Rotterdam",
    tone: "ink",
    roles: ["publisher", "seller"],
    following: ["samuel", "elise"],
    followers: 3102,
    joined: "2021-05-14",
  },
];

export const media: MediaAsset[] = [
  { id: "m-harbor", ownerId: "marina", type: "image", src: "/aqua/harbor.jpg", alt: "Misty northern harbor at dawn", aspect: "photo" },
  { id: "m-desk", ownerId: "samuel", type: "image", src: "/aqua/desk.jpg", alt: "Writer desk with glass of water and open notebook", aspect: "photo" },
  { id: "m-ceramic", ownerId: "luca", type: "image", src: "/aqua/ceramic.jpg", alt: "Porcelain bowl with seafoam glaze", aspect: "square" },
  { id: "m-pavilion", ownerId: "atlas", type: "image", src: "/aqua/pavilion.jpg", alt: "Glass pavilion over a reflecting pool", aspect: "wide" },
  { id: "m-lab", ownerId: "elise", type: "image", src: "/aqua/lab.jpg", alt: "Seawater samples in laboratory glassware", aspect: "photo" },
  { id: "m-caustics", ownerId: "nia", type: "image", src: "/aqua/caustics.jpg", alt: "Underwater light caustics on pale tile", aspect: "photo" },
  { id: "m-linen", ownerId: "luca", type: "image", src: "/aqua/linen.jpg", alt: "Folded linen runner and ceramic cup", aspect: "square" },
  { id: "m-print", ownerId: "marina", type: "image", src: "/aqua/print.jpg", alt: "Framed print of glass architecture", aspect: "square" },
  { id: "m-community", ownerId: "nia", type: "image", src: "/aqua/community.jpg", alt: "Bright community studio with books and glass vases", aspect: "wide" },
  { id: "m-capsulas", ownerId: "samuel", type: "image", src: "/aqua/book-capsulas.jpg", alt: "Cover of Cápsulas de Água", aspect: "cover" },
  { id: "m-mares", ownerId: "marina", type: "image", src: "/aqua/book-mares.jpg", alt: "Cover of A Costura das Marés", aspect: "cover" },
  { id: "m-graph", ownerId: "elise", type: "image", src: "/aqua/book-graph.jpg", alt: "Cover of Graph of the Living Sea", aspect: "cover" },
];

export const communities: Community[] = [
  {
    id: "mare",
    name: "Maré de Autores",
    handle: "mare",
    description: "Writers who treat chapters as living threads. Notes, drafts, and long reading.",
    cover: "/aqua/community.jpg",
    members: 18420,
    location: "Everywhere",
  },
  {
    id: "science",
    name: "Open Science North Sea",
    handle: "northsea",
    description: "Methods, preprints, and coastal data. Verification is a process, not a badge.",
    cover: "/aqua/lab.jpg",
    members: 6230,
    location: "Kiel · Hamburg",
  },
  {
    id: "makers",
    name: "Hamburg Makers",
    handle: "hammakers",
    description: "Clay, type, code, and shops that stay honest about their origin.",
    cover: "/aqua/pavilion.jpg",
    members: 2910,
    location: "Hamburg",
  },
];

export const events: EventItem[] = [
  {
    id: "e1",
    title: "Thread reading, live",
    when: "Thu 19:30",
    where: "Speicherstadt, Hamburg",
    communityId: "mare",
  },
  {
    id: "e2",
    title: "Coastal samples open lab",
    when: "Sat 11:00",
    where: "GEOMAR outreach, Kiel",
    communityId: "science",
  },
  {
    id: "e3",
    title: "Studio cups & type",
    when: "Sun 15:00",
    where: "Karoviertel",
    communityId: "makers",
  },
];

export const stores: Store[] = [
  { id: "st-samuel", ownerId: "samuel", name: "Star Editions", origin: "AQUA" },
  { id: "st-marina-shopify", ownerId: "marina", name: "Costa Prints", origin: "SHOPIFY" },
  { id: "st-luca", ownerId: "luca", name: "Voss Atelier", origin: "AQUA" },
  { id: "st-luca-ml", ownerId: "luca", name: "Voss on Mercado Libre", origin: "MERCADO_LIBRE" },
  { id: "st-atlas", ownerId: "atlas", name: "Atlas Press Shop", origin: "AQUA" },
];

export const products: Product[] = [
  {
    id: "p-capsulas-print",
    storeId: "st-samuel",
    sellerId: "samuel",
    title: "Cápsulas de Água — cloth edition",
    description: "Sewn binding, foam-white cloth, a ribbon the color of harbor water. Printed in Rotterdam.",
    price: 2800,
    currency: "EUR",
    origin: "AQUA",
    type: "BOOK",
    image: "/aqua/book-capsulas.jpg",
    linkedBookId: "b-capsulas",
  },
  {
    id: "p-print-pavilion",
    storeId: "st-marina-shopify",
    sellerId: "marina",
    title: "Pavilion over water — archival print",
    description: "Limited archival pigment print. Checkout and inventory live on Costa Prints (Shopify).",
    price: 12000,
    currency: "EUR",
    origin: "SHOPIFY",
    type: "PHYSICAL",
    image: "/aqua/print.jpg",
    externalUrl: "https://example.com/costa-prints",
  },
  {
    id: "p-foam-bowl",
    storeId: "st-luca",
    sellerId: "luca",
    title: "Bowl, Foam",
    description: "Thrown porcelain. Celadon that holds a tide line. Each piece is slightly different.",
    price: 8600,
    currency: "EUR",
    origin: "AQUA",
    type: "PHYSICAL",
    image: "/aqua/ceramic.jpg",
  },
  {
    id: "p-linen",
    storeId: "st-luca-ml",
    sellerId: "luca",
    title: "Mist stripe linen runner",
    description: "Oyster linen with a single sea-mist stripe. Listed on Mercado Libre; AQUA only stores the relation.",
    price: 5400,
    currency: "EUR",
    origin: "MERCADO_LIBRE",
    type: "PHYSICAL",
    image: "/aqua/linen.jpg",
    externalUrl: "https://example.com/mercadolibre-linen",
  },
  {
    id: "p-typeset",
    storeId: "st-atlas",
    sellerId: "atlas",
    title: "Quiet type — a digital guide",
    description: "A small press manual for setting long literary threads. Instant download after AQUA checkout.",
    price: 1900,
    currency: "EUR",
    origin: "AQUA",
    type: "DIGITAL",
    image: "/aqua/desk.jpg",
  },
  {
    id: "p-bundle",
    storeId: "st-samuel",
    sellerId: "samuel",
    title: "Book + bowl, together",
    description: "The cloth edition with Luca’s Foam bowl. Two objects, one table.",
    price: 34000,
    currency: "EUR",
    origin: "AQUA",
    type: "PHYSICAL",
    image: "/aqua/ceramic.jpg",
    linkedBookId: "b-capsulas",
  },
];

export const books: Book[] = [
  {
    id: "b-capsulas",
    authorId: "samuel",
    title: "Cápsulas de Água",
    subtitle: "A city that kept relations instead of things",
    cover: "/aqua/book-capsulas.jpg",
    synopsis:
      "In a northern city of glass capsules, nothing is owned for long. What remains is the path from a person to a page to a shop to a click. A novel about storage, memory, and the ethics of knowing without possessing.",
    tags: ["literary", "speculative", "Hamburg"],
    monetization: "FREE",
    language: "Portuguese",
    reads: 48210,
    rating: 4.8,
    chapters: [
      {
        id: "c-cap-1",
        bookId: "b-capsulas",
        number: 1,
        title: "A cidade que guardava relações",
        blocks: [
          { id: "b1-01", type: "HEADING", text: "I" },
          {
            id: "b1-02",
            type: "PARAGRAPH",
            text: "A primeira coisa que a cidade aprendeu a não guardar foi o objeto. Guardava o caminho até ele. Uma pessoa, um copo, uma frase, uma loja do outro lado da água — e o fio, quase invisível, que ainda os ligava.",
          },
          {
            id: "b1-03",
            type: "PARAGRAPH",
            text: "Chamavam a isso cápsula. Não porque fosse pequena. Porque era transparente. Podias ver o conteúdo sem o tocar, e o toque, quando vinha, já era outra relação: a mão, o vidro, a memória da água.",
          },
          {
            id: "b1-04",
            type: "QUOTE",
            text: "Não precisamos possuir o mar para conhecer a maré.",
          },
          {
            id: "b1-05",
            type: "PARAGRAPH",
            text: "Eu trabalhava no arquivo das relações. O edifício flutuava um palmo acima do canal, o suficiente para que a maré passasse por baixo como um pensamento que não nos pertence. As pessoas vinham pedir notícias de coisas que já não tinham: um livro emprestado, um prato quebrado, um amor que mudara de cidade.",
          },
          { id: "b1-06", type: "IMAGE", mediaId: "m-pavilion" },
          {
            id: "b1-07",
            type: "PARAGRAPH",
            text: "O meu ofício era simples e difícil. Eu não recuperava o objeto. Recuperava o mapa. Dizia: este copo pertenceu a Luca, que o vendeu a uma loja que já não existe, que o mostrou num vídeo que uma rapariga em Lagos guardou, que uma leitora em Hamburgo abriu numa noite de chuva. O copo podia estar em qualquer sítio. A relação, essa, cabia numa cápsula.",
          },
          {
            id: "b1-08",
            type: "AUTHOR_NOTE",
            text: "A architecture of this chapter is the product graph, written as weather.",
          },
          {
            id: "b1-09",
            type: "PARAGRAPH",
            text: "Às vezes alguém chorava. Não de falta — de excesso. Saber demais sobre o caminho de uma coisa é uma forma de possessão mais íntima do que tê-la na prateleira. O arquivo tinha regras. Mostrávamos agregados. Nunca a hora exacta em que Maria leu o parágrafo três.",
          },
          { id: "b1-10", type: "DIVIDER" },
          {
            id: "b1-11",
            type: "PARAGRAPH",
            text: "Naquela manhã o canal estava de vidro. Uma cápsula nova chegou sem remetente. Dentro havia apenas uma frase, escrita com tinta da cor da água funda: guarda isto sem ficar comigo.",
          },
        ],
      },
      {
        id: "c-cap-2",
        bookId: "b-capsulas",
        number: 2,
        title: "O primeiro bloco",
        blocks: [
          { id: "b2-01", type: "HEADING", text: "II" },
          {
            id: "b2-02",
            type: "PARAGRAPH",
            text: "Os livros, na cidade, já não se viravam página a página como portas. Liam-se em fios. Cada parágrafo era um bloco, cada bloco podia receber um comentário, um sublinhado, um silêncio. O romance não virava tweet. Continuava a ser literatura. Por baixo, porém, a água sabia exactamente onde tinhas parado.",
          },
          {
            id: "b2-03",
            type: "PARAGRAPH",
            text: "Abri o volume sem número de páginas. O primeiro bloco era uma cabeça de capítulo, só um traço vertical, como um cais. O segundo era a frase da cápsula. O terceiro ainda não existia. Eu havia de o escrever com a mesma mão que arquivava os outros.",
          },
          {
            id: "b2-04",
            type: "QUOTE",
            text: "Continuar a ler não é virar a página. É recusar o reload.",
          },
          {
            id: "b2-05",
            type: "PARAGRAPH",
            text: "À noite, as cápsulas do arquivo acendiam-se uma a uma, não para vigiar, mas para lembrar que uma relação também precisa de descanso. Apaguei a luz sobre o bloco dezoito e a cidade, educada, não contou a ninguém a hora.",
          },
          { id: "b2-06", type: "IMAGE", mediaId: "m-desk" },
          {
            id: "b2-07",
            type: "PARAGRAPH",
            text: "Se algum dia me perguntares o que a cidade guardava, não te darei a lista dos objectos. Dar-te-ei o fio. Pessoa, página, livro, loja, clique, compra. Mesmo quando cada um destes nomes vive numa margem diferente da água.",
          },
        ],
      },
    ],
  },
  {
    id: "b-mares",
    authorId: "marina",
    title: "A Costura das Marés",
    subtitle: "Poems that behave like fabric",
    cover: "/aqua/book-mares.jpg",
    synopsis:
      "A sequence of sewn waves: poems that treat the tide as a stitch, the harbor as a hem, and photography as a second needle.",
    tags: ["poetry", "photography"],
    monetization: "FREE",
    language: "Portuguese",
    reads: 19340,
    rating: 4.7,
    chapters: [
      {
        id: "c-mares-1",
        bookId: "b-mares",
        number: 1,
        title: "Ponto atrás",
        blocks: [
          { id: "bm-01", type: "HEADING", text: "Ponto atrás" },
          {
            id: "bm-02",
            type: "PARAGRAPH",
            text: "Costuro a água com linha da cor da água. O ponto desaparece. Fica o pano, que é o dia.",
          },
          { id: "bm-03", type: "IMAGE", mediaId: "m-harbor" },
          {
            id: "bm-04",
            type: "QUOTE",
            text: "Uma fotografia também é um ponto: prende a luz antes de ela ir embora.",
          },
          {
            id: "bm-05",
            type: "PARAGRAPH",
            text: "Se me perguntares de que é feito o norte, digo: de orlas. Lisboa ensinou-me a entrada. O mar do Norte ensinou-me a saída, que é outra costura, feita pelo avesso.",
          },
        ],
      },
    ],
  },
  {
    id: "b-graph",
    authorId: "elise",
    title: "Graph of the Living Sea",
    subtitle: "Notes toward an open coastal model",
    cover: "/aqua/book-graph.jpg",
    synopsis:
      "A readable monograph on currents, sampling, and why a graph of relations is a better public object than a locked dataset. Methods are included. Certification is not claimed.",
    tags: ["science", "coast", "open"],
    monetization: "FREE",
    language: "English",
    reads: 7210,
    rating: 4.6,
    chapters: [
      {
        id: "c-graph-1",
        bookId: "b-graph",
        number: 1,
        title: "A node is not a possession",
        blocks: [
          { id: "bg-01", type: "HEADING", text: "Premise" },
          {
            id: "bg-02",
            type: "PARAGRAPH",
            text: "The North Sea does not belong to a laboratory. What we can keep, ethically, is the relation: sample to station, station to tide, tide to model, model to a reader who will never hold the water.",
          },
          { id: "bg-03", type: "IMAGE", mediaId: "m-lab" },
          {
            id: "bg-04",
            type: "QUOTE",
            text: "A DOI is a relation, not a trophy.",
          },
          {
            id: "bg-05",
            type: "AUTHOR_NOTE",
            text: "This chapter is a preprint in narrative form. It is not peer reviewed. Status belongs to the wiki record, not to the cover.",
          },
          {
            id: "bg-06",
            type: "PARAGRAPH",
            text: "If a platform stores the graph and not the seawater, it must still refuse to invent a certificate. Process first. Badge later, if ever.",
          },
        ],
      },
    ],
  },
  {
    id: "b-tide-epub",
    authorId: "atlas",
    title: "The Tide Graph",
    subtitle: "Imported EPUB — the file stays in storage",
    cover: "/aqua/book-graph.jpg",
    synopsis:
      "A packaged document, not a native AQUA book. epub.js reads the file. AQUA stores the CFI: who read, how far, when they left. Relation, not a second copy of the binary.",
    tags: ["imported", "epub", "press"],
    monetization: "FREE",
    language: "English",
    reads: 840,
    rating: 4.4,
    source: "epub",
    epubUrl: "/aqua/books/tide-graph.epub",
    chapters: [
      {
        id: "epub",
        bookId: "b-tide-epub",
        number: 1,
        title: "Imported file",
        blocks: [],
      },
    ],
  },
];

export const articles: WikiArticle[] = [
  {
    id: "w-glass",
    kind: "popular",
    title: "Floating glass, briefly",
    excerpt: "Why a white canvas with capsules reads as water, not as ice.",
    cover: "/aqua/pavilion.jpg",
    authorIds: ["samuel", "marina"],
    updatedAt: "2026-09-02",
    body: [
      "Glass on a blue field looks like a gadget. Glass on a white field looks like weather. The capsule works because the canvas stays quiet.",
      "True frost is not a white card. It is a layer that lets the room behind it keep breathing — blur, saturate, a bright edge, a shadow the color of deep water at seven percent opacity.",
      "In cities of the north this is not metaphor. It is how pavilions meet canals.",
    ],
  },
  {
    id: "w-graph",
    kind: "popular",
    title: "What a relation graph actually is",
    excerpt: "Follows are a list. Relations are a map with more than one kind of edge.",
    cover: "/aqua/caustics.jpg",
    authorIds: ["elise", "samuel"],
    updatedAt: "2026-08-21",
    body: [
      "A follow says: I want more of you. A relation can say: I read you, I bought from you, I cited you, I walked past your shop, I saved a paragraph.",
      "The useful public object is not the private trail. It is the aggregate path — the way a book becomes a product becomes a click without exposing a name to a dashboard.",
    ],
  },
  {
    id: "w-micro",
    kind: "scientific",
    title: "Surface microplastics along the Elbe mouth, spring transect",
    excerpt: "A methods-forward preprint. Sampling, blanks, and limits. Not certified.",
    cover: "/aqua/lab.jpg",
    authorIds: ["elise"],
    status: "Preprint",
    doi: "10.5555/aqua.preprint.elbe.2026",
    institution: "Independent / GEOMAR visiting",
    updatedAt: "2026-06-12",
    body: [
      "We report a spring transect of surface microplastics at the Elbe mouth. This record is a preprint. It has not been peer reviewed and it is not institution-verified on AQUA.",
      "Methods: neuston net, 333 µm; procedural blanks on every third station; polymer ID by ATR-FTIR for a stratified subset. We do not convert particle counts into a policy slogan.",
      "Data relations (station, tide, blank, spectrum) are the object of record. Raw spectra remain with the authors’ laboratory storage. AQUA stores the citation path.",
    ],
  },
  {
    id: "w-attrib",
    kind: "scientific",
    title: "Attribution paths in distributed commerce",
    excerpt: "A working note on storing click-to-order relations without claiming the order.",
    cover: "/aqua/desk.jpg",
    authorIds: ["elise", "atlas"],
    status: "Preprint",
    updatedAt: "2026-07-30",
    body: [
      "When a product lives on Shopify and the conversation lives on AQUA, the conversion path is a graph across authorities. The external store remains source of truth for price, inventory, and order state.",
      "A platform that stores the relation (profile → post → product → store → click) can attribute without intercepting checkout. Inventing a single cart across legal entities is a different, later problem.",
    ],
  },
];

export const posts: Post[] = [
  {
    id: "p1",
    authorId: "samuel",
    createdAt: hoursAgo(2),
    kind: "book",
    text: "Chapter two is up. The city learns to read in blocks — still literature, still a tide. If you stop at the divider, the book will wait without telling anyone the hour.",
    ref: { type: "book", id: "b-capsulas" },
    likes: 428,
    comments: 36,
    reposts: 41,
    saves: 90,
  },
  {
    id: "p2",
    authorId: "marina",
    createdAt: hoursAgo(5),
    kind: "gallery",
    text: "Dawn on the canal. I did not keep the water. I kept the stitch. #aquaapp #waves",
    mediaIds: ["m-harbor", "m-print"],
    external: {
      platform: "Instagram",
      url: "https://instagram.com/p/demo-marina-harbor",
      externalId: "ig_harbor_01",
    },
    likes: 1904,
    comments: 88,
    reposts: 120,
    saves: 340,
  },
  {
    id: "p3",
    authorId: "elise",
    createdAt: hoursAgo(8),
    kind: "article",
    text: "New preprint on the wiki: surface microplastics, Elbe mouth. Methods and blanks are in the record. There is no AQUA Certified badge here — that process does not exist yet, and I will not invent it.",
    ref: { type: "article", id: "w-micro" },
    communityId: "science",
    likes: 512,
    comments: 47,
    reposts: 63,
    saves: 201,
  },
  {
    id: "p4",
    authorId: "luca",
    createdAt: hoursAgo(11),
    kind: "product",
    text: "Bowl, Foam. Thrown this week. The glaze keeps a tide line you can only see when the room is quiet.",
    ref: { type: "product", id: "p-foam-bowl" },
    mediaIds: ["m-ceramic"],
    likes: 276,
    comments: 19,
    reposts: 12,
    saves: 64,
  },
  {
    id: "p5",
    authorId: "nia",
    createdAt: hoursAgo(14),
    kind: "gallery",
    text: "Hamburg Makers, Sunday. Bring a cup, a draft, or a quiet. #aquaapp #personae",
    mediaIds: ["m-community", "m-caustics"],
    communityId: "makers",
    likes: 641,
    comments: 28,
    reposts: 22,
    saves: 55,
  },
  {
    id: "p6",
    authorId: "samuel",
    createdAt: hoursAgo(20),
    kind: "gallery",
    text: "The desk does not own the sentence. It only holds the glass. #aquaapp",
    mediaIds: ["m-desk", "m-lab"],
    likes: 388,
    comments: 21,
    reposts: 14,
    saves: 70,
  },
  {
    id: "p7",
    authorId: "atlas",
    createdAt: hoursAgo(26),
    kind: "article",
    text: "A small press note: we can typeset a thread without pretending the file lives in our warehouse. Quiet type is out in the shop.",
    ref: { type: "product", id: "p-typeset" },
    likes: 154,
    comments: 11,
    reposts: 9,
    saves: 40,
  },
  {
    id: "p8",
    authorId: "marina",
    createdAt: hoursAgo(30),
    kind: "book",
    text: "A Costura das Marés — first sequence. Read it as fabric, not as a feed.",
    ref: { type: "book", id: "b-mares" },
    likes: 870,
    comments: 54,
    reposts: 77,
    saves: 210,
  },
  {
    id: "p9",
    authorId: "luca",
    createdAt: hoursAgo(34),
    kind: "product",
    text: "Linen runner, mist stripe. The listing lives on Mercado Libre. AQUA knows the relation; the cart will not pretend it can close here.",
    ref: { type: "product", id: "p-linen" },
    mediaIds: ["m-linen"],
    likes: 121,
    comments: 8,
    reposts: 4,
    saves: 22,
  },
  {
    id: "p10",
    authorId: "elise",
    createdAt: hoursAgo(40),
    kind: "book",
    text: "Graph of the Living Sea is readable as a thread. Chapter one is a premise, not a certificate.",
    ref: { type: "book", id: "b-graph" },
    communityId: "science",
    likes: 298,
    comments: 33,
    reposts: 40,
    saves: 112,
  },
  {
    id: "p11",
    authorId: "nia",
    createdAt: hoursAgo(44),
    kind: "music",
    text: "Caustics — a listening sketch. The file stays in the studio. What you have here is the relation: room, light, unfinished bar.",
    mediaIds: ["m-caustics"],
    likes: 1102,
    comments: 61,
    reposts: 80,
    saves: 240,
  },
  {
    id: "p12",
    authorId: "samuel",
    createdAt: hoursAgo(50),
    kind: "text",
    text: "This is a long message of the app, like a tweet. Like a drop of aqua if I may. Bringing back the short message to the apps with more responsibility and fun. #aquaapp #news",
    likes: 1560,
    comments: 94,
    reposts: 301,
    saves: 420,
  },
  {
    id: "p13",
    authorId: "marina",
    createdAt: hoursAgo(56),
    kind: "external",
    text: "Behind the print — a short from the studio floor. Referenced, not copied.",
    mediaIds: ["m-print"],
    external: {
      platform: "TikTok",
      url: "https://tiktok.com/@demo/print",
      externalId: "tt_print_01",
    },
    likes: 3201,
    comments: 140,
    reposts: 410,
    saves: 500,
  },
  {
    id: "p14",
    authorId: "atlas",
    createdAt: hoursAgo(62),
    kind: "text",
    text: "The pavilion over the pool is not a headquarters. It is a view. Identity, data, and the application should be allowed to live apart.",
    mediaIds: ["m-pavilion"],
    likes: 233,
    comments: 17,
    reposts: 29,
    saves: 48,
  },
  {
    id: "p15",
    authorId: "samuel",
    createdAt: hoursAgo(70),
    kind: "product",
    text: "Cloth edition is in the shop — AQUA native, so the cart can close here. The Shopify print in Marina’s shop cannot, and should not.",
    ref: { type: "product", id: "p-capsulas-print" },
    communityId: "mare",
    likes: 190,
    comments: 15,
    reposts: 11,
    saves: 37,
  },
];

export const seedComments: Comment[] = [
  { id: "cm1", targetType: "post", targetId: "p1", authorId: "marina", text: "The divider is the most honest punctuation you have written.", at: hoursAgo(1) },
  { id: "cm2", targetType: "post", targetId: "p1", authorId: "elise", text: "I stopped at the author note and the book waited. That is the feature.", at: hoursAgo(1) },
  { id: "cm3", targetType: "block", targetId: "b1-04", authorId: "nia", text: "This line is the whole platform, quietly.", at: hoursAgo(3) },
  { id: "cm4", targetType: "block", targetId: "b1-09", authorId: "elise", text: "Thank you for not giving us Maria’s hour.", at: hoursAgo(4) },
  { id: "cm5", targetType: "post", targetId: "p3", authorId: "samuel", text: "Linked from the shop graph as a citation, not as a stamp.", at: hoursAgo(6) },
  { id: "cm6", targetType: "post", targetId: "p11", authorId: "marina", text: "The light is doing the arrangement. I would stitch this.", at: hoursAgo(10) },
];

export const threads: Thread[] = [
  { id: "t-marina", participantIds: ["samuel", "marina"], preview: "I can print the pavilion small, for the cloth edition insert.", at: hoursAgo(3) },
  { id: "t-luca", participantIds: ["samuel", "luca"], preview: "The bundle: I can pack the bowl in foam the color of the ribbon.", at: hoursAgo(9) },
  { id: "t-elise", participantIds: ["samuel", "elise"], preview: "Please keep the preprint status visible on the card.", at: hoursAgo(18) },
  { id: "t-nia", participantIds: ["samuel", "nia"], preview: "Sunday — I’ll bring the caustics sketch, not a full set.", at: hoursAgo(22) },
];

export const messages: ChatMessage[] = [
  { id: "msg1", threadId: "t-marina", fromId: "marina", text: "The harbor frame is too wide for a cloth insert. I cropped a square.", at: hoursAgo(5) },
  { id: "msg2", threadId: "t-marina", fromId: "samuel", text: "Square is better. The book already has the pavilion as a block.", at: hoursAgo(4) },
  { id: "msg3", threadId: "t-marina", fromId: "marina", text: "I can print the pavilion small, for the cloth edition insert.", at: hoursAgo(3), ref: { type: "product", id: "p-print-pavilion" } },
  { id: "msg4", threadId: "t-luca", fromId: "luca", text: "Foam bowl is ready. You still want the bundle as one object?", at: hoursAgo(12) },
  { id: "msg5", threadId: "t-luca", fromId: "samuel", text: "One table, two origins of making — but one AQUA checkout.", at: hoursAgo(10) },
  { id: "msg6", threadId: "t-luca", fromId: "luca", text: "The bundle: I can pack the bowl in foam the color of the ribbon.", at: hoursAgo(9) },
  { id: "msg7", threadId: "t-elise", fromId: "elise", text: "If the wiki card says Certified I will ask you to take it down.", at: hoursAgo(20) },
  { id: "msg8", threadId: "t-elise", fromId: "samuel", text: "It says Preprint. The badge is a process we do not have.", at: hoursAgo(19) },
  { id: "msg9", threadId: "t-elise", fromId: "elise", text: "Please keep the preprint status visible on the card.", at: hoursAgo(18) },
  { id: "msg10", threadId: "t-nia", fromId: "nia", text: "Sunday — I’ll bring the caustics sketch, not a full set.", at: hoursAgo(22) },
];

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

const profileById = new Map(profiles.map((p) => [p.id, p]));
const profileByHandle = new Map(profiles.map((p) => [p.handle, p]));
const mediaById = new Map(media.map((m) => [m.id, m]));
const bookById = new Map(books.map((b) => [b.id, b]));
const productById = new Map(products.map((p) => [p.id, p]));
const articleById = new Map(articles.map((a) => [a.id, a]));
const communityById = new Map(communities.map((c) => [c.id, c]));
const storeById = new Map(stores.map((s) => [s.id, s]));
const postById = new Map(posts.map((p) => [p.id, p]));

export const getProfile = (id: string) => profileById.get(id);
export const getProfileByHandle = (h: string) => profileByHandle.get(h);
export const getMedia = (id: string) => mediaById.get(id);
export const getBook = (id: string) => bookById.get(id);
export const getProduct = (id: string) => productById.get(id);
export const getArticle = (id: string) => articleById.get(id);
export const getCommunity = (id: string) => communityById.get(id);
export const getStore = (id: string) => storeById.get(id);
export const getPost = (id: string) => postById.get(id);

export function chapterOf(book: Book, chapterId: string) {
  return book.chapters.find((c) => c.id === chapterId);
}

export function isEpubBook(book: Book) {
  return book.source === "epub" && Boolean(book.epubUrl);
}

export function originLabel(origin: Product["origin"]): string {
  switch (origin) {
    case "AQUA":
      return "AQUA";
    case "SHOPIFY":
      return "Shopify";
    case "WOOCOMMERCE":
      return "WooCommerce";
    case "MERCADO_LIBRE":
      return "Mercado Libre";
    case "ETSY":
      return "Etsy";
    case "AFFILIATE":
      return "Affiliate";
  }
}

export const ME = profiles[0];
