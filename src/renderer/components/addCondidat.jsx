import React, { useState, useEffect } from "react";
import { useRulesCtx } from "../context/RulesContext";

// ── Calcul d'âge précis (tient compte du mois + jour) ────────────────────────
const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

// ── Lit les règles et retourne le statut pour un candidat ────────────────────
//   blocked      = true  → inscription interdite
//   needsParent  = true  → autorisé seulement si case cochée
//   age          = nombre ou null
const evaluateRules = (rules, dob) => {
  const age = calculateAge(dob);
  if (age === null) return { blocked: false, needsParent: false, age: null };

  let blocked = false;
  let needsParent = false;

  rules.forEach((rule) => {
    if (!rule.enabled) return; // ← règle désactivée dans Paramètres = ignorée

    if (age >= rule.min && age <= rule.max) {
      if (rule.action === "block")          blocked = true;
      if (rule.action === "require_parent") needsParent = true;
    }
  });

  return { blocked, needsParent, age };
};

// ── Icônes SVG inline ─────────────────────────────────────────────────────────
const IconX = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
  :root {
    --blue: #4E96E1; --blue-dark: #2e7bd4; --blue-light: #EBF3FC;
    --red: #DC2626; --red-light: #FEE2E2;
    --orange: #F59E0B; --orange-dark: #d97706; --orange-light: #FEF3C7;
    --green: #10B981; --green-light: #D1FAE5;
    --gray-50: #F8FAFC; --gray-100: #F1F5F9; --gray-200: #E2E8F0;
    --gray-400: #94A3B8; --gray-600: #475569; --gray-900: #0F172A;
    --radius: 14px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; animation: fadeIn .18s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  .modal {
    background:#fff; border-radius:var(--radius);
    box-shadow:0 20px 60px rgba(0,0,0,.18);
    width:500px; max-width:96vw; max-height:92vh; overflow-y:auto;
    font-family:'Sora',sans-serif;
    animation:slideUp .22s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes slideUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }

  .modal-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:20px 24px 16px;
  }
  .modal-title-wrap { display:flex; align-items:center; gap:10px; }
  .modal-header h2  { font-size:18px; font-weight:700; color:var(--gray-900); }

  .mode-badge {
    padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700;
    letter-spacing:.4px; text-transform:uppercase;
  }
  .mode-badge.edit { background:var(--orange-light); color:var(--orange); }
  .mode-badge.add  { background:var(--blue-light);   color:var(--blue);   }

  .modal-close {
    width:32px; height:32px; border-radius:8px;
    background:var(--gray-100); border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    color:var(--gray-600); transition:background .15s;
  }
  .modal-close:hover { background:var(--red-light); color:var(--red); }
  .modal-divider { border:none; border-top:1px solid var(--gray-200); margin:0 24px; }

  .modal-body { padding:24px; display:flex; flex-direction:column; gap:18px; }

  .field { display:flex; flex-direction:column; gap:5px; }
  .field label { font-size:12.5px; font-weight:600; color:var(--gray-600); }
  .field label .req { color:var(--red); margin-left:2px; }

  .field input[type="text"],
  .field input[type="date"] {
    height:40px; padding:0 12px;
    border:1.5px solid var(--gray-200); border-radius:9px;
    font-family:'Sora',sans-serif; font-size:13px; color:var(--gray-900);
    background:var(--gray-50); outline:none; transition:border .15s, background .15s;
  }
  .field input:focus         { border-color:var(--blue);   background:#fff; }
  .field input.input-error   { border-color:var(--red);    background:var(--red-light); }
  .field input.input-warning { border-color:var(--orange); background:var(--orange-light); }

  .row-2 { display:flex; gap:12px; }
  .row-2 .field { flex:1; }

  .gender-group { display:flex; gap:20px; align-items:center; margin-top:5px; }
  .gender-option { display:flex; align-items:center; gap:7px; cursor:pointer; }
  .gender-option input[type="radio"] { accent-color:var(--blue); width:16px; height:16px; cursor:pointer; }
  .gender-option label { font-size:13px; color:var(--gray-900); cursor:pointer; font-weight:500; }

  /* ── Bannière âge ── */
  .age-banner {
    display:flex; align-items:flex-start; gap:10px;
    padding:12px 14px; border-radius:10px;
    font-size:13px; font-weight:500; line-height:1.45;
    animation:fadeIn .2s ease;
  }
  .age-banner.blocked { background:var(--red-light);    color:var(--red);         border:1px solid #fca5a5; }
  .age-banner.warning { background:var(--orange-light); color:var(--orange-dark); border:1px solid #fcd34d; }
  .age-banner.ok      { background:var(--green-light);  color:#065f46;            border:1px solid #6ee7b7; }
  .age-banner .banner-icon { font-size:18px; flex-shrink:0; }

  /* ── Case autorisation parentale ── */
  .parent-check {
    display:flex; align-items:flex-start; gap:10px;
    padding:12px 14px; border-radius:10px; cursor:pointer;
    background:var(--orange-light); border:1px solid #fcd34d;
    transition:background .15s; animation:fadeIn .2s ease;
  }
  .parent-check:hover { background:#fef9c3; }
  .parent-check input[type="checkbox"] {
    accent-color:var(--orange); width:16px; height:16px;
    cursor:pointer; flex-shrink:0; margin-top:2px;
  }
  .parent-check label {
    font-size:13px; font-weight:500; color:var(--orange-dark);
    cursor:pointer; line-height:1.4;
  }

  .modal-footer {
    display:flex; justify-content:flex-end; gap:10px;
    padding:16px 24px 20px; border-top:1px solid var(--gray-200);
  }
  .btn-cancel {
    padding:10px 22px; border-radius:10px; background:var(--gray-100);
    color:var(--gray-600); border:none; font-family:'Sora',sans-serif;
    font-size:13px; font-weight:600; cursor:pointer; transition:all .15s;
  }
  .btn-cancel:hover { background:var(--gray-200); }
  .btn-save {
    padding:10px 24px; border-radius:10px; background:var(--blue);
    color:#fff; border:none; font-family:'Sora',sans-serif;
    font-size:13px; font-weight:700; cursor:pointer; transition:all .15s;
  }
  .btn-save:hover:not(:disabled) { background:var(--blue-dark); }
  .btn-save.edit-mode            { background:var(--orange); }
  .btn-save.edit-mode:hover:not(:disabled) { background:var(--orange-dark); }
  .btn-save:disabled {
    background:var(--gray-200); color:var(--gray-400); cursor:not-allowed;
  }
`;

// ── Composant principal ───────────────────────────────────────────────────────
export default function AddCandidatModal({ showModal, setShowModal, candidat = null, onSave }) {
  const isEdit = !!candidat;
  const { inscriptionRules } = useRulesCtx(); // ← lit les règles du contexte

  const emptyForm = { nom: "", prenom: "", dob: "", inscription: "", tel: "", sexe: "" };
  const [form, setForm] = useState(emptyForm);
  const [parentAuthChecked, setParentAuthChecked] = useState(false);

  // Évaluation en temps réel à chaque changement de date de naissance
  const { blocked, needsParent, age } = evaluateRules(inscriptionRules, form.dob);

  // Le bouton Sauvegarder est actif seulement si :
  // - pas bloqué
  // - si autorisation parentale requise → case cochée
  const canSave = !blocked && (!needsParent || parentAuthChecked);

 useEffect(() => {
  setParentAuthChecked(false);
  if (candidat) {
    setForm({
      nom:         candidat.nom                                              || "",
      prenom:      candidat.prenom                                           || "",
      dob:         candidat.date_naissance
                     ? new Date(candidat.date_naissance).toISOString().split("T")[0]
                     : "",
      inscription: candidat.date_inscription
                     ? new Date(candidat.date_inscription).toISOString().split("T")[0]
                     : "",
      tel:         candidat.telephone                                        || "",
      sexe:        candidat.sexe === "M" ? "homme" : candidat.sexe === "F" ? "femme" : "",
      email:       candidat.email                                            || "",
    });
  } else {
    const today = new Date().toISOString().split("T")[0];
    setForm({ nom:"", prenom:"", dob:"", inscription:today, tel:"", sexe:"", email:"" });
  }
}, [candidat, showModal]);

  const handleSave = () => {
    if (!canSave) return;
    const data = {
      idCandidat:          candidat?.idCandidat,
      nom:                 form.nom,
      prenom:              form.prenom,
      telephone:           form.tel,
      date_naissance:      form.dob,
      date_inscription:    form.inscription,
      sexe:                form.sexe === "homme" ? "M" : "F",
      statut:              "actif",
      autorisationParentale: needsParent && parentAuthChecked,
      email:                 form.email || null,
    };
    onSave?.(data);
  };

  if (!showModal) return null;

  // ── Bannière selon le statut d'âge ──────────────────────────────────────────
  const renderAgeBanner = () => {
    if (!form.dob) return null;

    if (blocked) return (
      <div className="age-banner blocked">
        <span className="banner-icon">🚫</span>
        <span>
          Inscription <strong>interdite</strong> — le candidat a <strong>{age} ans</strong>.
          Cette règle est activée dans les paramètres.
        </span>
      </div>
    );

    if (needsParent) return (
      <div className="age-banner warning">
        <span className="banner-icon">📑</span>
        <span>
          Le candidat a <strong>{age} ans</strong> — une <strong>autorisation parentale</strong> est requise.
          Cochez la case ci-dessous pour confirmer.
        </span>
      </div>
    );

    return (
      <div className="age-banner ok">
        <span className="banner-icon">✅</span>
        <span>
          Inscription <strong>autorisée</strong> — le candidat a <strong>{age} ans</strong>.
        </span>
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
        <div className="modal">

          {/* ── Header ── */}
          <div className="modal-header">
            <div className="modal-title-wrap">
              <h2>{isEdit ? "Modifier le candidat" : "Ajouter un candidat"}</h2>
              <span className={`mode-badge ${isEdit ? "edit" : "add"}`}>
                {isEdit ? "Édition" : "Nouveau"}
              </span>
            </div>
            <button className="modal-close" onClick={() => setShowModal(false)}><IconX /></button>
          </div>
          <hr className="modal-divider" />

          {/* ── Corps ── */}
          <div className="modal-body">

            {/* Nom */}
            <div className="field">
              <label>Nom du candidat <span className="req">*</span></label>
              <input type="text" placeholder="Saisir le nom"
                value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            </div>

            {/* Prénom */}
            <div className="field">
              <label>Prénom du candidat <span className="req">*</span></label>
              <input type="text" placeholder="Saisir le prénom"
                value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
            </div>

            {/* Date naissance + inscription */}
            <div className="row-2">
              <div className="field">
                <label>Date de naissance <span className="req">*</span></label>
                <input
                  type="date"
                  value={form.dob}
                  className={blocked ? "input-error" : needsParent ? "input-warning" : ""}
                  onChange={e => {
                    setForm(f => ({ ...f, dob: e.target.value }));
                    setParentAuthChecked(false); // reset la case si on change la date
                  }}
                />
              </div>
              <div className="field">
                <label>Date d'inscription <span className="req">*</span></label>
                <input type="date" value={form.inscription}
                  onChange={e => setForm(f => ({ ...f, inscription: e.target.value }))} />
              </div>
            </div>

            {/* Bannière de statut (apparaît dès qu'une date est saisie) */}
            {renderAgeBanner()}

            {/* Case autorisation parentale (visible seulement si nécessaire) */}
            {needsParent && !blocked && (
              <div className="parent-check" onClick={() => setParentAuthChecked(v => !v)}>
                <input
                  type="checkbox"
                  checked={parentAuthChecked}
                  onChange={e => setParentAuthChecked(e.target.checked)}
                  onClick={e => e.stopPropagation()}
                />
                <label>
                  Je confirme que le candidat possède une <strong>autorisation parentale valide</strong>,
                  conservée dans son dossier physique.
                </label>
              </div>
            )}
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
  <label>Email</label>
  <input
    type="email"
    placeholder="email@exemple.com"
    value={form.email || ""}
    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
  />
</div>
            {/* Téléphone */}
            <div className="field">
              <label>Numéro de téléphone <span className="req">*</span></label>
              <input type="text" placeholder="Saisir le numéro"
                value={form.tel} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} />
            </div>

            {/* Sexe */}
            <div className="field">
              <label>Sexe <span className="req">*</span></label>
              <div className="gender-group">
                {["homme", "femme"].map(s => (
                  <div className="gender-option" key={s}>
                    <input type="radio" name="sexe" id={s} value={s}
                      checked={form.sexe === s}
                      onChange={() => setForm(f => ({ ...f, sexe: s }))} />
                    <label htmlFor={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</label>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
            <button
              className={`btn-save ${isEdit ? "edit-mode" : ""}`}
              onClick={handleSave}
              disabled={!!form.dob && !canSave}
              title={
                blocked       ? "Inscription interdite pour cet âge" :
                needsParent && !parentAuthChecked ? "Cochez l'autorisation parentale d'abord" :
                ""
              }
            >
              {isEdit ? "Mettre à jour" : "Sauvegarder"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}