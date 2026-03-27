import React from "react";
import { FaTimes, FaUser, FaCalendarDay, FaMapMarkerAlt } from "react-icons/fa";
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

const ExamenModal = ({ examen, onClose }) => {
  if (!examen) return null;

  const tp = typeColor[examen.type]       || { bg: "#eee", color: "#333" };
  const st = statusConfig[examen.status]  || { bg: "#eee", color: "#333", label: examen.status };

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

        {/* ── Info grid ── */}
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
          <button className="btn btn--secondary" onClick={onClose}>Fermer</button>
          <button className="btn btn--primary">Modifier</button>
        </div>
      </div>
    </div>
  );
};

export default ExamenModal;