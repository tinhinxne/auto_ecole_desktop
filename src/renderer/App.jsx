import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import SignIn    from './pages/SignIn';
import Access    from './pages/Access';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Page de connexion (racine) */}
        <Route path="/"          element={<SignIn />} />

        {/* Sélection du rôle */}
        <Route path="/access"    element={<Access />} />

        {/* Dashboard principal */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirection de toute route inconnue vers la racine */}
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
