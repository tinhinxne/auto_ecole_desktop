// App.jsx
import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import SignIn from "./pages/SignIn";
import Access from "./pages/Access";
import Dashboard from "./pages/Dashboard";
import Condidats from "./pages/condidats";
import Moniteur from "./pages/Moniteur";
import AgendaPage from "./pages/Agenda";
import Payments from "./pages/Payments";
import Examens from "./pages/Examens";
import Layout from "./layout/Layout";
import Parametres from "./layout/parametres";

const App = () => {
  return (
    <HashRouter>
      <Routes>

        {/* ── Redirection racine → connexion ── */}
        <Route path="/" element={<Navigate to="/connexion" replace />} />

        {/* ── Page connexion — sans sidebar ── */}
        <Route path="/connexion" element={<SignIn />} />
        <Route path="/access" element={<Access />} />

        {/* ── Pages protégées — avec sidebar via Layout ── */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/candidats" element={<Condidats />} />
          <Route path="/moniteur" element={<Moniteur />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/examens" element={<Examens />} />
          <Route path="/payments" element={<Payments />} />
           <Route path="/parametres" element={<Parametres />} />
        </Route>

      </Routes>
    </HashRouter>
  );
};

export default App;