import { useEffect, useState } from "react";
import {
  Users,
  Gamepad2,
  Loader2,
  BarChart2,
  CalendarDays,
  Check,
  Wallet,
  Clock,
  Trophy,
  Hexagon,
  TrendingDown,
  Crown,
  ShoppingBag,
  DollarSign,
  Star,
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

// ── Analytics helpers ──────────────────────────────────────────────────────────

const PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#06b6d4",
];

const MOCK_ECON = [
  {
    costPerHour: 0.12,
    unplayedPct: 42,
    libraryValue: 3200,
    totalGames: 150,
    unplayed: 63,
  },
  {
    costPerHour: 0.05,
    unplayedPct: 55,
    libraryValue: 2400,
    totalGames: 120,
    unplayed: 66,
  },
  {
    costPerHour: 0.5,
    unplayedPct: 62,
    libraryValue: 4800,
    totalGames: 210,
    unplayed: 130,
  },
  {
    costPerHour: 0.23,
    unplayedPct: 35,
    libraryValue: 900,
    totalGames: 45,
    unplayed: 16,
  },
  {
    costPerHour: 0.28,
    unplayedPct: 70,
    libraryValue: 6200,
    totalGames: 300,
    unplayed: 210,
  },
  {
    costPerHour: 0.35,
    unplayedPct: 48,
    libraryValue: 1800,
    totalGames: 80,
    unplayed: 38,
  },
];

const MOCK_TIME = [
  { totalHours: 3000, topGame: "Skyrim", topGameHours: 600 }, // Yo
  { totalHours: 4500, topGame: "Dota 2", topGameHours: 3200 }, // Friend1
  { totalHours: 3200, topGame: "The Witcher 3", topGameHours: 480 }, // Friend2
  { totalHours: 1200, topGame: "Counter-Strike 2", topGameHours: 800 }, // Friend3
  { totalHours: 9000, topGame: "Stardew Valley", topGameHours: 2400 }, // Friend4
  { totalHours: 2100, topGame: "Street Fighter 6", topGameHours: 900 }, // Friend5
];

function DonutChart({
  pct,
  color,
  size = 100,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1e293b"
        strokeWidth="10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

type AnalyticsSubTab = "economia" | "tiempo" | "logros" | "radar";

function AnalyticsPanel({
  selectedFriends,
  userName,
}: {
  selectedFriends: Friend[];
  userName: string;
}) {
  const [subTab, setSubTab] = useState<AnalyticsSubTab>("economia");

  const MOCK_NAMES = [
    "AlexGamer",
    "SarahPro",
    "MikeTheTank",
    "LunaStar",
    "RyuStreet",
  ];
  const friendsToShow =
    selectedFriends.length > 0
      ? selectedFriends.slice(0, 5)
      : MOCK_NAMES.map((name) => ({ username: name }));

  const people = [
    { name: userName || "Yo", ...MOCK_ECON[0], color: PALETTE[0] },
    ...friendsToShow.map((f: any, i: number) => ({
      name: f.username,
      ...(MOCK_ECON[i + 1] ?? MOCK_ECON[MOCK_ECON.length - 1]),
      color: PALETTE[i + 1] ?? PALETTE[PALETTE.length - 1],
    })),
  ];

  const rentSorted = [...people].sort((a, b) => a.costPerHour - b.costPerHour);
  const maxCost = 0.6;
  const bestRent = rentSorted[0].name;

  const libSorted = [...people].sort((a, b) => b.libraryValue - a.libraryValue);
  const totalValue = people.reduce((s, p) => s + p.libraryValue, 0);
  const bestLib = libSorted[0].name;

  // Tiempo data
  const peopleWithTime = people.map((p, i) => ({
    ...p,
    totalHours: (MOCK_TIME[i] ?? MOCK_TIME[MOCK_TIME.length - 1]).totalHours,
    topGame: (MOCK_TIME[i] ?? MOCK_TIME[MOCK_TIME.length - 1]).topGame,
    topGameHours: (MOCK_TIME[i] ?? MOCK_TIME[MOCK_TIME.length - 1])
      .topGameHours,
  }));
  const hoursSorted = [...peopleWithTime].sort(
    (a, b) => b.totalHours - a.totalHours,
  );
  const maxHours = 10000;
  const bestTime = hoursSorted[0].name;
  const bestTimeDays = Math.floor(hoursSorted[0].totalHours / 24);
  const bestTimeYears = (bestTimeDays / 365).toFixed(1);

  const subTabs: {
    id: AnalyticsSubTab;
    label: string;
    icon: React.ReactNode;
    activeClass: string;
  }[] = [
    {
      id: "economia",
      label: "Economía",
      icon: <Wallet size={16} />,
      activeClass: "bg-[#009966] shadow-[0px_10px_15px_0px_rgba(0,79,59,0.3)]",
    },
    {
      id: "tiempo",
      label: "Tiempo",
      icon: <Clock size={16} />,
      activeClass:
        "bg-[#155dfc] shadow-[0px_10px_15px_0px_rgba(28,57,142,0.3)]",
    },
    {
      id: "logros",
      label: "Logros",
      icon: <Trophy size={16} />,
      activeClass:
        "bg-[#7c3aed] shadow-[0px_10px_15px_0px_rgba(109,40,217,0.3)]",
    },
    {
      id: "radar",
      label: "Radar",
      icon: <Hexagon size={16} />,
      activeClass:
        "bg-[#0891b2] shadow-[0px_10px_15px_0px_rgba(8,145,178,0.3)]",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tab bar */}
      <div className="flex items-center p-2 gap-1 bg-[rgba(15,23,43,0.6)] border border-[#1d293d] rounded-[16px]">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-[14px] text-sm font-semibold transition-all ${
              subTab === t.id
                ? `${t.activeClass} text-white`
                : "text-[#90a1b9] hover:text-white"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {subTab === "economia" && (
        <>
          {/* Factor Económico header */}
          <div
            className="flex items-center gap-4 px-6 py-5 rounded-[24px] border border-[rgba(0,188,125,0.2)]"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,79,59,0.3) 0%, rgba(13,84,43,0.2) 50%, rgba(11,79,74,0.3) 100%)",
            }}
          >
            <div className="w-[52px] h-[52px] shrink-0 bg-[rgba(0,188,125,0.2)] rounded-[16px] flex items-center justify-center">
              <Wallet size={28} className="text-[#00bc7d]" />
            </div>
            <div>
              <h2 className="text-[24px] font-bold text-white">
                Factor Económico
              </h2>
              <p className="text-[#90a1b9] text-[14px]">
                La cartera y la rentabilidad — ¿quién aprovecha mejor cada euro?
              </p>
            </div>
          </div>

          {/* Two-column charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Rentabilidad Máxima */}
            <div className="bg-[rgba(15,23,43,0.8)] border border-[#1d293d] rounded-[24px] p-6 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1)]">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown size={20} className="text-[#62748e]" />
                    <h3 className="text-white font-bold text-[18px]">
                      Rentabilidad Máxima
                    </h3>
                  </div>
                  <p className="text-[#62748e] text-[12px] max-w-[200px] leading-relaxed">
                    Coste por hora jugada (€/h) — menor = mejor inversor
                  </p>
                </div>
                <div className="px-3 py-1 bg-[rgba(0,188,125,0.1)] border border-[rgba(0,188,125,0.2)] rounded-full flex items-center gap-1.5 shrink-0">
                  <Crown size={12} className="text-[#00d492]" />
                  <span className="text-[#00d492] text-[10px] font-bold">
                    {bestRent}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3.5">
                {rentSorted.map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-[#94a3b8] text-[12px] w-20 text-right truncate shrink-0">
                      {p.name}
                    </span>
                    <div className="flex-1 h-4 bg-[#0f172b] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(p.costPerHour / maxCost) * 100}%`,
                          backgroundColor: p.color,
                          transition: "width 0.7s ease",
                        }}
                      />
                    </div>
                    <span className="text-[#94a3b8] text-[11px] w-10 shrink-0">
                      {p.costPerHour.toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 pl-24 pr-10">
                {["0.00€", "0.15€", "0.30€", "0.45€", "0.60€"].map((v) => (
                  <span key={v} className="text-[#64748b] text-[10px]">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* El Diógenes Digital */}
            <div className="bg-[rgba(15,23,43,0.8)] border border-[#1d293d] rounded-[24px] p-6 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1)]">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag size={20} className="text-[#62748e]" />
                  <h3 className="text-white font-bold text-[18px]">
                    El "Diógenes Digital"
                  </h3>
                </div>
                <p className="text-[#62748e] text-[12px]">
                  El backlog de la vergüenza — % de juegos con 0 horas
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {people.map((p) => (
                  <div key={p.name} className="flex flex-col items-center">
                    <div
                      className="relative"
                      style={{ width: 100, height: 100 }}
                    >
                      <DonutChart
                        pct={p.unplayedPct}
                        color={p.color}
                        size={100}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="font-black text-[20px]"
                          style={{ color: p.color }}
                        >
                          {p.unplayedPct}%
                        </span>
                      </div>
                    </div>
                    <p className="text-white text-[12px] font-bold mt-1 text-center truncate w-full">
                      {p.name}
                    </p>
                    <p className="text-[#62748e] text-[10px] text-center">
                      {p.unplayed} de {p.totalGames} sin abrir
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Valor Total de la Biblioteca */}
          <div className="bg-[rgba(15,23,43,0.8)] border border-[#1d293d] rounded-[24px] p-6 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1)]">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={20} className="text-[#62748e]" />
                  <h3 className="text-white font-bold text-[18px]">
                    Valor Total de la Biblioteca
                  </h3>
                </div>
                <p className="text-[#62748e] text-[12px]">
                  Valor estimado de todos los juegos (precio base, €)
                </p>
              </div>
              <div className="px-3 py-1 bg-[rgba(0,201,80,0.1)] border border-[rgba(0,201,80,0.2)] rounded-full flex items-center gap-1.5 shrink-0">
                <Crown size={12} className="text-[#05df72]" />
                <span className="text-[#05df72] text-[10px] font-bold">
                  {bestLib}
                </span>
              </div>
            </div>

            {/* Treemap */}
            <div className="flex h-[220px] gap-[3px] rounded-[12px] overflow-hidden">
              {libSorted.slice(0, 3).map((p, idx) => (
                <div
                  key={p.name}
                  className="relative flex flex-col justify-end p-3 min-w-[55px] hover:brightness-110 transition-all cursor-default"
                  style={{
                    flex: p.libraryValue,
                    background: `linear-gradient(180deg, ${p.color}1a 0%, ${p.color}44 100%)`,
                    border: `1px solid ${p.color}44`,
                    borderRadius: "8px",
                  }}
                >
                  <span
                    className="text-xs font-bold mb-0.5"
                    style={{ color: idx === 0 ? "#fbbf24" : "#94a3b8" }}
                  >
                    {idx === 0 ? "👑" : `#${idx + 1}`}
                  </span>
                  <p className="text-white font-bold text-[13px] truncate">
                    {p.name}
                  </p>
                  <p
                    className="font-black text-[15px]"
                    style={{ color: p.color }}
                  >
                    {p.libraryValue.toLocaleString()}€
                  </p>
                  <p className="text-[#94a3b8] text-[9px]">
                    {((p.libraryValue / totalValue) * 100).toFixed(1)}% del
                    total
                  </p>
                </div>
              ))}

              {libSorted.length > 3 && (
                <div
                  className="flex flex-col gap-[3px] min-w-[70px]"
                  style={{
                    flex: libSorted
                      .slice(3)
                      .reduce((s, p) => s + p.libraryValue, 0),
                  }}
                >
                  {libSorted[3] && (
                    <div
                      className="relative flex flex-col justify-end p-2 hover:brightness-110 transition-all cursor-default"
                      style={{
                        flex: libSorted[3].libraryValue,
                        background: `linear-gradient(180deg, ${libSorted[3].color}1a 0%, ${libSorted[3].color}44 100%)`,
                        border: `1px solid ${libSorted[3].color}44`,
                        borderRadius: "8px",
                      }}
                    >
                      <span className="text-[#94a3b8] text-[9px] font-bold">
                        #4
                      </span>
                      <p className="text-white font-bold text-[12px] truncate">
                        {libSorted[3].name}
                      </p>
                      <p
                        className="font-black text-[13px]"
                        style={{ color: libSorted[3].color }}
                      >
                        {libSorted[3].libraryValue.toLocaleString()}€
                      </p>
                      <p className="text-[#94a3b8] text-[8px]">
                        {(
                          (libSorted[3].libraryValue / totalValue) *
                          100
                        ).toFixed(1)}
                        % del total
                      </p>
                    </div>
                  )}
                  {libSorted.length > 4 && (
                    <div
                      className="flex gap-[3px]"
                      style={{
                        flex: libSorted
                          .slice(4)
                          .reduce((s, p) => s + p.libraryValue, 0),
                      }}
                    >
                      {libSorted.slice(4).map((p, idx) => (
                        <div
                          key={p.name}
                          className="relative flex flex-col justify-end p-2 hover:brightness-110 transition-all cursor-default min-w-0"
                          style={{
                            flex: p.libraryValue,
                            background: `linear-gradient(180deg, ${p.color}1a 0%, ${p.color}44 100%)`,
                            border: `1px solid ${p.color}44`,
                            borderRadius: "8px",
                          }}
                        >
                          <span className="text-[#94a3b8] text-[9px] font-bold">
                            #{idx + 5}
                          </span>
                          <p className="text-white font-bold text-[10px] truncate">
                            {p.name}
                          </p>
                          <p
                            className="font-black text-[11px]"
                            style={{ color: p.color }}
                          >
                            {p.libraryValue.toLocaleString()}€
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-[#62748e] text-[12px]">
                Valor total combinado:
              </span>
              <span className="text-[#05df72] font-black text-[14px]">
                {totalValue.toLocaleString()}€
              </span>
            </div>
          </div>
        </>
      )}

      {subTab === "tiempo" && (
        <>
          {/* Factor Tiempo banner */}
          <div
            className="flex items-center gap-4 px-6 py-5 rounded-[24px] border border-[rgba(43,127,255,0.2)]"
            style={{
              background:
                "linear-gradient(90deg, rgba(28,57,142,0.3) 0%, rgba(49,44,133,0.2) 50%, rgba(16,78,100,0.3) 100%)",
            }}
          >
            <div className="w-[52px] h-[52px] shrink-0 bg-[rgba(43,127,255,0.2)] rounded-[16px] flex items-center justify-center">
              <Clock size={28} className="text-[#51a2ff]" />
            </div>
            <div>
              <h2 className="text-[24px] font-bold text-white">
                Factor Tiempo
              </h2>
              <p className="text-[#90a1b9] text-[14px]">
                Las horas de vuelo — el medidor definitivo de dedicación (o de
                falta de vida social)
              </p>
            </div>
          </div>

          {/* El "No Life" Absoluto — vertical bar chart */}
          <div className="bg-[rgba(15,23,43,0.8)] border border-[#1d293d] rounded-[24px] p-6 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1)]">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={20} className="text-[#62748e]" />
                  <h3 className="text-white font-bold text-[18px]">
                    El &quot;No Life&quot; Absoluto
                  </h3>
                </div>
                <p className="text-[#62748e] text-[12px]">
                  Total histórico de horas registradas en Steam
                </p>
              </div>
              <div className="px-3 py-1 bg-[rgba(43,127,255,0.1)] border border-[rgba(43,127,255,0.2)] rounded-full flex items-center gap-1.5 shrink-0">
                <Crown size={12} className="text-[#51a2ff]" />
                <span className="text-[#51a2ff] text-[10px] font-bold">
                  {bestTime}
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="relative" style={{ height: 280 }}>
              {/* Y-axis labels */}
              <div
                className="absolute left-0 top-0 flex flex-col justify-between"
                style={{ height: "calc(100% - 28px)" }}
              >
                {[
                  maxHours,
                  maxHours * 0.75,
                  maxHours * 0.5,
                  maxHours * 0.25,
                  0,
                ].map((v) => (
                  <span
                    key={v}
                    className="text-[#64748b] text-[10px] text-right w-9 leading-none"
                  >
                    {(v / 1000).toFixed(1)}k
                  </span>
                ))}
              </div>
              {/* Grid lines */}
              <div
                className="absolute left-11 right-0 top-0 flex flex-col justify-between"
                style={{ height: "calc(100% - 28px)" }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="border-t border-[rgba(30,41,59,0.7)]"
                  />
                ))}
              </div>
              {/* Bars + x-labels */}
              <div className="absolute left-11 right-0 top-0 bottom-0 flex items-end justify-around gap-3 px-4">
                {hoursSorted.map((p) => (
                  <div
                    key={p.name}
                    className="flex flex-col items-center justify-end gap-1.5 flex-1 h-full pb-7"
                  >
                    <div
                      className="w-full rounded-t-[8px] min-h-[4px] transition-all duration-700"
                      style={{
                        height: `${(p.totalHours / maxHours) * (280 - 28)}px`,
                        backgroundColor: p.color,
                      }}
                    />
                  </div>
                ))}
              </div>
              {/* X-axis labels */}
              <div className="absolute left-11 right-0 bottom-0 h-7 flex items-center justify-around px-4">
                {hoursSorted.map((p) => (
                  <span
                    key={p.name}
                    className="flex-1 text-center text-[#64748b] text-[10px] truncate px-1"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer stat */}
            <div className="bg-[rgba(29,41,61,0.4)] rounded-[14px] py-3 px-4 mt-4 text-center text-[12px]">
              <span className="text-[#62748e]">{bestTime} lleva </span>
              <span className="text-white font-bold">{bestTimeDays} días</span>
              <span className="text-[#62748e]">
                {" "}
                completos jugando ({bestTimeYears} años)
              </span>
            </div>
          </div>

          {/* Obsesión Monomática — top game per person */}
          <div className="bg-[rgba(15,23,43,0.8)] border border-[#1d293d] rounded-[24px] p-6 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-2 mb-1">
              <Star size={20} className="text-[#62748e]" />
              <h3 className="text-white font-bold text-[18px]">
                Obsesión Monomática
              </h3>
            </div>
            <p className="text-[#62748e] text-[12px] mb-5">
              El Top 1 de cada jugador y su % sobre el total de horas
            </p>
            <div className="flex flex-col gap-4">
              {peopleWithTime.map((p) => {
                const pct = Math.round((p.topGameHours / p.totalHours) * 100);
                return (
                  <div
                    key={p.name}
                    className="bg-[rgba(29,41,61,0.4)] border border-[rgba(49,65,88,0.3)] rounded-[16px] px-4 pt-4 pb-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${p.color}22` }}
                        >
                          <span
                            className="font-black text-[12px]"
                            style={{ color: p.color }}
                          >
                            {p.name[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white font-bold text-[14px]">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-[#62748e] text-[10px]">
                        {p.totalHours.toLocaleString()}h totales
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[#cad5e2] text-[12px] font-semibold">
                        {p.topGame}
                      </span>
                      <span
                        className="font-black text-[12px]"
                        style={{ color: p.color }}
                      >
                        {p.topGameHours}h
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#314158] rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${p.color}, ${p.color}66)`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#45556c] text-[10px]">0%</span>
                      <span
                        className="font-bold text-[10px]"
                        style={{ color: p.color }}
                      >
                        % del total
                      </span>
                      <span className="text-[#45556c] text-[10px]">100%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {(subTab === "logros" || subTab === "radar") && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(15,23,43,0.8)] border border-[#1d293d] flex items-center justify-center mb-4">
            <BarChart2 size={32} className="text-[#51a2ff]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Próximamente</h2>
          <p className="text-[#62748e] text-sm">
            Esta sección estará disponible próximamente.
          </p>
        </div>
      )}
    </div>
  );
}

// ── End Analytics Panel ─────────────────────────────────────────────────────

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
            <AnalyticsPanel
              selectedFriends={friends.filter((f) =>
                selectedIds.has(f.steamId),
              )}
              userName={user.personaname}
            />
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
