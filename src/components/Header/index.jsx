import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const base = "px-3 py-2 rounded-lg";
  const active = "bg-white/10 text-white";
  const inactive = "text-white/80 hover:text-white hover:bg-white/10";

  return (
    <header className="bg-slate-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-white font-bold">RJ Dashboard</Link>
        <nav className="flex gap-2">
          <NavLink to="/" end className={({isActive}) => `${base} ${isActive?active:inactive}`}>Inicio</NavLink>
          <NavLink to="/usuarios" className={({isActive}) => `${base} ${isActive?active:inactive}`}>Usuario específico</NavLink>
        </nav>
      </div>
    </header>
  );
}
