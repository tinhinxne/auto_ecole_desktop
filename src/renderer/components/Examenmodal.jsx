import React from "react";
import { FaTimes, FaUser, FaCalendarDay, FaMapMarkerAlt, FaPhone, FaEnvelope, FaPlus, FaClock } from "react-icons/fa";
import InfoRow from "./Inforow";
import Button from "./Button";

const typeColor = {
  Code: { bg: "#e8f5e9", color: "#2e7d32" },
  Créneau: { bg: "#fff3e0", color: "#e65100" },
  Circulation: { bg: "#fce4ec", color: "#c62828" },
};

const statusConfig = {
  Scheduled: { bg: "#e3f2fd", color: "#1565c0", label: "Programmé" },
  Passed: { bg: "#e8f5e9", color: "#2e7d32", label: "Réussi" },
  Failed: { bg: "#ffebee", color: "#c62828", label: "Échoué" },
};

const CANDIDAT_EXTRA = {
  "Amina Albane": {
    dossier: "2234",
    moniteur: "Jean Dupont",
    phone: "077845687",
    email: "aminaalbane@gmail.com",
    historique: [
      { date: "2026-01-29", type: "Code", status: "Passed" },
      { date: "2026-02-10", type: "Créneau", status: "Passed" },
      { date: "2026-02-28", type: "Circulation", status: "Failed" },
      { date: "2026-03-11", type: "Circulation", status: "Scheduled" },
    ],
  },
  "Tinhinane Belarbi": {
    dossier: "2733",
    moniteur: "Salim Chellou",
    phone: "055845687",
    email: "tinhianebelarbi@gmail.com",
    historique: [{ date: "2026-03-10", type: "Code", status: "Scheduled" }]
  }
};

const DEFAULT_EXTRA = { dossier: "—", moniteur: "—", phone: "—", email: "—", historique: [] };

const ExamenModal = ({ examen, onClose }) => {
  if (!examen) return null;

  const tp = typeColor[examen.type] || { bg: "#eee", color: "#333" };
  const st = statusConfig[examen.status] || { bg: "#eee", color: "#333", label: examen.status };
  const extra = CANDIDAT_EXTRA[examen.candidat] || DEFAULT_EXTRA;

  const totalExamens = extra.historique.length;
  const reussis = extra.historique.filter((h) => h.status === "Passed").length;
  const echoues = extra.historique.filter((h) => h.status === "Failed").length;

  // --- STYLES SYSTÈME PAIEMENT ---
  const s = {
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    content: { background: "#fff", borderRadius: "20px", width: "90%", maxWidth: "550px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #E5E7EB", background: "#F9FAFB", borderRadius: "20px 20px 0 0" },
    title: { fontSize: "20px", fontWeight: "600", color: "#111827", margin: 0 },
    closeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6B7280", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" },
    body: { padding: "24px" },
    candidateName: { fontSize: "18px", fontWeight: "600", color: "#4E96E1", marginBottom: "12px" },
    infoText: { fontSize: "14px", color: "#374151", marginBottom: "8px" },
    sectionTitle: { fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "16px", marginTop: "24px" },
    historyTable: { width: "100%", borderCollapse: "collapse", marginTop: "12px" },
    tableHeader: { background: "#F9FAFB", padding: "10px 12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6B7280", borderBottom: "1px solid #E5E7EB" },
    tableCell: { padding: "10px 12px", fontSize: "13px", color: "#374151", borderBottom: "1px solid #F3F4F6" },
    badge: (bg, col) => ({ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", background: bg, color: col, display: "inline-block" }),
    recapBadge: (bg, col, border) => ({ padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: bg, color: col, border: `1.5px solid ${border}`, marginRight: "8px" })
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.content} onClick={(e) => e.stopPropagation()}>
        
        {/* --- HEADER (Style Paiement) --- */}
        <div style={s.header}>
          <h3 style={s.title}>Détails de l'examen</h3>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={s.body}>
          {/* --- CANDIDAT --- */}
          <div style={s.candidateName}>{examen.candidat}</div>
          
          <div style={s.infoText}><strong>Numéro du dossier :</strong> {extra.dossier}</div>
          <div style={s.infoText}><strong>Moniteur assigné :</strong> {extra.moniteur}</div>

          {/* --- CONTACT --- */}
          <div style={{ display: "flex", gap: "20px", margin: "12px 0" }}>
            <span style={s.infoText}><FaPhone size={12} color="#6B7280"/> {extra.phone}</span>
            <span style={s.infoText}><FaEnvelope size={12} color="#6B7280"/> {extra.email}</span>
          </div>

          <div style={{ height: "1px", background: "#E5E7EB", margin: "20px 0" }} />

          {/* --- RÉCAP EXAMENS (Tes Badges dans le style Paiement) --- */}
          <div style={{ display: "flex", marginBottom: "20px" }}>
            <span style={s.recapBadge("#e8f3fd", "#1565c0", "#b3d4f5")}>Total : {totalExamens}</span>
            <span style={s.recapBadge("#e8f5e9", "#2e7d32", "#a5d6a7")}>Réussis : {reussis}</span>
            <span style={s.recapBadge("#ffebee", "#c62828", "#ef9a9a")}>Échoués : {echoues}</span>
          </div>

          {/* --- TABLEAU HISTORIQUE --- */}
          <div style={s.sectionTitle}>Historique complet</div>
          <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #F3F4F6", borderRadius: "12px" }}>
            <table style={s.historyTable}>
              <thead>
                <tr>
                  <th style={s.tableHeader}>DATE</th>
                  <th style={s.tableHeader}>TYPE D'EXAMEN</th>
                  <th style={s.tableHeader}>STATUT</th>
                </tr>
              </thead>
              <tbody>
                {extra.historique.map((h, i) => {
                  const htp = typeColor[h.type] || { bg: "#eee", color: "#333" };
                  const hst = statusConfig[h.status] || { bg: "#eee", color: "#333", label: h.status };
                  return (
                    <tr key={i}>
                      <td style={s.tableCell}>{h.date}</td>
                      <td style={s.tableCell}>
                        <span style={s.badge(htp.bg, htp.color)}>{h.type}</span>
                      </td>
                      <td style={s.tableCell}>
                        <span style={s.badge(hst.bg, hst.color)}>{hst.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* --- INFO GRID (Détails Examen Actuel) --- */}
          <div style={s.sectionTitle}>Informations sur l'examen actuel</div>
          <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "12px" }}>
            <InfoRow label="Type d'examen" value={<span style={s.badge(tp.bg, tp.color)}>{examen.type}</span>} />
            <InfoRow label="Date" value={<><FaCalendarDay color="#4E96E1" style={{marginRight: 6}}/> {examen.date}</>} />
            <InfoRow label="Heure" value={<><FaClock color="#4E96E1" style={{marginRight: 6}}/> {examen.heure}</>} />
            <InfoRow label="Lieu" value={<><FaMapMarkerAlt color="#E44C3C" style={{marginRight: 6}}/> {examen.lieu}</>} />
            <InfoRow label="Statut" value={<span style={s.badge(st.bg, st.color)}>{st.label}</span>} />
          </div>

          {/* --- FOOTER (Boutons Style Paiement) --- */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            <Button variant="primary">
              <FaPlus style={{ marginRight: 8 }} /> Modifier l'examen
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExamenModal;