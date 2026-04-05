import React, { useState } from "react";
import '../../styles/paramatres.css';
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import {
  ChevronRight,
  UserCog,
  ClipboardList,
  BookOpen,
  Check,
  X,
  Plus,
  Save,
} from "lucide-react";

const sections = [
  {
    id: "inscription",
    icon: <ClipboardList size={20} />,
    title: "Règles d'inscriptions des candidats",
    description: "Définir les exceptions d'inscriptions pour les candidats",
  },
  {
    id: "examens",
    icon: <BookOpen size={20} />,
    title: "Règles des examens",
    description: "Configurer les règles, délais pour les examens",
  },
  {
    id: "moniteurs",
    icon: <UserCog size={20} />,
    title: "Permissions des moniteurs",
    description: "Gérer les accès du moniteur aux différents modules",
  },
];

/* ─── Toggle Switch ─── */
const Toggle = ({ value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    style={{
      width: 42,
      height: 24,
      borderRadius: 12,
      background: value ? "#6c63ff" : "#ccc",
      cursor: "pointer",
      position: "relative",
      transition: "background 0.2s",
      flexShrink: 0,
    }}
  >
    <div style={{
      position: "absolute",
      top: 3,
      left: value ? 20 : 3,
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: "white",
      transition: "left 0.2s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }} />
  </div>
);

/* ─── Select dropdown ─── */
const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      padding: "4px 8px",
      borderRadius: 8,
      border: "1px solid #ccc",
      fontSize: 13,
      background: "#f8faff",
      cursor: "pointer",
    }}
  >
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
);

/* ══════════════════════════════════════════
   MODAL 1 — Règles des examens
══════════════════════════════════════════ */
const ModalExamens = ({ onClose }) => {
  const [rules, setRules] = useState([
    { id: 1, icon: "🕐", label: "Délai après échec - attendre", value: "14", unit: "Jours", color: "#a78bfa" },
    { id: 2, icon: "🔴", label: "Nombre max de tentatives", value: "3", unit: null, color: "#f87171" },
    { id: 3, icon: "🔴", label: "Blocage si non paiement", value: null, toggle: true, toggleVal: true, color: "#f87171" },
  ]);

  const updateRule = (id, key, val) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));

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
            <div className="new-rule-row" key={r.id} style={{ background: r.color + "22", borderLeft: `4px solid ${r.color}` }}>
              <span className="rule-icon">{r.icon}</span>
              <span className="rule-label">{r.label}</span>
              {r.toggle ? (
                <Toggle value={r.toggleVal} onChange={v => updateRule(r.id, "toggleVal", v)} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                  <Select value={r.value} onChange={v => updateRule(r.id, "value", v)}
                    options={["1","2","3","5","7","14","30"]} />
                  {r.unit && <span style={{ fontSize: 13, color: "#555" }}>{r.unit}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="add-rule-btn" onClick={() =>
          setRules(prev => [...prev, { id: Date.now(), icon: "🔵", label: "Nouvelle règle", value: "1", unit: "Jours", color: "#60a5fa" }])
        }>
          <Plus size={14} /> Ajouter une règle
        </button>

        <div className="new-modal-footer">
          <button className="btn cancel" onClick={onClose}><X size={13}/> Annuler</button>
          <button className="btn primary" onClick={onClose}><Save size={13}/> Sauvegarder</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MODAL 2 — Permissions des moniteurs
══════════════════════════════════════════ */
const ModalMoniteurs = ({ onClose }) => {
  const [role, setRole] = useState("Candidat");
  const [perms, setPerms] = useState([
    { id: 1, icon: "👥", label: "Consulter la liste total des candidats", value: true },
    { id: 2, icon: "👁️", label: "Voir le profil détaillé d'un candidat", value: true },
    { id: 3, icon: "➕", label: "Ajout/Modifier candidat", value: false },
    { id: 4, icon: "🗑️", label: "Suppression candidat", value: false },
  ]);

  const toggle = (id) =>
    setPerms(prev => prev.map(p => p.id === id ? { ...p, value: !p.value } : p));

  return (
    <div className="modal-overlay">
      <div className="modal new-modal">
        <div className="new-modal-header">
          <h2>Gestion des exceptions :</h2>
          <span className="close" onClick={onClose}><X size={16}/></span>
        </div>
        <hr/>

        <div className="perm-role-row">
          <p className="new-modal-subtitle" style={{ margin: 0 }}>Gestion des permissions pour les moniteurs :</p>
          <Select value={role} onChange={setRole} options={["Candidat", "Moniteur", "Admin"]} />
        </div>

        <div className="new-rules-list" style={{ marginTop: 12 }}>
          {perms.map(p => (
            <div className="new-rule-row perm-row" key={p.id}
              style={{ background: p.value ? "#ede9fe" : "#f1f5f9", borderLeft: `4px solid ${p.value ? "#8b5cf6" : "#cbd5e1"}` }}>
              <span className="rule-icon">{p.icon}</span>
              <span className="rule-label">{p.label}</span>
              <Toggle value={p.value} onChange={() => toggle(p.id)} />
            </div>
          ))}
        </div>

        <div className="new-modal-footer">
          <button className="btn cancel" onClick={onClose}><X size={13}/> Annuler</button>
          <button className="btn primary" onClick={onClose}><Save size={13}/> Sauvegarder</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MODAL 3 — Règles d'inscriptions
══════════════════════════════════════════ */
const ModalInscription = ({ onClose }) => {
  const [rules, setRules] = useState([
    { id: 1, ageLabel: "<= 16 ans", rule: "Inscription interdite", icon: "❌", toggle: false, color: "#f87171" },
    { id: 2, ageLabel: "17 - 18 ans", rule: "Autorisation parentale obligatoire", icon: "❌", toggle: true, color: "#f87171" },
    { id: 3, ageLabel: ">= 19 ans", rule: "Inscription libre", icon: "✅", toggle: true, color: "#34d399" },
  ]);

  const toggle = (id) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, toggle: !r.toggle } : r));

  return (
    <div className="modal-overlay">
      <div className="modal new-modal">
        <div className="new-modal-header">
          <h2>Gestion des exceptions :</h2>
          <span className="close" onClick={onClose}><X size={16}/></span>
        </div>
        <hr/>

        <div className="new-rules-list">
          {rules.map(r => (
            <div key={r.id}>
              <p className="age-label">{r.ageLabel}</p>
              <div className="new-rule-row" style={{ background: r.color + "22", borderLeft: `4px solid ${r.color}` }}>
                <span className="rule-icon">{r.icon}</span>
                <span className="rule-label">{r.rule}</span>
                <Toggle value={r.toggle} onChange={() => toggle(r.id)} />
              </div>
            </div>
          ))}
        </div>

        <div className="new-modal-footer">
          <button className="btn cancel" onClick={onClose}><X size={13}/> Annuler</button>
          <button className="btn primary" onClick={onClose}><Save size={13}/> Sauvegarder</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════ */
const Parametres = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [savedSections, setSavedSections] = useState([]);

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
          <p>Gérer les étudiants, les leçons et les examens de conduite</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2>Parametre</h2>
              <p>Gérer les règles métier de ton système</p>
            </div>
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
                    <span className="saved-badge"><Check size={12} /> Sauvegardé</span>
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

      {activeModal === "examens" && <ModalExamens onClose={closeModal} />}
      {activeModal === "moniteurs" && <ModalMoniteurs onClose={closeModal} />}
      {activeModal === "inscription" && <ModalInscription onClose={closeModal} />}
    </div>
  );
};

export default Parametres;