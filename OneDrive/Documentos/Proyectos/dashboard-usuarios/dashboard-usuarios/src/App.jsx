import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import UsersSearch from "./pages/UsersSearch";
import UserDetail from "./pages/UserDetail";
import Login from './pages/Login';
import { DataProvider } from "./context/DataContext";
import MerakiMACFinder from "./components/MerakiMACFinder/MerakiMACFinder";


export default function App() {
  const [session, setSession] = useState(sessionStorage.getItem("dashboard_session") || false);
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header usa <Link/>, así que debe estar dentro del Router */}
      <DataProvider>
        {session && <Header />}
        <Routes>
          <Route path="/" element={session ? <Home /> : <Login setSession={setSession} />} />
          <Route path="/usuarios" element={session ? <UsersSearch /> : <Login setSession={setSession} />} />
          <Route path="/usuarios/:mac" element={session ? <UserDetail /> : <Login setSession={setSession} />} />
          <Route path="/mac-search" element={session ? <MerakiMACFinder /> : <Login setSession={setSession} />} />
        </Routes>
      </DataProvider>
    </div>
  );
}
