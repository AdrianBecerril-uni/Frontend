import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router";
import api from "../../lib/api";
import {
  Gamepad2, Clock, Trophy, TrendingUp, ChevronRight, BarChart3,
  Star, ExternalLink, Activity
} from "lucide-react";
import { GenreBreakdown } from "../components/charts/GenreBreakdown";
import { GamingHeatmap } from "../components/charts/GamingHeatmap";

interface Game {
  appId: number;
  name: string;
  playtime: number;
  lastPlayed?: number;
  icon: string;
}

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "charts" | "library">("overview");

  // Chart data
  const [genreData, setGenreData] = useState<any>(null);
  const [genreLoading, setGenreLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [profileRes, gamesRes, recentRes] = await Promise.all([
          api.get(`/api/steam/profile/${user.steamid}`),
          api.get(`/api/steam/games/${user.steamid}`),
          api.get(`/api/steam/recent/${user.steamid}`),
        ]);

        setProfile(profileRes.data);
        setGames(gamesRes.data?.games || []);
        setRecentGames(recentRes.data?.games || []);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Fetch chart data when the charts tab is active
  useEffect(() => {
    if (!user || activeTab !== "charts" || genreData) return;

    const fetchStats = async () => {
      setGenreLoading(true);
      try {
        const genreRes = await api.get(`/api/steam/stats/genres/${user.steamid}`);
        setGenreData(genreRes.data);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setGenreLoading(false);
      }
    };

    fetchStats();
  }, [user, activeTab, genreData]);

  if (!user) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando perfil de Steam...</p>
        </div>
      </div>
    );
  }

  const totalHours = Math.round(games.reduce((acc, g) => acc + (g.playtime || 0), 0) / 60);
  const gamesPlayed = games.filter(g => g.playtime > 0).length;
  const topGames = [...games].sort((a, b) => (b.playtime || 0) - (a.playtime || 0)).slice(0, 5);

  const tabs = [
    { id: "overview" as const, label: "Resumen", icon: Activity },
    { id: "charts" as const, label: "Gráficas", icon: BarChart3 },
    { id: "library" as const, label: "Biblioteca", icon: Gamepad2 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Profile Header */}
      <div className="relative bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-cyan-900/20" />
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <img
            src={profile?.avatar || user.avatarfull}
            alt={profile?.username || user.personaname}
            className="w-24 h-24 rounded-2xl ring-4 ring-blue-500/30 shadow-2xl"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-white">{profile?.username || user.personaname}</h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-2">
              <span className="text-sm text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online
              </span>
            </div>
          </div>
          <a
            href={profile?.profileUrl || user.profileurl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-sm transition-colors border border-slate-700"
          >
            <ExternalLink size={16} /> Ver en Steam
          </a>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-800">
          {[
            { label: "Juegos", value: games.length.toLocaleString(), icon: Gamepad2, color: "text-blue-400" },
            { label: "Jugados", value: gamesPlayed.toLocaleString(), icon: Star, color: "text-emerald-400" },
            { label: "Horas Total", value: totalHours.toLocaleString(), icon: Clock, color: "text-purple-400" },
            { label: "Recientes", value: recentGames.length.toString(), icon: TrendingUp, color: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 text-center border-r last:border-r-0 border-slate-800">
              <div className={`flex items-center justify-center gap-1.5 ${stat.color} mb-1`}>
                <stat.icon size={14} />
                <span className="text-lg font-bold">{stat.value}</span>
              </div>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-1.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top Games */}
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-amber-400" /> Top Juegos por Horas
            </h2>
            {topGames.length > 0 ? (
              <div className="space-y-3">
                {topGames.map((game, i) => {
                  const hours = Math.round(game.playtime / 60);
                  const maxHours = Math.round((topGames[0]?.playtime || 1) / 60);
                  const widthPercent = Math.max(10, (hours / maxHours) * 100);
                  return (
                    <div key={game.appId} className="group relative">
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                        <span className="text-sm font-bold text-slate-600 w-5">#{i + 1}</span>
                        <img
                          src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/header.jpg`}
                          alt={game.name}
                          className="w-16 h-10 rounded-lg object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = game.icon; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{game.name}</p>
                          <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-blue-400 whitespace-nowrap">{hours}h</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No se encontraron juegos</p>
            )}
          </div>

          {/* Recent Games */}
          {recentGames.length > 0 && (
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-purple-400" /> Jugado Recientemente
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentGames.slice(0, 6).map(game => (
                  <Link
                    key={game.appId}
                    to={`/game/${game.appId}`}
                    className="group flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-blue-500/30 transition-all"
                  >
                    <img
                      src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/header.jpg`}
                      alt={game.name}
                      className="w-16 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">{game.name}</p>
                      <p className="text-xs text-slate-500">
                        {game.playtime2Weeks ? `${Math.round(game.playtime2Weeks / 60)}h en 2 sem` : `${Math.round(game.playtimeForever / 60)}h total`}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-600" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts Tab */}
      {activeTab === "charts" && (
        <div className="space-y-6">
          {genreLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Calculando estadísticas... esto puede tardar unos segundos</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GenreBreakdown data={genreData?.genres} />
              <GamingHeatmap />
            </div>
          )}
        </div>
      )}

      {/* Library Tab */}
      {activeTab === "library" && (
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Gamepad2 size={20} className="text-blue-400" /> Tu Biblioteca ({games.length} juegos)
          </h2>
          {games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {games.slice(0, 20).map(game => (
                <Link
                  key={game.appId}
                  to={`/game/${game.appId}`}
                  className="group bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/header.jpg`}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">{game.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {game.playtime > 0 ? `${Math.round(game.playtime / 60)}h jugadas` : 'Sin jugar'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No se encontraron juegos en tu biblioteca</p>
          )}
        </div>
      )}
    </div>
  );
}
