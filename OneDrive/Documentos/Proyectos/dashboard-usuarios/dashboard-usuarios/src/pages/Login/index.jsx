import React, { useState } from 'react'
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react'

const NEON = "#6CFC4F"

function Login({ setSession }) {
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = () => {
    if (password === 'Seguridad@2025') {
      setSession(true);
      sessionStorage.setItem("dashboard_session", true);
      console.log("login existoso");
    } else {
      console.log("contraseña incorrecta");
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-6 text-slate-100 overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 600px at 15% -10%, rgba(108,252,79,0.10), transparent 60%)," +
          "linear-gradient(180deg, #0a0f17 0%, #080c14 35%, #070a11 100%)",
      }}
    >
      {/* Grid neón sutil */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(108,252,79,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(108,252,79,.18) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Halo verde inferior izq */}
      <div
        className="absolute -left-24 bottom-[-6rem] w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25 -z-10"
        style={{ background: NEON }}
      />

      <div className="w-full max-w-md">
        {/* Card principal */}
        <div
          className="rounded-2xl overflow-hidden shadow-xl"
          style={{
            background: "rgba(10,13,22,0.8)",
            border: "1px solid rgba(108,252,79,0.18)",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.45), 0 0 0 1px rgba(108,252,79,.08) inset",
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-8 text-center"
            style={{ borderBottom: "1px solid rgba(108,252,79,0.16)" }}
          >
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
              style={{
                background: "rgba(108,252,79,0.12)",
                border: `1px solid ${NEON}55`,
                boxShadow: `0 0 14px ${NEON}33 inset, 0 0 12px ${NEON}22`,
              }}
            >
              <Lock className="w-6 h-6" style={{ color: NEON }} />
            </div>
            <h1 className="text-xl font-semibold">
              Dashboard <span style={{ color: NEON, textShadow: `0 0 10px ${NEON}55` }}>Usuarios</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Sistema de analíticas · Datastics</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-base font-medium text-white">Bienvenido</h2>
              <p className="text-xs text-slate-400">Ingresa tu contraseña para continuar</p>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={visiblePassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 pr-10 text-xs rounded-md bg-[rgba(9,12,20,0.85)] text-slate-100 outline-none transition-shadow"
                  style={{
                    border: error
                      ? "1px solid rgba(244,63,94,0.6)" // rojo
                      : "1px solid rgba(108,252,79,0.22)",
                    boxShadow: error
                      ? "0 0 0 3px rgba(244,63,94,0.15), inset 0 0 0 1px rgba(244,63,94,0.2)"
                      : `inset 0 0 0 1px rgba(108,252,79,0.08)`,
                  }}
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setVisiblePassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: error ? "#f43f5e" : "#cbd5e1" }}
                >
                  {visiblePassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-2 text-xs flex items-center gap-1" style={{ color: "#f43f5e" }}>
                  <span>Contraseña incorrecta</span>
                </div>
              )}
            </div>

            {/* Botón */}
            <button
              onClick={handleLogin}
              className="w-full py-2.5 px-4 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-transform active:scale-95"
              style={{
                background: `linear-gradient(180deg, ${NEON}1A, ${NEON}33)`,
                color: "#fff",
                border: `1px solid ${NEON}66`,
                boxShadow: `0 0 16px ${NEON}33, inset 0 0 0 1px rgba(0,0,0,.4)`,
              }}
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </button>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">Sistema seguro de Datastics</p>
            </div>
          </div>
        </div>

        {/* Decoración inferior */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-1">
            <div className="w-6 h-0.5" style={{ background: "rgba(108,252,79,0.35)" }} />
            <div className="w-1 h-1 rounded-full" style={{ background: "rgba(108,252,79,0.45)" }} />
            <div className="w-1 h-1 rounded-full" style={{ background: "rgba(108,252,79,0.45)" }} />
            <div className="w-6 h-0.5" style={{ background: "rgba(108,252,79,0.35)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login
