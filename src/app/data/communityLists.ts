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
  ownerLabel?: boolean;
  topVoted?: boolean;
  topOrder?: number;
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
      "https://www.figma.com/api/mcp/asset/d21e45fd-58fb-48d3-b325-4067e4f0568a",
    tag: "RPG",
    tagTone:
      "bg-[rgba(142,81,255,0.15)] border-[rgba(142,81,255,0.2)] text-[#a684ff]",
    trending: true,
    topVoted: true,
    topOrder: 5,
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
      "https://www.figma.com/api/mcp/asset/92d8b0d4-5f13-483c-ba3f-e002f89216f5",
    tag: "Co-op",
    tagTone:
      "bg-[rgba(43,127,255,0.15)] border-[rgba(43,127,255,0.2)] text-[#51a2ff]",
    trending: true,
    topVoted: true,
    topOrder: 2,
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
      "https://www.figma.com/api/mcp/asset/7c3a8a9a-1bf7-4709-9be5-c0ab4b061c7d",
    tag: "Terror",
    tagTone:
      "bg-[rgba(251,44,54,0.15)] border-[rgba(251,44,54,0.2)] text-[#ff6467]",
    trending: true,
    topVoted: true,
    topOrder: 3,
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
      "https://www.figma.com/api/mcp/asset/2a41e24d-f401-40c2-b6b7-ddaceadc07ba",
    tag: "Indie",
    tagTone:
      "bg-[rgba(0,188,125,0.15)] border-[rgba(0,188,125,0.2)] text-[#00d492]",
    trending: true,
    newLabel: true,
    mine: true,
    topVoted: true,
    topOrder: 1,
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
  {
    id: "estrategia-4x-dominar-mundo",
    title: "Estrategia 4X para Dominar el Mundo",
    author: "CivFanatic",
    authorAvatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=CivFanatic",
    date: "10 Mar 2026",
    description:
      "Civilizacion, diplomacia y conquista. Las joyas del genero de estrategia por turnos.",
    likes: 145,
    dislikes: 14,
    commentsCount: 34,
    gamesCount: 7,
    image:
      "https://www.figma.com/api/mcp/asset/29b55e89-cf86-47e1-90d7-62283ef65b74",
    tag: "Estrategia",
    tagTone:
      "bg-[rgba(0,184,219,0.15)] border-[rgba(0,184,219,0.2)] text-[#00d3f3]",
    topVoted: true,
    topOrder: 4,
    genre: "Estrategia",
    games: [
      {
        rank: 1,
        title: "Sid Meier's Civilization VI",
        description: "Construye un imperio que perdure por siglos.",
        price: 5.99,
        oldPrice: 59.99,
        metascore: 88,
        metascoreTone: "blue",
        year: "2016",
        image: "https://picsum.photos/seed/civ6/384/236",
      },
      {
        rank: 2,
        title: "Humankind",
        description: "Reescribe la historia en cada era.",
        price: 19.99,
        oldPrice: 49.99,
        metascore: 77,
        metascoreTone: "blue",
        year: "2021",
        image: "https://picsum.photos/seed/humankind/384/236",
      },
      {
        rank: 3,
        title: "Age of Wonders 4",
        description: "Fantasia tactica con construccion de reino.",
        price: 34.99,
        oldPrice: 49.99,
        metascore: 81,
        metascoreTone: "blue",
        year: "2023",
        image: "https://picsum.photos/seed/aow4/384/236",
      },
    ],
    comments: [
      {
        id: "estrategia-comment-1",
        user: "TurnBasedKing",
        avatar:
          "https://api.dicebear.com/9.x/adventurer/svg?seed=TurnBasedKing",
        text: "Muy buena seleccion para maratones de estrategia.",
        timeAgo: "Hace 2 horas",
      },
      {
        id: "estrategia-comment-2",
        user: "HexaGrid",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=HexaGrid",
        text: "Civilization VI sigue siendo el rey.",
        timeAgo: "Hace 6 horas",
      },
    ],
  },
  {
    id: "survival-sobrevive-o-muere",
    title: "Survival: Sobrevive o Muere",
    author: "WildCrafter",
    authorAvatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=WildCrafter",
    date: "09 Mar 2026",
    description:
      "Crafting, base building y supervivencia extrema. Cuanto aguantas?",
    likes: 112,
    dislikes: 11,
    commentsCount: 41,
    gamesCount: 9,
    image:
      "https://www.figma.com/api/mcp/asset/8b189d86-19f6-41e8-9950-68b151223284",
    tag: "Accion",
    tagTone:
      "bg-[rgba(255,105,0,0.15)] border-[rgba(255,105,0,0.2)] text-[#ff8904]",
    ownerLabel: true,
    topVoted: true,
    topOrder: 6,
    genre: "Accion",
    games: [
      {
        rank: 1,
        title: "Rust",
        description: "Construye, saquea y sobrevive a cualquier costo.",
        price: 39.99,
        oldPrice: 44.99,
        metascore: 69,
        metascoreTone: "blue",
        year: "2018",
        image: "https://picsum.photos/seed/rust/384/236",
      },
      {
        rank: 2,
        title: "Valheim",
        description: "Co-op vikingo con progresion y exploracion.",
        price: 11.99,
        oldPrice: 19.99,
        metascore: 84,
        metascoreTone: "blue",
        year: "2021",
        image: "https://picsum.photos/seed/valheim/384/236",
      },
      {
        rank: 3,
        title: "The Forest",
        description: "Supervivencia y horror en una isla hostil.",
        price: 4.19,
        oldPrice: 16.79,
        metascore: 83,
        metascoreTone: "blue",
        year: "2018",
        image: "https://picsum.photos/seed/the-forest/384/236",
      },
    ],
    comments: [
      {
        id: "survival-comment-1",
        user: "RaiderWolf",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=RaiderWolf",
        text: "Valheim con amigos es de lo mejor para este genero.",
        timeAgo: "Hace 3 horas",
      },
      {
        id: "survival-comment-2",
        user: "ShelterBuilder",
        avatar:
          "https://api.dicebear.com/9.x/adventurer/svg?seed=ShelterBuilder",
        text: "Buena mezcla entre survival duro y accesible.",
        timeAgo: "Hace 7 horas",
      },
    ],
  },
  {
    id: "exploracion-espacial-sci-fi-dreams",
    title: "Exploracion Espacial: Sci-Fi Dreams",
    author: "StarPilot42",
    authorAvatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=StarPilot42",
    date: "08 Mar 2026",
    description:
      "Viajes interestelares, colonizacion planetaria y combate en el vacio del espacio.",
    likes: 98,
    dislikes: 10,
    commentsCount: 28,
    gamesCount: 11,
    image:
      "https://www.figma.com/api/mcp/asset/44552785-0820-4acc-a932-1c72c991888c",
    tag: "Sci-Fi",
    tagTone:
      "bg-[rgba(97,95,255,0.15)] border-[rgba(97,95,255,0.2)] text-[#7c86ff]",
    newLabel: true,
    topVoted: true,
    topOrder: 7,
    genre: "Sci-Fi",
    games: [
      {
        rank: 1,
        title: "No Man's Sky",
        description: "Explora galaxias infinitas y crea tu ruta.",
        price: 23.99,
        oldPrice: 59.99,
        metascore: 77,
        metascoreTone: "blue",
        year: "2016",
        image: "https://picsum.photos/seed/no-mans-sky/384/236",
      },
      {
        rank: 2,
        title: "Elite Dangerous",
        description: "Simulacion espacial profunda para pilotos.",
        price: 4.99,
        oldPrice: 24.99,
        metascore: 80,
        metascoreTone: "blue",
        year: "2014",
        image: "https://picsum.photos/seed/elite-dangerous/384/236",
      },
      {
        rank: 3,
        title: "Everspace 2",
        description: "Accion espacial con loot y progreso ARPG.",
        price: 29.99,
        oldPrice: 39.99,
        metascore: 83,
        metascoreTone: "blue",
        year: "2023",
        image: "https://picsum.photos/seed/everspace2/384/236",
      },
    ],
    comments: [
      {
        id: "scifi-comment-1",
        user: "GalaxyNomad",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=GalaxyNomad",
        text: "Faltaria Outer Wilds, pero la lista esta genial.",
        timeAgo: "Hace 1 hora",
      },
      {
        id: "scifi-comment-2",
        user: "NebulaKid",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=NebulaKid",
        text: "Everspace 2 merece mas reconocimiento.",
        timeAgo: "Hace 9 horas",
      },
    ],
  },
  {
    id: "joyas-ocultas-por-menos-de-5",
    title: "Joyas Ocultas por menos de 5€",
    author: "IndieHunter",
    authorAvatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=IndieHunter",
    date: "07 Mar 2026",
    description:
      "Juegos increibles que cuestan menos que un cafe. Aprovechad las ofertas.",
    likes: 89,
    dislikes: 6,
    commentsCount: 12,
    gamesCount: 8,
    image:
      "https://www.figma.com/api/mcp/asset/afebfb79-67d4-42e5-9d98-30ac27397731",
    tag: "Ofertas",
    tagTone:
      "bg-[rgba(254,154,0,0.15)] border-[rgba(254,154,0,0.2)] text-[#ffb900]",
    topVoted: true,
    topOrder: 8,
    genre: "Ofertas",
    games: [
      {
        rank: 1,
        title: "Vampire Survivors",
        description: "Adictivo, barato y perfecto para sesiones cortas.",
        price: 4.99,
        oldPrice: 4.99,
        metascore: 86,
        metascoreTone: "blue",
        year: "2022",
        image: "https://picsum.photos/seed/vampire-survivors/384/236",
      },
      {
        rank: 2,
        title: "FTL: Faster Than Light",
        description: "Roguelike espacial clasico con muchas decisiones.",
        price: 2.49,
        oldPrice: 9.99,
        metascore: 84,
        metascoreTone: "blue",
        year: "2012",
        image: "https://picsum.photos/seed/ftl/384/236",
      },
      {
        rank: 3,
        title: "Portal",
        description: "Puzles legendarios y humor impecable.",
        price: 1.95,
        oldPrice: 9.75,
        metascore: 90,
        metascoreTone: "green",
        year: "2007",
        image: "https://picsum.photos/seed/portal/384/236",
      },
    ],
    comments: [
      {
        id: "ofertas-comment-1",
        user: "DealSeeker",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=DealSeeker",
        text: "Esta lista me ahorro bastante dinero.",
        timeAgo: "Hace 5 horas",
      },
      {
        id: "ofertas-comment-2",
        user: "PocketGamer",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=PocketGamer",
        text: "Portal a este precio es compra obligatoria.",
        timeAgo: "Hace 11 horas",
      },
    ],
  },
  {
    id: "steampunk-retrofuturismo",
    title: "Steampunk & Retrofuturismo",
    author: "GearHead",
    authorAvatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=GearHead",
    date: "06 Mar 2026",
    description:
      "Engranajes, vapor y mundos alternativos. Estetica steampunk en su maxima expresion.",
    likes: 76,
    dislikes: 9,
    commentsCount: 19,
    gamesCount: 5,
    image:
      "https://www.figma.com/api/mcp/asset/34ff93b5-f84d-435d-8ad2-b3f4f41cfcf7",
    tag: "Retro",
    tagTone:
      "bg-[rgba(246,51,154,0.15)] border-[rgba(246,51,154,0.2)] text-[#fb64b6]",
    newLabel: true,
    topVoted: true,
    topOrder: 9,
    genre: "Retro",
    games: [
      {
        rank: 1,
        title: "Bioshock Infinite",
        description: "Aventura retrofuturista con gran direccion artistica.",
        price: 7.49,
        oldPrice: 29.99,
        metascore: 94,
        metascoreTone: "green",
        year: "2013",
        image: "https://picsum.photos/seed/bioshock-infinite/384/236",
      },
      {
        rank: 2,
        title: "Frostpunk",
        description: "Gestion de ciudad y decisiones morales en frio extremo.",
        price: 5.99,
        oldPrice: 29.99,
        metascore: 84,
        metascoreTone: "blue",
        year: "2018",
        image: "https://picsum.photos/seed/frostpunk/384/236",
      },
      {
        rank: 3,
        title: "SteamWorld Heist",
        description: "Tactica por turnos en un universo steampunk.",
        price: 3.29,
        oldPrice: 12.99,
        metascore: 81,
        metascoreTone: "blue",
        year: "2016",
        image: "https://picsum.photos/seed/steamworld-heist/384/236",
      },
    ],
    comments: [
      {
        id: "retro-comment-1",
        user: "SteamScholar",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=SteamScholar",
        text: "Bioshock Infinite encaja perfecto en esta tematica.",
        timeAgo: "Hace 2 horas",
      },
      {
        id: "retro-comment-2",
        user: "CogPilot",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=CogPilot",
        text: "Me encanta que incluyas opciones menos conocidas.",
        timeAgo: "Hace 1 dia",
      },
    ],
  },
  {
    id: "carreras-velocidad-top-racers",
    title: "Carreras y Velocidad: Top Racers",
    author: "SpeedDemon",
    authorAvatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=SpeedDemon",
    date: "05 Mar 2026",
    description:
      "Desde arcades hasta sims: los mejores juegos de carreras en Steam.",
    likes: 67,
    dislikes: 7,
    commentsCount: 23,
    gamesCount: 10,
    image:
      "https://www.figma.com/api/mcp/asset/6b38a9bc-b202-4423-8d0f-02434dc87df7",
    tag: "Accion",
    tagTone:
      "bg-[rgba(255,105,0,0.15)] border-[rgba(255,105,0,0.2)] text-[#ff8904]",
    newLabel: true,
    topVoted: true,
    topOrder: 10,
    genre: "Accion",
    games: [
      {
        rank: 1,
        title: "Forza Horizon 5",
        description: "Arcade premium con mundo abierto en Mexico.",
        price: 29.99,
        oldPrice: 59.99,
        metascore: 92,
        metascoreTone: "green",
        year: "2021",
        image: "https://picsum.photos/seed/forza5/384/236",
      },
      {
        rank: 2,
        title: "Assetto Corsa",
        description: "Simulacion exigente con gran comunidad de mods.",
        price: 3.99,
        oldPrice: 19.99,
        metascore: 85,
        metascoreTone: "blue",
        year: "2014",
        image: "https://picsum.photos/seed/assetto-corsa/384/236",
      },
      {
        rank: 3,
        title: "Need for Speed Heat",
        description: "Velocidad nocturna y persecuciones urbanas.",
        price: 10.49,
        oldPrice: 69.99,
        metascore: 72,
        metascoreTone: "blue",
        year: "2019",
        image: "https://picsum.photos/seed/nfs-heat/384/236",
      },
    ],
    comments: [
      {
        id: "race-comment-1",
        user: "ApexDriver",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=ApexDriver",
        text: "Forza 5 y Assetto en la misma lista, excelente.",
        timeAgo: "Hace 30 min",
      },
      {
        id: "race-comment-2",
        user: "ShiftLate",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=ShiftLate",
        text: "Me faltaria Dirt Rally 2.0, pero esta muy bien.",
        timeAgo: "Hace 8 horas",
      },
    ],
  },
  {
    id: "juegos-ritmicos-que-enganchan",
    title: "Juegos Ritmicos que Enganchan",
    author: "BeatMaster",
    authorAvatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=BeatMaster",
    date: "04 Mar 2026",
    description:
      "Beat Saber, Crypt of the Necrodancer y mas. Musica y gameplay en perfecta armonia.",
    likes: 54,
    dislikes: 5,
    commentsCount: 15,
    gamesCount: 6,
    image:
      "https://www.figma.com/api/mcp/asset/cbed411c-7809-46b3-a270-12785382b641",
    tag: "Indie",
    tagTone:
      "bg-[rgba(0,188,125,0.15)] border-[rgba(0,188,125,0.2)] text-[#00d492]",
    topVoted: true,
    topOrder: 11,
    genre: "Indie",
    games: [
      {
        rank: 1,
        title: "Beat Saber",
        description: "Cortes precisos y ritmo frenetico en VR.",
        price: 29.99,
        oldPrice: 29.99,
        metascore: 86,
        metascoreTone: "blue",
        year: "2019",
        image: "https://picsum.photos/seed/beat-saber/384/236",
      },
      {
        rank: 2,
        title: "Crypt of the NecroDancer",
        description: "Dungeon crawler al compas de la musica.",
        price: 2.99,
        oldPrice: 14.99,
        metascore: 88,
        metascoreTone: "blue",
        year: "2015",
        image: "https://picsum.photos/seed/necrodancer/384/236",
      },
      {
        rank: 3,
        title: "Hi-Fi RUSH",
        description: "Accion estilizada sincronizada con la banda sonora.",
        price: 17.99,
        oldPrice: 29.99,
        metascore: 89,
        metascoreTone: "blue",
        year: "2023",
        image: "https://picsum.photos/seed/hifi-rush/384/236",
      },
    ],
    comments: [
      {
        id: "rhythm-comment-1",
        user: "TempoKid",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=TempoKid",
        text: "Lista top para entrenar reflejos y ritmo.",
        timeAgo: "Hace 2 horas",
      },
      {
        id: "rhythm-comment-2",
        user: "Drumline",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Drumline",
        text: "Hi-Fi RUSH es una joya total.",
        timeAgo: "Hace 12 horas",
      },
    ],
  },
  {
    id: "mi-coleccion-simuladores",
    title: "Mi Coleccion de Simuladores",
    author: "Tu",
    authorAvatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Tu",
    date: "03 Mar 2026",
    description:
      "Granjas, ciudades, trenes... si se puede simular, esta en esta lista.",
    likes: 34,
    dislikes: 3,
    commentsCount: 8,
    gamesCount: 14,
    image:
      "https://www.figma.com/api/mcp/asset/e6a024d8-881a-46a3-993a-e325f65bb52b",
    tag: "Simulacion",
    tagTone:
      "bg-[rgba(124,207,0,0.15)] border-[rgba(124,207,0,0.2)] text-[#9ae600]",
    mine: true,
    ownerLabel: true,
    topVoted: true,
    topOrder: 12,
    genre: "Simulacion",
    games: [
      {
        rank: 1,
        title: "Cities: Skylines",
        description: "Gestiona trafico, economia y servicios urbanos.",
        price: 8.99,
        oldPrice: 29.99,
        metascore: 85,
        metascoreTone: "blue",
        year: "2015",
        image: "https://picsum.photos/seed/cities-skylines/384/236",
      },
      {
        rank: 2,
        title: "Euro Truck Simulator 2",
        description: "Rutas largas, radio y mucha carretera.",
        price: 4.99,
        oldPrice: 19.99,
        metascore: 79,
        metascoreTone: "blue",
        year: "2012",
        image: "https://picsum.photos/seed/ets2/384/236",
      },
      {
        rank: 3,
        title: "Farming Simulator 22",
        description: "Cultiva, cosecha y optimiza tu granja.",
        price: 19.99,
        oldPrice: 39.99,
        metascore: 76,
        metascoreTone: "blue",
        year: "2021",
        image: "https://picsum.photos/seed/farming-22/384/236",
      },
    ],
    comments: [
      {
        id: "sim-comment-1",
        user: "CityPlanner",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=CityPlanner",
        text: "ETS2 y Cities en una misma lista es paz mental.",
        timeAgo: "Hace 4 horas",
      },
      {
        id: "sim-comment-2",
        user: "FarmHand",
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=FarmHand",
        text: "Perfecta para desconectar despues de trabajar.",
        timeAgo: "Hace 1 dia",
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
