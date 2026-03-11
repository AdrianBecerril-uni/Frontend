import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  Heart,
  MessageSquare,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { Link } from "react-router";
import {
  CATEGORY_CHIPS,
  COMMUNITY_LISTS,
  FEED_TABS,
  FeedTab,
} from "../data/communityLists";

export function Lists() {
  const [feedTab, setFeedTab] = useState<FeedTab>("trending");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [query, setQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createCategory, setCreateCategory] = useState("RPG");
  const [createCover, setCreateCover] = useState(
    () => COMMUNITY_LISTS[0]?.image ?? "",
  );

  const createCategoryOptions = useMemo(
    () => CATEGORY_CHIPS.filter((chip) => chip !== "Todas"),
    [],
  );

  const createCoverOptions = useMemo(
    () =>
      COMMUNITY_LISTS.slice(0, 3).map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
      })),
    [],
  );

  const titleChars = createTitle.length;
  const descriptionChars = createDescription.length;
  const canContinue =
    createTitle.trim().length > 0 &&
    createDescription.trim().length > 0 &&
    createCategory.length > 0 &&
    createCover.length > 0;

  useEffect(() => {
    if (!isCreateModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCreateModalOpen]);

  useEffect(() => {
    if (!isCreateModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCreateModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCreateModalOpen]);

  const filteredLists = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = COMMUNITY_LISTS.filter((item) => {
      const matchesTab =
        feedTab === "trending"
          ? !!item.trending
          : feedTab === "new"
            ? !!item.newLabel
            : feedTab === "top"
              ? !!item.topVoted
              : !!item.mine;

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

    if (feedTab === "top") {
      return result.sort((a, b) => (a.topOrder ?? 999) - (b.topOrder ?? 999));
    }

    return result;
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
          className="h-9 px-4 rounded-[10px] bg-[#009966] text-white text-[14px] font-medium flex items-center gap-2 hover:bg-[#00ad74] transition-colors self-start"
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
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
                    {list.ownerLabel && (
                      <span className="h-[19px] rounded-full px-2 bg-[rgba(43,127,255,0.9)] text-white text-[10px] font-bold">
                        TUYA
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
                        <MessageSquare size={13} /> {list.commentsCount}
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

      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(2,6,24,0.78)] backdrop-blur-[2px] px-4 py-8 overflow-y-auto"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="mx-auto w-full max-w-[780px] rounded-[14px] border border-[#1e2c46] bg-[#020b22] shadow-[0px_40px_80px_0px_rgba(0,0,0,0.55)] overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-8 pt-4 pb-5 bg-[linear-gradient(90deg,#12265f_0%,#23164f_50%,#24133f_100%)] border-b border-[#1e2c46]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[31px] leading-none font-bold text-white flex items-center gap-2">
                    <Star size={14} className="text-[#3cb5ff]" />
                    Crear Nueva Lista
                  </h2>
                  <p className="mt-2 text-[14px] text-[#90a1b9]">
                    Comparte tu coleccion curada con la comunidad
                  </p>
                </div>

                <button
                  type="button"
                  className="h-7 w-7 rounded-full text-[#6f7d94] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors flex items-center justify-center"
                  onClick={() => setIsCreateModalOpen(false)}
                  aria-label="Cerrar modal"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 flex items-center gap-2 text-[12px]">
                <div className="flex items-center gap-2 text-white">
                  <span className="h-5 w-5 rounded-full bg-[#2b7fff] flex items-center justify-center text-[11px] font-semibold">
                    1
                  </span>
                  <span>Info</span>
                </div>
                <div className="h-px flex-1 bg-[#40517b]" />
                <div className="flex items-center gap-2 text-[#5f6f8f]">
                  <span className="h-5 w-5 rounded-full bg-[#253353] flex items-center justify-center text-[11px] font-semibold">
                    2
                  </span>
                  <span>Juegos</span>
                </div>
                <div className="h-px flex-1 bg-[#2a3554]" />
                <div className="flex items-center gap-2 text-[#5f6f8f]">
                  <span className="h-5 w-5 rounded-full bg-[#253353] flex items-center justify-center text-[11px] font-semibold">
                    3
                  </span>
                  <span>Vista previa</span>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-[14px]">
                  <label
                    htmlFor="list-title"
                    className="text-[#cad5e2] font-medium"
                  >
                    Titulo de la lista <span className="text-[#ff5f6d]">*</span>
                  </label>
                  <span className="text-[#62748e] text-[12px]">
                    {titleChars}/80
                  </span>
                </div>
                <input
                  id="list-title"
                  value={createTitle}
                  onChange={(event) =>
                    setCreateTitle(event.target.value.slice(0, 80))
                  }
                  placeholder="Ej: Top RPGs de todos los tiempos"
                  className="w-full h-11 rounded-[10px] bg-[#0f1f3b] border border-[#2f405e] px-4 text-[14px] text-[#cad5e2] placeholder:text-[#62748e] focus:outline-none focus:border-[#2b7fff]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-[14px]">
                  <label
                    htmlFor="list-description"
                    className="text-[#cad5e2] font-medium"
                  >
                    Descripcion
                  </label>
                  <span className="text-[#62748e] text-[12px]">
                    {descriptionChars}/200
                  </span>
                </div>
                <textarea
                  id="list-description"
                  value={createDescription}
                  onChange={(event) =>
                    setCreateDescription(event.target.value.slice(0, 200))
                  }
                  placeholder="Cuentale a la comunidad de que va tu lista..."
                  className="w-full h-[96px] rounded-[12px] bg-[#0f1f3b] border border-[#2f405e] px-4 py-3 text-[14px] text-[#cad5e2] placeholder:text-[#62748e] focus:outline-none focus:border-[#2b7fff] resize-none"
                />
              </div>

              <div>
                <p className="mb-2 text-[14px] text-[#cad5e2] font-medium">
                  Categoria <span className="text-[#ff5f6d]">*</span>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {createCategoryOptions.map((option) => {
                    const active = createCategory === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setCreateCategory(option)}
                        className={`h-[50px] rounded-[10px] border text-[12px] transition-colors ${
                          active
                            ? "bg-[#1a3770] border-[#2b7fff] text-white"
                            : "bg-[#111f3a] border-[#2f405e] text-[#a7b6cd] hover:text-white"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[14px] text-[#cad5e2] font-medium">
                  Portada
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {createCoverOptions.map((cover) => {
                    const active = createCover === cover.image;
                    return (
                      <button
                        key={cover.id}
                        type="button"
                        onClick={() => setCreateCover(cover.image)}
                        className={`relative h-[88px] rounded-[10px] overflow-hidden border transition-colors ${
                          active
                            ? "border-[#2b7fff]"
                            : "border-[#2f405e] hover:border-[#4766a3]"
                        }`}
                        aria-label={`Seleccionar portada ${cover.title}`}
                      >
                        <img
                          src={cover.image}
                          alt={cover.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(1,8,22,0.85)] to-transparent" />
                        {active && (
                          <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#2b7fff] flex items-center justify-center text-white">
                            <Check size={12} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-8 py-3 border-t border-[#1e2c46] bg-[#010a1f] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="h-10 px-3 rounded-[10px] text-[#a3b3cb] text-[14px] flex items-center gap-2 hover:text-white transition-colors"
              >
                <ChevronLeft size={14} /> Cancelar
              </button>

              <button
                type="button"
                disabled={!canContinue}
                className={`h-10 px-5 rounded-[10px] text-[14px] font-medium flex items-center gap-2 transition-colors ${
                  canContinue
                    ? "bg-[#155dfc] text-white hover:bg-[#2b7fff]"
                    : "bg-[#1c2f5c] text-[#6c84b3] cursor-not-allowed"
                }`}
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
