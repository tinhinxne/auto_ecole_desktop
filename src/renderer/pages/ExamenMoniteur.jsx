import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarDay, FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaLock, FaTrash } from "react-icons/fa";
import SelectFilter from "../components/SelectFilter";
import ExamenModal from "../components/Examenmodal";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import { useAuth } from "../context/AuthContext";             // ← AJOUT
import { useMyPermissions } from "../context/PermissionsContext"; // ← AJOUT
import "../../styles/Examens.css";

// ── SUPPRIME les 3 constantes codées en dur ──
// const CAN_TOGGLE_STATUS = false;
// const CAN_REMOVE_CANDIDAT = false;
// const CURRENT_MONITEUR = "Moniteur 3";

function LockedTooltip({ children, message = "Permission requise par l'admin" }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative", display:"inline-flex" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{ position:"absolute", bottom:"110%", left:"50%", transform:"translateX(-50%)",
          background:"#1e293b", color:"#fff", padding:"7px 13px", borderRadius:8,
          fontSize:"0.72rem", fontWeight:500, whiteSpace:"nowrap", zIndex:999,
          boxShadow:"0 8px 24px rgba(0,0,0,0.25)", pointerEvents:"none" }}>
          🔒 {message}
          <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)",
            width:0, height:0, borderLeft:"6px solid transparent",
            borderRight:"6px solid transparent", borderTop:"6px solid #1e293b" }} />
        </div>
      )}
    </div>
  );
}

function LockedBanner({ message, onClose }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"10px 20px", background:"linear-gradient(90deg,rgba(239,68,68,0.06),rgba(239,68,68,0.02))",
      border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:"0.8rem", color:"#b91c1c" }}>
        <FaLock /><strong>Action non autorisée</strong> — {message}
      </div>
      <button onClick={onClose} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:16 }}>✕</button>
    </div>
  );
}

const ExamensMoniteur = () => {
  // ← REMPLACE les constantes
  const { currentUser } = useAuth();
  const { CAN_TOGGLE_STATUS, CAN_REMOVE_CANDIDAT } = useMyPermissions();
  const CURRENT_MONITEUR = currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "";

  // ... tout le reste du composant identique à ton fichier original
  const [examensList] = useState([
    { id:3,  candidat:"Karima Alhane",  type:"Créneau",     date:"2026-03-10", heure:"08:00", lieu:"Centre d'examen Naceria",    status:"Scheduled", moniteur:"Moniteur 3" },
    { id:7,  candidat:"Bssad Omar",     type:"Code",        date:"2026-03-12", heure:"09:00", lieu:"Auto-école principal",        status:"Passed",    moniteur:"Moniteur 3" },
    { id:11, candidat:"Kaci Benazzouz", type:"Circulation", date:"2026-03-05", heure:"14:00", lieu:"Centre d'examen Tazebboujt", status:"Scheduled", moniteur:"Moniteur 3" },
    { id:14, candidat:"Nassima Oukili", type:"Code",        date:"2026-03-01", heure:"10:30", lieu:"Auto-école stade",            status:"Failed",    moniteur:"Moniteur 3" },
  ]);

  const [selectedExamen, setSelectedExamen] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [lockedBanner, setLockedBanner] = useState(null);

  const STATUS_CONFIG = {
    Scheduled: { bg:"#e3f2fd", color:"#1565c0", label:"Programmé" },
    Passed:    { bg:"#e8f5e9", color:"#2e7d32", label:"Réussi"    },
    Failed:    { bg:"#ffebee", color:"#c62828", label:"Échoué"    },
  };

  const handleRemoveCandidat = (e) => {
    e.stopPropagation();
    if (!CAN_REMOVE_CANDIDAT) { setLockedBanner("La suppression est réservée aux administrateurs."); return; }
  };

  const handleToggleStatus = (e) => {
    e.stopPropagation();
    if (!CAN_TOGGLE_STATUS) { setLockedBanner("La modification du résultat est réservée aux administrateurs."); return; }
  };

  const filtered = examensList.filter(ex =>
    (statusFilter === "Tous" || ex.status === statusFilter) &&
    (typeFilter   === "Tous" || ex.type   === typeFilter)
  );

  const statsData = [
    { label:"Mes Sessions", val:examensList.length,                                    color:"blue",   icon:<FaUser />,        trend:"Candidats"       },
    { label:"Réussites",    val:examensList.filter(e=>e.status==="Passed").length,     color:"green",  icon:<FaCheckCircle />, trend:"Validés"         },
    { label:"Échecs",       val:examensList.filter(e=>e.status==="Failed").length,     color:"red",    icon:<FaTimesCircle />, trend:"À reprogrammer"  },
    { label:"En attente",   val:examensList.filter(e=>e.status==="Scheduled").length,  color:"orange", icon:<FaClock />,       trend:"À évaluer"       },
  ];

  return (
    <div className="main">
      <div className="header">
        <img src={ConnexionImg} alt="illustration" className="header-img" />
        <h1><img src={SmallCar} alt="" width={40} /> Panneau de contrôle</h1>
        <p>Suivi de mes sessions d'examens — {CURRENT_MONITEUR}</p>
      </div>
      <div className="examens-content">
        {lockedBanner && <LockedBanner message={lockedBanner} onClose={() => setLockedBanner(null)} />}
        <div className="examens-page-header">
          <div>
            <h2 className="examens-page-title">Mes Sessions d'Examen</h2>
            <p className="examens-page-sub">Vue lecture seule — contactez l'admin pour modifier les résultats.</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(148,163,184,0.12)", border:"1px solid #e2e8f0", borderRadius:10, padding:"8px 16px", fontSize:"0.78rem", color:"#64748b", fontWeight:600 }}>
            <FaLock style={{ fontSize:12 }} /> Vue lecture seule
          </div>
        </div>
        <div className="stats-grid">
          {statsData.map((item, i) => (
            <motion.div key={i} className="stat-card-modern" whileHover={{ y:-5 }}>
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
          <SelectFilter value={statusFilter} onChange={setStatusFilter} options={["Tous","Scheduled","Passed","Failed"]} label="Filtrer par Statut" />
          <SelectFilter value={typeFilter}   onChange={setTypeFilter}   options={["Tous","Code","Créneau","Circulation"]} label="Type d'Examen" />
        </div>
        <div className="examens-table-wrap">
          <table className="examens-table">
            <thead>
              <tr><th>Candidat(e)</th><th>Type</th><th>Date / Heure</th><th>Lieu</th><th>Résultat</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((examen, i) => {
                  const st = STATUS_CONFIG[examen.status];
                  return (
                    <motion.tr layout initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, scale:0.95 }}
                      key={examen.id} className={`examens-table__row ${i%2===0?"examens-table__row--even":""}`}
                      onClick={() => setSelectedExamen(examen)}>
                      <td style={{ fontWeight:"600" }}>{examen.candidat}</td>
                      <td>{examen.type}</td>
                      <td>
                        <div className="examens-table__date">
                          <FaCalendarDay style={{ color:"#4E96E1", fontSize:12 }} />
                          <div>{examen.date}<span className="examens-table__heure"> {examen.heure}</span></div>
                        </div>
                      </td>
                      <td>{examen.lieu}</td>
                      <td>
                        {CAN_TOGGLE_STATUS ? (
                          <div className="status-clickable" style={{ background:st.bg, color:st.color }} onClick={handleToggleStatus}>{st.label}</div>
                        ) : (
                          <LockedTooltip message="Modification réservée à l'admin">
                            <div className="status-clickable" style={{ background:st.bg, color:st.color, cursor:"not-allowed", opacity:0.85 }} onClick={handleToggleStatus}>
                              <FaLock style={{ marginRight:6, fontSize:9, opacity:0.6 }} />{st.label}
                            </div>
                          </LockedTooltip>
                        )}
                      </td>
                      <td className="examens-table__actions">
                        {CAN_REMOVE_CANDIDAT ? (
                          <button className="btn-remove" onClick={handleRemoveCandidat}>🗑</button>
                        ) : (
                          <LockedTooltip message="Suppression réservée à l'admin">
                            <button className="btn-remove" style={{ opacity:0.6, cursor:"not-allowed", filter:"grayscale(2)" }} onClick={handleRemoveCandidat}>🗑</button>
                          </LockedTooltip>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      <ExamenModal examen={selectedExamen} onClose={() => setSelectedExamen(null)} readOnly />
    </div>
  );
};

export default ExamensMoniteur;