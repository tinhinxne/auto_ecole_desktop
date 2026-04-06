import React, { useState } from "react";
import { motion } from "framer-motion"; // Pour les mêmes animations que le Dashboard
import { FaPlus, FaCalendarDay, FaCheckCircle, FaTimesCircle, FaChartLine, FaClock } from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import SelectFilter from "../components/SelectFilter";
import ExamenModal from "../components/Examenmodal";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import "../../styles/Examens.css";

/* ──────────────────────────────────────────────
   DATA & CONFIG
────────────────────────────────────────────── */
const EXAMENS = [
  { id: 1, candidat: "Tinhinane Belarbi", type: "Code", date: "2026-03-10", heure: "08:00", lieu: "Centre d'examen Naceria", status: "Scheduled" },
  { id: 2, candidat: "Sonia Benazzouz", type: "Créneau", date: "2026-03-10", heure: "14:00", lieu: "Auto-école principal", status: "Scheduled" },
  { id: 5, candidat: "Hadjer Berkani", type: "Code", date: "2026-03-05", heure: "11:00", lieu: "Centre d'examen Tazebboujt", status: "Passed" },
  { id: 6, candidat: "Melissa Azil", type: "Circulation", date: "2026-03-01", heure: "09:30", lieu: "Auto-école stade", status: "Failed" },
];

const TYPE_COLOR = {
  Code: { bg: "#e8f5e9", color: "#2e7d32" },
  Créneau: { bg: "#fff3e0", color: "#e65100" },
  Circulation: { bg: "#fce4ec", color: "#c62828" },
};

const STATUS_CONFIG = {
  Scheduled: { bg: "#e3f2fd", color: "#1565c0", label: "Scheduled" },
  Passed: { bg: "#e8f5e9", color: "#2e7d32", label: "Passed" },
  Failed: { bg: "#ffebee", color: "#c62828", label: "Failed" },
};

const Examens = () => {
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [typeFilter, setTypeFilter] = useState("Tous");

  const filtered = EXAMENS.filter((e) => {
    const matchStatus = statusFilter === "Tous" || e.status === statusFilter;
    const matchType = typeFilter === "Tous" || e.type === typeFilter;
    return matchStatus && matchType;
  });

  // Data pour les cards style Dashboard
  const statsData = [
    { label: "Examens Planifiés", val: "4", color: "blue", icon: <FaClock />, trend: "A venir" },
    { label: "Candidats Réussis", val: "1", color: "green", icon: <FaCheckCircle />, trend: "+1 ce mois" },
    { label: "Candidats Échoués", val: "1", color: "red", icon: <FaTimesCircle />, trend: "-2% global" },
    { label: "Taux de Réussite", val: "50%", color: "orange", icon: <FaChartLine />, trend: "Stable" }
  ];

  return (
    <div className="main">
      {/* HEADER IDENTIQUE DASHBOARD */}
      <div className="header">
        <img src={ConnexionImg} alt="illustration" className="header-img" />
        <h1>
          <img src={SmallCar} alt="" width={40} /> Panneau de contrôle de l'auto-école
        </h1>
        <p>Gérer les étudiants, les leçons et les examens</p>
      </div>

      <div className="examens-content">
        <div className="examens-page-header">
          <div>
            <h2 className="examens-page-title">Examens</h2>
            <p className="examens-page-sub">Gérer et suivre les examens de conduite</p>
          </div>
          <button className="examens-btn-planifier">
            <FaPlus style={{ marginRight: 6 }} /> Planifier un examen
          </button>
        </div>

        {/* SECTION STATS STYLE DASHBOARD (GRID 4 COLONNES) */}
        <div className="stats-grid">
          {statsData.map((item, i) => (
            <motion.div 
              key={i} 
              className="stat-card-modern"
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="stat-left">
                 <span className="stat-label">{item.label}</span>
                 <span className="stat-value">{item.val}</span>
                 <span className={`stat-trend ${item.color}`}>{item.trend}</span>
              </div>
              <div className={`stat-icon ${item.color}`}>{item.icon}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="examens-filters">
          <SelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={["Tous", "Scheduled", "Passed", "Failed"]}
            label="Status"
          />
          <SelectFilter
            value={typeFilter}
            onChange={setTypeFilter}
            options={["Tous", "Code", "Créneau", "Circulation"]}
            label="Type Examen"
          />
        </div>

        {/* Table */}
        <div className="examens-table-wrap">
          <table className="examens-table">
            <thead>
              <tr>
                <th>Candidat(e)</th>
                <th>Type d'examen</th>
                <th>Date et heure</th>
                <th>Lieu</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((examen, i) => {
                const tp = TYPE_COLOR[examen.type] || { bg: "#eee", color: "#333" };
                const st = STATUS_CONFIG[examen.status] || { bg: "#eee", color: "#333", label: examen.status };
                return (
                  <tr
                    key={examen.id}
                    className={`examens-table__row ${i % 2 === 0 ? "examens-table__row--even" : ""}`}
                    onClick={() => setSelectedExamen(examen)}
                  >
                    <td>{examen.candidat}</td>
                    <td>
                      <span className="badge" style={{ background: tp.bg, color: tp.color }}>
                        {examen.type}
                      </span>
                    </td>
                    <td>
                      <div className="examens-table__date">
                        <FaCalendarDay style={{ color: "#4E96E1", fontSize: 12 }} />
                        <div>
                          <div>{examen.date}</div>
                          <div className="examens-table__heure">{examen.heure}</div>
                        </div>
                      </div>
                    </td>
                    <td>{examen.lieu}</td>
                    <td>
                      <span className="badge" style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="examens-table__actions">-</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ExamenModal examen={selectedExamen} onClose={() => setSelectedExamen(null)} />
    </div>
  );
};

export default Examens;