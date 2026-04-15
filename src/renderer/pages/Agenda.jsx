
import React, { useState, useRef, useCallback, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const HOURS      = [7,8,9,10,11,12,13,14,15,16,17,18];
const DAYS_SHORT = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const CELL_H = 72;
const DUREE_OPTIONS = [
  { value: "0.5",  label: "30 min" },
  { value: "0.75", label: "45 min" },
  { value: "1",    label: "1h" },
  { value: "1.5",  label: "1h30" },
  { value: "2",    label: "2h" },
  { value: "3",    label: "3h" },
];

const COLORS = {
  code:        { bg:"#3b82f6", light:"rgba(59,130,246,0.18)",  border:"rgba(59,130,246,0.4)",  text:"#1d4ed8" },
  creneau:     { bg:"#f59e0b", light:"rgba(245,158,11,0.18)",  border:"rgba(245,158,11,0.4)",  text:"#92400e" },
  circulation: { bg:"#10b981", light:"rgba(16,185,129,0.18)",  border:"rgba(16,185,129,0.4)",  text:"#065f46" },
  boxing:      { bg:"#ef4444", light:"rgba(239,68,68,0.18)",   border:"rgba(239,68,68,0.4)",   text:"#991b1b" },
};

// Données de fallback si l'API Electron n'est pas disponible
const FALLBACK_SESSIONS = [
  { id:1,  name:"Sonia Benazzouz",   monitor:"Moniteur 1", type:"code",        day:0, startH:8,  dur:1, notes:"" },
  { id:2,  name:"Tinhinane Belarte", monitor:"Moniteur 2", type:"code",        day:1, startH:8,  dur:1, notes:"" },
  { id:3,  name:"Karima Alhane",     monitor:"Moniteur 3", type:"creneau",     day:2, startH:8,  dur:1, notes:"" },
  { id:4,  name:"Melissa Azil",      monitor:"Moniteur 4", type:"code",        day:3, startH:8,  dur:1, notes:"" },
  { id:5,  name:"Wassim Benazzouz",  monitor:"Moniteur 5", type:"code",        day:1, startH:9,  dur:1, notes:"" },
  { id:6,  name:"Azidane Chahla",    monitor:"Moniteur 7", type:"circulation", day:4, startH:9,  dur:1, notes:"" },
  { id:7,  name:"Bssad Omar",        monitor:"Moniteur 3", type:"code",        day:5, startH:9,  dur:1, notes:"" },
  { id:8,  name:"Cherdi Feriel",     monitor:"Moniteur 5", type:"code",        day:0, startH:10, dur:1, notes:"" },
  { id:9,  name:"Benacer Riham",     monitor:"Moniteur 7", type:"circulation", day:4, startH:10, dur:1, notes:"" },
  { id:10, name:"Kaci Benazzouz",    monitor:"Moniteur 2", type:"creneau",     day:5, startH:10, dur:1, notes:"" },
  { id:11, name:"Kaci Benazzouz",    monitor:"Moniteur 6", type:"boxing",      day:2, startH:14, dur:1, notes:"" },
];

const CANDIDATES = ["Benacer Riham","Sonia Benazzouz","Wassim Benazzouz","Melissa Azil","Kaci Benazzouz","Tinhinane Belarte","Karima Alhane","Azidane Chahla"];
const MONITORS   = ["Moniteur 1","Moniteur 2","Moniteur 3","Moniteur 4","Moniteur 5","Moniteur 6","Moniteur 7"];

const cap = s => s.split(" ").map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(" ");

// ── HELPERS DB → calendrier ──────────────────────────────────────────────────
/**
 * Convertit une ligne renvoyée par get-seances (format DB) en objet
 * utilisable par le calendrier.
 *
 * Format DB attendu :
 *   { idSeance, date:"2025-06-10", heure:"08:00:00", type, statut,
 *     moniteurNom, candidatsNoms, candidatsIds }
 */
// Ajoute cette fonction en haut du fichier, avec les autres helpers
function floatToHHMM(h) {
  const hours   = Math.floor(h);
  const minutes = Math.round((h % 1) * 60);
  return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;
}
function toLocalISO(dateVal) {
  if (!dateVal) return "";
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day   = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function dbRowToSession(row) {
  const rawDate   = toLocalISO(row.date);
  const dateObj   = new Date(rawDate + "T12:00:00");
  const dayOfWeek = dateObj.getDay();

  // ✅ Prend heures ET minutes → 07:45 = 7.75
  const parts  = (row.heure || "08:00").split(":");
  const startH = parseInt(parts[0]) + (parseInt(parts[1] || 0) / 60);

  const firstName = row.candidatsNoms
    ? row.candidatsNoms.split(", ")[0].trim()
    : "—";

  return {
    id:      row.idSeance,
    name:    firstName,
    monitor: row.moniteurNom || "—",
    type:    (row.type || "code").toLowerCase(),
    day:     dayOfWeek,
    startH,
    dur:     parseFloat(row.duree) || 1,
    notes:   row.statut || "",
    _raw:    row,
  };
}
/**
 * Construit l'objet seanceData attendu par add-seance / update-seance
 * à partir du formulaire du modal.
 */
function formToSeanceData(form) {
  return {
    date:        form.date,
    heure:       form.heure,
    type:        form.type,
    statut:      form.statut || "planifiée",
    moniteur_id: form.moniteur_id || null,
    candidatIds: form.candidatId ? [parseInt(form.candidatId)] : [],
  };
}

// ── DATE UTILS ───────────────────────────────────────────────────────────────
function getMondayOfWeek(date) {
  const d = new Date(date); d.setHours(0,0,0,0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}
function getWeekDates(monday) {
  const sun = new Date(monday); sun.setDate(sun.getDate()-1);
  return Array.from({length:7}, (_,i) => {
    const d = new Date(sun); d.setDate(sun.getDate()+i); return d;
  });
}
function formatWeekLabel(dates) {
  const s = dates[0].toLocaleDateString("fr-FR",{day:"numeric",month:"long"});
  const e = dates[6].toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
  return `${s} – ${e}`;
}

const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`;

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  const bg = type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#3b82f6";
  return (
    <div style={{
      position:"fixed", bottom:24, right:28, zIndex:500,
      background: bg, color:"#fff",
      padding:"11px 20px", borderRadius:10,
      fontFamily:"'Poppins',sans-serif", fontSize:"0.82rem", fontWeight:600,
      boxShadow:"0 8px 24px rgba(0,0,0,0.18)",
      animation:"slideUp 0.25s ease",
    }}>
      {message}
      <style>{`@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

// ── LOADING SPINNER ───────────────────────────────────────────────────────────
function LoadingOverlay() {
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:50,
      background:"rgba(248,250,252,0.75)", backdropFilter:"blur(2px)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div style={{
        width:36, height:36, borderRadius:"50%",
        border:"3px solid #e2e8f0",
        borderTop:"3px solid #2563eb",
        animation:"spin 0.75s linear infinite",
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── POPUP ─────────────────────────────────────────────────────────────────────
function SessionPopup({ session, anchor, onClose, onDelete, onEdit }) {
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  if (!session || !anchor) return null;
  const top  = Math.min(anchor.bottom + 8, window.innerHeight - 320);
  const left = Math.min(anchor.left, window.innerWidth - 270);
  const col  = COLORS[session.type] || COLORS.code;

  return (
    <div ref={ref} style={{
      position:"fixed", zIndex:200, top, left,
      background:"#fff", border:"1px solid #e2e8f0",
      borderRadius:14, width:250,
      boxShadow:"0 20px 60px rgba(0,0,0,0.15)", overflow:"hidden",
      fontFamily:"'Poppins',sans-serif",
    }}>
      {/* Header */}
      <div style={{ padding:"13px 15px 10px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:"0.88rem", fontWeight:700, color:"#1e293b" }}>{cap(session.name)}</div>
          
<div style={{ fontSize:"0.68rem", color:"#94a3b8", marginTop:2 }}>
  {(() => {
    const endH  = session.startH + session.dur;
    const endHH = Math.floor(endH);
    const endMM = Math.round((endH - endHH) * 60);
    const endStr = `${endHH}:${String(endMM).padStart(2,"0")}`;
    return `${DAYS_SHORT[session.day]} • ${session.startH}:00 – ${endStr}`;
  })()}
</div>
        </div>
        <button onClick={onClose} style={{ background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:16,lineHeight:1,padding:0 }}>✕</button>
      </div>

      {/* Body */}
      <div style={{ padding:"12px 15px", display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:"0.78rem" }}>
          <span style={{ color:"#64748b" }}>Type :</span>
          <span style={{ fontWeight:700, padding:"3px 10px", borderRadius:20, background:col.light, color:col.text, border:`1px solid ${col.border}`, textTransform:"capitalize", fontSize:"0.72rem" }}>{session.type}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.78rem" }}>
          <span style={{ color:"#64748b" }}>Moniteur :</span>
          <span style={{ fontWeight:500, color:"#1e293b" }}>{session.monitor}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.78rem" }}>
          <span style={{ color:"#64748b" }}>Candidat :</span>
          <span style={{ fontWeight:500, color:"#1e293b" }}>{cap(session.name)}</span>
        </div>
        {session.notes && (
          <div style={{ fontSize:"0.73rem", color:"#64748b", background:"#f8fafc", padding:"6px 9px", borderRadius:7, marginTop:2 }}>{session.notes}</div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display:"flex", gap:8, padding:"10px 13px", borderTop:"1px solid #e2e8f0", background:"#f8fafc" }}>
        <button onClick={() => { onDelete(session.id); onClose(); }} style={{ flex:1, padding:"7px", borderRadius:8, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", color:"#ef4444", fontFamily:"'Poppins',sans-serif", fontSize:"0.75rem", fontWeight:600, cursor:"pointer" }}>
          Supprimer
        </button>
        <button onClick={() => { onEdit(session); onClose(); }} style={{ flex:1, padding:"7px", borderRadius:8, background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.25)", color:"#3b82f6", fontFamily:"'Poppins',sans-serif", fontSize:"0.75rem", fontWeight:600, cursor:"pointer" }}>
          Modifier
        </button>
      </div>
    </div>
  );
}

// ── CREATE / EDIT MODAL ───────────────────────────────────────────────────────
// Ligne des props :
function CreateModal({ onClose, onCreate, weekDates, editing, saving, sessions }) {
  const toISO = d => d.toISOString().split("T")[0];
  const [candidats, setCandidats] = useState([]);
const [moniteurs, setMoniteurs] = useState([]);
useEffect(() => {
  async function loadData() {
    try {
      console.log("=== loadData START ===");
      console.log("window.electron:", window.electron);
      
      if (window.electron) {
        console.log("getCandidats func:", window.electron.getCandidats);
        console.log("getMoniteurs func:", window.electron.getMoniteurs);
        
        const c = await window.electron.getCandidats();
        console.log("candidats reçus:", c);
        
        const m = await window.electron.getMoniteurs();
        console.log("moniteurs reçus:", m);
        
        setCandidats(Array.isArray(c) ? c : []);
        setMoniteurs(Array.isArray(m) ? m : []);
      } else {
        console.warn("window.electron est undefined !");
      }
    } catch (err) {
      console.error("Erreur loadData:", err);
    }
  }
  loadData();
}, []);
const [form, setForm] = React.useState(editing ? {
  candidat:    editing.name,
  candidatId:  editing._raw?.candidatsIds
                 ? String(editing._raw.candidatsIds.split(",")[0].trim())
                 : "",
  moniteur:    editing.monitor,
  moniteur_id: editing._raw?.moniteur_id
                 ? String(editing._raw.moniteur_id)
                 : "",
  type:        editing.type,
  date:        toLocalISO(editing._raw?.date),
  heure:       `${String(editing.startH).padStart(2,"0")}:00`,
  statut:      editing._raw?.statut || "planifiée",
  dur:         String(editing.dur || 1),
  notes:       "",
} : {
  candidat:"", candidatId:"", moniteur:"", moniteur_id:"",
  type:"code",
  date: toLocalISO(new Date()),
  heure:"08:00", statut:"planifiée", dur:"1", notes:"",
});
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const inpS = {
    width:"100%", boxSizing:"border-box",
    background:"#fff", border:"1px solid #cbd5e1",
    borderRadius:8, padding:"9px 11px",
    color:"#1e293b", fontFamily:"'Poppins',sans-serif",
    fontSize:"0.85rem", outline:"none",
  };

  const handleSubmit = () => {
  if (!form.date || !form.heure || !form.type) return;
  if (!form.candidatId || form.candidatId === "") {
    alert("Veuillez sélectionner un candidat.");
    return;
  }
  if (!form.moniteur_id || form.moniteur_id === "") {
    alert("Veuillez sélectionner un moniteur.");
    return;
  }
  onCreate({
    id:      editing ? editing.id : Date.now(),
    name:    form.candidat || "Nouveau Candidat",
    monitor: form.moniteur || "Moniteur 1",
    type:    form.type || "code",
    day:     new Date(form.date + "T12:00:00").getDay(),
    startH:  parseInt(form.heure.split(":")[0]),
    dur:     parseFloat(form.dur) || 1,
    notes:   form.statut,
    _formData: {
  date:        form.date,
  heure:       form.heure,
  type:        form.type,
  statut:      form.statut,
  moniteur_id: form.moniteur_id && form.moniteur_id !== ""
                 ? parseInt(form.moniteur_id)
                 : null,
  candidatIds: form.candidatId ? [parseInt(form.candidatId)] : [],  // ✅ était "candidatId" avant
    duree:       parseFloat(form.dur) || 1,
},
  });
};

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(15,23,42,0.5)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:16, width:520, maxWidth:"96vw", maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 25px 60px rgba(0,0,0,0.2)", overflow:"hidden", fontFamily:"'Poppins',sans-serif", position:"relative" }}>

        {saving && <LoadingOverlay />}

        {/* Header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:"1.05rem", fontWeight:700, color:"#1e293b" }}>{editing ? "Modifier la séance" : "Créer une séance"}</div>
            <div style={{ fontSize:"0.72rem", color:"#94a3b8", marginTop:3 }}>Planifier une nouvelle séance de conduite ou d'examen</div>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", color:"#64748b", width:30, height:30, borderRadius:8, cursor:"pointer", fontSize:14, display:"grid", placeItems:"center" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:"18px 24px", overflowY:"auto", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {/* Candidat */}
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Candidat <span style={{ color:"#ef4444" }}>*</span></label>
              <select
  style={inpS}
  value={form.candidatId}
  onChange={e => {
    const selected = candidats.find(c => c.idCandidat == e.target.value);
    set("candidatId", e.target.value);
    set("candidat", selected ? `${selected.nom} ${selected.prenom}` : "");
  }}
>
  <option value="">Sélectionner candidat...</option>
  {candidats.map(c => (
    <option key={c.idCandidat} value={c.idCandidat}>
      {c.nom} {c.prenom}
    </option>
  ))}
</select>
            </div>

            {/* Moniteur */}
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Moniteur <span style={{ color:"#ef4444" }}>*</span></label>
              <select
  style={inpS}
  value={form.moniteur_id}
  onChange={e => {
    const selected = moniteurs.find(m => m.id == e.target.value);
    set("moniteur_id", e.target.value);
    set("moniteur", selected ? `${selected.nom} ${selected.prenom}` : "");
  }}
>
  <option value="">Sélectionner moniteur...</option>
  {moniteurs.map(m => (
    <option key={m.id} value={m.id}>
      {m.nom} {m.prenom}
    </option>
  ))}
</select>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Type <span style={{ color:"#ef4444" }}>*</span></label>
              <select style={inpS} value={form.type} onChange={e=>set("type",e.target.value)}>
                <option value="code">Code</option>
                <option value="circulation">Circulation</option>
                <option value="creneau">Créneau</option>
                <option value="boxing">Boxing</option>
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Date <span style={{ color:"#ef4444" }}>*</span></label>
              <input style={inpS} type="date" value={form.date} onChange={e=>set("date",e.target.value)} />
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
  <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Heure <span style={{ color:"#ef4444" }}>*</span></label>
  <select style={inpS} value={form.heure} onChange={e => set("heure", e.target.value)}>
    <option value="">Choisir un créneau...</option>
    {(() => {
      const duree = parseFloat(form.dur) || 1;
      // Tous les slots de 30min entre 7h et 18h30
      const allSlots = [];
        for (let h = 7; h < 19; h++) {
          allSlots.push(h);
          allSlots.push(h + 0.25);
          allSlots.push(h + 0.5);
          allSlots.push(h + 0.75);
        }

      // Intervalles occupés ce jour-là
      const occupiedIntervals = (sessions || [])
        .filter(s => {
          const sDate = toLocalISO(s._raw?.date);
          const isOther = editing ? s.id !== editing.id : true;
          return sDate === form.date && isOther;
        })
        .map(s => ({ start: s.startH, end: s.startH + s.dur }));

      const formatSlot = slot => {
            const h = Math.floor(slot);
            const m = Math.round((slot % 1) * 60);
            return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
          };

      return allSlots.map(slot => {
          const slotEnd = slot + duree;
          if (slotEnd > 19) return null;

          // Filtre les slots selon la durée choisie
          const minutes = Math.round((slot % 1) * 60);
          const isValid = duree === 0.75
            ? [0, 15, 30, 45].includes(minutes)  // 45min → quarts d'heure
            : [0, 30].includes(minutes);          // autres → demi-heures
          if (!isValid) return null;

          const conflict = occupiedIntervals.find(i => slot < i.end && slotEnd > i.start);
          const startStr = formatSlot(slot);
          const endStr   = formatSlot(slotEnd);
          return (
            <option key={slot} value={startStr} disabled={!!conflict}
              style={{ color: conflict ? "#cbd5e1" : "#1e293b" }}>
              {conflict ? `${startStr} – ${endStr}  ✗` : `${startStr} – ${endStr}  ✓`}
            </option>
          );
        });
    })()}
  </select>
</div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Statut</label>
              <select style={inpS} value={form.statut} onChange={e=>set("statut",e.target.value)}>
                <option value="planifiée">Planifiée</option>
                <option value="confirmée">Confirmée</option>
                <option value="annulée">Annulée</option>
              </select>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Durée <span style={{ color:"#ef4444" }}>*</span></label>
              <select style={inpS} value={form.dur} onChange={e => set("dur", e.target.value)}>
  <option value="0.5">30 min</option>
  <option value="0.75">45 min</option>
  <option value="1">1h</option>
  <option value="1.5">1h30</option>
  <option value="2">2h</option>
  <option value="3">3h</option>
</select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Notes</label>
              <input style={inpS} type="text" placeholder="Notes rapides..." value={form.notes} onChange={e=>set("notes",e.target.value)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 24px", borderTop:"1px solid #e2e8f0", display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button onClick={onClose} disabled={saving} style={{ padding:"9px 20px", borderRadius:8, background:"#f1f5f9", border:"1px solid #e2e8f0", color:"#64748b", fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem", cursor:"pointer", fontWeight:500, opacity: saving ? 0.6 : 1 }}>
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ padding:"9px 22px", borderRadius:8, background: saving ? "#93c5fd" : "#2563eb", border:"none", color:"#fff", fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem", fontWeight:600, cursor: saving ? "not-allowed" : "pointer", boxShadow:"0 4px 14px rgba(37,99,235,0.35)", display:"flex", alignItems:"center", gap:8 }}>
            {saving && <div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.4)", borderTop:"2px solid #fff", animation:"spin 0.7s linear infinite" }} />}
            {editing ? "Enregistrer" : "Créer la séance"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CALENDAR GRID ─────────────────────────────────────────────────────────────
function CalendarGrid({ sessions, weekDates, todayIdx, onSessionClick, onDrop }) {
  const [dragging, setDragging] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);
  const dragRef = useRef(null);

  const handleDragStart = (e, session) => { dragRef.current = session; setDragging(session.id); e.dataTransfer.effectAllowed = "move"; };
  const handleDragEnd   = () => { setDragging(null); setDragOver(null); dragRef.current = null; };
  const handleDragOver  = (e, day, hour) => { e.preventDefault(); e.dataTransfer.dropEffect="move"; setDragOver({day,hour}); };
  const handleDrop      = (e, day, hour) => { e.preventDefault(); if (dragRef.current) onDrop(dragRef.current.id, day, hour); setDragging(null); setDragOver(null); dragRef.current = null; };

  return (
    <div style={{ border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden", background:"#fff", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div style={{ display:"grid", gridTemplateColumns:"52px repeat(7,1fr)", background:"#f8fafc", borderBottom:"2px solid #e2e8f0", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ borderRight:"1px solid #e2e8f0", fontSize:"0.65rem", color:"#94a3b8", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:600 }}>Heure</div>
        {weekDates.map((date,i) => {
          const isToday = i === todayIdx;
          return (
            <div key={i} style={{ padding:"10px 6px", textAlign:"center", borderRight:"1px solid #e2e8f0", background: isToday ? "rgba(37,99,235,0.06)" : "transparent" }}>
              <div style={{ fontSize:"0.6rem", fontWeight:600, textTransform:"uppercase", letterSpacing:1, color: isToday ? "#2563eb" : "#94a3b8" }}>{DAYS_SHORT[date.getDay()]}</div>
              <div style={{ fontSize:"0.92rem", fontWeight:700, color: isToday ? "#fff" : "#334155", marginTop:3, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {isToday
                  ? <div style={{ width:26, height:26, borderRadius:"50%", background:"#2563eb", display:"grid", placeItems:"center", fontSize:"0.88rem" }}>{date.getDate()}</div>
                  : date.getDate()
                }
              </div>
              <div style={{ fontSize:"0.6rem", color:"#94a3b8", marginTop:1 }}>
                {date.toLocaleDateString("fr-FR",{month:"short"})}
              </div>
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div style={{ display:"grid", gridTemplateColumns:"52px repeat(7,1fr)" }}>
        {/* Colonne heure */}
        <div style={{ borderRight:"1px solid #e2e8f0" }}>
          {HOURS.map(h => (
            <div key={h} style={{ height:CELL_H, borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"flex-start", padding:"5px 8px 0", fontSize:"0.62rem", fontWeight:600, color:"#94a3b8" }}>
              {h}:00
            </div>
          ))}
        </div>

        {/* Colonnes jours */}
        {weekDates.map((_,dayIdx) => {
          const isToday = dayIdx === todayIdx;
          const daySessions = sessions.filter(s => s.day === dayIdx);
          return (
            <div key={dayIdx} style={{ position:"relative", borderRight:"1px solid #e2e8f0", background: isToday ? "rgba(37,99,235,0.015)" : "transparent" }}>
              {HOURS.map((h, hIdx) => {
                const isTarget = dragOver && dragOver.day===dayIdx && dragOver.hour===h;
                return (
                  <div key={h} style={{
                    height:CELL_H,
                    borderBottom: hIdx < HOURS.length-1 ? "1px solid #f1f5f9" : "none",
                    background: isTarget ? "rgba(37,99,235,0.07)" : "transparent",
                    position:"relative", transition:"background 0.1s",
                  }}
                    onDragOver={e => handleDragOver(e, dayIdx, h)}
                    onDrop={e => handleDrop(e, dayIdx, h)}
                  >
                    {isTarget && <div style={{ position:"absolute", inset:2, border:"2px dashed rgba(37,99,235,0.4)", borderRadius:6, pointerEvents:"none" }} />}
                  </div>
                );
              })}

              {daySessions.map(s => {
                  const firstHour = HOURS[0];
                  const topPx = (s.startH - firstHour) * CELL_H;
                  if (s.startH < firstHour || s.startH >= firstHour + HOURS.length) return null;
                  const col = COLORS[s.type] || COLORS.code;
                  const isDragging = dragging === s.id;
                  return (
                    <div key={s.id}
                    draggable
                    onDragStart={e => handleDragStart(e, s)}
                    onDragEnd={handleDragEnd}
                    onClick={e => { e.stopPropagation(); onSessionClick(s, e.currentTarget.getBoundingClientRect()); }}
                    style={{
                      position:"absolute", left:3, right:3,
                      top: topPx+3, height: s.dur*CELL_H-6,
                      borderRadius:8, padding:"5px 8px",
                      cursor: isDragging ? "grabbing" : "grab",
                      userSelect:"none",
                      background: col.light,
                      borderLeft: `3px solid ${col.bg}`,
                      boxShadow: `0 1px 4px ${col.bg}30`,
                      opacity: isDragging ? 0.4 : 1,
                      transform: isDragging ? "scale(0.97)" : "scale(1)",
                      transition:"transform 0.15s, box-shadow 0.15s",
                      overflow:"hidden",
                      zIndex: isDragging ? 1 : 2,
                    }}
                    onMouseEnter={e => { if (!isDragging) { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=`0 4px 12px ${col.bg}40`; e.currentTarget.style.zIndex=5; }}}
                    onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow=`0 1px 4px ${col.bg}30`; e.currentTarget.style.zIndex=2; }}
                  >
                    <div style={{ fontSize:"0.72rem", fontWeight:700, color:col.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cap(s.name)}</div>
                    <div style={{ fontSize:"0.62rem", color:"#64748b", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.monitor}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AgendaPage() {
  const [sessions,   setSessions]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null); // { message, type }

  const [weekBase,   setWeekBase]   = useState(() => getMondayOfWeek(new Date()));
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [popup,      setPopup]      = useState({ session:null, anchor:null });
  const [search,     setSearch]     = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMon,  setFilterMon]  = useState("");
  const [viewMode,   setViewMode]   = useState("semaine");

  const weekDates = getWeekDates(weekBase);
  const weekLabel = formatWeekLabel(weekDates);
  const today = new Date(); today.setHours(0,0,0,0);
  const todayIdx = weekDates.findIndex(d => { const c=new Date(d); c.setHours(0,0,0,0); return c.getTime()===today.getTime(); });

  // ── Electron API helper (graceful fallback) ──────────────────────────────
  const api = window.electron || null;

  const showToast = (message, type = "success") => setToast({ message, type });

  // ── CHARGEMENT INITIAL DES SÉANCES ──────────────────────────────────────
  useEffect(() => {
    loadSeances();
  }, []);

 async function loadSeances() {
  setLoading(true);
  try {
    if (api?.getSeances) {
      const rows = await api.getSeances();
      console.log("=== rows bruts DB ===", rows);
      
      if (Array.isArray(rows) && rows.length > 0) {
        const mapped = rows.map(dbRowToSession);
        console.log("=== sessions mappées ===", mapped);
        setSessions(mapped);
      }
    }
  } catch(err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}

  // ── NAVIGATION ───────────────────────────────────────────────────────────
  const prevWeek = () => setWeekBase(d => { const n=new Date(d); n.setDate(n.getDate()-7); return n; });
  const nextWeek = () => setWeekBase(d => { const n=new Date(d); n.setDate(n.getDate()+7); return n; });
  const goToday  = () => { setWeekBase(getMondayOfWeek(new Date())); setViewMode("aujourd'hui"); };

  // ── FILTRES ──────────────────────────────────────────────────────────────
  const hasFilters = search || filterType || filterMon;
  const resetFilters = () => { setSearch(""); setFilterType(""); setFilterMon(""); };

  // Dans AgendaPage, remplace `filtered` par :
const filtered = sessions.filter(s => {
  // Filtre semaine courante
  const sessionDate = s._raw?.date instanceof Date
    ? s._raw.date
    : new Date(String(s._raw?.date).split("T")[0] + "T12:00:00");
  
  const weekStart = weekDates[0];
  const weekEnd   = weekDates[6];
  const inWeek    = sessionDate >= weekStart && sessionDate <= weekEnd;

  return inWeek &&
    (!search     || s.name.toLowerCase().includes(search.toLowerCase()) || s.monitor.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || s.type    === filterType) &&
    (!filterMon  || s.monitor === filterMon);
});

  // ── DRAG & DROP (déplacement local uniquement) ──────────────────────────
  const handleDrop = useCallback(async (id, day, hour) => {
  const session = sessions.find(s => s.id === id);
  if (!session) return;

  setSessions(p => p.map(s => s.id === id ? { ...s, day, startH: hour } : s));

  const newDate  = toLocalISO(weekDates[day]);
const newHeure = floatToHHMM(hour);
  if (api?.updateSeance) {
    try {
      await api.updateSeance({
        id:          session.id,
        date:        newDate,
        heure:       newHeure,
        type:        session.type,
        statut:      session._raw?.statut || "planifiée",
        moniteur_id: session._raw?.moniteur_id,
        duree:       session.dur,
      });
      await loadSeances();
      showToast("Séance déplacée avec succès.");
    } catch (err) {
      console.error("handleDrop error:", err);
      showToast("Erreur lors du déplacement.", "error");
      await loadSeances();
    }
  }
}, [sessions, weekDates, api]);

  // ── SUPPRESSION ──────────────────────────────────────────────────────────
 const handleDelete = async (id) => {
  setSessions(p => p.filter(s => s.id !== id));
  if (api?.deleteSeance) {
    try {
      await api.deleteSeance(id);
      showToast("Séance supprimée.", "success");
    } catch (err) {
      showToast("Erreur lors de la suppression.", "error");
    }
  } else {
    showToast("Séance supprimée (mode démo).", "info");
  }
};

  // ── CRÉATION / MODIFICATION ──────────────────────────────────────────────
  /**
   * `sessionObj` contient à la fois les champs calendrier (name, monitor, type,
   * day, startH, dur, notes) et `_formData` (date, heure, type, statut,
   * moniteur_id, candidatId) pour l'IPC.
   */
  const handleSave = async (sessionObj) => {
  setSaving(true);
  try {
    const { _formData, ...calendarFields } = sessionObj;

    if (api?.updateSeance && editing) {
      // MODIFICATION
      await api.updateSeance({
        id:          editing.id,
        date:        _formData.date,
        heure:       _formData.heure,
        type:        _formData.type,
        statut:      _formData.statut,
        moniteur_id: _formData.moniteur_id,
        duree:       _formData.duree,
        candidatId:  _formData.candidatIds?.[0] || null,
      });
      // Recharge depuis la DB pour avoir les données propres
      await loadSeances();
      showToast("Séance modifiée avec succès.");

    } else if (api?.addSeance && !editing) {
      // CRÉATION
      const result = await api.addSeance(_formData);
      if (result?.success) {
        await loadSeances();
        showToast("Séance créée avec succès.");
      } else {
        throw new Error(result?.message || "Erreur lors de la création.");
      }

    } else {
      // MODE DÉMO sans Electron
      if (editing) {
        setSessions(p => p.map(e => e.id === calendarFields.id ? calendarFields : e));
      } else {
        setSessions(p => [...p, { ...calendarFields, id: Date.now() }]);
      }
      showToast(editing ? "Séance modifiée (mode démo)." : "Séance créée (mode démo).", "info");
    }

  } catch (err) {
    console.error("handleSave error:", err);
    showToast(err.message || "Une erreur est survenue.", "error");
  } finally {
    setSaving(false);
    setShowModal(false);
    setEditing(null);
  }
};

  const monitors = [...new Set(sessions.map(s=>s.monitor))].sort();

  return (
    <>
      <style>{FONT_LINK}</style>
      <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden", background:"#f1f5f9", fontFamily:"'Poppins',sans-serif", color:"#1e293b" }}>

        {/* ── HERO ── */}
        <div style={{ position:"relative", background:"linear-gradient(135deg,#dbeafe 0%,#bfdbfe 50%,#e0f2fe 100%)", borderBottom:"1px solid #bfdbfe", padding:"0 28px", flexShrink:0, overflow:"hidden", minHeight:110 }}>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:6, background:"repeating-linear-gradient(90deg,#fbbf24 0,#fbbf24 30px,transparent 30px,transparent 60px)", opacity:0.6 }} />

          {/* Voiture */}
          <div style={{ position:"absolute", right:120, bottom:8, opacity:0.9 }}>
            <svg width="160" height="80" viewBox="0 0 320 160" fill="none">
              <ellipse cx="160" cy="148" rx="148" ry="10" fill="rgba(0,0,0,0.08)" />
              <rect x="30" y="90" width="260" height="60" rx="10" fill="#3b82f6" />
              <rect x="55" y="65" width="210" height="55" rx="12" fill="#2563eb" />
              <rect x="72" y="75" width="65" height="36" rx="4" fill="#bfdbfe" opacity=".95" />
              <rect x="183" y="75" width="65" height="36" rx="4" fill="#bfdbfe" opacity=".95" />
              <circle cx="95" cy="153" r="20" fill="#1e293b" />
              <circle cx="225" cy="153" r="20" fill="#1e293b" />
              <circle cx="95" cy="153" r="9" fill="#3b82f6" />
              <circle cx="225" cy="153" r="9" fill="#3b82f6" />
              <rect x="270" y="98" width="22" height="8" rx="3" fill="#fcd34d" />
              <rect x="28" y="98" width="16" height="8" rx="2" fill="#f87171" />
            </svg>
          </div>

          {/* Feu tricolore */}
          <div style={{ position:"absolute", right:40, bottom:0, opacity:0.85 }}>
            <svg width="36" height="100" viewBox="0 0 50 160" fill="none">
              <rect x="15" y="0" width="20" height="130" rx="10" fill="#334155" />
              <rect x="5" y="8" width="40" height="112" rx="10" fill="#1e293b" />
              <circle cx="25" cy="30" r="11" fill="#ef4444" />
              <circle cx="25" cy="63" r="11" fill="#fbbf24" />
              <circle cx="25" cy="96" r="11" fill="#22c55e" />
            </svg>
          </div>

          {/* Panneau */}
          <div style={{ position:"absolute", right:280, bottom:10, opacity:0.7 }}>
            <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
              <polygon points="40,5 75,70 5,70" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3"/>
              <text x="40" y="58" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#1e293b">!</text>
            </svg>
          </div>

          <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", gap:20, padding:"18px 0" }}>
            <div>
              <h1 style={{ fontSize:"1.9rem", fontWeight:800, color:"#1e3a8a", margin:0, letterSpacing:-0.5 }}>Agenda</h1>
              <div style={{ fontSize:"0.75rem", color:"#3b82f6", marginTop:2, fontWeight:500 }}>Planification et suivi des séances</div>
            </div>

            {/* Boutons vue */}
            <div style={{ display:"flex", gap:0, marginLeft:20, background:"rgba(255,255,255,0.6)", borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,0.8)" }}>
              {[{key:"jour",label:"Jour"},{key:"semaine",label:"Semaine"},{key:"aujourd'hui",label:"Aujourd'hui"}].map(({key,label}) => (
                <button key={key} onClick={() => { setViewMode(key); if(key==="aujourd'hui") goToday(); }}
                  style={{ padding:"8px 16px", border:"none", background: viewMode===key ? "#2563eb" : "transparent", color: viewMode===key ? "#fff" : "#3b82f6", fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Semaine label */}
            <div style={{ fontSize:"1.05rem", fontWeight:700, color:"#1e3a8a", marginLeft:"auto" }}>
              {weekDates[0] && `${weekDates[0].getDate()} – ${weekDates[6].getDate()} ${weekDates[6].toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}`}
            </div>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 28px", borderBottom:"1px solid #e2e8f0", background:"#fff", flexShrink:0, gap:12, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={prevWeek} style={{ width:30, height:30, borderRadius:8, background:"#f8fafc", border:"1px solid #e2e8f0", color:"#64748b", cursor:"pointer", display:"grid", placeItems:"center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontSize:"0.85rem", fontWeight:600, color:"#334155", minWidth:220, textAlign:"center" }}>{weekLabel}</span>
            <button onClick={nextWeek} style={{ width:30, height:30, borderRadius:8, background:"#f8fafc", border:"1px solid #e2e8f0", color:"#64748b", cursor:"pointer", display:"grid", placeItems:"center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button onClick={goToday} style={{ padding:"7px 14px", borderRadius:8, background:"#f8fafc", border:"1px solid #e2e8f0", color:"#3b82f6", fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", fontWeight:600, cursor:"pointer" }}>
              Aujourd'hui
            </button>
            {/* Bouton rafraîchir */}
            <button onClick={loadSeances} disabled={loading} title="Rafraîchir"
              style={{ width:30, height:30, borderRadius:8, background:"#f8fafc", border:"1px solid #e2e8f0", color:"#64748b", cursor: loading ? "not-allowed" : "pointer", display:"grid", placeItems:"center", opacity: loading ? 0.5 : 1 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }}>
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
          </div>

          <Button text="+ Ajouter Séance" onClick={() => setShowModal(true)} />
        </div>

        {/* ── FILTRES ── */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 28px", borderBottom:"1px solid #e2e8f0", background:"#fff", flexShrink:0, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:200, maxWidth:320 }}>
            <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input style={{ width:"100%", boxSizing:"border-box", padding:"8px 12px 8px 32px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, color:"#1e293b", fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", outline:"none" }}
              type="text" placeholder="Rechercher candidat ou moniteur..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>

          <span style={{ fontSize:"0.75rem", color:"#94a3b8", fontWeight:500 }}>Type :</span>
          <select style={{ padding:"7px 10px", borderRadius:8, background:"#f8fafc", border:"1px solid #e2e8f0", color:"#334155", fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", outline:"none", cursor:"pointer" }}
            value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="">Tous</option>
            <option value="code">Code</option>
            <option value="circulation">Circulation</option>
            <option value="creneau">Créneau</option>
          </select>

          <span style={{ fontSize:"0.75rem", color:"#94a3b8", fontWeight:500 }}>Moniteur :</span>
          <select style={{ padding:"7px 10px", borderRadius:8, background:"#f8fafc", border:"1px solid #e2e8f0", color:"#334155", fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", outline:"none", cursor:"pointer" }}
            value={filterMon} onChange={e=>setFilterMon(e.target.value)}>
            <option value="">Tous</option>
            {monitors.map(m=><option key={m}>{m}</option>)}
          </select>

          {hasFilters && (
            <button onClick={resetFilters} style={{ padding:"6px 12px", borderRadius:8, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#ef4444", fontFamily:"'Poppins',sans-serif", fontSize:"0.75rem", fontWeight:600, cursor:"pointer" }}>
              ✕ Réinitialiser
            </button>
          )}

          <div style={{ marginLeft:"auto", fontSize:"0.72rem", color:"#94a3b8", background:"#f8fafc", border:"1px solid #e2e8f0", padding:"3px 12px", borderRadius:20 }}>
            {filtered.length} séance{filtered.length!==1?"s":""}
          </div>
        </div>

        {/* ── CALENDRIER ── */}
        <div style={{ flex:1, overflowY:"auto", overflowX:"auto", padding:"16px 28px 20px", position:"relative" }}>
          {loading && (
            <div style={{ position:"absolute", inset:0, zIndex:20, background:"rgba(241,245,249,0.7)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid #e2e8f0", borderTop:"3px solid #2563eb", animation:"spin 0.75s linear infinite" }} />
              <span style={{ fontSize:"0.8rem", color:"#64748b", fontWeight:500 }}>Chargement des séances…</span>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
          <CalendarGrid
            sessions={filtered}
            weekDates={weekDates}
            todayIdx={todayIdx}
            onSessionClick={(s, rect) => setPopup({ session:s, anchor:rect })}
            onDrop={handleDrop}
          />
        </div>

        {/* ── LÉGENDE ── */}
        <div style={{ display:"flex", alignItems:"center", gap:24, padding:"10px 28px 14px", background:"#fff", borderTop:"1px solid #e2e8f0", flexShrink:0 }}>
          {Object.entries(COLORS).map(([type, col]) => (
            <div key={type} style={{ display:"flex", alignItems:"center", gap:7, fontSize:"0.76rem", color:"#64748b" }}>
              <div style={{ width:12, height:12, borderRadius:3, background:col.bg }} />
              {cap(type)}
            </div>
          ))}
          {/* Indicateur mode connexion */}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5, fontSize:"0.7rem", color:"#94a3b8" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background: window.electronAPI ? "#22c55e" : "#f59e0b" }} />
            {window.electron ? "Connecté à la base de données" : "Mode démo (hors connexion)"}
          </div>
        </div>
      </div>

      {/* ── Popup & Modals ── */}
      {popup.session && (
        <SessionPopup
          session={popup.session}
          anchor={popup.anchor}
          onClose={() => setPopup({session:null, anchor:null})}
          onDelete={handleDelete}
          onEdit={s => { setEditing(s); setShowModal(true); setPopup({session:null,anchor:null}); }}
        />
      )}
      {showModal && (
        <CreateModal
          onClose={() => { setShowModal(false); setEditing(null); }}
          onCreate={handleSave}
          weekDates={weekDates}
          editing={editing}
          saving={saving}
          sessions={sessions} 
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </>
  );
}
