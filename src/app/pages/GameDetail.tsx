import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link } from "react-router";
import {
  ArrowLeft, Bell, Heart, Loader2, ShoppingCart,
  TrendingDown, TrendingUp, Star, ExternalLink,
  Tag, Clock, Award, ChevronDown, ChevronUp, Info,
  Package
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import api from "../../lib/api";
import type { Deal } from "../components/market/DealCard";

// ── types ─────────────────────────────────────────────────────────────────────

type CheapDeal = {
  storeID: string; gameID: string; dealID: string;
  salePrice: string; normalPrice: string; savings: string;
  lastChange: number; steamAppID?: string;
};
type CheapGame = {
  info:   { title: string; steamAppID: string; thumb: string };
  cheapestPriceEver?: { price: string; date: number };
  deals:  Array<{ storeID: string; dealID: string; price: string; retailPrice: string; savings: string }>;
};
type PricePoint = { date: Date; price: number; label: string };

// ── helpers ───────────────────────────────────────────────────────────────────

function toNum(v?: string | number | null) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? 0));
  return isFinite(n) ? n : 0;
}
function fmt(v: number) { return `$${v.toFixed(2)}`; }

function buildHistoryFromPoints(pointsInput: PricePoint[], allTimeMin: number, current: number): PricePoint[] {
  const sorted = [...pointsInput]
    .filter((p) => p?.date && toNum(p.price) > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const bucket = new Map<string, PricePoint>();
  sorted.forEach((p) => {
    const key = `${p.date.getFullYear()}-${p.date.getMonth()}`;
    const prev = bucket.get(key);
    if (!prev || p.price < prev.price) bucket.set(key, p);
  });

  const now = new Date();
  const result: PricePoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const found = bucket.get(key);
    result.push({
      date: d,
      price: found ? found.price : (result.at(-1)?.price ?? current),
      label: d.toLocaleDateString("es-ES", { month: "short", year: "2-digit" }),
    });
  }

  const hasATL = result.some((p) => p.price <= allTimeMin * 1.01);
  if (!hasATL && allTimeMin < result[0].price) {
    result[0].price = allTimeMin;
  }

  return result;
}

function buildHistory(deals: CheapDeal[], allTimeMin: number, current: number): PricePoint[] {
  const pointsInput = [...deals]
    .filter(d => d.lastChange && toNum(d.salePrice) > 0)
    .map(d => ({
    date:  new Date(d.lastChange * 1000),
    price: toNum(d.salePrice),
    label: new Date(d.lastChange * 1000).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" }),
  }));
  return buildHistoryFromPoints(pointsInput, allTimeMin, current);
}

// ── Price Chart ───────────────────────────────────────────────────────────────

function PriceChart({ points, current, atl, normal }: {
  points:  PricePoint[];
  current: number;
  atl:     number;
  normal:  number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 560; const H = 220;
  const PAD = { top: 20, right: 16, bottom: 36, left: 44 };
  const w = W - PAD.left - PAD.right;
  const h = H - PAD.top  - PAD.bottom;

  const prices  = points.map(p => p.price);
  const maxP    = Math.max(...prices, normal) * 1.08;
  const minP    = Math.max(0, Math.min(...prices, atl) * 0.92);
  const range   = maxP - minP || 1;

  const cx = (i: number) => PAD.left + (i / (points.length - 1)) * w;
  const cy = (v: number) => PAD.top  + (1 - (v - minP) / range) * h;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${cx(i)} ${cy(p.price)}`).join(" ");
  const areaD = `${pathD} L ${cx(points.length - 1)} ${PAD.top + h} L ${PAD.left} ${PAD.top + h} Z`;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => minP + (range * i) / ticks);

  const hoveredPoint = hovered !== null ? points[hovered] : null;

  return (
    <div className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* y-grid + labels */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={PAD.left} y1={cy(v)} x2={PAD.left + w} y2={cy(v)} stroke="#1e293b" strokeDasharray="3 4"/>
            <text x={PAD.left - 6} y={cy(v) + 4} fill="#64748b" fontSize="10" textAnchor="end">{fmt(v)}</text>
          </g>
        ))}

        {/* all-time-low reference */}
        {atl < maxP && atl > minP && (
          <>
            <line x1={PAD.left} y1={cy(atl)} x2={PAD.left + w} y2={cy(atl)}
                  stroke="#22c55e" strokeDasharray="4 3" strokeWidth="1.5" opacity="0.7"/>
            <text x={PAD.left + w - 2} y={cy(atl) - 4} fill="#22c55e" fontSize="9" textAnchor="end">
              mínimo histórico {fmt(atl)}
            </text>
          </>
        )}

        {/* normal price reference */}
        {normal > current && (
          <>
            <line x1={PAD.left} y1={cy(normal)} x2={PAD.left + w} y2={cy(normal)}
                  stroke="#ef4444" strokeDasharray="4 3" strokeWidth="1" opacity="0.5"/>
            <text x={PAD.left + 2} y={cy(normal) - 4} fill="#ef4444" fontSize="9" opacity="0.7">
              precio base {fmt(normal)}
            </text>
          </>
        )}

        {/* area */}
        <path d={areaD} fill="url(#areaGrad)"/>

        {/* line */}
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>

        {/* x labels */}
        {points.map((p, i) => {
          if (i % 2 !== 0 && i !== points.length - 1) return null;
          return (
            <text key={i} x={cx(i)} y={H - 8} fill="#475569" fontSize="9" textAnchor="middle">
              {p.label}
            </text>
          );
        })}

        {/* hover zones */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={cx(i) - w / points.length / 2}
            y={PAD.top}
            width={w / points.length}
            height={h}
            fill="transparent"
            onMouseEnter={() => setHovered(i)}
            className="cursor-crosshair"
          />
        ))}

        {/* hover indicator */}
        {hovered !== null && hoveredPoint && (
          <>
            <line x1={cx(hovered)} y1={PAD.top} x2={cx(hovered)} y2={PAD.top + h}
                  stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1"/>
            <circle cx={cx(hovered)} cy={cy(hoveredPoint.price)} r="5"
                    fill="#3b82f6" stroke="#0f172a" strokeWidth="2"/>
          </>
        )}
      </svg>

      {/* tooltip */}
      {hoveredPoint && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-xl text-center">
            <p className="text-white font-bold text-sm">{fmt(hoveredPoint.price)}</p>
            <p className="text-slate-400">{hoveredPoint.label}</p>
            {hoveredPoint.price <= atl * 1.01 && (
              <p className="text-emerald-400 font-medium mt-0.5">🏆 Mínimo histórico</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── main GameDetail ───────────────────────────────────────────────────────────

export function GameDetail() {
  const { id }           = useParams<{ id: string }>();
  const location         = useLocation();
  const dealFromState    = (location.state as { deal?: Deal } | null)?.deal;

  const [loading,        setLoading]        = useState(true);
  const [gameTitle,      setGameTitle]      = useState(dealFromState?.title ?? "");
  const [gameThumb,      setGameThumb]      = useState(dealFromState?.thumb ?? "");
  const [steamAppId,     setSteamAppId]     = useState<string | null>(null);
  const [offers,         setOffers]         = useState<CheapDeal[]>([]);
  const [itadHistory,    setItadHistory]    = useState<PricePoint[]>([]);
  const [historySource,  setHistorySource]  = useState<"itad" | "cheapshark">("cheapshark");
  const [cheapestEver,   setCheapestEver]   = useState<{ price: string; date: number } | undefined>();
  const [steamGame,      setSteamGame]      = useState<any>(null);
  const [expanded,       setExpanded]       = useState(false);
  const [loadError,      setLoadError]      = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true); setLoadError("");
      try {
        let appId  = dealFromState?.steamAppID || id;
        let gameId = dealFromState?.gameID     || null;

        // fetch deals by steamAppID
        const dealsRes = await axios.get("https://www.cheapshark.com/api/1.0/deals", {
          params: { steamAppID: appId, pageSize: 60, storeID: "1" },
        });
        const allDeals: CheapDeal[] = dealsRes.data ?? [];
        if (!gameId && allDeals[0]?.gameID) gameId = allDeals[0].gameID;

        // fetch game metadata from CheapShark
        let meta: CheapGame | null = null;
        if (gameId) {
          try {
            const r = await axios.get(`https://www.cheapshark.com/api/1.0/games`, { params: { id: gameId } });
            meta = r.data;
            if (!appId && meta?.info?.steamAppID) appId = meta.info.steamAppID;
          } catch { /* ignore */ }
        }

        // widen history – also fetch by title
        if (meta?.info?.title) {
          try {
            const r2 = await axios.get("https://www.cheapshark.com/api/1.0/deals", {
              params: { title: meta.info.title, storeID: "1", pageSize: 60 },
            });
            const extra: CheapDeal[] = r2.data ?? [];
            const filteredExtra = extra.filter((deal) => {
              const sameSteamApp = appId && deal?.steamAppID && String(deal.steamAppID) === String(appId);
              const sameGameId = gameId && deal?.gameID && String(deal.gameID) === String(gameId);
              return Boolean(sameSteamApp || sameGameId);
            });
            const ids = new Set(allDeals.map(d => d.dealID));
            filteredExtra.forEach(d => { if (!ids.has(d.dealID)) allDeals.push(d); });
          } catch { /* ignore */ }
        }

        // fetch Steam metadata via backend
        let steam: any = null;
        if (appId) {
          try {
            const r = await api.get(`/api/steam/app/${appId}`);
            steam = r.data?.data ?? null;
          } catch { /* ignore */ }
        }

        let itadPoints: PricePoint[] = [];
        try {
          const historyRes = await api.get("/api/steam/itad/history", {
            params: {
              appId: appId || undefined,
              title: meta?.info?.title || dealFromState?.title || undefined,
              country: "ES",
            },
          });

          const rawPoints = Array.isArray(historyRes.data?.points)
            ? historyRes.data.points
            : [];

          itadPoints = rawPoints
            .map((p: any) => {
              const timestamp = Number(p?.timestamp);
              const price = toNum(p?.price);
              if (!Number.isFinite(timestamp) || price <= 0) return null;
              const d = new Date(timestamp);
              if (Number.isNaN(d.getTime())) return null;
              return {
                date: d,
                price,
                label: d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" }),
              } as PricePoint;
            })
            .filter(Boolean) as PricePoint[];
        } catch {
          // Fall back to CheapShark history when ITAD is unavailable.
        }

        if (!cancelled) {
          const fallbackTitle = meta?.info?.title ?? dealFromState?.title ?? "Juego";
          const fallbackThumb = meta?.info?.thumb  ?? dealFromState?.thumb ?? "";
          setGameTitle(steam?.name       ?? fallbackTitle);
          setGameThumb(steam?.header_image ?? fallbackThumb);
          setSteamAppId(appId ?? meta?.info?.steamAppID ?? null);
          setOffers(allDeals);
          setItadHistory(itadPoints);
          setHistorySource(itadPoints.length > 0 ? "itad" : "cheapshark");
          setCheapestEver(meta?.cheapestPriceEver);
          setSteamGame(steam);
          if (!steam && !meta && !allDeals.length) setLoadError("No se pudo obtener información para este juego.");
        }
      } catch {
        if (!cancelled) setLoadError("Error al cargar la información del juego.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const currentPrice = useMemo(() => {
    if (offers.length) return Math.min(...offers.map(o => toNum(o.salePrice)));
    return toNum(dealFromState?.salePrice);
  }, [offers, dealFromState]);

  const normalPrice = useMemo(() => {
    if (offers.length) return Math.max(...offers.map(o => toNum(o.normalPrice)));
    return toNum(dealFromState?.normalPrice);
  }, [offers, dealFromState]);

  const atl = toNum(cheapestEver?.price) || currentPrice;

  const priceHistory = useMemo(() => {
    if (itadHistory.length > 0) {
      return buildHistoryFromPoints(itadHistory, atl, currentPrice || 1);
    }
    return buildHistory(offers, atl, currentPrice || 1);
  }, [itadHistory, offers, atl, currentPrice]);

  const discount    = normalPrice > 0 ? Math.round(((normalPrice - currentPrice) / normalPrice) * 100) : 0;
  const atlDiscount = normalPrice > 0 ? Math.round(((normalPrice - atl) / normalPrice) * 100) : 0;

  const priceTrend = useMemo(() => {
    if (priceHistory.length < 3) return "stable";
    const recent = priceHistory.slice(-3).map(p => p.price);
    const first  = priceHistory.slice(0, 3).map(p => p.price);
    const avgR   = recent.reduce((a, b) => a + b, 0) / 3;
    const avgF   = first.reduce((a, b) => a + b, 0) / 3;
    if (avgR < avgF * 0.92) return "down";
    if (avgR > avgF * 1.08) return "up";
    return "stable";
  }, [priceHistory]);

  const recommendation = useMemo(() => {
    if (currentPrice <= atl * 1.03) return { label: "Compra ahora", color: "text-emerald-400", icon: "🏆" };
    if (discount >= 60)             return { label: "Gran oferta",  color: "text-emerald-400", icon: "🔥" };
    if (discount >= 30)             return { label: "Buen descuento", color: "text-blue-400",  icon: "👍" };
    if (priceTrend === "down")      return { label: "Precio bajando", color: "text-yellow-400", icon: "📉" };
    return { label: "Precio estable", color: "text-slate-400", icon: "📊" };
  }, [currentPrice, atl, discount, priceTrend]);

  const steamStoreUrl = steamAppId ? `https://store.steampowered.com/app/${steamAppId}` : undefined;

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={32}/>
        <p className="text-slate-400 text-sm">Cargando análisis…</p>
      </div>
    </div>
  );

  if (loadError) return (
    <div className="max-w-3xl mx-auto pb-20 pt-8">
      <Link to="/market" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm">
        <ArrowLeft size={16}/> Volver
      </Link>
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
        <p className="text-white text-xl font-bold mb-2">No se pudo cargar</p>
        <p className="text-slate-400 text-sm">{loadError}</p>
      </div>
    </div>
  );

  return (
    <div className="pb-20 max-w-6xl mx-auto">
      <Link to="/market" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8">
        <ArrowLeft size={16}/> Volver al Mercado
      </Link>

      {/* hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-52 md:h-64">
        {gameThumb ? (
          <img src={gameThumb} alt={gameTitle} className="w-full h-full object-cover"/>
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <Package size={48} className="text-slate-600"/>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent"/>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"/>
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{gameTitle}</h1>
          <div className="flex flex-wrap items-center gap-3">
            {discount > 0 && (
              <span className="bg-emerald-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-lg">
                -{discount}%
              </span>
            )}
            <span className="text-2xl font-black text-white">{fmt(currentPrice)}</span>
            {normalPrice > currentPrice && (
              <span className="text-slate-400 line-through text-sm">{fmt(normalPrice)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">

        {/* ── left: price analysis ─────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* price history card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white">Historial de Precios</h2>
              <span className="text-[11px] text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                {historySource === "itad"
                  ? "últimos 12 meses · IsThereAnyDeal"
                  : "últimos 12 meses · CheapShark"}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Pasa el ratón sobre la gráfica para ver el precio en cada fecha.
            </p>
            <PriceChart points={priceHistory} current={currentPrice} atl={atl} normal={normalPrice}/>
          </div>

          {/* stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Precio actual", value: fmt(currentPrice), color: "text-emerald-400", icon: <Tag size={16}/> },
              { label: "Precio base",   value: fmt(normalPrice),  color: "text-slate-300",   icon: <Package size={16}/> },
              { label: "Mínimo histórico", value: `${fmt(atl)} (-${atlDiscount}%)`, color: "text-green-400", icon: <Award size={16}/> },
              { label: "Tendencia",     value: priceTrend === "down" ? "Bajando ↓" : priceTrend === "up" ? "Subiendo ↑" : "Estable →",
                                        color: priceTrend === "down" ? "text-green-400" : priceTrend === "up" ? "text-red-400" : "text-slate-400",
                                        icon: priceTrend === "down" ? <TrendingDown size={16}/> : <TrendingUp size={16}/> },
            ].map(s => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5">{s.icon}{s.label}</div>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* insight cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Info size={15} className="text-blue-400"/>
                <span className="text-sm text-slate-400">Recomendación IA</span>
              </div>
              <p className={`text-base font-bold ${recommendation.color}`}>
                {recommendation.icon} {recommendation.label}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {currentPrice <= atl * 1.03
                  ? "El precio está en su punto más bajo. Ideal para comprar."
                  : discount >= 60
                  ? `Descuento agresivo del ${discount}%. Muy por debajo del precio base.`
                  : discount >= 30
                  ? `${discount}% de descuento sobre el precio base.`
                  : priceTrend === "down"
                  ? "El precio ha bajado en los últimos meses. Podría bajar más."
                  : "El precio se mantiene estable. Espera una oferta mejor."}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={15} className="text-purple-400"/>
                <span className="text-sm text-slate-400">Mejor momento de compra</span>
              </div>
              <p className="text-base font-bold text-white">
                {currentPrice <= atl * 1.05 ? "Ahora mismo" :
                 "Próximas rebajas"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {atl < currentPrice
                  ? `El precio mínimo fue ${fmt(atl)}. Puedes ahorrar ${fmt(currentPrice - atl)} esperando.`
                  : "El precio actual está cerca del mínimo histórico."}
              </p>
            </div>
          </div>

          {/* price breakdown toggle */}
          {offers.length > 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Star size={15} className="text-amber-400"/>
                  Historial de ofertas ({offers.length} registros)
                </span>
                {expanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
              </button>
              {expanded && (
                <div className="divide-y divide-slate-800/60">
                  {[...offers]
                    .sort((a, b) => b.lastChange - a.lastChange)
                    .slice(0, 12)
                    .map(o => (
                      <div key={o.dealID} className="flex items-center justify-between px-5 py-2.5 text-xs">
                        <span className="text-slate-400">
                          {new Date(o.lastChange * 1000).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <div className="flex items-center gap-3">
                          {parseFloat(o.savings) > 5 && (
                            <span className="text-emerald-500 font-medium">-{Math.round(parseFloat(o.savings))}%</span>
                          )}
                          <span className="text-white font-bold">{fmt(toNum(o.salePrice))}</span>
                          <span className="text-slate-600 line-through">{fmt(toNum(o.normalPrice))}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── right: action sidebar ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* game thumb */}
          {gameThumb && (
            <img src={gameThumb} alt={gameTitle}
                 className="w-full rounded-xl border border-slate-800 hidden xl:block"/>
          )}

          {/* price card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-emerald-400">{fmt(currentPrice)}</span>
                {normalPrice > currentPrice && (
                  <span className="text-slate-500 line-through text-sm pb-1">{fmt(normalPrice)}</span>
                )}
              </div>
              {discount > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded">
                    Ahorras {fmt(normalPrice - currentPrice)} ({discount}%)
                  </span>
                </div>
              )}
            </div>

            <a
              href={steamStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                steamStoreUrl
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={16}/>
              Ver en Steam
              <ExternalLink size={13}/>
            </a>

            <button
              onClick={() => {
                const key = "steamates_wishlist";
                const list = JSON.parse(localStorage.getItem(key) ?? "[]");
                const id2 = steamAppId ?? gameTitle;
                if (!list.includes(id2)) {
                  list.push(id2);
                  localStorage.setItem(key, JSON.stringify(list));
                  toast.success("Añadido a tu wishlist");
                } else {
                  toast.info("Ya está en tu wishlist");
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              <Heart size={15}/> Wishlist
            </button>

            <button
              onClick={() => toast.success(`Alerta creada para ${gameTitle}`, {
                description: `Te avisaremos si baja de ${fmt(currentPrice)}.`
              })}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-700/40 bg-amber-900/20 hover:bg-amber-900/40 text-amber-400 text-sm font-medium transition-colors"
            >
              <Bell size={15}/> Alerta de precio
            </button>
          </div>

          {/* price summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-sm">
            {[
              { label: "Precio actual",       value: fmt(currentPrice),            color: "text-emerald-400" },
              { label: "Precio base",          value: fmt(normalPrice),             color: "text-white" },
              { label: "Mínimo histórico",     value: fmt(atl),                     color: "text-green-400" },
              { label: "Ahorro máximo",        value: `-${atlDiscount}%`,           color: "text-green-400" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-slate-500">{row.label}</span>
                <span className={`font-semibold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* steam description */}
          {steamGame?.short_description && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                {steamGame.short_description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
