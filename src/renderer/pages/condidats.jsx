import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import "../../styles/condidats.css";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import { SquarePen, Trash, Phone, Mail, X, Send } from "lucide-react";
import AddCandidatModal from "../components/addCondidat";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getInitials = (prenom, nom) =>
  `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();

// ─────────────────────────────────────────────
// Modale Contact Email
// ─────────────────────────────────────────────
const SUBJECTS = [
  "Rappel de séance",
  "Convocation à l'examen",
  "Retard de paiement",
  "Félicitations",
  "Autre",
];

function ContactModal({ candidat, onClose }) {
  const [sujet,       setSujet]       = useState(SUBJECTS[0]);
  const [sujetCustom, setSujetCustom] = useState("");
  const [message,     setMessage]     = useState("");
  const [sending,     setSending]     = useState(false);
  const [sent,        setSent]        = useState(false);
  const [error,       setError]       = useState("");

  const email      = candidat._raw?.email;
  const hasEmail   = !!email;
  const nomComplet = `${candidat.prenom} ${candidat.nom}`;

  const handleSend = async () => {
    const sujetFinal = sujet === "Autre" ? sujetCustom.trim() : sujet;
    if (!message.trim())                          { setError("Le message ne peut pas être vide."); return; }
    if (sujet === "Autre" && !sujetCustom.trim()) { setError("Veuillez saisir un sujet."); return; }
    if (!hasEmail)                                { setError("Ce candidat n'a pas d'adresse email enregistrée."); return; }
    setSending(true);
    setError("");
    try {
      const result = await window.electron.sendCandidatMessage({
        email,
        nomCandidat: nomComplet,
        sujet: sujetFinal,
        message,
      });
      if (result?.success) setSent(true);
      else setError("Erreur lors de l'envoi. Vérifiez votre connexion.");
    } catch (err) {
      setError("Erreur inattendue : " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "inherit",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 16,
        width: 480, maxWidth: "95vw",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        animation: "slideUp .22s cubic-bezier(.34,1.56,.64,1)",
      }}>
        <style>{`
          @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
          @keyframes spin    { to{transform:rotate(360deg)} }
        `}</style>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px 14px", borderBottom: "1px solid #e2e8f0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#dbeafe", color: "#185fa5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700,
            }}>
              {getInitials(candidat.prenom, candidat.nom)}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                Contacter {nomComplet}
              </div>
              <div style={{ fontSize: 12, color: hasEmail ? "#64748b" : "#ef4444" }}>
                {hasEmail ? email : "⚠ Pas d'email enregistré"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", borderRadius: 8,
            width: 32, height: 32, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#64748b",
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        {sent ? (
          <div style={{
            padding: "40px 24px", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Send size={24} color="#16a34a" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Email envoyé !</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Le message a été transmis à <strong>{email}</strong>.
            </div>
            <button onClick={onClose} style={{
              marginTop: 8, padding: "10px 28px", borderRadius: 10,
              background: "#2b537e", border: "none", color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Fermer
            </button>
          </div>
        ) : (
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Sujet */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                Sujet <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={sujet}
                onChange={(e) => { setSujet(e.target.value); setSujetCustom(""); setError(""); }}
                style={{
                  padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 9,
                  fontFamily: "inherit", fontSize: 13, color: "#1e293b",
                  background: "#f8fafc", outline: "none",
                }}
              >
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>

              {/* Champ libre si "Autre" est choisi */}
              {sujet === "Autre" && (
                <input
                  type="text"
                  value={sujetCustom}
                  onChange={(e) => { setSujetCustom(e.target.value); setError(""); }}
                  placeholder="Saisissez votre sujet…"
                  style={{
                    padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 9,
                    fontFamily: "inherit", fontSize: 13, color: "#1e293b",
                    background: "#f8fafc", outline: "none", marginTop: 4,
                  }}
                />
              )}
            </div>

            {/* Message */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                Message <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); setError(""); }}
                placeholder="Saisissez votre message ici…"
                rows={5}
                style={{
                  padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 9,
                  fontFamily: "inherit", fontSize: 13, color: "#1e293b",
                  background: "#f8fafc", outline: "none", resize: "vertical",
                  lineHeight: 1.6,
                }}
              />
            </div>

            {/* Compteur */}
            <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "right", marginTop: -8 }}>
              {message.length} caractère{message.length !== 1 ? "s" : ""}
            </div>

            {/* Erreur */}
            {error && (
              <div style={{
                padding: "9px 13px", borderRadius: 9,
                background: "#fef2f2", border: "1px solid #fca5a5",
                color: "#dc2626", fontSize: 12, fontWeight: 500,
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Pas d'email */}
            {!hasEmail && (
              <div style={{
                padding: "9px 13px", borderRadius: 9,
                background: "#fff7ed", border: "1px solid #fed7aa",
                color: "#c2410c", fontSize: 12, fontWeight: 500,
              }}>
                ⚠ Ce candidat n'a pas d'adresse email. Ajoutez-en une dans sa fiche pour pouvoir le contacter.
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!sent && (
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 10,
            padding: "14px 22px 18px", borderTop: "1px solid #e2e8f0",
          }}>
            <button onClick={onClose} style={{
              padding: "9px 20px", borderRadius: 10,
              background: "#f1f5f9", border: "none", color: "#64748b",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Annuler
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !hasEmail}
              style={{
                padding: "9px 22px", borderRadius: 10,
                background: sending || !hasEmail ? "#94a3b8" : "#2b537e",
                border: "none", color: "#fff",
                fontSize: 13, fontWeight: 700,
                cursor: sending || !hasEmail ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 7,
                transition: "background .15s",
              }}
            >
              {sending ? (
                <>
                  <div style={{
                    width: 13, height: 13, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTop: "2px solid #fff",
                    animation: "spin .7s linear infinite",
                  }} />
                  Envoi…
                </>
              ) : (
                <><Send size={14} /> Envoyer</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────
const Condidats = () => {
  const [candidats,       setCandidats]       = useState([]);
  const [showModal,       setShowModal]       = useState(false);
  const [editCandidat,    setEditCandidat]    = useState(null);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [contactCandidat, setContactCandidat] = useState(null);

  const th = { padding: "15px 16px", textAlign: "left", color: "#fff", fontWeight: "600", fontSize: "14px" };
  const td = { padding: "14px 16px", borderBottom: "1px solid #E5E7EB", fontSize: "14px", color: "#1F2937" };

  const candidatsFiltres = candidats.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      c.tel.toLowerCase().includes(q) ||
      (c.status && c.status.toLowerCase().includes(q))
    );
  });

  const loadCandidats = async () => {
    try {
      const data    = await window.electron.getCandidats();
      const seances = await window.electron.getSeances();

      const formatted = data.map((c) => {
        const nbSessions = seances.filter((s) => {
          if (!s.candidatsIds) return false;
          const ids = String(s.candidatsIds).split(",").map((id) => parseInt(id.trim()));
          return ids.includes(c.idCandidat);
        }).length;

        return {
          id:          c.idCandidat,
          nom:         c.nom,
          prenom:      c.prenom,
          tel:         c.telephone,
          inscription: c.date_inscription
            ? new Date(c.date_inscription).toISOString().split("T")[0]
            : "",
          dob: c.date_naissance
            ? new Date(c.date_naissance).toISOString().split("T")[0]
            : "",
          sessions: nbSessions,
          status:   c.statut,
          sexe:     c.sexe,
          photo:    c.photo || null,
          _raw:     c,
        };
      });

      setCandidats(formatted);
    } catch (error) {
      console.error("Erreur lors du chargement des candidats :", error);
      setCandidats([]);
    }
  };

  useEffect(() => { loadCandidats(); }, []);

  const handleEdit = (candidat) => {
    setEditCandidat(candidat._raw);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditCandidat(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce candidat ?")) {
      const result = await window.electron.deleteCandidat(id);
      if (result?.success) {
        await loadCandidats();
      } else {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleSave = async (data) => {
    if (data.idCandidat) {
      await window.electron.updateCandidat(data);
    } else {
      await window.electron.addCandidat(data);
    }
    await loadCandidats();
    setShowModal(false);
  };

  return (
    <div className="container">
      <div className="main">

        <div className="header">
          <img src={ConnexionImg} alt="" className="header-img" />
          <h1>
            <img src={SmallCar} alt="" width={40} />
            Panneau de contrôle de l'auto-école
          </h1>
          <p>Gérer les étudiants, les leçons et les examens</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2>Candidats</h2>
              <p>Gérer et suivre tous les candidats</p>
            </div>
            <Button text="+ Ajouter candidat" onClick={handleAdd} />
          </div>

          {/* BARRE DE RECHERCHE */}
          <div style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "center" }}>
            <div style={{
              flex: 1, background: "#fff", padding: "12px 20px",
              borderRadius: "15px", display: "flex", gap: "15px",
              alignItems: "center", border: "1px solid #E2E8F0",
            }}>
              <input
                type="text"
                placeholder="🔍 Rechercher un candidat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, padding: "10px", border: "1px solid #CBD5E0",
                  borderRadius: "10px", outline: "none", fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}>
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr style={{ background: "#2b537e" }}>
                    <th style={th}>Candidat</th>
                    <th style={th}>Contact</th>
                    <th style={th}>Date d'inscription</th>
                    <th style={th}>Progress</th>
                    <th style={th}>Status</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidatsFiltres.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#A0AEC0" }}>
                        Aucun candidat trouvé
                      </td>
                    </tr>
                  ) : (
                    candidatsFiltres.map((c, index) => (
                      <tr key={c.id} style={{ background: index % 2 === 0 ? "#fff" : "#F8FAFC" }}>

                        <td style={td}>{c.nom} {c.prenom}</td>

                        <td style={td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Phone size={15} /> {c.tel}
                          </div>
                        </td>

                        <td style={td}>{c.inscription}</td>

                        <td style={td}>
                          <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${Math.min((c.sessions / 20) * 100, 100)}%` }} />
                          </div>
                          <span className="progress-text">{c.sessions}/20 sessions</span>
                        </td>

                        <td style={td}>
                          <span className={`status ${c.status}`}>{c.status}</span>
                        </td>

                        <td style={td}>
                          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>

                            {/* Modifier */}
                            <SquarePen
                              size={17} color="blue"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleEdit(c)}
                            />

                            {/* Contacter par email */}
                            <Mail
                              size={17}
                              color={c._raw?.email ? "#2b537e" : "#cbd5e1"}
                              style={{ cursor: c._raw?.email ? "pointer" : "default" }}
                              title={c._raw?.email ? `Envoyer un email à ${c.prenom} ${c.nom}` : "Pas d'email enregistré"}
                              onClick={() => { if (c._raw?.email) setContactCandidat(c); }}
                            />

                            {/* Supprimer */}
                            <Trash
                              size={17} color="red"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleDelete(c.id)}
                            />

                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODALE AJOUT / EDIT */}
      <AddCandidatModal
        showModal={showModal}
        setShowModal={setShowModal}
        candidat={editCandidat}
        onSave={handleSave}
      />

      {/* MODALE CONTACT EMAIL */}
      {contactCandidat && (
        <ContactModal
          candidat={contactCandidat}
          onClose={() => setContactCandidat(null)}
        />
      )}
    </div>
  );
};

export default Condidats;