import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import AgendaMoniteur from "./pages/AgendaMoniteur";

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<AgendaMoniteur />} />
      </Routes>
    </HashRouter>
  );
};

export default App;