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
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Game {
  appId: string;
  name: string;
  image: string;
  _id: string;
}

interface List {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  author: {
    _id: string;
    username: string;
    avatar: string;
  };
  games: Game[];
  likes: string[];
  createdAt: string;
}

export function ListDetail() {
  const { id } = useParams();
  const { user, login } = useAuth();
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await api.get(`/api/lists/${id}`);
        setList(response.data);
      } catch (err) {
        console.error("Error fetching list:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchList();
    }
  }, [id]);

  if (loading) {
    return <div className="text-white text-center py-20">Cargando...</div>;
  }

  if (error || !list) {
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
            src={list.coverImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"}
            alt={list.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172b] to-transparent" />

          <div className="absolute inset-x-10 bottom-10 flex flex-col gap-4">
            <div>
              <h1 className="text-white text-[36px] leading-[40px] font-bold">
                {list.title}
              </h1>
              <div className="mt-2 flex items-center gap-4 text-[16px]">
                <span className="inline-flex items-center gap-2 text-white">
                  <img
                    src={list.author?.avatar}
                    alt={list.author?.username}
                    className="w-8 h-8 rounded-full object-cover border border-[#45556c] bg-[#314158]"
                  />
                  {list.author?.username}
                </span>
                <span className="text-[#62748e]">•</span>
                <span className="text-[#cad5e2]">
                  {formatDistanceToNow(new Date(list.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="border-b border-[#1d293d] px-10 py-10">
          <p className="text-[#cad5e2] text-[18px] leading-[29px] whitespace-pre-wrap">
            {list.description}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[#90a1b9] text-[16px]"
            >
              <MessageSquare size={20} /> 0 Comentarios
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
            {list.games.map((game, index) => (
              <div
                key={game._id}
                className="rounded-[14px] border border-[#1d293d] bg-[#0f172b] p-4 flex items-center gap-4"
              >
                <div className="text-[#314158] text-[24px] leading-8 font-bold w-10 text-center shrink-0">
                  #{index + 1}
                </div>
                <div className="relative w-[192px] h-[118px] rounded-[10px] overflow-hidden bg-[#1d293d] shrink-0">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white text-[20px] leading-7 font-bold truncate">
                    {game.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
