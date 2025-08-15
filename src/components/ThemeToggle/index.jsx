// src/components/ThemeToggle.jsx
import { useContext } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { ThemeContext } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full 
                 bg-gray-100 dark:bg-gray-800 
                 hover:bg-gray-200 dark:hover:bg-gray-700
                 text-gray-700 dark:text-gray-300
                 hover:text-gray-900 dark:hover:text-white
                 border border-gray-200 dark:border-gray-600
                 transition-all duration-200 ease-in-out
                 shadow-sm hover:shadow-md
                 transform hover:scale-105 active:scale-95"
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