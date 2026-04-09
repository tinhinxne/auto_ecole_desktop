import React, { useState, useRef, useEffect } from "react";

// ── icons ────────────────────────────────────────────────────────────────────
const IconUserRound = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const IconCamera = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IconUpload = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const IconX = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconTrash = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const IconSnap = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" />
  </svg>
);
const IconEdit = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
    width: 680px; max-width: 96vw; max-height: 92vh; overflow-y: auto;
    font-family: 'Sora', sans-serif;
    animation: slideUp .22s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes slideUp { from { transform:translateY(24px);opacity:0 } to { transform:translateY(0);opacity:1 } }

  /* ── mode badge ── */
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

  .modal-body { display: flex; gap: 24px; padding: 24px; }

  .form-left { flex: 1; display: flex; flex-direction: column; gap: 14px; }
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
  .gender-group { display: flex; gap: 20px; align-items: center; }
  .gender-option { display: flex; align-items: center; gap: 7px; cursor: pointer; }
  .gender-option input[type="radio"] { accent-color: var(--blue); width: 16px; height: 16px; cursor: pointer; }
  .gender-option label { font-size: 13px; color: var(--gray-900); cursor: pointer; font-weight: 500; }

  .form-right {
    width: 160px; display: flex; flex-direction: column;
    align-items: center; gap: 12px; padding-top: 4px;
  }
  .avatar-wrap {
    position: relative; width: 110px; height: 110px; border-radius: 50%;
    overflow: hidden; background: var(--blue-light); border: 3px solid var(--gray-200);
    display: flex; align-items: center; justify-content: center;
    color: var(--blue); transition: border-color .2s;
  }
  .avatar-wrap.has-photo { border-color: var(--blue); }
  .avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .avatar-actions { display: flex; flex-direction: column; gap: 8px; width: 100%; }
  .photo-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%; padding: 8px 0; border-radius: 9px;
    font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 600;
    cursor: pointer; border: none; transition: all .15s;
  }
  .photo-btn.upload { background: var(--blue-light); color: var(--blue); }
  .photo-btn.upload:hover { background: var(--blue); color: #fff; }
  .photo-btn.webcam { background: var(--gray-100); color: var(--gray-600); }
  .photo-btn.webcam:hover { background: var(--gray-900); color: #fff; }
  .photo-btn.remove { background: var(--red-light); color: var(--red); }
  .photo-btn.remove:hover { background: var(--red); color: #fff; }

  /* webcam */
  .webcam-overlay {
    position: fixed; inset: 0; z-index: 1100;
    background: rgba(0,0,0,.85);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 16px;
  }
  .webcam-container { position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 0 0 3px var(--blue); }
  .webcam-container video { display: block; width: 360px; max-width: 90vw; }
  .webcam-controls { display: flex; gap: 12px; }
  .wc-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 10px; border: none;
    font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s;
  }
  .wc-btn.snap { background: var(--blue); color: #fff; }
  .wc-btn.snap:hover { background: var(--blue-dark); }
  .wc-btn.cancel-wc { background: rgba(255,255,255,.12); color: #fff; }
  .wc-btn.cancel-wc:hover { background: rgba(255,255,255,.22); }

  /* footer */
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

  .toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    background: var(--green); color: #fff; padding: 10px 20px; border-radius: 10px;
    font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600;
    box-shadow: 0 4px 20px rgba(16,185,129,.35); animation: fadeIn .2s ease; z-index: 2000;
  }
`;

// ── component ─────────────────────────────────────────────────────────────────
// Props :
//   showModal   : bool
//   setShowModal: fn
//   candidat    : object|null  — null = mode ajout, objet = mode édition
//   onSave      : fn(data)     — callback avec les données finales
export default function AddCandidatModal({ showModal, setShowModal, candidat = null, onSave }) {
  const isEdit = !!candidat;

  const emptyForm = { nom: "", prenom: "", dob: "", inscription: "", tel: "", sexe: "", photo: null };

  const [form, setForm]           = useState(emptyForm);
  const [photo, setPhoto]         = useState(null);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [toast, setToast]         = useState(false);

  const fileInputRef = useRef(null);
  const videoRef     = useRef(null);
  const streamRef    = useRef(null);

  // ── pré-remplir quand candidat change ────────────────────────────────────
  useEffect(() => {
    if (candidat) {
      setForm({
        nom:         candidat.nom         || "",
        prenom:      candidat.prenom      || "",
        dob:         candidat.dob         || "",
        inscription: candidat.inscription || "",
        tel:         candidat.tel         || "",
        sexe:        candidat.sexe        || "",
      });
      setPhoto(candidat.photo || null);
    } else {
      setForm(emptyForm);
      setPhoto(null);
    }
  }, [candidat, showModal]);

  // ── upload fichier ────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    e.target.value = "";
  };

  // ── webcam ────────────────────────────────────────────────────────────────
  const openWebcam = async () => {
    setWebcamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert("Accès à la caméra refusé ou non disponible.");
      setWebcamOpen(false);
    }
  };
  const closeWebcam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setWebcamOpen(false);
  };
  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg"));
    closeWebcam();
  };

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const data = { ...form, photo, ...(isEdit ? { id: candidat.id } : {}) };
    onSave?.(data);
    setToast(true);
    setTimeout(() => setToast(false), 1800);
  };

  if (!showModal) return null;

  return (
    <>
      <style>{css}</style>

      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
        <div className="modal">

          {/* header */}
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

          {/* body */}
          <div className="modal-body">
            <div className="form-left">
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

            {/* right — photo */}
            <div className="form-right">
              <div className={`avatar-wrap ${photo ? "has-photo" : ""}`}>
                {photo ? <img src={photo} alt="candidat" /> : <IconUserRound />}
              </div>
              <div className="avatar-actions">
                <input ref={fileInputRef} type="file" accept="image/*"
                  style={{ display: "none" }} onChange={handleFileChange} />
                <button className="photo-btn upload" onClick={() => fileInputRef.current.click()}>
                  <IconUpload size={13} /> Télécharger
                </button>
                <button className="photo-btn webcam" onClick={openWebcam}>
                  <IconCamera size={13} /> Prendre photo
                </button>
                {photo && (
                  <button className="photo-btn remove" onClick={() => setPhoto(null)}>
                    <IconTrash size={13} /> Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
            <button className={`btn-save ${isEdit ? "edit-mode" : ""}`} onClick={handleSave}>
              {isEdit ? "Mettre à jour" : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>

      {/* webcam overlay */}
      {webcamOpen && (
        <div className="webcam-overlay">
          <div className="webcam-container">
            <video ref={videoRef} autoPlay playsInline />
          </div>
          <div className="webcam-controls">
            <button className="wc-btn snap" onClick={takeSnapshot}><IconSnap size={16} /> Capturer</button>
            <button className="wc-btn cancel-wc" onClick={closeWebcam}><IconX size={14} /> Annuler</button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          {isEdit ? "✓ Candidat mis à jour" : "✓ Candidat ajouté avec succès"}
        </div>
      )}
    </>
  );
}