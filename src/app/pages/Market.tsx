import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Search, Filter, ArrowUpDown, Lock, Gamepad2, Car, Sword, Crosshair, Zap, Ghost, DollarSign, ChevronDown } from "lucide-react";
import { DealCard, Deal } from "../components/market/DealCard";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

// Mock Genres for filtering (since API doesn't provide them)
const GENRES = ["Action", "Shooter", "Racing", "RPG", "Strategy", "Horror"];

const getMockGenre = (deal: Deal): string => {
  const title = deal.title.toLowerCase();
  if (title.includes("race") || title.includes("moto") || title.includes("speed")) return "Racing";
  if (title.includes("dead") || title.includes("zombie") || title.includes("horror")) return "Horror";
  if (title.includes("war") || title.includes("duty") || title.includes("shoot") || title.includes("gun")) return "Shooter";
  if (title.includes("final") || title.includes("dragon") || title.includes("fantasy")) return "RPG";
  if (title.includes("civilization") || title.includes("age") || title.includes("sim")) return "Strategy";
  
  // Deterministic fallback based on ID char code sum
  const sum = deal.dealID.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GENRES[sum % GENRES.length];
};

export function Market() {
  const { user, login } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("150");
  const [sortBy, setSortBy] = useState("rating-desc");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if we should show the "Locked" state for recommendations
  // We lock it if there is no user, OR if the user is the demo user (Guest)
  const isGuest = user?.steamid === "76561198000000000";
  const isRecommendationsLocked = !user || isGuest;

  // Quick price presets
  const pricePresets = [
    { label: "< $10", value: "10" },
    { label: "< $20", value: "20" },
    { label: "< $30", value: "30" },
    { label: "< $50", value: "50" },
    { label: "Todos", value: "150" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPriceDropdownOpen(false);
      }
    }

    if (isPriceDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isPriceDropdownOpen]);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const params: any = {
        storeID: "1", // Steam
        upperPrice: maxPrice,
        pageSize: 60, // Limit results
      };
      
      if (searchTerm) {
        params.title = searchTerm;
      }
      
      // Map sort values to API parameters (API only supports ascending for these)
      if (sortBy.startsWith("price")) {
        params.sortBy = "Price";
      } else if (sortBy.startsWith("savings")) {
        params.sortBy = "Savings";
      } else if (sortBy.startsWith("rating")) {
        params.sortBy = "Deal Rating";
      } else if (sortBy.startsWith("release")) {
        params.sortBy = "Release";
      }

      const response = await axios.get("https://www.cheapshark.com/api/1.0/deals", {
        params
      });
      
      let fetchedDeals = response.data;
      
      // Apply local sorting for descending orders (API returns ascending by default)
      // Note: For some sorts, the API already returns in the right order
      if (sortBy === "price-asc") {
        // API returns ascending by default when sortBy=Price, but let's ensure it
        fetchedDeals = [...fetchedDeals].sort((a: Deal, b: Deal) => 
          parseFloat(a.salePrice) - parseFloat(b.salePrice)
        );
      } else if (sortBy === "price-desc") {
        fetchedDeals = [...fetchedDeals].sort((a: Deal, b: Deal) => 
          parseFloat(b.salePrice) - parseFloat(a.salePrice)
        );
      } else if (sortBy === "rating-asc") {
        fetchedDeals = [...fetchedDeals].sort((a: Deal, b: Deal) => 
          parseFloat(a.dealRating) - parseFloat(b.dealRating)
        );
      } else if (sortBy === "savings-asc") {
        fetchedDeals = [...fetchedDeals].sort((a: Deal, b: Deal) => 
          parseFloat(a.savings) - parseFloat(b.savings)
        );
      } else if (sortBy === "savings-desc") {
        fetchedDeals = [...fetchedDeals].sort((a: Deal, b: Deal) => 
          parseFloat(b.savings) - parseFloat(a.savings)
        );
      } else if (sortBy === "release-asc") {
        fetchedDeals = [...fetchedDeals].sort((a: Deal, b: Deal) => 
          a.releaseDate - b.releaseDate
        );
      } else if (sortBy === "release-desc") {
        fetchedDeals = [...fetchedDeals].sort((a: Deal, b: Deal) => 
          b.releaseDate - a.releaseDate
        );
      }
      
      setDeals(fetchedDeals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast.error("Error al cargar las ofertas. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDeals();
    }, 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm, maxPrice, sortBy]);

  // Apply genre and price filters locally
  useEffect(() => {
    let filtered = deals;
    
    // Apply minimum price filter
    const minPriceNum = parseFloat(minPrice);
    if (minPriceNum > 0) {
      filtered = filtered.filter(deal => parseFloat(deal.salePrice) >= minPriceNum);
    }
    
    // Apply genre filter
    if (selectedGenre) {
      filtered = filtered.filter(deal => getMockGenre(deal) === selectedGenre);
    }
    
    setFilteredDeals(filtered);
  }, [deals, selectedGenre, minPrice]);

  const handleSteamLogin = () => {
    if (isGuest) {
      // If guest, logout first or just redirect to login
      login(); // This redirects to steam auth
    } else {
      login();
    }
  };

  const GenreIcon = ({ genre }: { genre: string }) => {
    switch(genre) {
      case "Racing": return <Car size={14} />;
      case "Action": return <Sword size={14} />;
      case "Shooter": return <Crosshair size={14} />;
      case "Strategy": return <Zap size={14} />;
      case "Horror": return <Ghost size={14} />;
      case "RPG": return <Gamepad2 size={14} />;
      default: return <Gamepad2 size={14} />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Mercado</h1>
          <p className="text-slate-400 text-sm">Ofertas en tiempo real de CheapShark</p>
        </div>
      </div>

      {/* Recommended Section (Locked/Unlocked) */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Recomendado para ti</h2>
        
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 min-h-[220px]">
           {/* Content (Blurred if locked) */}
           <div className={`p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 ${isRecommendationsLocked ? 'blur-md opacity-50 pointer-events-none select-none' : ''}`}>
              {/* Mock Recommendations */}
              {[1,2,3,4,5,6].map((i) => (
                 <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse"></div>
              ))}
           </div>

           {/* Lock Overlay */}
           {isRecommendationsLocked && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950/60 backdrop-blur-[2px]">
                <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-md mx-4">
                   <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                      <Lock className="text-blue-400" size={32} />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Desbloquea tus recomendaciones</h3>
                   <p className="text-slate-400 mb-6 text-sm">
                     Conecta tu cuenta de Steam para que nuestra IA analice tu biblioteca y encuentre las mejores ofertas basadas en tus gustos.
                   </p>
                   <button 
                     onClick={handleSteamLogin}
                     className="bg-[#171a21] hover:bg-[#2a475e] text-[#c5c3c0] hover:text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-3 border border-[#2a475e] shadow-lg group"
                   >
                     <img 
                       src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" 
                       alt="Steam Logo" 
                       className="w-5 h-5 group-hover:scale-110 transition-transform" 
                     />
                     <span>Iniciar Sesión con Steam</span>
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Filters and Deals List */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <h2 className="text-2xl font-bold text-white">Todas las ofertas</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            {/* Price Filter Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                className="appearance-none bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-200 hover:border-blue-500 cursor-pointer w-full flex items-center justify-between gap-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-slate-500" />
                  <span>
                    {minPrice === "0" && maxPrice === "150" 
                      ? "Precio" 
                      : minPrice === "0" 
                        ? `< $${maxPrice}`
                        : maxPrice === "150"
                          ? `> $${minPrice}`
                          : `$${minPrice} - $${maxPrice}`
                    }
                  </span>
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isPriceDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Content */}
              {isPriceDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 space-y-4 z-50">
                  {/* Quick Presets */}
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Presets Rápidos</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {pricePresets.map(preset => (
                        <button
                          key={preset.value}
                          onClick={() => {
                            setMinPrice("0");
                            setMaxPrice(preset.value);
                          }}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                            minPrice === "0" && maxPrice === preset.value
                              ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                              : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-700"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Dual Range */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <label className="text-xs text-slate-400 block">Rango Personalizado</label>
                    
                    {/* Price labels */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Min:</span>
                        <span className="font-semibold text-white">${minPrice}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Max:</span>
                        <span className="font-semibold text-white">
                          {maxPrice === "150" ? "Sin límite" : `$${maxPrice}`}
                        </span>
                      </div>
                    </div>
                    
                    {/* Dual Range Slider */}
                    <div className="relative h-6 flex items-center">
                      {/* Track background */}
                      <div className="absolute w-full h-1.5 bg-slate-700 rounded-full"></div>
                      
                      {/* Active track */}
                      <div 
                        className="absolute h-1.5 bg-blue-500 rounded-full"
                        style={{
                          left: `${(parseInt(minPrice) / 150) * 100}%`,
                          right: `${100 - (parseInt(maxPrice) / 150) * 100}%`
                        }}
                      ></div>
                      
                      {/* Min price slider */}
                      <input 
                        type="range" 
                        min="0" 
                        max="150" 
                        step="5"
                        value={minPrice} 
                        onChange={(e) => {
                          const newMin = e.target.value;
                          if (parseInt(newMin) < parseInt(maxPrice) - 5) {
                            setMinPrice(newMin);
                          }
                        }}
                        className="absolute w-full pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:shadow-lg"
                        style={{ zIndex: minPrice > maxPrice ? 5 : 3 }}
                      />
                      
                      {/* Max price slider */}
                      <input 
                        type="range" 
                        min="0" 
                        max="150" 
                        step="5"
                        value={maxPrice} 
                        onChange={(e) => {
                          const newMax = e.target.value;
                          if (parseInt(newMax) > parseInt(minPrice) + 5) {
                            setMaxPrice(newMax);
                          }
                        }}
                        className="absolute w-full pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:shadow-lg"
                        style={{ zIndex: maxPrice < minPrice ? 5 : 4 }}
                      />
                    </div>
                    
                    {/* Price markers */}
                    <div className="flex justify-between text-[10px] text-slate-500 px-0.5">
                      <span>$0</span>
                      <span>$50</span>
                      <span>$100</span>
                      <span>$150</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer w-full min-w-[180px]"
              >
                <option value="rating-desc">Mejor valorados</option>
                <option value="rating-asc">Peor valorados</option>
                <option value="price-asc">Más barato primero</option>
                <option value="savings-desc">Mayor descuento</option>
                <option value="release-desc">Más recientes</option>
                <option value="release-asc">Más antiguos</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* Genre Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button
             onClick={() => setSelectedGenre(null)}
             className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
               !selectedGenre 
                 ? "bg-blue-600 text-white border-blue-500" 
                 : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500"
             }`}
          >
            Todos
          </button>
          {GENRES.map(genre => (
            <button
               key={genre}
               onClick={() => setSelectedGenre(genre)}
               className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                 selectedGenre === genre
                   ? "bg-blue-600 text-white border-blue-500" 
                   : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500"
               }`}
            >
              <GenreIcon genre={genre} />
              {genre}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-slate-900 h-40 rounded-xl animate-pulse border border-slate-800"></div>
          ))}
        </div>
      ) : (
        <>
          {filteredDeals.length > 0 ? (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredDeals.map((deal) => (
                <DealCard key={deal.dealID} deal={deal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p className="text-xl">No se encontraron ofertas con estos criterios.</p>
              <button onClick={() => {setSearchTerm(""); setSelectedGenre(null);}} className="text-blue-400 text-sm mt-2 hover:underline">
                Limpiar filtros
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}