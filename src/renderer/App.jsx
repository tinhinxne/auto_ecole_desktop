import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PermissionsProvider } from "./context/PermissionsContext";
import { RulesProvider } from "./context/RulesContext"; // ← AJOUTÉ

import SignIn from "./pages/SignIn";
import Access from "./pages/Access";
import Dashboard from "./pages/Dashboard";
import Condidats from "./pages/condidats";
import Moniteur from "./pages/Moniteur";
import AgendaPage from "./pages/Agenda";
import Payments from "./pages/Payments";
import Examens from "./pages/Examens";
import Parametres from "./pages/parametres";
import Layout from "./layout/Layout";

import LayoutMoniteur from "./layout/LayoutMoniteur";
import DashboardMoniteur from "./pages/DashboardMoniteur";
import MesCandidats from "./pages/MesCandidats";
import AgendaMoniteur from "./pages/AgendaMoniteur";
import ExamensMoniteur from "./pages/ExamenMoniteur";
import PaiementsMoniteur from "./pages/PaiementMoniteur";
import ParametresMoniteur from "./pages/ParametresMoniteur";
import ForgotPassword from "./pages/ForgotPassword";

const App = () => {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <RulesProvider>          {/* ← AJOUTÉ */}
          <HashRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/connexion" replace />} />
              <Route path="/connexion" element={<SignIn />} />
              <Route path="/access" element={<Access />} />
                              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/candidats" element={<Condidats />} />
                <Route path="/moniteur" element={<Moniteur />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/examens" element={<Examens />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/parametres" element={<Parametres />} />
              </Route>

              <Route element={<LayoutMoniteur />}>
                <Route path="/moniteur/dashboard" element={<DashboardMoniteur />} />
                <Route path="/moniteur/candidat" element={<MesCandidats />} />
                <Route path="/moniteur/agenda" element={<AgendaMoniteur />} />
                <Route path="/moniteur/paiements" element={<PaiementsMoniteur />} />
                <Route path="/moniteur/examens" element={<ExamensMoniteur />} />
                <Route path="/moniteur/parametres" element={<ParametresMoniteur />} />

              </Route>
            </Routes>
          </HashRouter>
        </RulesProvider>          {/* ← AJOUTÉ */}
      </PermissionsProvider>
    </AuthProvider>
  );
};

export default App;