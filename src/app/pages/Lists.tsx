import { useMemo, useState } from "react";
import {
  Bookmark,
  Clock3,
  Flame,
  Heart,
  MessageSquare,
  Plus,
  Search,
  Star,
} from "lucide-react";
import { Link } from "react-router";

type FeedTab = "trending" | "top" | "new" | "mine";

type CommunityList = {
  id: string;
  title: string;
  author: string;
  description: string;
  likes: number;
  comments: number;
  gamesCount: number;
  image: string;
  tag: string;
  tagTone: string;
  trending?: boolean;
  newLabel?: boolean;
  genre: string;
};

const FEED_TABS: { id: FeedTab; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "top", label: "Más Votadas" },
  { id: "new", label: "Nuevas" },
  { id: "mine", label: "Mis Listas" },
];

const CATEGORY_CHIPS = [
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
];

const LISTS: CommunityList[] = [
  {
    id: "top-rpgs-2024",
    title: "Top RPGs de 2024",
    author: "GamerPro99",
    description:
      "Los mejores juegos de rol que he jugado este año. Imprescindibles!",
    likes: 124,
    comments: 45,
    gamesCount: 12,
    image:
      "https://www.figma.com/api/mcp/asset/b569fdcd-3e50-45c7-ad4d-c7604fbb0eca",
    tag: "RPG",
    tagTone:
      "bg-[rgba(142,81,255,0.15)] border-[rgba(142,81,255,0.2)] text-[#a684ff]",
    trending: true,
    genre: "RPG",
  },
  {
    id: "coop-amigos",
    title: "Co-op para jugar con amigos",
    author: "SquadLeader",
    description:
      "Lista definitiva para no discutir que jugar el fin de semana.",
    likes: 256,
    comments: 78,
    gamesCount: 20,
    image:
      "https://www.figma.com/api/mcp/asset/8e3321e0-23c4-4d57-9568-8c43dc87a502",
    tag: "Co-op",
    tagTone:
      "bg-[rgba(43,127,255,0.15)] border-[rgba(43,127,255,0.2)] text-[#51a2ff]",
    trending: true,
    genre: "Co-op",
  },
  {
    id: "survival-horror-101",
    title: "Survival Horror 101",
    author: "DarkSoulsLover",
    description:
      "Los juegos mas terrorificos de Steam. No jugar solo de noche. Avisados.",
    likes: 178,
    comments: 56,
    gamesCount: 15,
    image:
      "https://www.figma.com/api/mcp/asset/5cbcf0e4-22e8-4cfe-9081-c6540a9b3663",
    tag: "Terror",
    tagTone:
      "bg-[rgba(251,44,54,0.15)] border-[rgba(251,44,54,0.2)] text-[#ff6467]",
    trending: true,
    genre: "Terror",
  },
  {
    id: "indie-gems-2025",
    title: "Indie Gems 2025",
    author: "CuratedIndie",
    description:
      "Los indies que estan petando este año. Pequeños estudios, grandes experiencias.",
    likes: 320,
    comments: 92,
    gamesCount: 4,
    image:
      "https://www.figma.com/api/mcp/asset/d5813370-0e92-4123-a22a-8417ecf9f35f",
    tag: "Indie",
    tagTone:
      "bg-[rgba(0,188,125,0.15)] border-[rgba(0,188,125,0.2)] text-[#00d492]",
    trending: true,
    newLabel: true,
    genre: "Indie",
  },
];

export function Lists() {
  const [feedTab, setFeedTab] = useState<FeedTab>("trending");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [query, setQuery] = useState("");

  const filteredLists = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LISTS.filter((item) => {
      const matchesTab =
        feedTab === "trending"
          ? !!item.trending
          : feedTab === "new"
            ? !!item.newLabel
            : feedTab === "top"
              ? item.likes >= 170
              : item.author.toLowerCase().includes("curated");

      const matchesCategory =
        selectedCategory === "Todas" ||
        item.genre.toLowerCase() === selectedCategory.toLowerCase();

      const matchesQuery =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      return matchesTab && matchesCategory && matchesQuery;
    });
  }, [feedTab, query, selectedCategory]);

  return (
    <div className="pb-20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[42px] leading-[1] font-bold text-white mb-2">
            Listas de la Comunidad
          </h1>
          <p className="text-[#90a1b9] text-[14px]">
            Descubre colecciones curadas por otros jugadores
          </p>
        </div>

        <button
          className="h-9 px-4 rounded-[10px] bg-[#314158] text-[#90a1b9] text-[14px] font-medium flex items-center gap-2 hover:bg-[#3b4d67] transition-colors self-start"
          type="button"
        >
          <Plus size={18} /> Crear Lista
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="h-[42px] p-[5px] rounded-[14px] border border-[#1d293d] bg-[rgba(15,23,43,0.8)] flex items-start gap-1 w-fit">
            {FEED_TABS.map((tab) => {
              const active = feedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFeedTab(tab.id)}
                  className={`h-8 rounded-[10px] px-4 text-[12px] font-medium flex items-center gap-2 transition-all ${
                    active
                      ? "bg-[#155dfc] text-white shadow-[0px_10px_15px_0px_rgba(43,127,255,0.2)]"
                      : "text-[#90a1b9] hover:text-white"
                  }`}
                >
                  {tab.id === "trending" && <Flame size={14} />}
                  {tab.id === "top" && <Star size={14} />}
                  {tab.id === "new" && <Clock3 size={14} />}
                  {tab.id === "mine" && <Bookmark size={14} />}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full xl:w-[256px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#62748e]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar listas..."
              className="w-full h-[38px] rounded-[10px] bg-[#0f172b] border border-[#314158] pl-9 pr-4 text-[14px] text-[#cad5e2] placeholder:text-[rgba(226,232,240,0.5)] focus:outline-none focus:border-[#51a2ff]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORY_CHIPS.map((chip) => {
            const active = chip === selectedCategory;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setSelectedCategory(chip)}
                className={`h-[30.5px] rounded-full px-[13px] text-[11px] font-medium whitespace-nowrap border transition-colors ${
                  active
                    ? "bg-[#155dfc] border-[#2b7fff] text-white"
                    : "bg-[#0f172b] border-[#314158] text-[#90a1b9] hover:text-white"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {filteredLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {filteredLists.map((list) => (
              <Link
                key={list.id}
                to={`/lists/${list.id}`}
                className="bg-[#0f172b] border border-[#1d293d] rounded-[14px] overflow-hidden block hover:border-[#2b7fff] transition-colors"
              >
                <div className="relative h-[160px]">
                  <img
                    src={list.image}
                    alt={list.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172b] via-[rgba(15,23,43,0.4)] to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {list.trending && (
                      <span className="h-[19px] rounded-full px-2 bg-[rgba(255,105,0,0.9)] text-white text-[10px] font-bold flex items-center gap-1">
                        <Flame size={10} /> TRENDING
                      </span>
                    )}
                    {list.newLabel && (
                      <span className="h-[19px] rounded-full px-2 bg-[rgba(0,188,125,0.9)] text-white text-[10px] font-bold">
                        NUEVA
                      </span>
                    )}
                  </div>

                  <span
                    className={`absolute top-4 right-3 h-5 rounded-full border px-[9px] text-[10px] font-medium flex items-center ${list.tagTone}`}
                  >
                    {list.tag}
                  </span>

                  <div className="absolute left-4 right-4 bottom-3">
                    <h3 className="text-white text-[22px] leading-6 font-bold mb-0.5 truncate">
                      {list.title}
                    </h3>
                    <p className="text-[11px] text-[#cad5e2]">
                      por <span className="text-[#51a2ff]">{list.author}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-3">
                  <p className="text-[#90a1b9] text-[12px] leading-[19.5px] min-h-[58px]">
                    {list.description}
                  </p>

                  <div className="mt-4 pt-2 border-t border-[#1d293d] flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[#62748e] text-[12px]">
                      <span className="flex items-center gap-1">
                        <Heart size={13} /> {list.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={13} /> {list.comments}
                      </span>
                    </div>
                    <span className="h-[17px] rounded-[4px] bg-[#1d293d] px-2 text-[#62748e] text-[10px] font-medium flex items-center">
                      {list.gamesCount} juegos
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[rgba(15,23,43,0.8)] border border-[#1d293d] rounded-[14px] p-10 text-center">
            <p className="text-[#90a1b9] text-[14px] mb-4">
              No se encontraron listas para este filtro.
            </p>
            <button
              type="button"
              onClick={() => {
                setFeedTab("trending");
                setSelectedCategory("Todas");
                setQuery("");
              }}
              className="h-9 px-4 rounded-[10px] bg-[#155dfc] text-white text-[13px] font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
