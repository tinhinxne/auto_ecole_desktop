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

        <div className="examens-table-wrap">
          <table className="examens-table">
            <thead>
              <tr>
                <th>Candidat(e)</th>
                <th>Type</th>
                <th>Date / Heure</th>
                <th>Lieu</th>
                <th>Résultat (Cliquer pour changer)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((examen, i) => {
                  const st = STATUS_CONFIG[examen.status];
                  return (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={examen.id}
                      className={`examens-table__row ${i % 2 === 0 ? "examens-table__row--even" : ""}`}
                      onClick={() => setSelectedExamen(examen)}
                    >
                      <td style={{ fontWeight: "600" }}>{examen.candidat}</td>
                      <td>{examen.type}</td>
                      <td>
                        <div className="examens-table__date">
                          <FaCalendarDay style={{ color: "#4E96E1", fontSize: 12 }} />
                          <div>{examen.date} <span className="examens-table__heure">{examen.heure}</span></div>
                        </div>
                      </td>
                      <td>{examen.lieu}</td>
                      <td>
                        <div 
                          className="status-clickable" 
                          style={{ background: st.bg, color: st.color }}
                          onClick={(e) => handleToggleStatus(examen.id, examen.status, e)}
                        >
                          <FaExchangeAlt style={{ marginRight: 8, fontSize: 10 }} />
                          {st.label}
                        </div>
                      </td>
                      <td className="examens-table__actions">
                        <button className="btn-remove" onClick={(e) => handleRemoveCandidat(examen.id, e)}>
                          <FaTrashAlt />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* La modale affiche les infos, mais sans bouton modifier (voir ci-dessous) */}
      <ExamenModal examen={selectedExamen} onClose={() => setSelectedExamen(null)} />
    </div>
  );
};

export default Examens;
