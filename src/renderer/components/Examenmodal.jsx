

import React from "react";
import { FaTimes, FaUser, FaCalendarDay, FaMapMarkerAlt, FaPhone, FaEnvelope, FaPlus } from "react-icons/fa";
import InfoRow from "./Inforow";
import "./ExamenModal.css";

const typeColor = {
  Code:        { bg: "#e8f5e9", color: "#2e7d32" },
  Créneau:     { bg: "#fff3e0", color: "#e65100" },
  Circulation: { bg: "#fce4ec", color: "#c62828" },
};

const statusConfig = {
  Scheduled: { bg: "#e3f2fd", color: "#1565c0", label: "Scheduled" },
  Passed:    { bg: "#e8f5e9", color: "#2e7d32", label: "Passed"    },
  Failed:    { bg: "#ffebee", color: "#c62828", label: "Failed"    },
};

/* Données fictives liées au candidat — à remplacer par de vraies données */
const CANDIDAT_EXTRA = {
  "Amina Albane": {
    dossier:  "2234",
    moniteur: "Jean Dupont",
    phone:    "077845687",
    email:    "aminaalbane@gmail.com",
    historique: [
      { date: "2026-01-29", type: "Code",        status: "Passed"    },
      { date: "2026-02-10", type: "Créneau",     status: "Passed"    },
      { date: "2026-02-28", type: "Circulation", status: "Failed"    },
      { date: "2026-03-11", type: "Circulation", status: "Scheduled" },
    ],
  },

 "Tinhinane Belarbi":{
  dossier:"2733",
  miniteur:"Salim Chellou",
  phone:"055845687",
  email:"tinhianebelarbi@gmail.com",
  historique:[
    {date:"2026-03-10", type:"Code" , status:"Scheduled" }
  ]
 }
};

const DEFAULT_EXTRA = {
  dossier:  "—",
  moniteur: "—",
  phone:    "—",
  email:    "—",
  historique: [],
};

const ExamenModal = ({ examen, onClose }) => {
  if (!examen) return null;

  const tp    = typeColor[examen.type]      || { bg: "#eee", color: "#333" };
  const st    = statusConfig[examen.status] || { bg: "#eee", color: "#333", label: examen.status };
  const extra = CANDIDAT_EXTRA[examen.candidat] || DEFAULT_EXTRA;

  const totalExamens = extra.historique.length;
  const reussis      = extra.historique.filter((h) => h.status === "Passed").length;
  const echoues      = extra.historique.filter((h) => h.status === "Failed").length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal__header">
          <div>
            <h3 className="modal__title">Détails de l'examen</h3>
            <p className="modal__subtitle">Informations complètes sur l'examen</p>
          </div>
          <button className="modal__close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* ── Candidat ── */}
        <div className="modal__section">
          <div className="modal__avatar-row">
            <div className="modal__avatar">
              <FaUser style={{ color: "#4E96E1", fontSize: 22 }} />
            </div>
            <div>
              <div className="modal__candidat-name">{examen.candidat}</div>
              <div className="modal__candidat-role">Candidat(e)</div>
            </div>
          </div>
        </div>

        <div className="modal__divider" />

        {/* ── Dossier + Moniteur ── */}
        <div className="modal__section modal__section--meta">
          <div className="modal__meta-row">
            <span className="modal__meta-label">numéro du dossier :</span>
            <span className="modal__meta-value">{extra.dossier}</span>
          </div>
          <div className="modal__meta-row">
            <span className="modal__meta-label">Moniteur assigné :</span>
            <span className="modal__meta-value">{extra.moniteur}</span>
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="modal__section modal__section--contact">
          <span className="modal__meta-label">Contact :</span>
          <div className="modal__contact-row">
            <span className="modal__contact-item">
              <FaPhone style={{ color: "#555", fontSize: 12 }} />
              {extra.phone}
            </span>
            <span className="modal__contact-item">
              <FaEnvelope style={{ color: "#555", fontSize: 12 }} />
              {extra.email}
            </span>
          </div>
        </div>

        <div className="modal__divider" />

        {/* ── Récap examens ── */}
        <div className="modal__section modal__section--recap">
          <div className="modal__recap-badge modal__recap-badge--total">
            Total examens : {totalExamens}
          </div>
          <div className="modal__recap-badge modal__recap-badge--passed">
            Réussis : {reussis}
          </div>
          <div className="modal__recap-badge modal__recap-badge--failed">
            Échoués : {echoues}
          </div>
        </div>

        {/* ── Tableau historique ── */}
        {extra.historique.length > 0 && (
          <div className="modal__historique-wrap">
            <table className="modal__historique-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>Type d'examen</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {extra.historique.map((h, i) => {
                  const htp = typeColor[h.type]      || { bg: "#eee", color: "#333" };
                  const hst = statusConfig[h.status] || { bg: "#eee", color: "#333", label: h.status };
                  return (
                    <tr key={i} className={i % 2 === 0 ? "modal__historique-row--even" : ""}>
                      <td>{h.date}</td>
                      <td>
                        <span className="badge" style={{ background: htp.bg, color: htp.color }}>
                          {h.type}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: hst.bg, color: hst.color }}>
                          {hst.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal__divider" />

        {/* ── Info grid (examen actuel) ── */}
        <div className="modal__info-grid">
          <InfoRow
            label="Type d'examen"
            value={
              <span className="badge" style={{ background: tp.bg, color: tp.color }}>
                {examen.type}
              </span>
            }
          />
          <InfoRow
            label="Date"
            value={
              <span className="modal__icon-value">
                <FaCalendarDay style={{ color: "#4E96E1" }} />
                {examen.date}
              </span>
            }
          />
          <InfoRow label="Heure" value={examen.heure} />
          <InfoRow
            label="Lieu"
            value={
              <span className="modal__icon-value">
                <FaMapMarkerAlt style={{ color: "#E44C3C" }} />
                {examen.lieu}
              </span>
            }
          />
          <InfoRow
            label="Statut"
            value={
              <span className="badge" style={{ background: st.bg, color: st.color }}>
                {st.label}
              </span>
            }
          />
        </div>

        <div className="modal__divider" />

        {/* ── Footer ── */}
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>Annuler</button>
          <button className="btn btn--primary">
            <FaPlus style={{ marginRight: 6, fontSize: 11 }} />
           Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamenModal;