import React, { useState, useEffect } from "react";
import { evaluateCandidatRules } from "../utils/rulesEngine";
// ── icons ────────────────────────────────────────────────────────────────────
const IconX = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── styles ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
  :root {
    --blue: #4E96E1; --blue-dark: #2e7bd4; --blue-light: #EBF3FC;
    --red: #DC2626; --red-light: #FEE2E2;
    --gray-50: #F8FAFC; --gray-100: #F1F5F9; --gray-200: #E2E8F0;
    --gray-400: #94A3B8; --gray-600: #475569; --gray-900: #0F172A;
    --green: #10B981; --orange: #F59E0B; --orange-light: #FEF3C7;
    --radius: 14px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; animation: fadeIn .18s ease;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .modal {
    background: #fff; border-radius: var(--radius);
    box-shadow: 0 20px 60px rgba(0,0,0,.18);
    width: 500px; max-width: 96vw; max-height: 92vh; overflow-y: auto;
    font-family: 'Sora', sans-serif;
    animation: slideUp .22s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes slideUp { from { transform:translateY(24px);opacity:0 } to { transform:translateY(0);opacity:1 } }

  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 16px;
  }
  .modal-title-wrap { display: flex; align-items: center; gap: 10px; }
  .modal-header h2 { font-size: 18px; font-weight: 700; color: var(--gray-900); }
  .mode-badge {
    padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
    letter-spacing: .4px; text-transform: uppercase;
  }
  .mode-badge.edit   { background: var(--orange-light); color: var(--orange); }
  .mode-badge.add    { background: var(--blue-light);   color: var(--blue);   }

  .modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--gray-100); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--gray-600); transition: background .15s;
  }
  .modal-close:hover { background: var(--red-light); color: var(--red); }
  .modal-divider { border: none; border-top: 1px solid var(--gray-200); margin: 0 24px; }

  .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }

  .field { display: flex; flex-direction: column; gap: 5px; }
  .field label { font-size: 12.5px; font-weight: 600; color: var(--gray-600); }
  .field label span { color: var(--red); margin-left: 2px; }
  .field input[type="text"],
  .field input[type="date"] {
    height: 40px; padding: 0 12px;
    border: 1.5px solid var(--gray-200); border-radius: 9px;
    font-family: 'Sora', sans-serif; font-size: 13px; color: var(--gray-900);
    background: var(--gray-50); outline: none; transition: border .15s;
  }
  .field input:focus { border-color: var(--blue); background: #fff; }
  
  .row-2 { display: flex; gap: 12px; }
  .row-2 .field { flex: 1; }
  
  .gender-group { display: flex; gap: 20px; align-items: center; margin-top: 5px; }
  .gender-option { display: flex; align-items: center; gap: 7px; cursor: pointer; }
  .gender-option input[type="radio"] { accent-color: var(--blue); width: 16px; height: 16px; cursor: pointer; }
  .gender-option label { font-size: 13px; color: var(--gray-900); cursor: pointer; font-weight: 500; }

  .modal-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 16px 24px 20px; border-top: 1px solid var(--gray-200);
  }
  .btn-cancel {
    padding: 10px 22px; border-radius: 10px; background: var(--gray-100);
    color: var(--gray-600); border: none; font-family: 'Sora', sans-serif;
    font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s;
  }
  .btn-cancel:hover { background: var(--gray-200); }
  .btn-save {
    padding: 10px 24px; border-radius: 10px; background: var(--blue);
    color: #fff; border: none; font-family: 'Sora', sans-serif;
    font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s;
  }
  .btn-save:hover { background: var(--blue-dark); }
  .btn-save.edit-mode { background: var(--orange); }
  .btn-save.edit-mode:hover { background: #d97706; }
`;

export default function AddCandidatModal({ showModal, setShowModal, candidat = null, onSave }) {
  const isEdit = !!candidat;
  const emptyForm = { nom: "", prenom: "", dob: "", inscription: "", tel: "", sexe: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (candidat) {
      setForm({
        nom: candidat.nom || "",
        prenom: candidat.prenom || "",
        dob: candidat.dob || "",
        inscription: candidat.inscription || "",
        tel: candidat.tel || "",
        sexe: candidat.sexe || "",
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      setForm({ ...emptyForm, inscription: today });
    }
  }, [candidat, showModal]);

  const handleSave = () => {
    const data = {
      idCandidat: candidat?.id,
      nom: form.nom,
      prenom: form.prenom,
      telephone: form.tel,
      date_naissance: form.dob,
      date_inscription: form.inscription,
      sexe: form.sexe === "homme" ? "M" : "F",
      statut: "actif"
    };
    onSave?.(data);
  };

  if (!showModal) return null;

  return (
    <>
      <style>{css}</style>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
        <div className="modal">
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

          <div className="modal-body">
            <div className="field">
              <label>Nom du candidat <span>*</span></label>
              <input type="text" placeholder="Saisir le nom"
                value={form.nom} onChange={e => setForm(f => ({...f, nom: e.target.value}))} />
            </div>

            <div className="field">
              <label>Prénom du candidat <span>*</span></label>
              <input type="text" placeholder="Saisir le prénom"
                value={form.prenom} onChange={e => setForm(f => ({...f, prenom: e.target.value}))} />
            </div>

            <div className="row-2">
              <div className="field">
                <label>Date de naissance <span>*</span></label>
                <input type="date" value={form.dob}
                  onChange={e => setForm(f => ({...f, dob: e.target.value}))} />
              </div>
              <div className="field">
                <label>Date d'inscription <span>*</span></label>
                <input type="date" value={form.inscription}
                  onChange={e => setForm(f => ({...f, inscription: e.target.value}))} />
              </div>
            </div>

            <div className="field">
              <label>Numéro de téléphone <span>*</span></label>
              <input type="text" placeholder="Saisir le numéro"
                value={form.tel} onChange={e => setForm(f => ({...f, tel: e.target.value}))} />
            </div>

            <div className="field">
              <label>Sexe <span>*</span></label>
              <div className="gender-group">
                {["homme", "femme"].map(s => (
                  <div className="gender-option" key={s}>
                    <input type="radio" name="sexe" id={s} value={s}
                      checked={form.sexe === s}
                      onChange={() => setForm(f => ({...f, sexe: s}))} />
                    <label htmlFor={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
            <button className={`btn-save ${isEdit ? "edit-mode" : ""}`} onClick={handleSave}>
              {isEdit ? "Mettre à jour" : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}