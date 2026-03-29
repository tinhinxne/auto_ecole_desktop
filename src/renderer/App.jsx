import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Moniteur from './pages/Moniteur';

sessionStorage.setItem('userRole', 'admin');

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<Moniteur />} />
        <Route path="/moniteurs" element={<Moniteur />} />
        {/* Catch-all: redirect unknown paths back to home */}
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;