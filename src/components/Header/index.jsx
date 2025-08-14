import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const base = "px-3 py-1.5 rounded-md transition-all duration-200 text-sm";
  const active = "bg-gray-900 text-white shadow-sm";
  const inactive = "text-gray-600 hover:text-gray-900 hover:bg-gray-50";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link 
          to="/" 
          className="text-lg font-light text-gray-900 hover:text-gray-700 transition-colors duration-200"
        >
          Analytics Dashboard
        </Link>
        <nav className="flex gap-1">
          <NavLink 
            to="/" 
            end 
            className={({isActive}) => `${base} ${isActive ? active : inactive}`}
          >
            Home
          </NavLink>
          <NavLink 
            to="/usuarios" 
            className={({isActive}) => `${base} ${isActive ? active : inactive}`}
          >
            User Details
          </NavLink>
        </nav>
      </div>
    </header>
  );
}