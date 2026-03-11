export type FeedTab = "trending" | "top" | "new" | "mine";

export type ListGame = {
  rank: number;
  title: string;
  description: string;
  price: number;
  oldPrice: number;
  metascore: number;
  metascoreTone: "green" | "blue" | "red";
  year: string;
  image: string;
};

export type ListComment = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timeAgo: string;
};

export type CommunityList = {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  date: string;
  description: string;
  likes: number;
  dislikes: number;
  commentsCount: number;
  gamesCount: number;
  image: string;
  tag: string;
  tagTone: string;
  trending?: boolean;
  newLabel?: boolean;
  mine?: boolean;
  genre: string;
  games: ListGame[];
  comments: ListComment[];
};

export const FEED_TABS: { id: FeedTab; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "top", label: "Más Votadas" },
  { id: "new", label: "Nuevas" },
  { id: "mine", label: "Mis Listas" },
];

export const CATEGORY_CHIPS = [
  "Todas",
  "Accion",
  "Co-op",
  "Estrategia",
  "Indie",
  "Ofertas",
  "RPG",
  "Retro",
  "Sci-Fi",
  "Simulacion",
  "Terror",
] as const;

export const COMMUNITY_LISTS: CommunityList[] = [
  {
    id: "top-rpgs-2024",
    title: "Top RPGs de 2024",
    author: "GamerPro99",
    authorAvatar:
      "https://www.figma.com/api/mcp/asset/91d75465-b70b-46fe-9706-08d859c021fc",
    date: "12 Oct 2024",
    description:
      "Los mejores juegos de rol que he jugado este ano. Imprescindibles!",
    likes: 124,
    dislikes: 12,
    commentsCount: 2,
    gamesCount: 3,
    image:
      "https://www.figma.com/api/mcp/asset/b569fdcd-3e50-45c7-ad4d-c7604fbb0eca",
    tag: "RPG",
    tagTone:
      "bg-[rgba(142,81,255,0.15)] border-[rgba(142,81,255,0.2)] text-[#a684ff]",
    trending: true,
    genre: "RPG",
    games: [
      {
        rank: 1,
        title: "Baldur's Gate 3",
        description: "Un RPG epico basado en Dungeons & Dragons.",
        price: 59.99,
        oldPrice: 59.99,
        metascore: 96,
        metascoreTone: "green",
        year: "2023",
        image:
          "https://www.figma.com/api/mcp/asset/7dd6c9f1-0e95-4691-bd32-4b3576518c0d",
      },
      {
        rank: 2,
        title: "Starfield",
        description: "Explora el universo en este RPG de Bethesda.",
        price: 69.99,
        oldPrice: 59.99,
        metascore: 85,
        metascoreTone: "blue",
        year: "2023",
        image:
          "https://www.figma.com/api/mcp/asset/4d3698ba-37c9-45d4-b329-005f5bcce339",
      },
      {
        rank: 3,
        title: "Cyberpunk 2077: Phantom Liberty",
        description: "Expansion de espionaje y thriller para Cyberpunk 2077.",
        price: 29.99,
        oldPrice: 59.99,
        metascore: 89,
        metascoreTone: "blue",
        year: "2023",
        image:
          "https://www.figma.com/api/mcp/asset/a523e224-26f8-4f2b-9508-5dd5c8018eea",
      },
    ],
    comments: [
      {
        id: "rpg-fan-01",
        user: "RPG_Fan_01",
        avatar:
          "https://www.figma.com/api/mcp/asset/fbf3d737-c8db-45fe-8c90-1520a82c8c88",
        text: "En serio no pusiste Baldur's Gate 3 en el top 1? Herejia.",
        timeAgo: "Hace 2 horas",
      },
      {
        id: "steam-deck-user",
        user: "SteamDeckUser",
        avatar:
          "https://www.figma.com/api/mcp/asset/8ee73488-0ada-4daa-9369-7e2027191725",
        text: "Buena lista, todos corren genial en la Deck.",
        timeAgo: "Hace 5 horas",
      },
    ],
  },
  {
    id: "coop-amigos",
    title: "Co-op para jugar con amigos",
    author: "SquadLeader",
    authorAvatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=SquadLeader",
    date: "28 Nov 2025",
    description:
      "Lista definitiva para no discutir que jugar el fin de semana.",
    likes: 256,
    dislikes: 18,
    commentsCount: 3,
    gamesCount: 3,
    image:
      "https://www.figma.com/api/mcp/asset/8e3321e0-23c4-4d57-9568-8c43dc87a502",
    tag: "Co-op",
    tagTone:
      "bg-[rgba(43,127,255,0.15)] border-[rgba(43,127,255,0.2)] text-[#51a2ff]",
    trending: true,
    genre: "Co-op",
    games: [
      {
        rank: 1,
        title: "It Takes Two",
        description: "Aventura cooperativa esencial para jugar en pareja.",
        price: 39.99,
        oldPrice: 59.99,
        metascore: 88,
        metascoreTone: "blue",
        year: "2021",
        image: "https://picsum.photos/seed/it-takes-two/384/236",
      },
      {
        rank: 2,
        title: "Lethal Company",
        description: "Caos y risas buscando chatarra con amigos.",
        price: 9.99,
        oldPrice: 12.99,
        metascore: 90,
        metascoreTone: "green",
        year: "2023",
        image: "https://picsum.photos/seed/lethal-company/384/236",
      },
      {
        rank: 3,
        title: "Helldivers 2",
        description: "Shooter co-op intenso de extraccion y estrategia.",
        price: 39.99,
        oldPrice: 49.99,
        metascore: 82,
        metascoreTone: "blue",
        year: "2024",
        image: "https://picsum.photos/seed/helldivers-2/384/236",
      },
    ],
    comments: [
      {
        id: "coop-comment-1",
        user: "PartyHost",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=PartyHost",
        text: "It Takes Two sigue siendo imbatible para empezar la noche.",
        timeAgo: "Hace 1 hora",
      },
      {
        id: "coop-comment-2",
        user: "NoFriendlyFire",
        avatar:
          "https://api.dicebear.com/9.x/adventurer/svg?seed=NoFriendlyFire",
        text: "Helldivers 2 es top, pero preparad paciencia en dificultad alta.",
        timeAgo: "Hace 4 horas",
      },
    ],
  },
  {
    id: "survival-horror-101",
    title: "Survival Horror 101",
    author: "DarkSoulsLover",
    authorAvatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=DarkSoulsLover",
    date: "03 Ene 2026",
    description:
      "Los juegos mas terrorificos de Steam. No jugar solo de noche.",
    likes: 178,
    dislikes: 22,
    commentsCount: 2,
    gamesCount: 3,
    image:
      "https://www.figma.com/api/mcp/asset/5cbcf0e4-22e8-4cfe-9081-c6540a9b3663",
    tag: "Terror",
    tagTone:
      "bg-[rgba(251,44,54,0.15)] border-[rgba(251,44,54,0.2)] text-[#ff6467]",
    trending: true,
    genre: "Terror",
    games: [
      {
        rank: 1,
        title: "Resident Evil 4",
        description: "Remake de accion y terror con ritmo impecable.",
        price: 39.99,
        oldPrice: 59.99,
        metascore: 93,
        metascoreTone: "green",
        year: "2023",
        image: "https://picsum.photos/seed/re4-remake/384/236",
      },
      {
        rank: 2,
        title: "Alien: Isolation",
        description: "Tension constante en los pasillos de Sevastopol.",
        price: 7.99,
        oldPrice: 29.99,
        metascore: 81,
        metascoreTone: "blue",
        year: "2014",
        image: "https://picsum.photos/seed/alien-isolation/384/236",
      },
      {
        rank: 3,
        title: "Outlast",
        description: "Sin armas, solo correr, esconderse y rezar.",
        price: 3.99,
        oldPrice: 19.99,
        metascore: 80,
        metascoreTone: "blue",
        year: "2013",
        image: "https://picsum.photos/seed/outlast/384/236",
      },
    ],
    comments: [
      {
        id: "horror-comment-1",
        user: "NocturnalGamer",
        avatar:
          "https://api.dicebear.com/9.x/adventurer/svg?seed=NocturnalGamer",
        text: "Alien Isolation me hizo pausar varias veces. Muy buena seleccion.",
        timeAgo: "Hace 3 horas",
      },
      {
        id: "horror-comment-2",
        user: "FlashlightOnly",
        avatar:
          "https://api.dicebear.com/9.x/adventurer/svg?seed=FlashlightOnly",
        text: "Outlast de noche con auriculares da demasiado miedo.",
        timeAgo: "Hace 6 horas",
      },
    ],
  },
  {
    id: "indie-gems-2025",
    title: "Indie Gems 2025",
    author: "CuratedIndie",
    authorAvatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=CuratedIndie",
    date: "15 Feb 2026",
    description:
      "Los indies que estan petando este ano. Pequenos estudios, joyas.",
    likes: 320,
    dislikes: 16,
    commentsCount: 4,
    gamesCount: 4,
    image:
      "https://www.figma.com/api/mcp/asset/d5813370-0e92-4123-a22a-8417ecf9f35f",
    tag: "Indie",
    tagTone:
      "bg-[rgba(0,188,125,0.15)] border-[rgba(0,188,125,0.2)] text-[#00d492]",
    trending: true,
    newLabel: true,
    mine: true,
    genre: "Indie",
    games: [
      {
        rank: 1,
        title: "Balatro",
        description: "Roguelike de poker absurdamente adictivo.",
        price: 14.99,
        oldPrice: 19.99,
        metascore: 90,
        metascoreTone: "green",
        year: "2024",
        image: "https://picsum.photos/seed/balatro/384/236",
      },
      {
        rank: 2,
        title: "Animal Well",
        description: "Metroidvania de puzles con atmosfera inquietante.",
        price: 18.99,
        oldPrice: 24.99,
        metascore: 91,
        metascoreTone: "green",
        year: "2024",
        image: "https://picsum.photos/seed/animal-well/384/236",
      },
      {
        rank: 3,
        title: "Mouthwashing",
        description: "Narrativa experimental con estilo visual unico.",
        price: 11.99,
        oldPrice: 15.99,
        metascore: 84,
        metascoreTone: "blue",
        year: "2025",
        image: "https://picsum.photos/seed/mouthwashing/384/236",
      },
      {
        rank: 4,
        title: "Dungeons of Hinterberg",
        description: "ARPG colorido con combates y social links.",
        price: 29.99,
        oldPrice: 39.99,
        metascore: 78,
        metascoreTone: "blue",
        year: "2025",
        image: "https://picsum.photos/seed/hinterberg/384/236",
      },
    ],
    comments: [
      {
        id: "indie-comment-1",
        user: "PixelHunter",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=PixelHunter",
        text: "Balatro es droga legal, 100 por ciento de acuerdo.",
        timeAgo: "Hace 45 min",
      },
      {
        id: "indie-comment-2",
        user: "TinyStudioFan",
        avatar:
          "https://api.dicebear.com/9.x/adventurer/svg?seed=TinyStudioFan",
        text: "Gracias por meter Animal Well, merece mas foco.",
        timeAgo: "Hace 2 horas",
      },
    ],
  },
];

export function getCommunityListById(id?: string) {
  if (!id) {
    return undefined;
  }

  return COMMUNITY_LISTS.find((list) => list.id === id);
}
