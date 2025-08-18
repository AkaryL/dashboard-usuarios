import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";

export default function Header() {
  const base = "px-3 py-2 text-xs rounded-md transition-colors duration-200";
  const active = "bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600";
  const inactive = "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white";

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200/80 dark:border-gray-700/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link 
          to="/" 
          className="text-lg font-light text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
        >
          Dashboard Usuario
        </Link>
        <nav className="flex justify-center items-center gap-2">
          <NavLink 
            to="/" 
            end 
            className={({isActive}) => `${base} ${isActive ? active : inactive}`}
          >
            Inicio
          </NavLink>
          <NavLink 
            to="/usuarios" 
            className={({isActive}) => `${base} ${isActive ? active : inactive}`}
          >
            Detalles de usuarios
          </NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}