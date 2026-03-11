import { useEffect, useState } from "react";
import {
  Users,
  Gamepad2,
  Loader2,
  BarChart2,
  CalendarDays,
  Check,
} from "lucide-react";
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

type Tab = "amigos" | "analitica" | "sesiones";

export function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("amigos");

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

  const getStatusText = (friend: Friend) => {
    if (friend.currentGame) return `playing ${friend.currentGame}`;
    switch (friend.status) {
      case 1:
        return "Online";
      case 2:
        return "Ocupado";
      case 3:
        return "Ausente";
      case 4:
        return "Durmiendo";
      default:
        return "Offline";
    }
  };

  const isOnline = (friend: Friend) =>
    friend.status > 0 || !!friend.currentGame;
  const isPlayingGame = (friend: Friend) => !!friend.currentGame;

  const getStatusDot = (friend: Friend) => {
    if (isPlayingGame(friend))
      return "bg-[#00c950] shadow-[0px_0px_8px_0px_rgba(34,197,94,0.6)]";
    if (isOnline(friend))
      return "bg-[#00c950] shadow-[0px_0px_8px_0px_rgba(34,197,94,0.6)]";
    return "bg-[#62748e]";
  };

  const getStatusTextColor = (friend: Friend) => {
    if (isPlayingGame(friend)) return "text-[#05df72]";
    if (isOnline(friend)) return "text-[#62748e]";
    return "text-[#62748e]";
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "amigos", label: "Amigos", icon: <Users size={18} /> },
    { id: "analitica", label: "Analítica", icon: <BarChart2 size={18} /> },
    { id: "sesiones", label: "Sesiones", icon: <Gamepad2 size={18} /> },
  ];

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Centro Social
          </h1>
          <p className="text-[#90a1b9] text-lg mt-2">
            Gestiona tus amigos, compara estadísticas y organiza partidas.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-[7px] gap-1 bg-[#0f172b] border border-[#1d293d] rounded-[14px] shadow-sm self-start sm:self-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-[10px] text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#155dfc] text-white shadow-[0px_10px_15px_0px_rgba(28,57,142,0.2),0px_4px_6px_0px_rgba(28,57,142,0.2)]"
                  : "text-[#90a1b9] hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-6 items-start">
        {/* Left panel: friend selector */}
        <div className="w-[261px] shrink-0 bg-[rgba(15,23,43,0.8)] border border-[#1d293d] rounded-[24px] p-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Check size={18} className="text-[#51a2ff]" />
              <h3 className="text-white font-bold text-[18px]">
                Selecciona Amigos
              </h3>
            </div>
            <p className="text-[#62748e] text-[12px] leading-relaxed">
              Selecciona amigos de la lista para incluirlos en las comparativas
              y sesiones.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" size={24} />
            </div>
          ) : friends.length === 0 ? (
            <div className="py-8 text-center">
              <Users size={32} className="text-[#314158] mx-auto mb-2" />
              <p className="text-[#62748e] text-xs">Lista vacía o privada</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[480px] pr-1">
              {friends.map((friend) => (
                <button
                  key={friend.steamId}
                  onClick={() => toggleSelect(friend.steamId)}
                  className={`flex items-center gap-3 p-3 rounded-[14px] border text-left transition-all w-full ${
                    selectedIds.has(friend.steamId)
                      ? "bg-[rgba(21,93,252,0.1)] border-[rgba(21,93,252,0.4)]"
                      : "bg-[rgba(29,41,61,0.3)] border-[rgba(49,65,88,0.3)] hover:border-[#314158]"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={friend.avatar}
                      alt={friend.username}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1d293d]"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f172b] ${getStatusDot(friend)}`}
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#cad5e2] text-[14px] font-medium truncate">
                      {friend.username}
                    </p>
                    <p
                      className={`text-[11px] truncate ${getStatusTextColor(friend)}`}
                    >
                      {getStatusText(friend)}
                    </p>
                  </div>
                  {/* Check indicator */}
                  {selectedIds.has(friend.steamId) && (
                    <div className="shrink-0 w-4 h-4 rounded-full bg-[#155dfc] flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Footer count */}
          <div className="border-t border-[#1d293d] pt-3 text-center">
            <p className="text-[#62748e] text-[12px] font-medium">
              {selectedIds.size} amigo{selectedIds.size !== 1 ? "s" : ""}{" "}
              seleccionado{selectedIds.size !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Right panel: main content area */}
        <div className="flex-1 min-w-0">
          {activeTab === "amigos" && selectedIds.size === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {/* Icon circle */}
              <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-[rgba(15,23,43,0.4)] border border-[#1d293d] flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[rgba(43,127,255,0.1)] blur-[40px]" />
                  <Users size={64} className="text-[#51a2ff] relative z-10" />
                </div>
              </div>

              <h2 className="text-[30px] font-bold text-white mb-4">
                Gestiona tu red de amigos
              </h2>
              <p className="text-[#90a1b9] text-lg max-w-[476px] leading-relaxed mb-12">
                Utiliza las pestañas superiores para analizar estadísticas
                comparativas o encontrar juegos en común para tu próxima sesión.
              </p>

              {/* Action cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-[672px]">
                <button
                  onClick={() => setActiveTab("analitica")}
                  className="bg-[#0f172b] border border-[#1d293d] rounded-[16px] p-8 flex flex-col items-center gap-3 hover:border-[rgba(21,93,252,0.4)] hover:bg-[rgba(21,93,252,0.05)] transition-all group"
                >
                  <div className="w-14 h-14 rounded-[16px] bg-[rgba(28,57,142,0.3)] flex items-center justify-center group-hover:bg-[rgba(28,57,142,0.5)] transition-colors">
                    <BarChart2 size={28} className="text-[#51a2ff]" />
                  </div>
                  <h3 className="text-white font-bold text-[20px]">
                    Comparar Stats
                  </h3>
                  <p className="text-[#62748e] text-[14px] text-center leading-5">
                    Analiza logros, tiempos de juego y bibliotecas
                  </p>
                </button>
                <button
                  onClick={() => setActiveTab("sesiones")}
                  className="bg-[#0f172b] border border-[#1d293d] rounded-[16px] p-8 flex flex-col items-center gap-3 hover:border-[rgba(89,22,139,0.4)] hover:bg-[rgba(89,22,139,0.05)] transition-all group"
                >
                  <div className="w-14 h-14 rounded-[16px] bg-[rgba(89,22,139,0.3)] flex items-center justify-center group-hover:bg-[rgba(89,22,139,0.5)] transition-colors">
                    <CalendarDays size={28} className="text-[#c27aff]" />
                  </div>
                  <h3 className="text-white font-bold text-[20px]">
                    Planificar Sesión
                  </h3>
                  <p className="text-[#62748e] text-[14px] text-center leading-5">
                    Encuentra juegos en común para jugar ahora
                  </p>
                </button>
              </div>
            </div>
          )}

          {activeTab === "amigos" && selectedIds.size > 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(21,93,252,0.15)] border border-[rgba(21,93,252,0.3)] flex items-center justify-center mb-4">
                <Users size={32} className="text-[#51a2ff]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedIds.size} amigo{selectedIds.size !== 1 ? "s" : ""}{" "}
                seleccionado{selectedIds.size !== 1 ? "s" : ""}
              </h2>
              <p className="text-[#90a1b9] mb-6">
                Elige una acción para continuar
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab("analitica")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#155dfc] text-white rounded-[12px] text-sm font-semibold hover:bg-[#1a6aff] transition-colors"
                >
                  <BarChart2 size={16} /> Comparar Stats
                </button>
                <button
                  onClick={() => setActiveTab("sesiones")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[rgba(89,22,139,0.3)] border border-[rgba(89,22,139,0.4)] text-[#c27aff] rounded-[12px] text-sm font-semibold hover:bg-[rgba(89,22,139,0.5)] transition-colors"
                >
                  <CalendarDays size={16} /> Planificar Sesión
                </button>
              </div>
            </div>
          )}

          {activeTab === "analitica" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(28,57,142,0.3)] flex items-center justify-center mb-4">
                <BarChart2 size={32} className="text-[#51a2ff]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Analítica comparativa
              </h2>
              <p className="text-[#90a1b9] max-w-md">
                Selecciona amigos del panel izquierdo y compara logros, tiempos
                de juego y bibliotecas.
              </p>
            </div>
          )}

          {activeTab === "sesiones" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(89,22,139,0.3)] flex items-center justify-center mb-4">
                <CalendarDays size={32} className="text-[#c27aff]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Planificar Sesión
              </h2>
              <p className="text-[#90a1b9] max-w-md">
                Selecciona amigos del panel izquierdo para encontrar juegos en
                común y organizar una sesión.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
