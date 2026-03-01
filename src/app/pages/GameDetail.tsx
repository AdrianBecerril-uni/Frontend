import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, ExternalLink, Tag, Star, DollarSign, Loader2 } from "lucide-react";

interface GameInfo {
  name: string;
  header_image: string;
  short_description: string;
  genres: { description: string }[];
  is_free: boolean;
  price_overview?: { final_formatted: string; discount_percent: number; initial_formatted: string };
  metacritic?: { score: number };
  release_date?: { date: string };
  developers?: string[];
  publishers?: string[];
}

interface CheapSharkDeal {
  storeID: string;
  dealID: string;
  price: string;
  retailPrice: string;
  savings: string;
}

export function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<GameInfo | null>(null);
  const [deals, setDeals] = useState<CheapSharkDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchGameData = async () => {
      try {
        // Fetch game details from Steam Store API
        const storeRes = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${id}&l=spanish`);
        const appData = storeRes.data?.[id]?.data;
        if (appData) {
          setGame(appData);
        }
      } catch (error) {
        console.error("Error fetching game details:", error);
      }

      try {
        // Fetch deals from CheapShark
        const dealsRes = await axios.get(`https://www.cheapshark.com/api/1.0/deals`, {
          params: { steamAppID: id, pageSize: 5 },
        });
        setDeals(dealsRes.data || []);
      } catch (error) {
        console.error("Error fetching deals:", error);
      }

      setLoading(false);
    };

    fetchGameData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={32} />
          <p className="text-slate-400 text-sm">Cargando información del juego...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 pt-8 space-y-6">
      {/* Back link */}
      <Link to="/market" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> Volver al mercado
      </Link>

      {game ? (
        <>
          {/* Game Header */}
          <div className="relative bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-[2.5/1] overflow-hidden">
              <img
                src={game.header_image}
                alt={game.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            </div>
            <div className="relative p-6 -mt-16">
              <h1 className="text-3xl font-bold text-white mb-2">{game.name}</h1>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">{game.short_description}</p>

              <div className="flex flex-wrap gap-3 mt-4">
                {game.genres?.map(g => (
                  <span key={g.description} className="flex items-center gap-1.5 text-xs bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-slate-300">
                    <Tag size={10} /> {g.description}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                {game.metacritic && (
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${game.metacritic.score >= 75 ? 'bg-green-600' : game.metacritic.score >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                      {game.metacritic.score}
                    </div>
                    <span className="text-xs text-slate-500">Metacritic</span>
                  </div>
                )}
                {game.release_date?.date && (
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Star size={12} /> {game.release_date.date}
                  </div>
                )}
                {game.developers && (
                  <div className="text-xs text-slate-500">
                    Dev: <span className="text-slate-300">{game.developers.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-400" /> Precios
            </h2>

            {game.is_free ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-emerald-400 font-bold text-lg">¡Gratis!</p>
              </div>
            ) : game.price_overview ? (
              <div className="flex items-center gap-4 mb-4">
                {game.price_overview.discount_percent > 0 && (
                  <span className="text-sm bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg">
                    -{game.price_overview.discount_percent}%
                  </span>
                )}
                {game.price_overview.discount_percent > 0 && (
                  <span className="text-sm text-slate-500 line-through">{game.price_overview.initial_formatted}</span>
                )}
                <span className="text-xl font-bold text-white">{game.price_overview.final_formatted}</span>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Precio no disponible</p>
            )}

            {/* CheapShark Deals */}
            {deals.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-300 mb-3">Mejores ofertas actuales</h3>
                <div className="space-y-2">
                  {deals.map(deal => {
                    const savings = Math.round(parseFloat(deal.savings));
                    return (
                      <a
                        key={deal.dealID}
                        href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-blue-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {savings > 0 && (
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              -{savings}%
                            </span>
                          )}
                          <span className="text-sm text-white font-medium">${deal.price}</span>
                          {savings > 0 && (
                            <span className="text-xs text-slate-500 line-through">${deal.retailPrice}</span>
                          )}
                        </div>
                        <ExternalLink size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Steam Store Link */}
            <div className="mt-4">
              <a
                href={`https://store.steampowered.com/app/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#171a21] hover:bg-[#2a475e] text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm border border-[#2a475e]"
              >
                <img
                  src="https://store.akamai.steamstatic.com/public/shared/images/header/logo_steam.svg"
                  alt="Steam"
                  className="w-5 h-5 brightness-200"
                />
                Ver en Steam Store
              </a>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center">
          <h2 className="text-xl font-bold text-white mb-3">Juego no encontrado</h2>
          <p className="text-slate-400 text-sm">No se pudo obtener información para este juego</p>
        </div>
      )}
    </div>
  );
}