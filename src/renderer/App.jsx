import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import AgendaPage from "./pages/Agenda";

import Layout from "./layout/Layout";

const App = () => {
  return (
    <Router>
      <Routes>

        {/* LOGIN (sans layout) */}
        <Route path="/" element={<SignIn />} />

        {/* ROUTES AVEC SIDEBAR */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agenda" element={<AgendaPage />} />
        </Route>

      </Routes>
    </Router>
  );
};

export default App;