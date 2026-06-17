// src/renderer/components/ModalConges.jsx
// Modale complète pour gérer : congé annuel auto-école + congés perso moniteurs
import React, { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, CalendarOff, User, Building2 } from "lucide-react";
import { useCongeCtx }        from "../context/CongeContext";
import { useExamenRulesCtx }  from "../context/ExamenRulesContext";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const MOIS = [
  { value: 1, label: "Janvier" }, { value: 2, label: "Février" },
  { value: 3, label: "Mars" },    { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },     { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" }, { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },{ value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },{ value: 12, label: "Décembre" },
];

const RAISONS = [
  { value: "maladie",  label: "🤒 Maladie",  color: "#ef4444" },
  { value: "voyage",   label: "✈️ Voyage",   color: "#3b82f6" },
  { value: "familial", label: "👨‍👩‍👧 Raison familiale", color: "#f59e0b" },
  { value: "autre",    label: "📋 Autre",    color: "#8b5cf6" },
];

const Toggle = ({ value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    style={{
      width: 42, height: 24, borderRadius: 12,
      background: value ? "#6c63ff" : "#cbd5e1",
      cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}
  >
    <div style={{
      position: "absolute", top: 3, left: value ? 20 : 3,
      width: 18, height: 18, borderRadius: "50%",
      background: "white", transition: "left 0.2s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }} />
  </div>
);

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });
};

const isExpired = (dateFin) => new Date(dateFin) < new Date();
const isActive  = (dateDebut, dateFin) => {
  const now = new Date();
  return new Date(dateDebut) <= now && now <= new Date(dateFin);
};

/* ── Composant principal ─────────────────────────────────────────────────── */
const ModalConges = ({ onClose }) => {
  // Congé annuel auto-école → ExamenRulesContext (déjà existant)
  const { examRules, saveExamRules } = useExamenRulesCtx();

  // Congés personnels moniteurs → CongeContext
  const { getCongesMoniteur, addCongeMoniteur, removeCongeMoniteur } = useCongeCtx();

  /* Tab actif */
  const [tab, setTab] = useState("autoecole"); // "autoecole" | "moniteurs"

  /* ── Tab 1 : Congé auto-école ── */
  const [conge, setConge] = useState({
    actif:     examRules.congeActif     ?? true,
    moisDebut: examRules.congeMoisDebut ?? 8,
    moisFin:   examRules.congeMoisFin   ?? 8,
  });

  /* ── Tab 2 : Congés moniteurs ── */
  const [moniteurs, setMoniteurs]         = useState([]);
  const [selectedId, setSelectedId]       = useState(null);
  const [showForm, setShowForm]           = useState(false);
  const [form, setForm]                   = useState({ dateDebut: "", dateFin: "", raison: "maladie" });
  const [formError, setFormError]         = useState("");
  const [congesLocaux, setCongesLocaux]   = useState([]);

  useEffect(() => {
    window.electron.getMoniteurs().then((list) => {
      setMoniteurs(list);
      if (list.length > 0) {
        const firstId = list[0].id;
        setSelectedId(firstId);
        setCongesLocaux(getCongesMoniteur(firstId));
      }
    });
  }, []);

  const handleSelectMoniteur = (id) => {
    const numId = Number(id);
    setSelectedId(numId);
    setCongesLocaux(getCongesMoniteur(numId));
    setShowForm(false);
    setFormError("");
  };

  const handleAddConge = () => {
    if (!form.dateDebut || !form.dateFin) {
      setFormError("Veuillez renseigner les deux dates.");
      return;
    }
    if (new Date(form.dateFin) < new Date(form.dateDebut)) {
      setFormError("La date de fin doit être après la date de début.");
      return;
    }
    addCongeMoniteur(selectedId, form);
    setCongesLocaux(getCongesMoniteur(selectedId));
    // Refresh après ajout (le context est synchrone, on re-lit)
    setTimeout(() => setCongesLocaux(getCongesMoniteur(selectedId)), 50);
    setForm({ dateDebut: "", dateFin: "", raison: "maladie" });
    setShowForm(false);
    setFormError("");
  };

  const handleRemove = (congeId) => {
    removeCongeMoniteur(selectedId, congeId);
    setTimeout(() => setCongesLocaux(getCongesMoniteur(selectedId)), 50);
  };

  const handleSaveAutoEcole = () => {
    // On merge dans examRules pour ne pas écraser les autres règles
    saveExamRules({
      ...examRules,
      congeActif:     conge.actif,
      congeMoisDebut: conge.moisDebut,
      congeMoisFin:   conge.moisFin,
    });
    onClose();
  };

  const moisDebutLabel = MOIS.find(m => m.value === conge.moisDebut)?.label || "Août";
  const moisFinLabel   = MOIS.find(m => m.value === conge.moisFin)?.label   || "Août";
  const memesMois      = conge.moisDebut === conge.moisFin;

  const selectedMoniteur = moniteurs.find(m => m.id === selectedId);
  const raisionInfo = (r) => RAISONS.find(x => x.value === r) || RAISONS[3];

  /* ── Render ── */
  return (
    <div className="modal-overlay">
      <div className="modal new-modal" style={{ maxWidth: 500, width: "94%" }}>

        {/* Header */}
        <div className="new-modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarOff size={18} /> Gestion des congés
          </h2>
          <span className="close" onClick={onClose}><X size={16} /></span>
        </div>
        <hr />

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {[
            { key: "autoecole", icon: <Building2 size={14} />, label: "Auto-école" },
            { key: "moniteurs", icon: <User size={14} />,      label: "Moniteurs"  },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 13, transition: "all 0.2s",
                background: tab === t.key ? "#6c63ff" : "#f1f5f9",
                color:      tab === t.key ? "white"   : "#64748b",
                boxShadow:  tab === t.key ? "0 2px 8px rgba(108,99,255,0.25)" : "none",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB : Auto-école ── */}
        {tab === "autoecole" && (
          <>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
              Définissez la période de fermeture annuelle. Les séances seront automatiquement
              bloquées sur cette plage.
            </p>

            <div style={{
              background: conge.actif ? "#fff7ed" : "#f1f5f9",
              border: `1.5px solid ${conge.actif ? "#fb923c" : "#cbd5e1"}`,
              borderRadius: 14, padding: 16, transition: "all 0.25s",
            }}>
              {/* Toggle + résumé */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: conge.actif ? 16 : 0 }}>
                <span style={{ fontSize: 24 }}>🏖️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: conge.actif ? "#c2410c" : "#64748b" }}>
                    Période de fermeture annuelle
                  </div>
                  <div style={{ fontSize: 11, color: conge.actif ? "#ea580c" : "#94a3b8", marginTop: 2 }}>
                    {conge.actif
                      ? memesMois
                        ? `Bloqué en ${moisDebutLabel}`
                        : `Bloqué de ${moisDebutLabel} à ${moisFinLabel}`
                      : "Aucun blocage — séances ouvertes toute l'année"}
                  </div>
                </div>
                <Toggle value={conge.actif} onChange={v => setConge(c => ({ ...c, actif: v }))} />
              </div>

              {conge.actif && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { key: "moisDebut", label: "Début", filter: () => MOIS },
                    { key: "moisFin",   label: "Fin",   filter: () => MOIS.filter(m => m.value >= conge.moisDebut) },
                  ].map(({ key, label, filter }) => (
                    <div key={key} style={{
                      background: "#fff", border: "1px solid #fed7aa",
                      borderRadius: 10, padding: "10px 14px",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#9a3412", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                        {label} du congé
                      </div>
                      <select
                        value={conge[key]}
                        onChange={e => setConge(c => ({ ...c, [key]: Number(e.target.value) }))}
                        style={{
                          width: "100%", padding: "6px 8px", borderRadius: 8,
                          border: "1px solid #fed7aa", fontSize: 13,
                          background: "#fff7ed", cursor: "pointer",
                          color: "#7c2d12", fontWeight: 600, outline: "none",
                        }}
                      >
                        {filter().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="new-modal-footer" style={{ marginTop: 20 }}>
              <button className="btn cancel" onClick={onClose}><X size={13} /> Annuler</button>
              <button className="btn primary" onClick={handleSaveAutoEcole}><Save size={13} /> Sauvegarder</button>
            </div>
          </>
        )}

        {/* ── TAB : Moniteurs ── */}
        {tab === "moniteurs" && (
          <>
            {/* Sélecteur moniteur */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>Moniteur :</span>
              <select
                value={selectedId ?? ""}
                onChange={e => handleSelectMoniteur(e.target.value)}
                style={{
                  padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0",
                  fontSize: 13, background: "#f8faff", cursor: "pointer",
                }}
              >
                {moniteurs.map(m => (
                  <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                ))}
              </select>
            </div>

            {/* Liste des congés existants */}
            <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 12 }}>
              {congesLocaux.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "28px 0",
                  color: "#94a3b8", fontSize: 13,
                }}>
                  <CalendarOff size={28} style={{ opacity: 0.3, marginBottom: 6 }} /><br />
                  Aucun congé enregistré pour ce moniteur
                </div>
              ) : (
                congesLocaux.map((c) => {
                  const r = raisionInfo(c.raison);
                  const actif    = isActive(c.dateDebut, c.dateFin);
                  const expire   = isExpired(c.dateFin);
                  const statusLabel = actif ? "En cours" : expire ? "Terminé" : "À venir";
                  const statusColor = actif ? "#22c55e" : expire ? "#94a3b8" : "#f59e0b";
                  return (
                    <div key={c.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: expire ? "#f8fafc" : actif ? "#f0fdf4" : "#fefce8",
                      border: `1px solid ${expire ? "#e2e8f0" : actif ? "#bbf7d0" : "#fde68a"}`,
                      borderRadius: 10, padding: "10px 12px", marginBottom: 8,
                      opacity: expire ? 0.7 : 1,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: r.color + "18",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, flexShrink: 0,
                      }}>
                        {r.label.split(" ")[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>
                          {r.label.slice(3)}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                          {formatDate(c.dateDebut)} → {formatDate(c.dateFin)}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px",
                          borderRadius: 20, background: statusColor + "20", color: statusColor,
                        }}>
                          {statusLabel}
                        </span>
                        <button
                          onClick={() => handleRemove(c.id)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#ef4444", padding: 2, borderRadius: 6,
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bouton ajouter / Formulaire */}
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  width: "100%", padding: "9px", borderRadius: 10,
                  border: "1.5px dashed #cbd5e1", background: "#f8faff",
                  color: "#6c63ff", fontWeight: 600, fontSize: 13,
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6,
                }}
              >
                <Plus size={14} /> Ajouter un congé
              </button>
            ) : (
              <div style={{
                background: "#f8faff", border: "1.5px solid #c7d2fe",
                borderRadius: 12, padding: 14,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#4338ca", marginBottom: 10 }}>
                  Nouveau congé — {selectedMoniteur?.prenom} {selectedMoniteur?.nom}
                </div>

                {/* Raison */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>
                    RAISON
                  </label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {RAISONS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setForm(f => ({ ...f, raison: r.value }))}
                        style={{
                          padding: "4px 10px", borderRadius: 20, fontSize: 12,
                          border: "1.5px solid",
                          borderColor: form.raison === r.value ? r.color : "#e2e8f0",
                          background: form.raison === r.value ? r.color + "18" : "white",
                          color: form.raison === r.value ? r.color : "#64748b",
                          cursor: "pointer", fontWeight: form.raison === r.value ? 700 : 400,
                          transition: "all 0.15s",
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  {[
                    { key: "dateDebut", label: "DATE DE DÉBUT" },
                    { key: "dateFin",   label: "DATE DE FIN"   },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>
                        {label}
                      </label>
                      <input
                        type="date"
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        style={{
                          width: "100%", padding: "6px 8px", borderRadius: 8,
                          border: "1px solid #c7d2fe", fontSize: 13,
                          background: "white", outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {formError && (
                  <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>
                    ⚠️ {formError}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setShowForm(false); setFormError(""); }}
                    style={{
                      flex: 1, padding: "7px", borderRadius: 8, border: "1px solid #e2e8f0",
                      background: "white", color: "#64748b", fontSize: 12, cursor: "pointer",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddConge}
                    style={{
                      flex: 2, padding: "7px", borderRadius: 8, border: "none",
                      background: "#6c63ff", color: "white",
                      fontSize: 12, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    }}
                  >
                    <Save size={12} /> Enregistrer le congé
                  </button>
                </div>
              </div>
            )}

            <div className="new-modal-footer" style={{ marginTop: 14 }}>
              <button className="btn cancel" onClick={onClose}><X size={13} /> Fermer</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModalConges;