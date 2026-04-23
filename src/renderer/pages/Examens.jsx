import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarDay, FaCheckCircle, FaTimesCircle, FaChartLine, FaClock, FaTrashAlt, FaExchangeAlt, FaUser } from "react-icons/fa";

import SelectFilter from "../components/SelectFilter";
import ExamenModal from "../components/Examenmodal";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import "../../styles/Examens.css";

const Examens = () => {
  // Liste générée automatiquement (Simulée)
  const [examensList, setExamensList] = useState([
    { id: 1, candidat: "Tinhinane Belarbi", type: "Code", date: "2026-03-10", heure: "08:00", lieu: "Centre d'examen Naceria", status: "Scheduled" },
    { id: 2, candidat: "Sonia Benazzouz", type: "Créneau", date: "2026-03-10", heure: "14:00", lieu: "Auto-école principal", status: "Scheduled" },
    { id: 5, candidat: "Hadjer Berkani", type: "Code", date: "2026-03-05", heure: "11:00", lieu: "Centre d'examen Tazebboujt", status: "Passed" },
    { id: 6, candidat: "Melissa Azil", type: "Circulation", date: "2026-03-01", heure: "09:30", lieu: "Auto-école stade", status: "Failed" },
  ]);

  const [selectedExamen, setSelectedExamen] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [typeFilter, setTypeFilter] = useState("Tous");

  const STATUS_CONFIG = {
    Scheduled: { bg: "#e3f2fd", color: "#1565c0", label: "Programmé" },
    Passed: { bg: "#e8f5e9", color: "#2e7d32", label: "Réussi" },
    Failed: { bg: "#ffebee", color: "#c62828", label: "Échoué" },
  };

  // --- ACTIONS ---
  const handleRemoveCandidat = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Retirer ce candidat de la session ?")) {
      setExamensList(prev => prev.filter(item => item.id !== id));
    }
  };
  const th = { padding: '15px 16px', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '14px' };
const td = { padding: '14px 16px', borderBottom: '1px solid #E5E7EB', fontSize: '14px', color: '#1F2937' };

  const handleToggleStatus = (id, currentStatus, e) => {
    e.stopPropagation();
    const cycle = ["Scheduled", "Passed", "Failed"];
    const nextStatus = cycle[(cycle.indexOf(currentStatus) + 1) % cycle.length];
    setExamensList(prev => prev.map(exam => exam.id === id ? { ...exam, status: nextStatus } : exam));
  };

  // --- FILTRAGE DYNAMIQUE ---
  const filtered = examensList.filter((e) => {
    const matchStatus = statusFilter === "Tous" || e.status === statusFilter;
    const matchType = typeFilter === "Tous" || e.type === typeFilter;
    return matchStatus && matchType;
  });

  const statsData = [
    { label: "Total Session", val: examensList.length, color: "blue", icon: <FaUser />, trend: "Candidats" },
    { label: "Réussites", val: examensList.filter(e => e.status === "Passed").length, color: "green", icon: <FaCheckCircle />, trend: "Validés" },
    { label: "Échecs", val: examensList.filter(e => e.status === "Failed").length, color: "red", icon: <FaTimesCircle />, trend: "À reprogrammer" },
    { label: "En attente", val: examensList.filter(e => e.status === "Scheduled").length, color: "orange", icon: <FaClock />, trend: "À évaluer" }
  ];

  return (
    <div className="main">
      <div className="header">
        <img src={ConnexionImg} alt="illustration" className="header-img" />
        <h1><img src={SmallCar} alt="" width={40} /> Panneau de contrôle</h1>
        <p>Suivi des sessions d'examens générées</p>
      </div>

      <div className="examens-content">
        <div className="examens-page-header">
          <div>
            <h2 className="examens-page-title">Session d'Examen</h2>
            <p className="examens-page-sub">Liste automatique : gérez les présences et les résultats.</p>
          </div>
          {/* Bouton ajouter supprimé ici */}
        </div>

        <div className="stats-grid">
          {statsData.map((item, i) => (
            <motion.div key={i} className="stat-card-modern" whileHover={{ y: -5 }}>
              <div className="stat-left">
                 <span className="stat-label">{item.label}</span>
                 <span className="stat-value">{item.val}</span>
                 <span className={`stat-trend ${item.color}`}>{item.trend}</span>
              </div>
              <div className={`stat-icon ${item.color}`}>{item.icon}</div>
            </motion.div>
          ))}
        </div>

        <div className="examens-filters">
          <SelectFilter 
            value={statusFilter} 
            onChange={setStatusFilter} 
            options={["Tous", "Scheduled", "Passed", "Failed"]} 
            label="Filtrer par Statut" 
          />
          <SelectFilter 
            value={typeFilter} 
            onChange={setTypeFilter} 
            options={["Tous", "Code", "Créneau", "Circulation"]} 
            label="Type d'Examen" 
          />
        </div>

        <div style={{ background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}>
  <div style={{ maxHeight: "500px", overflowY: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <tr style={{ background: "#2b537e" }}>
          <th style={th}>Candidat(e)</th>
          <th style={th}>Type</th>
          <th style={th}>Date / Heure</th>
          <th style={th}>Lieu</th>
          <th style={th}>Résultat (Cliquer pour changer)</th>
          <th style={th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        <AnimatePresence>
          {filtered.length > 0 ? filtered.map((examen, i) => {
            const st = STATUS_CONFIG[examen.status];
            return (
              <motion.tr
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={examen.id}
                style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC", cursor: "pointer" }}
                onClick={() => setSelectedExamen(examen)}
              >
                <td style={{ ...td, fontWeight: "600" }}>{examen.candidat}</td>
                <td style={td}>{examen.type}</td>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaCalendarDay style={{ color: "#4E96E1", fontSize: 12 }} />
                    <div>{examen.date} <span style={{ color: "#64748b", fontSize: "12px" }}>{examen.heure}</span></div>
                  </div>
                </td>
                <td style={td}>{examen.lieu}</td>
                <td style={td}>
                  <div
                    style={{ 
                      background: st.bg, color: st.color, 
                      display: "inline-flex", alignItems: "center",
                      padding: "4px 10px", borderRadius: "20px",
                      fontWeight: "600", fontSize: "13px", cursor: "pointer"
                    }}
                    onClick={(e) => handleToggleStatus(examen.id, examen.status, e)}
                  >
                    <FaExchangeAlt style={{ marginRight: 8, fontSize: 10 }} />
                    {st.label}
                  </div>
                </td>
                <td style={td}>
                  <button 
                    onClick={(e) => handleRemoveCandidat(examen.id, e)}
                    style={{ background: "#FEF2F2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </motion.tr>
            );
          }) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#A0AEC0" }}>
                Aucun examen trouvé.
              </td>
            </tr>
          )}
        </AnimatePresence>
      </tbody>
    </table>
  </div>
</div>
      </div>

      {/* La modale affiche les infos, mais sans bouton modifier (voir ci-dessous) */}
      <ExamenModal examen={selectedExamen} onClose={() => setSelectedExamen(null)} />
    </div>
  );
};

export default Examens;