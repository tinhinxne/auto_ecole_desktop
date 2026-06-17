import React, { useState, useEffect } from "react";
import '../../styles/parametres.css';
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import {
  ChevronRight, UserCog, ClipboardList,
  BookOpen, Check, X, Save,
} from "lucide-react";
import { useRulesCtx } from "../context/RulesContext";
import { usePermissionsCtx } from "../context/PermissionsContext";
import { useExamenRulesCtx } from "../context/ExamenRulesContext";

/* ─── COMPOSANTS REUTILISABLES ─── */

const Toggle = ({ value, onChange }) => (
  <div onClick={() => onChange(!value)} style={{
    width: 42, height: 24, borderRadius: 12,
    background: value ? "#6c63ff" : "#ccc",
    cursor: "pointer", position: "relative",
    transition: "background 0.2s", flexShrink: 0,
  }}>
    <div style={{
      position: "absolute", top: 3,
      left: value ? 20 : 3, width: 18, height: 18,
      borderRadius: "50%", background: "white",
      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }} />
  </div>
);

const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{
    padding: "4px 8px", borderRadius: 8,
    border: "1px solid #ccc", fontSize: 13,
    background: "#f8faff", cursor: "pointer",
  }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

/* ─── NOMS DES MOIS ─── */
const MOIS = [
  { value: 1,  label: "Janvier"   },
  { value: 2,  label: "Février"   },
  { value: 3,  label: "Mars"      },
  { value: 4,  label: "Avril"     },
  { value: 5,  label: "Mai"       },
  { value: 6,  label: "Juin"      },
  { value: 7,  label: "Juillet"   },
  { value: 8,  label: "Août"      },
  { value: 9,  label: "Septembre" },
  { value: 10, label: "Octobre"   },
  { value: 11, label: "Novembre"  },
  { value: 12, label: "Décembre"  },
];

/* ─── MODALE 1 : EXAMENS + CONGÉ ─── */
const ModalExamens = ({ onClose }) => {
  const { examRules, saveExamRules } = useExamenRulesCtx();

  // Règles existantes
  const [rules, setRules] = useState([
    { id: 1, icon: "🕐", label: "Délai après échec",        value: String(examRules.delaiApresEchec), unit: "Jours", color: "#a78bfa", type: "select", rulesKey: "delaiApresEchec" },
    { id: 2, icon: "🔴", label: "Tentatives max",           value: String(examRules.tentativesMax),   unit: null,    color: "#f87171", type: "select", rulesKey: "tentativesMax" },
    { id: 4, icon: "📅", label: "Jours d'examen autorisés", selectedDays: examRules.joursAutorises,   color: "#60a5fa", type: "days",   rulesKey: "joursAutorises" },
  ]);

  // État du congé séparé pour plus de clarté
  const [conge, setConge] = useState({
    actif:      examRules.congeActif      ?? true,
    moisDebut:  examRules.congeMoisDebut  ?? 8,
    moisFin:    examRules.congeMoisFin    ?? 8,
  });

  const daysOptions = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

  const updateRule = (id, key, val) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));

  const toggleDay = (ruleId, day) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const newDays = r.selectedDays.includes(day)
        ? r.selectedDays.filter(d => d !== day)
        : [...r.selectedDays, day];
      return { ...r, selectedDays: newDays };
    }));
  };

  const handleSave = () => {
    const newRules = {
      delaiApresEchec: Number(rules.find(r => r.rulesKey === "delaiApresEchec")?.value || 14),
      tentativesMax:   Number(rules.find(r => r.rulesKey === "tentativesMax")?.value   || 3),
      blocageImpaye:   examRules.blocageImpaye ?? true,
      joursAutorises:  rules.find(r => r.rulesKey === "joursAutorises")?.selectedDays || ["Lun","Mer","Ven"],
      // ── Congé ──
      congeActif:     conge.actif,
      congeMoisDebut: conge.moisDebut,
      congeMoisFin:   conge.moisFin,
    };
    saveExamRules(newRules);
    onClose();
  };

  // Label du mois pour l'affichage
  const moisDebutLabel = MOIS.find(m => m.value === conge.moisDebut)?.label || "Août";
  const moisFinLabel   = MOIS.find(m => m.value === conge.moisFin)?.label   || "Août";
  const memesMois      = conge.moisDebut === conge.moisFin;

  return (
    <div className="modal-overlay">
      <div className="modal new-modal">
        <div className="new-modal-header">
          <h2>Gestion des exceptions :</h2>
          <span className="close" onClick={onClose}><X size={16}/></span>
        </div>
        <hr/>

        {/* ── Règles existantes ── */}
        <p className="new-modal-subtitle">Règles des examens :</p>
        <div className="new-rules-list">
          {rules.map(r => (
            <div className="new-rule-row" key={r.id} style={{
              background: r.color + "15", borderLeft: `4px solid ${r.color}`,
              flexDirection: r.type === "days" ? "column" : "row",
              alignItems: r.type === "days" ? "flex-start" : "center",
              padding: "12px", marginBottom: "8px",
            }}>
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <span className="rule-icon" style={{ marginRight: 10 }}>{r.icon}</span>
                <span className="rule-label" style={{ fontWeight: "600", flex: 1 }}>{r.label}</span>
                <div style={{ marginLeft: "auto" }}>
                  {r.type === "select" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <select
                        value={r.value}
                        onChange={e => updateRule(r.id, "value", e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, background: "#f8faff", cursor: "pointer" }}
                      >
                        {["1","2","3","5","7","14","30"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      {r.unit && <span style={{ fontSize: 12, color: "#666" }}>{r.unit}</span>}
                    </div>
                  )}
                </div>
              </div>
              {r.type === "days" && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", width: "100%", marginTop: 8 }}>
                  {daysOptions.map(day => {
                    const isSel = r.selectedDays.includes(day);
                    return (
                      <button key={day} onClick={() => toggleDay(r.id, day)} style={{
                        padding: "4px 10px", borderRadius: "15px", fontSize: "11px", cursor: "pointer",
                        border: "1px solid", borderColor: isSel ? r.color : "#ccc",
                        background: isSel ? r.color : "white",
                        color: isSel ? "white" : "#666", transition: "0.2s",
                      }}>{day}</button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Section Congé Annuel ── */}
        <p className="new-modal-subtitle" style={{ marginTop: 20 }}>Congé annuel :</p>

        <div style={{
          background: conge.actif ? "#fff7ed" : "#f1f5f9",
          border: `1.5px solid ${conge.actif ? "#fb923c" : "#cbd5e1"}`,
          borderRadius: 12,
          padding: 16,
          transition: "all 0.25s",
        }}>
          {/* En-tête : icône + titre + toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: conge.actif ? 14 : 0 }}>
            <span style={{ fontSize: 22 }}>🏖️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: conge.actif ? "#c2410c" : "#64748b" }}>
                Période de fermeture
              </div>
              <div style={{ fontSize: 11, color: conge.actif ? "#ea580c" : "#94a3b8", marginTop: 2 }}>
                {conge.actif
                  ? memesMois
                    ? `Séances bloquées en ${moisDebutLabel}`
                    : `Séances bloquées de ${moisDebutLabel} à ${moisFinLabel}`
                  : "Aucun blocage actif — les séances restent ouvertes toute l'année"}
              </div>
            </div>
            <Toggle value={conge.actif} onChange={v => setConge(c => ({ ...c, actif: v }))} />
          </div>

          {/* Sélecteurs de mois (visibles seulement si actif) */}
          {conge.actif && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 4,
            }}>
              {/* Mois de début */}
              <div style={{
                background: "#fff",
                border: "1px solid #fed7aa",
                borderRadius: 10,
                padding: "10px 14px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9a3412", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  Début du congé
                </div>
                <select
                  value={conge.moisDebut}
                  onChange={e => setConge(c => ({ ...c, moisDebut: Number(e.target.value) }))}
                  style={{
                    width: "100%", padding: "6px 8px", borderRadius: 8,
                    border: "1px solid #fed7aa", fontSize: 13,
                    background: "#fff7ed", cursor: "pointer", color: "#7c2d12",
                    fontWeight: 600, outline: "none",
                  }}
                >
                  {MOIS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              {/* Mois de fin */}
              <div style={{
                background: "#fff",
                border: "1px solid #fed7aa",
                borderRadius: 10,
                padding: "10px 14px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9a3412", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  Fin du congé
                </div>
                <select
                  value={conge.moisFin}
                  onChange={e => setConge(c => ({ ...c, moisFin: Number(e.target.value) }))}
                  style={{
                    width: "100%", padding: "6px 8px", borderRadius: 8,
                    border: "1px solid #fed7aa", fontSize: 13,
                    background: "#fff7ed", cursor: "pointer", color: "#7c2d12",
                    fontWeight: 600, outline: "none",
                  }}
                >
                  {MOIS.filter(m => m.value >= conge.moisDebut).map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Avertissement si période invalide */}
          {conge.actif && conge.moisFin < conge.moisDebut && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#dc2626", fontWeight: 600 }}>
              ⚠️ Le mois de fin doit être après le mois de début.
            </div>
          )}
        </div>

        <div className="new-modal-footer">
          <button className="btn cancel"  onClick={onClose}><X    size={13}/> Fermer</button>
          <button className="btn primary" onClick={handleSave}><Save size={13}/> Sauvegarder</button>
        </div>
      </div>
    </div>
  );
};

/* ─── MODALE 2 : PERMISSIONS MONITEURS ─── */
const ModalMoniteurs = ({ onClose }) => {
  const { getPermissions, updatePermissions } = usePermissionsCtx();

  const [moniteurs,  setMoniteurs]  = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [localPerms, setLocalPerms] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [saved,      setSaved]      = useState(false);

  const PERMS_LABELS = [
    { key: "CAN_ADD_SESSION",         icon: "📅", label: "Peut ajouter / modifier des séances" },
    { key: "CAN_ADD_PAYMENT",         icon: "💰", label: "Peut ajouter des paiements" },
    { key: "CAN_TOGGLE_STATUS",       icon: "✅", label: "Peut modifier le résultat d'examen" },
    { key: "CAN_REMOVE_CANDIDAT",     icon: "🗑️", label: "Peut supprimer un candidat" },
    { key: "CAN_VIEW_ALL_CANDIDATES", icon: "👥", label: "Peut voir tous les candidats" },
  ];

  useEffect(() => {
    window.electron.getMoniteurs().then(list => {
      setMoniteurs(list);
      if (list.length > 0) {
        const firstId = list[0].id;
        setSelectedId(firstId);
        setLocalPerms(getPermissions(firstId));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSelectMoniteur = (id) => {
    const numId = Number(id);
    setSelectedId(numId);
    setLocalPerms(getPermissions(numId));
    setSaved(false);
  };

  const togglePerm = (key) => {
    setSaved(false);
    setLocalPerms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updatePermissions(selectedId, localPerms);
    setSaved(true);
    setTimeout(() => onClose(), 800);
  };

  const selectedMoniteur = moniteurs.find(m => m.id === selectedId);
  const activeCount = Object.values(localPerms).filter(Boolean).length;

  return (
    <div className="modal-overlay">
      <div className="modal new-modal">
        <div className="new-modal-header">
          <h2>Permissions des moniteurs</h2>
          <span className="close" onClick={onClose}><X size={16}/></span>
        </div>
        <hr/>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
          <p className="new-modal-subtitle" style={{ margin: 0 }}>Moniteur concerné :</p>
          {loading ? (
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Chargement...</span>
          ) : (
            <select
              value={selectedId ?? ""}
              onChange={e => handleSelectMoniteur(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, background: "#f8faff", cursor: "pointer" }}
            >
              {moniteurs.map(m => (
                <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
              ))}
            </select>
          )}
        </div>

        {selectedMoniteur && (
          <div style={{
            background: activeCount > 0 ? "rgba(108,99,255,0.06)" : "rgba(148,163,184,0.08)",
            border: `1px solid ${activeCount > 0 ? "rgba(108,99,255,0.2)" : "#e2e8f0"}`,
            borderRadius: 10, padding: "10px 14px", marginBottom: 14,
            fontSize: "0.78rem", color: activeCount > 0 ? "#4c3c9e" : "#64748b",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: "1rem" }}>{activeCount > 0 ? "🔓" : "🔒"}</span>
            <span>
              <strong>{selectedMoniteur.prenom} {selectedMoniteur.nom}</strong> —{" "}
              {activeCount === 0
                ? "aucune permission accordée (accès restreint)"
                : `${activeCount} permission${activeCount > 1 ? "s" : ""} accordée${activeCount > 1 ? "s" : ""}`}
            </span>
          </div>
        )}

        <div className="new-rules-list">
          {PERMS_LABELS.map(({ key, icon, label }) => {
            const val = !!localPerms[key];
            return (
              <div className="new-rule-row" key={key} style={{
                background: val ? "#ede9fe" : "#f1f5f9",
                borderLeft: `4px solid ${val ? "#8b5cf6" : "#cbd5e1"}`,
                transition: "background 0.2s, border-color 0.2s",
              }}>
                <span className="rule-icon">{icon}</span>
                <div style={{ flex: 1 }}>
                  <span className="rule-label">{label}</span>
                  <div style={{ fontSize: "0.68rem", color: val ? "#7c3aed" : "#94a3b8", marginTop: 2 }}>
                    {val ? "✓ Autorisé" : "✗ Bloqué"}
                  </div>
                </div>
                <Toggle value={val} onChange={() => togglePerm(key)} />
              </div>
            );
          })}
        </div>

        <div className="new-modal-footer">
          <button className="btn cancel" onClick={onClose}><X size={13}/> Annuler</button>
          <button className="btn primary" onClick={handleSave} style={{
            background: saved ? "#22c55e" : undefined,
            transition: "background 0.3s",
          }}>
            {saved ? <><Check size={13}/> Sauvegardé !</> : <><Save size={13}/> Sauvegarder</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── MODALE 3 : INSCRIPTION ─── */
const ModalInscription = ({ onClose }) => {
  const { inscriptionRules, saveInscriptionRules } = useRulesCtx();

  const [rules, setRules] = useState(() =>
    inscriptionRules.map(r => ({ ...r }))
  );

  const toggle = (id) =>
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));

  const handleSave = () => {
    saveInscriptionRules(rules);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal new-modal">
        <div className="new-modal-header">
          <h2>Règles d'inscription :</h2>
          <span className="close" onClick={onClose}><X size={16}/></span>
        </div>
        <hr/>
        <div className="new-rules-list" style={{ marginTop: 12 }}>
          {rules.map(r => (
            <div key={r.id} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 600 }}>
                {r.ageLabel}
              </p>
              <div className="new-rule-row" style={{
                background: r.color + "15",
                borderLeft: `4px solid ${r.color}`,
                opacity: r.enabled ? 1 : 0.45,
                transition: "opacity 0.2s",
              }}>
                <span className="rule-icon">{r.icon}</span>
                <span className="rule-label" style={{ flex: 1 }}>{r.rule}</span>
                <Toggle value={r.enabled} onChange={() => toggle(r.id)} />
              </div>
            </div>
          ))}
        </div>
        <div className="new-modal-footer">
          <button className="btn cancel"  onClick={onClose}><X    size={13}/> Annuler</button>
          <button className="btn primary" onClick={handleSave}><Save size={13}/> Sauvegarder</button>
        </div>
      </div>
    </div>
  );
};

/* ─── PAGE PRINCIPALE ─── */
const Parametres = () => {
  const [activeModal,   setActiveModal]   = useState(null);
  const [savedSections, setSavedSections] = useState([]);

  const sections = [
    { id: "inscription", icon: <ClipboardList size={20}/>, title: "Règles d'inscriptions",    description: "Définir les conditions d'âge et documents" },
    { id: "examens",     icon: <BookOpen      size={20}/>, title: "Règles des examens",        description: "Définir délais, tentatives, jours et congé annuel" },
    { id: "moniteurs",   icon: <UserCog       size={20}/>, title: "Permissions des moniteurs", description: "Gérer les accès aux fonctionnalités moniteur" },
  ];

  const openModal  = (id) => setActiveModal(id);
  const closeModal = () => {
    if (activeModal && !savedSections.includes(activeModal)) {
      setSavedSections(prev => [...prev, activeModal]);
    }
    setActiveModal(null);
  };

  return (
    <div className="container">
      <div className="main">
        <div className="header">
          <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1><img src={SmallCar} alt="" width={40}/> Tableau de contrôle de l'auto-école</h1>
          <p>Gérer les paramètres métier de votre établissement</p>
        </div>
        <div className="card">
          <div className="card-header">
            <h2>Paramètres</h2>
            <p>Configurez les règles automatiques de votre système</p>
          </div>
          <div className="params-grid">
            {sections.map((s) => (
              <div className="param-card" key={s.id}>
                <div className="param-card-left">
                  <div className="param-icon">{s.icon}</div>
                  <div className="param-info">
                    <h3>{s.title}</h3>
                    <p>{s.description}</p>
                  </div>
                </div>
                <div className="param-card-right">
                  {savedSections.includes(s.id) && (
                    <span className="saved-badge"><Check size={12}/> Configuré</span>
                  )}
                  <button className="btn-configurer" onClick={() => openModal(s.id)}>
                    Configurer <ChevronRight size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {activeModal === "examens"     && <ModalExamens     onClose={closeModal}/>}
      {activeModal === "moniteurs"   && <ModalMoniteurs   onClose={closeModal}/>}
      {activeModal === "inscription" && <ModalInscription onClose={closeModal}/>}
    </div>
  );
};

export default Parametres;