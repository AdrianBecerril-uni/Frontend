import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";
import { Gamepad2, TrendingUp, Users, Shield, BarChart3, DollarSign, Bot } from "lucide-react";

export function Login() {
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  const features = [
    { icon: BarChart3, title: "Estadísticas Detalladas", desc: "Analiza tu tiempo de juego, logros y hábitos con gráficas interactivas." },
    { icon: Users, title: "Squad Analytics", desc: "Compara tu perfil con el de tus amigos y descubre afinidades de juego." },
    { icon: DollarSign, title: "Rastreador de Precios", desc: "Encuentra las mejores ofertas y recibe alertas de precios." },
    { icon: Bot, title: "Asistente IA", desc: "Un copiloto inteligente que conoce tu biblioteca y te recomienda joyas ocultas." },
  ];

  return (
    <div className="flex items-center justify-center min-h-[85vh] md:min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-cyan-900/10" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-xl mx-auto text-center px-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Gamepad2 className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
          SteaMates
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-md mx-auto mb-10 leading-relaxed">
          Analítica social gaming. Compara, descubre y comparte con tu squad.
        </p>

        {/* Login Button */}
        <button
          onClick={login}
          className="group bg-gradient-to-r from-[#1b2838] to-[#2a475e] hover:from-[#2a475e] hover:to-[#3d6180] text-white py-4 px-10 rounded-xl font-bold text-lg transition-all duration-300 ease-out hover:shadow-lg hover:shadow-blue-900/30 hover:scale-105 active:scale-100 border border-white/10 flex items-center gap-3 mx-auto"
        >
          <img
            src="https://store.akamai.steamstatic.com/public/shared/images/header/logo_steam.svg"
            alt="Steam"
            className="w-7 h-7 brightness-200 group-hover:scale-110 transition-transform"
          />
          Iniciar Sesión con Steam
        </button>

        <p className="text-xs text-slate-600 mt-4">
          Se utiliza autenticación de Steam OpenID. Nunca almacenamos tu contraseña.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
          {features.map(f => (
            <div
              key={f.title}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-left hover:border-blue-500/30 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:text-blue-300">
                  <f.icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-white">{f.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
