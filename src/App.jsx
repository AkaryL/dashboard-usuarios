import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import UsersSearch from "./pages/UsersSearch";
import UserDetail from "./pages/UserDetail";
import { DataProvider } from "./context/DataContext";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header usa <Link/>, así que debe estar dentro del Router */}
      <DataProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/usuarios" element={<UsersSearch />} />
          <Route path="/usuarios/:mac" element={<UserDetail />} />
        </Routes>
      </DataProvider>
    </div>
  );
}
