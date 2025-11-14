import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";

const NEON = "#6CFC4F";

export default function Header() {
  const base =
    "px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 relative";
  const active =
    "text-white shadow-[0_0_12px_rgba(108,252,79,0.45)]";
  const inactive =
    "text-slate-300 hover:text-white";

  return (
    <header className="relative z-20 border-b border-green-700 overflow-hidden">
      {/* Fondo oscuro como el Home */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 15% -30%, rgba(108,252,79,0.12), transparent 60%)," +
            "linear-gradient(90deg, #0a0f17 0%, #080c14 50%, #070a11 100%)",
        }}
      />

      {/* Grid sutil neón */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(108,252,79,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(108,252,79,.15) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Halo verde lateral */}
      <div
        className="absolute -left-20 top-1/2 -translate-y-1/2 -z-10 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ background: NEON }}
      />

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
        {/* Brand */}
        <Link
          to="/"
          className="text-lg md:text-2xl font-semibold tracking-tight text-white"
          style={{ textShadow: `0 0 12px ${NEON}AA` }}
        >
          Dashboard <span style={{ color: NEON }}>Usuarios</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
            style={({ isActive }) => ({
              border: isActive ? `1px solid ${NEON}66` : "1px solid transparent",
              background: isActive ? "rgba(108,252,79,.08)" : "transparent",
            })}
          >
            Inicio
            {({ isActive }) =>
              isActive && (
                <span
                  className="absolute left-3 right-3 -bottom-[2px] h-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`,
                  }}
                />
              )
            }
          </NavLink>

          <NavLink
            to="/usuarios"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
            style={({ isActive }) => ({
              border: isActive ? `1px solid ${NEON}66` : "1px solid transparent",
              background: isActive ? "rgba(108,252,79,.08)" : "transparent",
            })}
          >
            Detalles de usuarios
            {({ isActive }) =>
              isActive && (
                <span
                  className="absolute left-3 right-3 -bottom-[2px] h-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`,
                  }}
                />
              )
            }
          </NavLink>

          <NavLink
            to="/mac-search"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
            style={({ isActive }) => ({
              border: isActive ? `1px solid ${NEON}66` : "1px solid transparent",
              background: isActive ? "rgba(108,252,79,.08)" : "transparent",
            })}
          >
            Rastrear MAC
            {({ isActive }) =>
              isActive && (
                <span
                  className="absolute left-3 right-3 -bottom-[2px] h-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`,
                  }}
                />
              )
            }
          </NavLink>

          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
