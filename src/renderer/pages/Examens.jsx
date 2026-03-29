

import React, { useState } from "react";
import { FaPlus, FaCalendarDay } from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/Statcard";
import SelectFilter from "../components/SelectFilter";
import ExamenModal from "../components/Examenmodal";
import Connexion from "../../assets/Connexion.png";

import "./Examens.css";

/* ──────────────────────────────────────────────
   STATIC DATA
────────────────────────────────────────────── */
const EXAMENS = [
  {
    id: 1,
    candidat: "Tinhinane Belarbi",
    type: "Code",
    date: "2026-03-10",
    heure: "08:00",
    lieu: "Centre d'examen Naceria",
    status: "Scheduled",
  },
  {
    id: 2,
    candidat: "Sonia Benazzouz",
    type: "Créneau",
    date: "2026-03-10",
    heure: "14:00",
    lieu: "Auto-école principal",
    status: "Scheduled",
  },
  {
    id: 3,
    candidat: "Amina Albane",
    type: "Circulation",
    date: "2026-03-11",
    heure: "10:00",
    lieu: "Centre d'examen stade",
    status: "Scheduled",
  },
  {
    id: 4,
    candidat: "Nadine Bouariche",
    type: "Créneau",
    date: "2026-03-12",
    heure: "15:30",
    lieu: "Auto-école principal",
    status: "Scheduled",
  },
  {
    id: 5,
    candidat: "Hadjer Berkani",
    type: "Code",
    date: "2026-03-05",
    heure: "11:00",
    lieu: "Centre d'examen Tazebboujt",
    status: "Passed",
  },
  {
    id: 6,
    candidat: "Melissa Azil",
    type: "Circulation",
    date: "2026-03-01",
    heure: "09:30",
    lieu: "Auto-école stade",
    status: "Failed",
  },
];

const STATS = [
  { label: "Planifiés",       value: 4,     color: "#1a1a2e" },
  { label: "Réussis",         value: 1,     color: "#2e7d32" },
  { label: "Échoués",         value: 1,     color: "#c62828" },
  { label: "Taux de réussite",value: "50%", color: "#1a1a2e" },
];

const TYPE_COLOR = {
  Code:        { bg: "#e8f5e9", color: "#2e7d32" },
  Créneau:     { bg: "#fff3e0", color: "#e65100" },
  Circulation: { bg: "#fce4ec", color: "#c62828" },
};

const STATUS_CONFIG = {
  Scheduled: { bg: "#e3f2fd", color: "#1565c0", label: "Scheduled" },
  Passed:    { bg: "#e8f5e9", color: "#2e7d32", label: "Passed"    },
  Failed:    { bg: "#ffebee", color: "#c62828", label: "Failed"    },
};

/* ──────────────────────────────────────────────
   PAGE
────────────────────────────────────────────── */
const Examens = () => {
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [statusFilter, setStatusFilter]     = useState("Tous");
  const [typeFilter, setTypeFilter]         = useState("Tous");

  const filtered = EXAMENS.filter((e) => {
    const matchStatus = statusFilter === "Tous" || e.status === statusFilter;
    const matchType   = typeFilter   === "Tous" || e.type   === typeFilter;
    return matchStatus && matchType;
  });

  return (
    <div className="examens-layout">
      <Sidebar />

      <div className="examens-main">
        {/* ── Banner ── */}
        <div className="examens-banner">
          <img
            src={Connexion}
            alt="banner"
            className="examens-banner__img"
          />
        
        </div>

        {/* ── Content ── */}
        <div className="examens-content">

          {/* Page header */}
          <div className="examens-page-header">
            <div>
              <h2 className="examens-page-title">Examens</h2>
              <p className="examens-page-sub">Gérer et suivre les examens de conduite</p>
            </div>
             <button className="examens-btn-planifier">
              <FaPlus style={{ marginRight: 6 }} />
              Planifier un examen
            </button> 
          </div>

          {/* Stats */}
          <div className="examens-stats-row">
            {STATS.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} color={s.color} />
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
                  const tp = TYPE_COLOR[examen.type]         || { bg: "#eee", color: "#333" };
                  const st = STATUS_CONFIG[examen.status]    || { bg: "#eee", color: "#333", label: examen.status };
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
      </div>

      {/* Modal */}
      <ExamenModal
        examen={selectedExamen}
        onClose={() => setSelectedExamen(null)}
      />
    </div>
  );
};

export default Examens;