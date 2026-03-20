import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router";
import {
  Shield, AlertTriangle, Users, Flag, Eye, EyeOff,
  Trash2, UserX, MessageSquareOff, Ban, FileText,
  CheckCircle2, Search, Home, AlertOctagon, AlertCircle
} from "lucide-react";

// Mock data
const MOCK_REPORTS = [
  { id: 1, type: "list", title: "Los peores juegos de 2024", author: "TrollUser123", reason: "Contenido ofensivo", status: "pending", date: "Hace 2h" },
  { id: 2, type: "comment", title: "Comentario en 'Mejores RPGs'", author: "HaterGamer", reason: "Spam", status: "pending", date: "Hace 5h" },
  { id: 3, type: "user", title: "Usuario abusivo", author: "BadActor99", reason: "Múltiples infracciones", status: "resolved", date: "Hace 1d" },
  { id: 4, type: "list", title: "Lista inapropiada", author: "SpamBot", reason: "Publicidad", status: "pending", date: "Hace 3h" },
];

const MOCK_USERS = [
  { id: 1, name: "DemoGamer_99", status: "active", reports: 0, lastActive: "Hace 5min", joined: "2024-01-15" },
  { id: 2, name: "TrollUser123", status: "warned", reports: 3, lastActive: "Hace 2h", joined: "2024-02-20" },
  { id: 3, name: "HaterGamer", status: "silenced", reports: 5, lastActive: "Hace 1d", joined: "2024-03-10" },
  { id: 4, name: "BadActor99", status: "banned", reports: 12, lastActive: "Hace 7d", joined: "2024-01-05" },
  { id: 5, name: "NormalPlayer", status: "active", reports: 0, lastActive: "Hace 1h", joined: "2024-02-01" },
];

type TabType = "moderation" | "users";

export function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("moderation");
  const [searchTerm, setSearchTerm] = useState("");

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: "moderation" as TabType, name: "Moderación", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: "users" as TabType, name: "Usuarios", icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <Shield size={24} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
              <p className="text-sm text-slate-500">Gestión y monitoreo de SteaMates</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700">
            <Home size={16} />
            <span className="text-sm">Volver al inicio</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                  activeTab === tab.id
                    ? `${tab.bg} border-${tab.color.replace('text-', '')}/30 ${tab.color}`
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === "moderation" && <ModerationPanel searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
      {activeTab === "users" && <UsersPanel searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
    </div>
  );
}

// ========== RF-16: Moderación Panel ==========
function ModerationPanel({ searchTerm, setSearchTerm }: { searchTerm: string; setSearchTerm: (val: string) => void }) {
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "list" | "comment" | "user">("all");

  const filteredReports = MOCK_REPORTS.filter(r => 
    (filter === "all" || r.status === filter) &&
    (typeFilter === "all" || r.type === typeFilter) &&
    (r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Reportes Pendientes", value: "4", icon: Flag, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Resueltos Hoy", value: "12", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Contenido Eliminado", value: "3", icon: Trash2, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Usuarios Advertidos", value: "7", icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-500/10" },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-slate-800 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl">
        {/* Search and Filters in one row */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar reportes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 whitespace-nowrap">Estado:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="resolved">Resueltos</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 whitespace-nowrap">Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="list">Listas</option>
              <option value="comment">Comentarios</option>
              <option value="user">Usuarios</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-3 text-sm text-slate-500">
          Mostrando <span className="text-white font-medium">{filteredReports.length}</span> reporte{filteredReports.length !== 1 ? 's' : ''}
        </div>

        {/* Reports List */}
        <div className="space-y-2">
          {filteredReports.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-slate-500">No se encontraron reportes con los filtros aplicados</p>
            </div>
          ) : (
            filteredReports.map(report => (
              <div key={report.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        report.type === "list" ? "bg-blue-500/10 text-blue-400" :
                        report.type === "comment" ? "bg-purple-500/10 text-purple-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>
                        {report.type === "list" ? "Lista" : report.type === "comment" ? "Comentario" : "Usuario"}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        report.status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {report.status === "pending" ? "Pendiente" : "Resuelto"}
                      </span>
                      <span className="text-xs text-slate-600">{report.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{report.title}</h4>
                    <p className="text-xs text-slate-400">Por <span className="text-slate-300 font-medium">{report.author}</span> • Motivo: {report.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Ver detalles">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg transition-colors" title="Ocultar">
                      <EyeOff size={16} />
                    </button>
                    <button className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ========== RF-17: Gestión de Usuarios ==========
function UsersPanel({ searchTerm, setSearchTerm }: { searchTerm: string; setSearchTerm: (val: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "warned" | "silenced" | "banned">("all");

  const filteredUsers = MOCK_USERS.filter(u =>
    (statusFilter === "all" || u.status === statusFilter) &&
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Usuarios Activos", value: "1,247", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Advertidos", value: "18", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Silenciados", value: "5", icon: MessageSquareOff, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Baneados", value: "12", icon: Ban, color: "text-red-400", bg: "bg-red-500/10" },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-slate-800 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Users Management */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 whitespace-nowrap">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="warned">Advertidos</option>
              <option value="silenced">Silenciados</option>
              <option value="banned">Baneados</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-2">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white">{user.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      user.status === "active" ? "bg-emerald-500/10 text-emerald-400" :
                      user.status === "warned" ? "bg-amber-500/10 text-amber-400" :
                      user.status === "silenced" ? "bg-orange-500/10 text-orange-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>
                      {user.status}
                    </span>
                    {user.reports > 0 && (
                      <span className="text-xs px-2 py-1 rounded font-medium bg-red-500/10 text-red-400">
                        {user.reports} reportes
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Última actividad: {user.lastActive} • Miembro desde {user.joined}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Ver historial">
                    <FileText size={16} />
                  </button>
                  <button className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 rounded-lg transition-colors" title="Advertir">
                    <AlertOctagon size={16} />
                  </button>
                  <button className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg transition-colors" title="Silenciar">
                    <MessageSquareOff size={16} />
                  </button>
                  <button className="p-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg transition-colors" title="Suspender">
                    <UserX size={16} />
                  </button>
                  <button className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors" title="Banear">
                    <Ban size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}