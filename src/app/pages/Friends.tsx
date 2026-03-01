import { useEffect, useState } from "react";
import { Users, Gamepad2, Loader2, Search, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";
import api from "../../lib/api";

interface Friend {
  steamId: string;
  username: string;
  avatar: string;
  status: number;
  currentGame: string | null;
  friendSince?: number;
}

export function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadFriends = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/steam/friends/${user.steamid}`);
        setFriends(res.data?.friends || []);
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFriends();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter(f => f.status > 0);
  const offlineFriends = filteredFriends.filter(f => f.status === 0);

  const getStatusText = (friend: Friend) => {
    if (friend.currentGame) return `Jugando ${friend.currentGame}`;
    switch (friend.status) {
      case 1: return "Online";
      case 2: return "Ocupado";
      case 3: return "Ausente";
      case 4: return "Durmiendo";
      case 5: return "Buscando intercambio";
      case 6: return "Buscando juego";
      default: return "Offline";
    }
  };

  const getStatusColor = (friend: Friend) => {
    if (friend.currentGame) return "text-green-400";
    if (friend.status > 0) return "text-blue-400";
    return "text-slate-500";
  };

  const getStatusDotColor = (friend: Friend) => {
    if (friend.currentGame) return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    if (friend.status > 0) return "bg-blue-500";
    return "bg-slate-500";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-3">Centro Social</h1>
        <p className="text-slate-400 text-lg">Tu lista de amigos de Steam</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total amigos", value: friends.length, color: "text-blue-400" },
          { label: "Online", value: onlineFriends.length, color: "text-green-400" },
          { label: "Offline", value: offlineFriends.length, color: "text-slate-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar amigos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={32} />
            <p className="text-slate-400 text-sm">Cargando amigos...</p>
          </div>
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center py-20">
          <Users size={48} className="text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Sin amigos</h3>
          <p className="text-slate-500 text-sm">Tu lista de amigos de Steam está vacía o es privada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Online Friends */}
          {onlineFriends.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Online — {onlineFriends.length}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {onlineFriends.map(friend => (
                  <div
                    key={friend.steamId}
                    className="flex items-center gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-blue-500/30 transition-all group"
                  >
                    <div className="relative shrink-0">
                      <img src={friend.avatar} alt={friend.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800" />
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${getStatusDotColor(friend)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate text-sm">{friend.username}</h4>
                      <p className={`text-xs ${getStatusColor(friend)} truncate mt-0.5`}>
                        {friend.currentGame && <Gamepad2 size={10} className="inline mr-1" />}
                        {getStatusText(friend)}
                      </p>
                    </div>
                    <a
                      href={`https://steamcommunity.com/profiles/${friend.steamId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Friends */}
          {offlineFriends.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-500 mb-3">
                Offline — {offlineFriends.length}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {offlineFriends.map(friend => (
                  <div
                    key={friend.steamId}
                    className="flex items-center gap-3 p-4 bg-slate-900/60 border border-slate-800/50 rounded-xl hover:border-slate-700 transition-all group opacity-70 hover:opacity-100"
                  >
                    <div className="relative shrink-0">
                      <img src={friend.avatar} alt={friend.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800 grayscale-[30%]" />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 bg-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-300 truncate text-sm">{friend.username}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Offline</p>
                    </div>
                    <a
                      href={`https://steamcommunity.com/profiles/${friend.steamId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}