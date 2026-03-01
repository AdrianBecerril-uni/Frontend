import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";
import { Shield, Users, Database, Activity, Server } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../lib/api";

export function Admin() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 pt-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
          <Shield size={32} className="text-red-400" /> Panel de Administración
        </h1>
        <p className="text-slate-400 text-lg">Gestión y monitorización del sistema</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield size={40} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">En Desarrollo</h2>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
          El panel de administración está en desarrollo. Incluirá moderación de contenido, gestión de usuarios, monitorización del sistema y métricas de uso.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: Users, label: "Usuarios", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: Database, label: "Base de Datos", color: "text-purple-400", bg: "bg-purple-500/10" },
            { icon: Activity, label: "Métricas", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: Server, label: "Sistema", color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map(item => (
            <div key={item.label} className={`${item.bg} border border-slate-800 rounded-xl p-4`}>
              <item.icon size={24} className={`${item.color} mx-auto mb-2`} />
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="text-sm font-bold text-white mt-1">—</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}