import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";
import { Gamepad2, Zap, Users, TrendingUp, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: <Zap size={16} className="text-[#51a2ff]" />,
    iconBg: "bg-[rgba(43,127,255,0.1)] border-[rgba(43,127,255,0.2)]",
    title: "Ofertas inteligentes",
    desc: "Mínimos históricos y alertas de precio en tiempo real.",
  },
  {
    icon: <Users size={16} className="text-[#ad46ff]" />,
    iconBg: "bg-[rgba(173,70,255,0.1)] border-[rgba(173,70,255,0.2)]",
    title: "Juega con amigos",
    desc: "Organiza sesiones, compara bibliotecas y vota listas.",
  },
  {
    icon: <TrendingUp size={16} className="text-[#00bc7d]" />,
    iconBg: "bg-[rgba(0,188,125,0.1)] border-[rgba(0,188,125,0.2)]",
    title: "Tu perfil gaming",
    desc: "Estadísticas, rentabilidad y tendencias de tu biblioteca.",
  },
];

const STATS = [
  { value: "12K+", label: "Jugadores" },
  { value: "850K", label: "Horas rastreadas" },
  { value: "3.2K", label: "Listas creadas" },
];

export function Login() {
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  const loginAdmin = () => {
    const backendUrl =
      (import.meta as any).env?.VITE_API_URL || "http://localhost:3001";
    window.location.href = `${backendUrl}/api/auth/steam`;
  };

  return (
    <div className="-mx-4 -mb-4 md:-m-8 bg-[#020618] min-h-[calc(100vh-80px)] md:min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative glow blobs */}
      <div className="pointer-events-none absolute left-20 top-20 w-80 h-80 rounded-full blur-[120px] bg-[rgba(43,127,255,0.08)]" />
      <div className="pointer-events-none absolute right-80 bottom-40 w-60 h-60 rounded-full blur-[100px] bg-[rgba(173,70,255,0.06)]" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* ── Left: hero ── */}
        <div className="flex-1 max-w-lg">
          {/* Logo row */}
          <div className="flex items-center gap-3 mb-10">
            <div
              className="rotate-3 w-10 h-10 rounded-[14px] flex items-center justify-center shadow-[0_10px_15px_rgba(43,127,255,0.2),0_4px_6px_rgba(43,127,255,0.2)]"
              style={{
                background: "linear-gradient(135deg,#00d3f3 0%,#155dfc 100%)",
              }}
            >
              <Gamepad2 className="text-white" size={22} />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">
              SteaMates
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold text-white leading-[1.2] mb-6">
            Tu vida gaming,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#51a2ff 0%,#c27aff 100%)",
              }}
            >
              mejor organizada
            </span>
          </h1>

          <p className="text-[#90a1b9] text-base leading-relaxed mb-10 max-w-[430px]">
            Conecta tu cuenta de Steam y descubre una nueva forma de gestionar
            tu biblioteca, encontrar ofertas y jugar con amigos.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-4 mb-10">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div
                  className={`w-[34px] h-[34px] shrink-0 rounded-[10px] border flex items-center justify-center ${f.iconBg}`}
                >
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-5">
                    {f.title}
                  </p>
                  <p className="text-[#62748e] text-xs leading-4">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex gap-8 pt-4 border-t border-[rgba(29,41,61,0.5)]">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-white text-lg font-bold">{s.value}</p>
                <p className="text-[#62748e] text-[10px] tracking-[0.5px] uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: login card ── */}
        <div className="w-full lg:w-[400px] shrink-0 bg-[rgba(15,23,43,0.5)] border border-[#1d293d] rounded-2xl px-[49px] py-[49px] shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-white text-2xl font-bold mb-2">Bienvenido</h2>
            <p className="text-[#62748e] text-sm">
              Inicia sesión para acceder a todas las funciones
            </p>
          </div>

          {/* Steam login button */}
          <button
            onClick={login}
            className="w-full bg-[#171a21] border border-[#2a475e] rounded-[14px] h-[58px] flex items-center justify-center gap-3 text-[#c5c3c0] font-bold text-base shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#1e2536] hover:border-[#3d6180] transition-all duration-200 mb-3 cursor-pointer"
          >
            <img
              src="https://store.akamai.steamstatic.com/public/shared/images/header/logo_steam.svg"
              alt="Steam"
              className="w-6 h-6 brightness-200"
            />
            Iniciar Sesión con Steam
          </button>

          {/* Admin login button */}
          <button
            onClick={loginAdmin}
            className="w-full bg-[#171a21] border border-[#2a475e] rounded-[14px] h-[82px] flex items-center gap-5 px-6 text-[#c5c3c0] font-bold text-base shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#1e2536] hover:border-[#3d6180] transition-all duration-200 mb-5 cursor-pointer"
          >
            <img
              src="https://store.akamai.steamstatic.com/public/shared/images/header/logo_steam.svg"
              alt="Steam"
              className="w-6 h-6 brightness-200 shrink-0"
            />
            <span className="flex-1 text-center leading-tight">
              Iniciar Sesión
              <br />
              como Administrador
            </span>
          </button>

          {/* Security badge */}
          <div className="bg-[rgba(29,41,61,0.3)] border border-[#1d293d] rounded-[10px] p-4 mb-3 flex gap-3">
            <Shield size={14} className="text-[#45556c] shrink-0 mt-0.5" />
            <p className="text-[#45556c] text-[11px] leading-[1.625]">
              Usamos la autenticación oficial de Steam. Nunca almacenamos tu
              contraseña ni datos sensibles.
            </p>
          </div>

          {/* Benefits badge */}
          <div className="bg-[rgba(43,127,255,0.05)] border border-[rgba(43,127,255,0.2)] rounded-[10px] p-4 mb-5 flex gap-3">
            <Zap size={14} className="text-[#51a2ff] shrink-0 mt-0.5" />
            <p className="text-[#51a2ff] text-[11px] leading-[1.625]">
              Al iniciar sesión podrás crear listas, votar y comentar en la
              comunidad.
            </p>
          </div>

          {/* Legal */}
          <p className="text-[#314158] text-[10px] text-center leading-[1.625]">
            Al continuar, aceptas los Términos de Servicio y la Política de
            Privacidad.
            <br />
            No estamos afiliados a Valve Corporation.
          </p>
        </div>
      </div>
    </div>
  );
}
