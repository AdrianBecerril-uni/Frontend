import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import axios from "axios";
import {
  TrendingUp, Users, Zap, Gamepad2, Clock, ArrowRight,
  Flame, Trophy, Star, ChevronRight, Sparkles
} from "lucide-react";

interface TrendingDeal {
  dealID: string;
  title: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  thumb: string;
  steamAppID: string;
}

interface FriendActivity {
  username: string;
  avatar: string;
  currentGame: string | null;
  status: number;
}

export function Home() {
  const { user } = useAuth();
  const [trending, setTrending] = useState<TrendingDeal[]>([]);
  const [friends, setFriends] = useState<FriendActivity[]>([]);
  const [stats, setStats] = useState({ totalHours: 0, totalGames: 0, totalFriends: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get("https://www.cheapshark.com/api/1.0/deals", {
          params: { storeID: "1", pageSize: 4, sortBy: "Deal Rating" },
        });
        setTrending(res.data || []);
      } catch (e) {
        console.error("Error fetching trending:", e);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchUserData = async () => {
      try {
        const [gamesRes, friendsRes] = await Promise.all([
          api.get(`/api/steam/games/${user.steamid}`).catch(() => ({ data: { games: [], totalCount: 0 } })),
          api.get(`/api/steam/friends/${user.steamid}`).catch(() => ({ data: { friends: [] } })),
        ]);

        const games = gamesRes.data?.games || [];
        const totalHours = Math.round(games.reduce((acc: number, g: any) => acc + (g.playtime || 0), 0) / 60);
        const friendList = friendsRes.data?.friends || [];

        setStats({
          totalHours,
          totalGames: gamesRes.data?.totalCount || games.length,
          totalFriends: friendList.length,
        });

        // Get top 3 friends that are online or playing
        const onlineFriends = friendList
          .filter((f: any) => f.status > 0)
          .slice(0, 3);
        setFriends(onlineFriends);
      } catch (e) {
        console.error("Error fetching user data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <div className="h-full flex flex-col space-y-4 px-4 md:px-8">

      {/* ========== HERO ========== */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1585620385456-4759f9b5c7d9?auto=format&fit=crop&q=80&w=2000"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-purple-500/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 px-8 py-10">
          <div className="max-w-full">
            {user ? (
              <p className="text-sm text-blue-400 font-medium mb-2.5 flex items-center gap-1.5 justify-center">
                <Sparkles size={14} />
                Hola de nuevo, {user.personaname}
              </p>
            ) : (
              <p className="text-sm text-slate-500 font-medium mb-2.5 uppercase tracking-wider text-center">
                Tu espacio gaming
              </p>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3.5 leading-tight text-center">
              Todo tu universo{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Steam
              </span>{" "}
              en un lugar
            </h1>

            <p className="text-slate-400 text-base md:text-lg leading-relaxed text-center mx-auto max-w-3xl">
              Ofertas, amigos, estadísticas y listas comunitarias.
              Organiza tu vida gaming sin complicaciones.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {user ? (
                <>
                  <Link
                    to="/friends"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm flex items-center gap-2"
                  >
                    <Users size={16} /> Centro Social
                  </Link>
                  <Link
                    to="/market"
                    className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm border border-slate-700 flex items-center gap-2"
                  >
                    <Zap size={16} /> Ver Ofertas
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm flex items-center gap-2"
                  >
                    <Gamepad2 size={16} /> Comenzar
                  </Link>
                  <Link
                    to="/market"
                    className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm border border-slate-700 flex items-center gap-2"
                  >
                    Ver Ofertas
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quick stats for logged users */}
          {user && !loading && (
            <div className="mt-6 flex flex-wrap gap-6 justify-center pt-5 border-t border-slate-800/60">
              {[
                { icon: Clock, label: "Horas jugadas", value: stats.totalHours.toLocaleString(), color: "text-blue-400" },
                { icon: Gamepad2, label: "Juegos", value: stats.totalGames.toLocaleString(), color: "text-emerald-400" },
                { icon: Users, label: "Amigos", value: stats.totalFriends.toLocaleString(), color: "text-purple-400" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <s.icon size={16} className={s.color} />
                  <div>
                    <p className="text-white font-bold text-sm">{s.value}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== MIDDLE: Trending + Activity (2 columns) ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Trending deals */}
        <div className="lg:col-span-3 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame size={17} className="text-orange-400" /> En tendencia
            </h2>
            <Link
              to="/market"
              className="text-[11px] text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              Ver más <ArrowRight size={12} />
            </Link>
          </div>

          {trending.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trending.map(deal => {
                const discount = Math.round(parseFloat(deal.savings));
                return (
                  <a
                    key={deal.dealID}
                    href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-22 h-13 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                      <img
                        src={deal.thumb}
                        alt={deal.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-xs font-medium text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                        {deal.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {discount > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            -{discount}%
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">${deal.salePrice}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <p className="text-sm text-slate-500">Cargando ofertas...</p>
            </div>
          )}
        </div>

        {/* Right column: friend activity */}
        <div className="lg:col-span-2 space-y-4">

          {/* Friend activity - Only show if logged in */}
          {user && (
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users size={17} className="text-purple-400" /> Amigos
                </h2>
                <Link
                  to="/friends"
                  className="text-[11px] text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  Ir al grupo <ArrowRight size={12} />
                </Link>
              </div>

              {friends.length > 0 ? (
                <div className="space-y-1">
                  {friends.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-800/40 rounded-xl transition-colors">
                      <div className="relative flex-shrink-0">
                        <img src={f.avatar} alt={f.username} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-300">
                          <span className="font-bold text-white">{f.username}</span>{" "}
                          {f.currentGame ? (
                            <>
                              <span className="text-slate-500">jugando</span>{" "}
                              <span className="text-blue-400 font-medium">{f.currentGame}</span>
                            </>
                          ) : (
                            <span className="text-green-400">Online</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  {loading ? "Cargando amigos..." : "Ningún amigo online ahora"}
                </p>
              )}
            </div>
          )}

          {/* Feature cards */}
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Star size={17} className="text-amber-400" /> Características
            </h2>
            <div className="space-y-2">
              {[
                { icon: Zap, title: "Ofertas en tiempo real", link: "/market", color: "text-blue-400" },
                { icon: TrendingUp, title: "Analítica personal", link: "/profile", color: "text-emerald-400" },
                { icon: Users, title: "Centro social", link: "/friends", color: "text-purple-400" },
              ].map((feat) => (
                <Link
                  key={feat.title}
                  to={feat.link}
                  className="flex items-center gap-3 px-2.5 py-2 hover:bg-slate-800/40 rounded-xl transition-colors group"
                >
                  <feat.icon size={16} className={feat.color} />
                  <span className="text-xs font-medium text-slate-300 group-hover:text-blue-400 transition-colors flex-1">{feat.title}</span>
                  <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========== FEATURE CARDS (compact) ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {[
          {
            icon: Zap,
            title: "Ofertas en Tiempo Real",
            desc: "Mínimos históricos y alertas de precio.",
            color: "text-blue-400",
            borderHover: "hover:border-blue-500/30",
            bg: "bg-blue-500/5",
            link: "/market",
          },
          {
            icon: Users,
            title: "Comunidad y Amigos",
            desc: "Listas colaborativas, sesiones y comparativas.",
            color: "text-purple-400",
            borderHover: "hover:border-purple-500/30",
            bg: "bg-purple-500/5",
            link: "/friends",
          },
          {
            icon: TrendingUp,
            title: "Analítica Personal",
            desc: "Estadísticas, rentabilidad y tendencias.",
            color: "text-emerald-400",
            borderHover: "hover:border-emerald-500/30",
            bg: "bg-emerald-500/5",
            link: "/profile",
          },
        ].map(feat => (
          <Link
            key={feat.title}
            to={feat.link}
            className={`${feat.bg} border border-slate-800 ${feat.borderHover} p-4 rounded-xl transition-all group hover:shadow-lg`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className={`p-1.5 rounded-lg bg-slate-800/50 ${feat.color} group-hover:scale-110 transition-transform`}>
                <feat.icon size={17} />
              </div>
              <h3 className="text-sm font-bold text-white">{feat.title}</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}