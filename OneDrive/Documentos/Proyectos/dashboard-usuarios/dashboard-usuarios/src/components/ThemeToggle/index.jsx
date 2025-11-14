// src/components/ThemeToggle.jsx
import { useContext } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { ThemeContext } from "../../context/ThemeContext";

const NEON = "#6CFC4F";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      style={{
        background: "rgba(10,13,22,0.85)", // fondo glass oscuro
        border: `1px solid ${NEON}55`,
        boxShadow: `0 0 10px ${NEON}33, inset 0 0 6px rgba(0,0,0,.6)`,
        color: theme === "dark" ? NEON : "#D1D5DB",
      }}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? (
        <FiSun className="w-5 h-5 transition-transform duration-200" />
      ) : (
        <FiMoon className="w-5 h-5 transition-transform duration-200" />
      )}
    </button>
  );
}
