import React, { useState, useEffect } from "react";
import '../../styles/parametres.css';
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import {
  ChevronRight, UserCog, ClipboardList,
  BookOpen, Check, X, Plus, Save,
} from "lucide-react";
import { useRulesCtx } from "../context/RulesContext";
import { usePermissionsCtx } from "../context/PermissionsContext";

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
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

/* ─── MODALE 1 : EXAMENS ─── */
const ModalExamens = ({ onClose }) => {
  const [rules, setRules] = useState([
    { id: 1, icon: "🕐", label: "Délai après échec", value: "14", unit: "Jours", color: "#a78bfa", type: "select" },
    { id: 2, icon: "🔴", label: "Tentatives max", value: "3", unit: null, color: "#f87171", type: "select" },
    { id: 3, icon: "💰", label: "Blocage si impayé", toggleVal: true, color: "#fbbf24", type: "toggle" },
    { id: 4, icon: "📅", label: "Jours d'examen autorisés", selectedDays: ["Lun", "Mer", "Ven"], color: "#60a5fa", type: "days" },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const daysOptions = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const updateRule = (id, key, val) => setRules(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));
  const toggleDay = (ruleId, day) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const newDays = r.selectedDays.includes(day)
        ? r.selectedDays.filter(d => d !== day)
        : [...r.selectedDays, day];
      return { ...r, selectedDays: newDays };
    }));
  };
  const handleAddCustomRule = () => {
    if (!customLabel.trim()) return;
    setRules([...rules, { id: Date.now(), icon: "⚙️", label: customLabel, toggleVal: true, color: "#6c63ff", type: "toggle" }]);
    setCustomLabel(""); setIsAdding(false);
  };
  return (
    <div className="modal-overlay">
      <div className="modal new-modal">
        <div className="new-modal-header">
          <h2>Gestion des exceptions :</h2>
          <span className="close" onClick={onClose}><X size={16}/></span>
        </div>
        <hr/>
        <p className="new-modal-subtitle">Règles des examens :</p>
        <div className="new-rules-list">
          {rules.map(r => (
            <div className="new-rule-row" key={r.id} style={{
              background: r.color + "15", borderLeft: `4px solid ${r.color}`,
              flexDirection: r.type === "days" ? "column" : "row",
              alignItems: r.type === "days" ? "flex-start" : "center",
              padding: "12px", marginBottom: "8px"
            }}>
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <span className="rule-icon" style={{ marginRight: 10 }}>{r.icon}</span>
                <span className="rule-label" style={{ fontWeight: "600", flex: 1 }}>{r.label}</span>
                <div style={{ marginLeft: "auto" }}>
                  {(r.type === "toggle" || !r.type) && <Toggle value={r.toggleVal} onChange={v => updateRule(r.id, "toggleVal", v)} />}
                  {r.type === "select" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Select value={r.value} onChange={v => updateRule(r.id, "value", v)} options={["1","2","3","5","7","14","30"]} />
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
                        background: isSel ? r.color : "white", color: isSel ? "white" : "#666", transition: "0.2s"
                      }}>{day}</button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        {isAdding ? (
          <div style={{ marginTop: 15, padding: 12, background: "#f8faff", borderRadius: 10, border: "1px dashed #6c63ff" }}>
            <input type="text" placeholder="Saisissez le libellé de la règle..." value={customLabel}
              onChange={e => setCustomLabel(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginBottom: "10px", outline: "none" }} autoFocus />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn primary" style={{ flex: 1, fontSize: 12 }} onClick={handleAddCustomRule}>Confirmer</button>
              <button className="btn cancel" style={{ flex: 1, fontSize: 12 }} onClick={() => setIsAdding(false)}>Annuler</button>
            </div>
          </div>
        ) : (
          <button className="add-rule-btn" onClick={() => setIsAdding(true)} style={{ marginTop: 15 }}><Plus size={14} /> Créer une règle personnalisée</button>
        )}
        <div className="new-modal-footer">
          <button className="btn cancel" onClick={onClose}><X size={13}/> Fermer</button>
          <button className="btn primary" onClick={onClose}><Save size={13}/> Sauvegarder</button>
        </div>
      </div>
    </div>
  );
};

/* ─── MODALE 2 : MONITEURS ─── */
const ModalMoniteurs = ({ onClose }) => {
  const { getPermissions, updatePermissions } = usePermissionsCtx(); // ← ton contexte existant

  const [moniteurs, setMoniteurs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [localPerms, setLocalPerms] = useState({});
  const [loading, setLoading] = useState(true);

  const PERMS_LABELS = [
    { key: "CAN_ADD_SESSION",         icon: "📅", label: "Peut ajouter des séances" },
    { key: "CAN_ADD_PAYMENT",         icon: "💰", label: "Peut ajouter des paiements" },
    { key: "CAN_TOGGLE_STATUS",       icon: "✅", label: "Peut modifier le résultat d'examen" },
    { key: "CAN_REMOVE_CANDIDAT",     icon: "🗑️", label: "Peut supprimer un candidat" },
    { key: "CAN_VIEW_ALL_CANDIDATES", icon: "👥", label: "Peut voir tous les candidats" },
  ];

  useEffect(() => {
    window.electron.getMoniteurs().then(list => {
      setMoniteurs(list);
      if (list.length > 0) {
        setSelectedId(list[0].id);
        setLocalPerms(getPermissions(list[0].id));
      }
      setLoading(false);
    });
  }, []);

  const handleSelectMoniteur = (id) => {
    const numId = Number(id);
    setSelectedId(numId);
    setLocalPerms(getPermissions(numId));
  };

  const togglePerm = (key) =>
    setLocalPerms(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    updatePermissions(selectedId, localPerms);
    onClose();
  };

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
        <div className="new-rules-list">
          {PERMS_LABELS.map(({ key, icon, label }) => {
            const val = !!localPerms[key];
            return (
              <div className="new-rule-row" key={key} style={{
                background: val ? "#ede9fe" : "#f1f5f9",
                borderLeft: `4px solid ${val ? "#8b5cf6" : "#cbd5e1"}`
              }}>
                <span className="rule-icon">{icon}</span>
                <span className="rule-label" style={{ flex: 1 }}>{label}</span>
                <Toggle value={val} onChange={() => togglePerm(key)} />
              </div>
            );
          })}
        </div>
        <div className="new-modal-footer">
          <button className="btn cancel" onClick={onClose}><X size={13}/> Annuler</button>
          <button className="btn primary" onClick={handleSave}><Save size={13}/> Sauvegarder</button>
        </div>
      </div>
    </div>
  );
};

/* ─── MODALE 3 : INSCRIPTION ─── */
const ModalInscription = ({ onClose }) => {
  const { inscriptionRules, saveInscriptionRules } = useRulesCtx(); // ← ton nouveau contexte

  // Copie locale pour éditer sans modifier le contexte avant de cliquer Sauvegarder
  const [rules, setRules] = useState(() =>
    inscriptionRules.map(r => ({ ...r }))
  );
  const [isAdding, setIsAdding] = useState(false);
  const [customLabel, setCustomLabel] = useState("");

  // Active ou désactive une règle avec le toggle
  const toggle = (id) =>
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));

  const handleAddCustomRule = () => {
    if (!customLabel.trim()) return;
    setRules([...rules, {
      id: Date.now(),
      ageLabel: "Personnalisée",
      rule: customLabel,
      icon: "📝",
      enabled: true,
      color: "#6c63ff",
      min: 0,
      max: 150,
      action: "allow",
    }]);
    setCustomLabel("");
    setIsAdding(false);
  };

  // Sauvegarde dans le contexte → localStorage automatiquement
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
                // Grisé visuellement quand désactivé
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

        {isAdding ? (
          <div style={{ marginTop: 15, padding: 12, background: "#f8faff", borderRadius: 10, border: "1px dashed #6c63ff" }}>
            <input
              type="text"
              placeholder="Libellé de la nouvelle règle..."
              value={customLabel}
              onChange={e => setCustomLabel(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginBottom: "10px", outline: "none" }}
              autoFocus
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn primary" style={{ flex: 1, fontSize: 12 }} onClick={handleAddCustomRule}>Confirmer</button>
              <button className="btn cancel" style={{ flex: 1, fontSize: 12 }} onClick={() => setIsAdding(false)}>Annuler</button>
            </div>
          </div>
        ) : (
          <button className="add-rule-btn" onClick={() => setIsAdding(true)} style={{ marginTop: 15 }}>
            <Plus size={14}/> Ajouter une règle
          </button>
        )}

        <div className="new-modal-footer">
          <button className="btn cancel" onClick={onClose}><X size={13}/> Annuler</button>
          <button className="btn primary" onClick={handleSave}><Save size={13}/> Sauvegarder</button>
        </div>
      </div>
    </div>
  );
};

/* ─── PAGE PRINCIPALE ─── */
const Parametres = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [savedSections, setSavedSections] = useState([]);

  const sections = [
    { id: "inscription", icon: <ClipboardList size={20} />, title: "Règles d'inscriptions", description: "Définir les conditions d'âge et documents" },
    { id: "examens",     icon: <BookOpen size={20} />,      title: "Règles des examens",     description: "Définir délais, tentatives et jours" },
    { id: "moniteurs",   icon: <UserCog size={20} />,       title: "Permissions des moniteurs", description: "Gérer les accès aux données candidats" },
  ];

  const openModal = (id) => setActiveModal(id);
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
          <h1><img src={SmallCar} alt="" width={40} /> Tableau de contrôle de l'auto-école</h1>
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
                    <span className="saved-badge"><Check size={12} /> Configuré</span>
                  )}
                  <button className="btn-configurer" onClick={() => openModal(s.id)}>
                    Configurer <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {activeModal === "examens"     && <ModalExamens     onClose={closeModal} />}
      {activeModal === "moniteurs"   && <ModalMoniteurs   onClose={closeModal} />}
      {activeModal === "inscription" && <ModalInscription onClose={closeModal} />}
    </div>
  );
};

export default Parametres;