import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link } from "react-router";
import {
  ArrowLeft,
  Bell,
  Heart,
  Loader2,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import api from "../../lib/api";
import type { Deal } from "../components/market/DealCard";

type SteamGame = {
  name: string;
  header_image: string;
  steam_appid: number;
};

type CheapSharkDeal = {
  storeID: string;
  gameID: string;
  dealID: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  lastChange: number;
  steamAppID?: string;
};

type CheapSharkGame = {
  info: {
    title: string;
    steamAppID: string;
    thumb: string;
  };
  cheapestPriceEver?: {
    price: string;
    date: number;
  };
  deals: Array<{
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string;
  }>;
};

type MonthlyPoint = {
  label: string;
  value: number;
};

function toNumber(value?: string | number | null) {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatUsd(value: number) {
  return `$${value.toFixed(2)}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function buildMonthlyHistory(
  offers: CheapSharkDeal[],
  cheapestEver: { price: string; date: number } | undefined,
  currentPrice: number,
): MonthlyPoint[] {
  const months: { key: string; label: string }[] = [];
  const now = new Date();

  for (let i = 7; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: monthKey(d),
      label: d.toLocaleString("en-US", { month: "short" }),
    });
  }

  const bucket = new Map<string, number[]>();

  offers.forEach((deal) => {
    if (!deal.lastChange) {
      return;
    }
    const d = new Date(deal.lastChange * 1000);
    const key = monthKey(d);
    if (!months.some((m) => m.key === key)) {
      return;
    }
    const list = bucket.get(key) ?? [];
    list.push(toNumber(deal.salePrice));
    bucket.set(key, list);
  });

  if (cheapestEver?.date) {
    const d = new Date(cheapestEver.date * 1000);
    const key = monthKey(d);
    if (months.some((m) => m.key === key)) {
      const list = bucket.get(key) ?? [];
      list.push(toNumber(cheapestEver.price));
      bucket.set(key, list);
    }
  }

  const values = months.map((m) => {
    const inMonth = bucket.get(m.key);
    if (!inMonth || inMonth.length === 0) {
      return null;
    }
    return Math.min(...inMonth);
  });

  let firstKnown = values.find((v): v is number => v !== null);
  if (firstKnown === undefined) {
    firstKnown = currentPrice;
  }

  let carry = firstKnown;
  const filled = values.map((v) => {
    if (v === null) {
      return carry;
    }
    carry = v;
    return v;
  });

  return months.map((m, i) => ({
    label: m.label,
    value: filled[i],
  }));
}

function buildInsights(history: MonthlyPoint[], normalPrice: number) {
  const last = history[history.length - 1]?.value ?? 0;
  const prev = history[history.length - 2]?.value ?? last;
  const monthlyLow = Math.min(...history.map((p) => p.value));
  const discount =
    normalPrice > 0
      ? Math.round(((normalPrice - last) / normalPrice) * 100)
      : 0;

  let recommendationTitle = "Buen momento";
  let recommendationText =
    "El precio actual esta por debajo del promedio reciente.";
  let recommendationTone = "text-[#05df72]";

  if (last <= monthlyLow * 1.03) {
    recommendationTitle = "Compra ahora";
    recommendationText =
      "El precio esta en su punto mas bajo del periodo analizado.";
    recommendationTone = "text-[#05df72]";
  } else if (discount >= 50) {
    recommendationTitle = "Descuento fuerte";
    recommendationText = "Tiene una rebaja agresiva frente al precio normal.";
    recommendationTone = "text-[#05df72]";
  } else if (last > prev * 1.08) {
    recommendationTitle = "Mejor esperar";
    recommendationText =
      "Subio recientemente y podria volver a bajar en pocos dias.";
    recommendationTone = "text-[#facc15]";
  }

  const delta = prev > 0 ? ((last - prev) / prev) * 100 : 0;
  let trendLabel = "Estable";
  let trendText =
    "Se espera que mantenga este precio durante las proximas semanas.";

  if (delta > 4) {
    trendLabel = "Subiendo";
    trendText =
      "El precio viene en alza. Activa alerta para no perder una bajada.";
  } else if (delta < -4) {
    trendLabel = "Bajando";
    trendText = "La tendencia es a la baja, podria mejorar aun mas pronto.";
  }

  return {
    recommendationTitle,
    recommendationText,
    recommendationTone,
    trendLabel,
    trendText,
  };
}

function PriceChart({ points }: { points: MonthlyPoint[] }) {
  const width = 620;
  const height = 250;
  const chartLeft = 40;
  const chartRight = 12;
  const chartTop = 16;
  const chartBottom = 30;

  const values = points.map((p) => p.value);
  const maxValue = Math.max(10, ...values);
  const roundedMax = Math.ceil(maxValue / 15) * 15;
  const yTicks = [
    0,
    roundedMax * 0.25,
    roundedMax * 0.5,
    roundedMax * 0.75,
    roundedMax,
  ].map((v) => Math.round(v));

  const x = (index: number) => {
    const usable = width - chartLeft - chartRight;
    return chartLeft + (index * usable) / (points.length - 1);
  };

  const y = (value: number) => {
    const usable = height - chartTop - chartBottom;
    return chartTop + usable - (value / roundedMax) * usable;
  };

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`)
    .join(" ");

  return (
    <div className="h-[300px] w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {yTicks.map((tick) => {
          const yPos = y(tick);
          return (
            <g key={tick}>
              <line
                x1={chartLeft}
                y1={yPos}
                x2={width - chartRight}
                y2={yPos}
                stroke="#1d293d"
                strokeDasharray="2 4"
              />
              <text
                x={chartLeft - 8}
                y={yPos + 4}
                fill="#64748b"
                fontSize="11"
                textAnchor="end"
              >
                ${tick}
              </text>
            </g>
          );
        })}

        <line
          x1={chartLeft}
          y1={height - chartBottom}
          x2={width - chartRight}
          y2={height - chartBottom}
          stroke="#334155"
        />

        {points.map((point, i) => (
          <text
            key={`label-${point.label}`}
            x={x(i)}
            y={height - 10}
            fill="#64748b"
            fontSize="11"
            textAnchor="middle"
          >
            {point.label}
          </text>
        ))}

        <path d={path} fill="none" stroke="#2b7fff" strokeWidth="3" />

        {points.map((point, i) => (
          <circle
            key={`point-${point.label}`}
            cx={x(i)}
            cy={y(point.value)}
            r="3.5"
            fill="#2b7fff"
          />
        ))}
      </svg>
    </div>
  );
}

export function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const dealFromState = (location.state as { deal?: Deal } | null)?.deal;

  const [loading, setLoading] = useState(true);
  const [steamGame, setSteamGame] = useState<SteamGame | null>(null);
  const [gameTitle, setGameTitle] = useState("");
  const [gameThumb, setGameThumb] = useState("");
  const [steamAppId, setSteamAppId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [offers, setOffers] = useState<CheapSharkDeal[]>([]);
  const [cheapestEver, setCheapestEver] = useState<
    { price: string; date: number } | undefined
  >(undefined);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setLoadError("");

      try {
        let resolvedSteamApp = dealFromState?.steamAppID || id;
        let resolvedGameId = dealFromState?.gameID || null;
        let allOffers: CheapSharkDeal[] = [];

        if (resolvedSteamApp) {
          const dealsByApp = await axios.get(
            "https://www.cheapshark.com/api/1.0/deals",
            {
              params: { steamAppID: resolvedSteamApp, pageSize: 60 },
            },
          );
          allOffers = dealsByApp.data || [];
          if (!resolvedGameId && allOffers[0]?.gameID) {
            resolvedGameId = allOffers[0].gameID;
          }
        }

        if (!resolvedGameId) {
          resolvedGameId = id;
        }

        let cheapGame: CheapSharkGame | null = null;
        if (resolvedGameId) {
          try {
            const gameRes = await axios.get(
              `https://www.cheapshark.com/api/1.0/games`,
              {
                params: { id: resolvedGameId },
              },
            );
            cheapGame = gameRes.data;
            if (!resolvedSteamApp && cheapGame?.info?.steamAppID) {
              resolvedSteamApp = cheapGame.info.steamAppID;
            }
          } catch {
            // Ignore and continue with available sources.
          }
        }

        if (allOffers.length === 0 && resolvedSteamApp) {
          const fallbackDeals = await axios.get(
            "https://www.cheapshark.com/api/1.0/deals",
            {
              params: { steamAppID: resolvedSteamApp, pageSize: 60 },
            },
          );
          allOffers = fallbackDeals.data || [];
          if (!resolvedGameId && allOffers[0]?.gameID) {
            resolvedGameId = allOffers[0].gameID;
          }
        }

        let steam: SteamGame | null = null;
        if (resolvedSteamApp) {
          try {
            const steamRes = await api.get(
              `/api/steam/app/${resolvedSteamApp}`,
            );
            steam = steamRes.data?.data || null;
          } catch {
            // Keep working with CheapShark data.
          }
        }

        const fallbackTitle =
          dealFromState?.title || cheapGame?.info?.title || "Juego";
        const fallbackThumb =
          dealFromState?.thumb || cheapGame?.info?.thumb || "";

        if (!cancelled) {
          setSteamGame(steam);
          setGameTitle(steam?.name || fallbackTitle);
          setGameThumb(steam?.header_image || fallbackThumb);
          setSteamAppId(
            resolvedSteamApp || cheapGame?.info?.steamAppID || null,
          );
          setGameId(resolvedGameId);
          setOffers(allOffers);
          setCheapestEver(cheapGame?.cheapestPriceEver);

          if (!steam && !cheapGame && allOffers.length === 0) {
            setLoadError(
              "No se pudo obtener informacion real para este juego.",
            );
          }
        }
      } catch {
        if (!cancelled) {
          setLoadError("Error al cargar la informacion del juego.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [dealFromState, id]);

  const currentPrice = useMemo(() => {
    if (offers.length > 0) {
      return Math.min(...offers.map((o) => toNumber(o.salePrice)));
    }
    return toNumber(dealFromState?.salePrice);
  }, [dealFromState?.salePrice, offers]);

  const normalPrice = useMemo(() => {
    if (offers.length > 0) {
      return Math.max(...offers.map((o) => toNumber(o.normalPrice)));
    }
    return toNumber(dealFromState?.normalPrice);
  }, [dealFromState?.normalPrice, offers]);

  const historicMin = useMemo(() => {
    if (cheapestEver?.price) {
      return toNumber(cheapestEver.price);
    }
    return currentPrice;
  }, [cheapestEver, currentPrice]);

  const history = useMemo(
    () => buildMonthlyHistory(offers, cheapestEver, currentPrice || 1),
    [cheapestEver, currentPrice, offers],
  );

  const insights = useMemo(
    () => buildInsights(history, normalPrice),
    [history, normalPrice],
  );

  const bestDeal = useMemo(() => {
    if (offers.length === 0) {
      return null;
    }

    return [...offers].sort(
      (a, b) => toNumber(a.salePrice) - toNumber(b.salePrice),
    )[0];
  }, [offers]);

  const minDiscount =
    normalPrice > 0
      ? Math.round(((normalPrice - historicMin) / normalPrice) * 100)
      : 0;

  const trendUp = insights.trendLabel === "Subiendo";
  const trendDown = insights.trendLabel === "Bajando";

  const handleWishlist = () => {
    const key = "steamates_wishlist";
    const list = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    const identifier = steamAppId || gameId || gameTitle;

    if (!list.includes(identifier)) {
      list.push(identifier);
      localStorage.setItem(key, JSON.stringify(list));
      toast.success("Juego anadido a tu wishlist");
      return;
    }

    toast.info("Este juego ya estaba en tu wishlist");
  };

  const handleAlert = () => {
    toast.success("Alerta de precio creada", {
      description: `Te avisaremos cuando ${gameTitle} baje de ${formatUsd(currentPrice || 0)}.`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2
            className="animate-spin text-blue-500 mx-auto mb-3"
            size={34}
          />
          <p className="text-slate-400 text-sm">
            Cargando analisis del juego...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto px-4 pb-20 pt-8">
        <Link
          to="/market"
          className="inline-flex items-center gap-2 text-[#90a1b9] hover:text-white text-[16px]"
        >
          <ArrowLeft size={18} /> Volver al Mercado
        </Link>

        <div className="mt-6 rounded-2xl border border-[#1d293d] bg-[#0f172b] p-10 text-center">
          <h2 className="text-white text-2xl font-bold mb-2">
            No se pudo cargar el juego
          </h2>
          <p className="text-[#90a1b9] text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <Link
        to="/market"
        className="inline-flex items-center gap-2 text-[#90a1b9] hover:text-white text-[16px]"
      >
        <ArrowLeft size={20} /> Volver al Mercado
      </Link>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-8">
        <aside className="space-y-4">
          <div className="h-[2px] rounded-2xl border border-[#1d293d]" />

          <div className="rounded-[14px] border border-[#1d293d] bg-[#0f172b] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#90a1b9] text-[16px]">Precio Actual</span>
              <span className="text-[#05df72] text-[24px] font-bold">
                {formatUsd(currentPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#62748e] text-[14px]">
                Minimo Historico
              </span>
              <span className="text-[#cad5e2] text-[14px]">
                {formatUsd(historicMin)}{" "}
                {minDiscount > 0 ? `(-${minDiscount}%)` : ""}
              </span>
            </div>

            <a
              href={
                steamAppId
                  ? `https://store.steampowered.com/app/${steamAppId}`
                  : undefined
              }
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 rounded-[10px] bg-[#155dfc] text-white font-bold text-[16px] inline-flex items-center justify-center gap-2 w-full"
            >
              <ShoppingCart size={18} /> Ver en Steam
            </a>

            <button
              type="button"
              onClick={handleWishlist}
              className="h-12 rounded-[10px] border border-[#314158] bg-[#1d293d] text-white font-bold text-[16px] inline-flex items-center justify-center gap-2 w-full"
            >
              <Heart size={18} /> Anadir a Wishlist
            </button>

            <button
              type="button"
              onClick={handleAlert}
              className="h-12 rounded-[10px] border border-[#314158] bg-[#1d293d] text-[#fdc700] font-bold text-[16px] inline-flex items-center justify-center gap-2 w-full"
            >
              <Bell size={18} /> Crear Alerta
            </button>
          </div>

          <div className="rounded-[14px] border border-[#1d293d] bg-[#0f172b] p-4">
            <div className="flex items-start gap-3">
              <img
                src={gameThumb}
                alt={gameTitle}
                className="w-16 h-16 rounded-lg object-cover border border-[#1d293d]"
              />
              <div>
                <p className="text-white text-sm font-semibold line-clamp-2">
                  {gameTitle}
                </p>
                <p className="text-[#62748e] text-xs mt-1">
                  {bestDeal
                    ? `Mejor oferta: ${formatUsd(toNumber(bestDeal.salePrice))}`
                    : "Sin ofertas activas"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div>
            <h1 className="text-[36px] leading-[40px] font-bold text-white">
              Analisis de Precio
            </h1>
            <p className="text-[#90a1b9] text-[16px] mt-1">
              Historico de fluctuacion en los ultimos 6 meses.
            </p>
          </div>

          <article className="rounded-[16px] border border-[#1d293d] bg-[#0f172b] p-6 shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1)]">
            <h2 className="text-white text-[18px] leading-7 font-bold mb-3">
              Historial de Precios
            </h2>
            <PriceChart points={history} />
          </article>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <article className="rounded-[14px] border border-[#1d293d] bg-[#0f172b] p-4">
              <h3 className="text-[#90a1b9] text-[14px] leading-5 font-medium">
                Recomendacion IA
              </h3>
              <p className="text-white text-[16px] leading-6 font-bold mt-1">
                {insights.recommendationTitle}
              </p>
              <p
                className={`text-[12px] leading-4 mt-1 ${insights.recommendationTone}`}
              >
                {insights.recommendationText}
              </p>
            </article>

            <article className="rounded-[14px] border border-[#1d293d] bg-[#0f172b] p-4">
              <div className="flex items-center gap-2">
                <h3 className="text-[#90a1b9] text-[14px] leading-5 font-medium">
                  Tendencia
                </h3>
                {trendUp && <TrendingUp size={14} className="text-[#facc15]" />}
                {trendDown && (
                  <TrendingDown size={14} className="text-[#05df72]" />
                )}
              </div>
              <p className="text-white text-[16px] leading-6 font-bold mt-1">
                {insights.trendLabel}
              </p>
              <p className="text-[#62748e] text-[12px] leading-4 mt-1">
                {insights.trendText}
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
