import { ListOrdered, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export function Lists() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-3">Listas Comunitarias</h1>
        <p className="text-slate-400 text-lg">Descubre y comparte listas de juegos con la comunidad</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ListOrdered size={40} className="text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Próximamente</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
          Las listas comunitarias están en desarrollo. Pronto podrás crear, votar y compartir listas de juegos con otros usuarios de SteaMates.
        </p>
        <Link
          to="/market"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors text-sm"
        >
          Explorar Ofertas <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}