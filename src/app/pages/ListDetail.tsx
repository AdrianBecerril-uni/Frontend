import {
  ArrowLeft,
  Lock,
  MessageSquare,
  Plus,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router";
import { getCommunityListById } from "../data/communityLists";
import { useAuth } from "../context/AuthContext";

function price(value: number) {
  return `$${value.toFixed(2)}`;
}

function metascoreClasses(tone: "green" | "blue" | "red") {
  if (tone === "green") {
    return "bg-[rgba(0,188,125,0.1)] border-[rgba(0,188,125,0.2)] text-[#00d492]";
  }

  if (tone === "red") {
    return "bg-[rgba(251,44,54,0.1)] border-[rgba(251,44,54,0.2)] text-[#ff6467]";
  }

  return "bg-[rgba(43,127,255,0.1)] border-[rgba(43,127,255,0.2)] text-[#51a2ff]";
}

export function ListDetail() {
  const { id } = useParams();
  const { user, login } = useAuth();
  const list = getCommunityListById(id);

  if (!list) {
    return <Navigate to="/lists" replace />;
  }

  return (
    <div className="pb-20">
      <Link
        to="/lists"
        className="inline-flex items-center gap-2 text-[#90a1b9] hover:text-white text-[16px]"
      >
        <ArrowLeft size={20} /> Volver a Listas
      </Link>

      <article className="mt-6 rounded-2xl border border-[#1d293d] bg-[#0f172b] overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <header className="relative h-[256px] bg-[#1d293d]">
          <img
            src={list.image}
            alt={list.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172b] to-transparent" />

          <div className="absolute inset-x-10 bottom-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-white text-[36px] leading-[40px] font-bold">
                {list.title}
              </h1>
              <div className="mt-2 flex items-center gap-4 text-[16px]">
                <span className="inline-flex items-center gap-2 text-white">
                  <img
                    src={list.authorAvatar}
                    alt={list.author}
                    className="w-8 h-8 rounded-full object-cover border border-[#45556c] bg-[#314158]"
                  />
                  {list.author}
                </span>
                <span className="text-[#62748e]">•</span>
                <span className="text-[#cad5e2]">{list.date}</span>
              </div>
            </div>

            <div className="h-[54px] rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(2,6,24,0.5)] px-3 flex items-center gap-3 w-fit">
              <div className="h-9 rounded-[10px] px-3 flex items-center gap-2 text-[#62748e] text-[16px] font-bold">
                <ThumbsUp size={18} /> {list.likes}
              </div>
              <div className="w-px h-6 bg-[#314158]" />
              <div className="h-9 rounded-[10px] px-3 flex items-center gap-2 text-[#62748e] text-[16px] font-bold">
                <ThumbsDown size={18} /> {list.dislikes}
              </div>
            </div>
          </div>
        </header>

        <section className="border-b border-[#1d293d] px-10 py-10">
          <p className="text-[#cad5e2] text-[18px] leading-[29px]">
            {list.description}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[#90a1b9] text-[16px]"
            >
              <MessageSquare size={20} /> {list.commentsCount} Comentarios
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 text-[#90a1b9] text-[16px]"
            >
              <Share2 size={20} /> Compartir
            </button>
          </div>
        </section>

        <section className="bg-[rgba(2,6,24,0.3)] px-6 md:px-10 py-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-8 h-8 rounded-[10px] bg-[#4f39f6] inline-flex items-center justify-center text-white text-[14px] font-bold">
              {list.games.length}
            </span>
            <h2 className="text-white text-[20px] leading-7 font-bold">
              Juegos en esta coleccion
            </h2>
          </div>

          <div className="space-y-4">
            {list.games.map((game) => (
              <div
                key={game.title}
                className="rounded-[14px] border border-[#1d293d] bg-[#0f172b] p-4"
              >
                <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                  <div className="text-[#314158] text-[24px] leading-8 font-bold w-10 text-center shrink-0">
                    #{game.rank}
                  </div>

                  <div className="relative w-full xl:w-[192px] h-[118px] rounded-[10px] overflow-hidden bg-[#1d293d] shrink-0">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className="absolute top-2 right-2 h-[22px] rounded-[4px] border border-[rgba(255,255,255,0.2)] bg-[rgba(0,0,0,0.7)] px-2 text-white text-[12px] leading-4 font-bold inline-flex items-center">
                      {game.year}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-white text-[20px] leading-7 font-bold truncate">
                          {game.title}
                        </h3>
                        <p className="text-[#90a1b9] text-[14px] leading-5">
                          {game.description}
                        </p>
                      </div>

                      <span
                        className={`h-[26px] rounded-[4px] border px-[9px] text-[12px] font-bold inline-flex items-center ${metascoreClasses(game.metascoreTone)}`}
                      >
                        {game.metascore} Metascore
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-white text-[18px] leading-7 font-bold">
                          {price(game.price)}
                        </span>
                        <span className="text-[#62748e] text-[12px] leading-4 line-through">
                          {price(game.oldPrice)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="h-[38px] rounded-[10px] border border-[#314158] bg-[#1d293d] px-4 inline-flex items-center gap-2 text-white text-[14px] leading-5 font-medium w-fit"
                      >
                        <Plus size={16} /> Anadir a mi lista
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-[#1d293d] px-6 md:px-10 py-10">
          <h2 className="text-white text-[20px] leading-7 font-bold">
            Comentarios ({list.comments.length})
          </h2>

          {!user && (
            <div className="mt-6 rounded-[14px] border border-[#1d293d] bg-[rgba(2,6,24,0.5)] p-6 text-center">
              <Lock size={32} className="text-[#62748e] mx-auto" />
              <p className="mt-3 text-[#90a1b9] text-[16px] leading-6">
                Debes iniciar sesion para comentar
              </p>
              <button
                type="button"
                onClick={login}
                className="mt-2 h-9 rounded-[10px] bg-[#4f39f6] px-4 text-white text-[14px] font-medium"
              >
                Iniciar Sesion
              </button>
            </div>
          )}

          <div className="mt-8 space-y-6">
            {list.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-4">
                <img
                  src={comment.avatar}
                  alt={comment.user}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1d293d]"
                />

                <div className="min-w-0 flex-1">
                  <div className="rounded-tl-[2px] rounded-tr-[14px] rounded-br-[14px] rounded-bl-[14px] bg-[rgba(29,41,61,0.5)] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white text-[16px] leading-6 font-bold">
                        {comment.user}
                      </span>
                      <span className="text-[#62748e] text-[12px] leading-4">
                        {comment.timeAgo}
                      </span>
                    </div>
                    <p className="mt-1 text-[#cad5e2] text-[14px] leading-5">
                      {comment.text}
                    </p>
                  </div>

                  <div className="mt-1 ml-2 flex items-center gap-4 text-[#62748e] text-[12px] leading-4">
                    <button type="button">Responder</button>
                    <button type="button">Me gusta</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
