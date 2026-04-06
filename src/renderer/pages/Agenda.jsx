import React, { useState, useRef, useCallback } from "react";
import ConnexionImg from "../../assets/Connexion.png";

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const HOURS      = [7,8,9,10,11,12,13,14,15,16,17,18];
const DAYS_SHORT = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const CELL_H     = 72;

const COLORS = {
  code:        { bg:"#3b82f6", light:"rgba(59,130,246,0.18)",  border:"rgba(59,130,246,0.4)",  text:"#1d4ed8" },
  creneau:     { bg:"#f59e0b", light:"rgba(245,158,11,0.18)",  border:"rgba(245,158,11,0.4)",  text:"#92400e" },
  circulation: { bg:"#10b981", light:"rgba(16,185,129,0.18)",  border:"rgba(16,185,129,0.4)",  text:"#065f46" },
  boxing:      { bg:"#ef4444", light:"rgba(239,68,68,0.18)",   border:"rgba(239,68,68,0.4)",   text:"#991b1b" },
};

const CANDIDATES = ["Benacer Riham","Sonia Benazzouz","Wassim Benazzouz","Melissa Azil","Kaci Benazzouz","Tinhinane Belarte","Karima Alhane","Azidane Chahla"];
const MONITORS   = ["Moniteur 1","Moniteur 2","Moniteur 3","Moniteur 4","Moniteur 5","Moniteur 6","Moniteur 7"];

const INITIAL_SESSIONS = [
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

const cap = s => s.split(" ").map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(" ");

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

// ── POPUP ────────────────────────────────────────────────────────────────────
function SessionPopup({ session, anchor, onClose, onDelete, onEdit }) {
  const ref = useRef();
  React.useEffect(() => {
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
            {`${DAYS_SHORT[session.day]} ${anchor.dateStr||""} • ${session.startH}:00 – ${session.startH+session.dur}:00`} code
          </div>
        </div>
        <button onClick={onClose} style={{ background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:16,lineHeight:1,padding:0 }}>✕</button>
      </div>

      {/* Body */}
      <div style={{ padding:"12px 15px", display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:"0.78rem" }}>
          <span style={{ color:"#64748b" }}>Type de :</span>
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
function CreateModal({ onClose, onCreate, weekDates, editing }) {
  const toISO = d => d.toISOString().split("T")[0];
  const [form, setForm] = React.useState(editing ? {
    candidat: editing.name,
    moniteur: editing.monitor,
    type:     editing.type,
    date:     toISO(weekDates[editing.day] || new Date()),
    heure:    `${String(editing.startH).padStart(2,"0")}:00`,
    statut:   "Planifiée",
    dur:      String(editing.dur),
    notes:    editing.notes || "",
  } : {
    candidat:"", moniteur:"", type:"code",
    date: toISO(weekDates[1] || new Date()),
    heure:"08:00", statut:"Planifiée", dur:"1", notes:"",
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const inpS = {
    width:"100%", boxSizing:"border-box",
    background:"#fff", border:"1px solid #cbd5e1",
    borderRadius:8, padding:"9px 11px",
    color:"#1e293b", fontFamily:"'Poppins',sans-serif",
    fontSize:"0.85rem", outline:"none",
  };

  const handleSubmit = () => {
    const h = parseInt(form.heure.split(":")[0]);
    const d = new Date(form.date+"T12:00:00").getDay();
    onCreate({
      id: editing ? editing.id : Date.now(),
      name: form.candidat || "Nouveau Candidat",
      monitor: form.moniteur || "Moniteur 1",
      type: form.type || "code",
      day: d, startH: h, dur: parseInt(form.dur) || 1, notes: form.notes,
    });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(15,23,42,0.5)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:16, width:520, maxWidth:"96vw", maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 25px 60px rgba(0,0,0,0.2)", overflow:"hidden", fontFamily:"'Poppins',sans-serif" }}>

        {/* Header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:"1.05rem", fontWeight:700, color:"#1e293b" }}>{editing ? "Modifier la séance" : "Creer une séance"}</div>
            <div style={{ fontSize:"0.72rem", color:"#94a3b8", marginTop:3 }}>Planifier une nouvelle séance de conduite ou d'examen</div>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", color:"#64748b", width:30, height:30, borderRadius:8, cursor:"pointer", fontSize:14, display:"grid", placeItems:"center" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:"18px 24px", overflowY:"auto", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Candidat <span style={{ color:"#ef4444" }}>*</span></label>
              <select style={inpS} value={form.candidat} onChange={e=>set("candidat",e.target.value)}>
                <option value="">Rechercher le candidat...</option>
                {CANDIDATES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Moniteur <span style={{ color:"#ef4444" }}>*</span></label>
              <select style={inpS} value={form.moniteur} onChange={e=>set("moniteur",e.target.value)}>
                <option value="">Sélectionner moniteur...</option>
                {MONITORS.map(m=><option key={m}>{m}</option>)}
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
              <input style={inpS} type="time" value={form.heure} onChange={e=>set("heure",e.target.value)} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Statut</label>
              <select style={inpS} value={form.statut} onChange={e=>set("statut",e.target.value)}>
                <option>Planifiée</option><option>Confirmée</option><option>Annulée</option>
              </select>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Durée <span style={{ color:"#ef4444" }}>*</span></label>
              <select style={inpS} value={form.dur} onChange={e=>set("dur",e.target.value)}>
                {[1,2,3].map(n=><option key={n} value={n}>{n}h:30min</option>)}
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Candidat</label>
              <input style={inpS} type="text" placeholder="Référence..." value={form.notes} onChange={e=>set("notes",e.target.value)} />
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <label style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>Notes</label>
            <textarea style={{ ...inpS, minHeight:70, resize:"vertical" }} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Notes additionnelles pour la séance" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 24px", borderTop:"1px solid #e2e8f0", display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button onClick={onClose} style={{ padding:"9px 20px", borderRadius:8, background:"#f1f5f9", border:"1px solid #e2e8f0", color:"#64748b", fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem", cursor:"pointer", fontWeight:500 }}>
            Annuler
          </button>
          <button onClick={handleSubmit} style={{ padding:"9px 22px", borderRadius:8, background:"#2563eb", border:"none", color:"#fff", fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem", fontWeight:600, cursor:"pointer", boxShadow:"0 4px 14px rgba(37,99,235,0.35)" }}>
            Créer la séance
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

  const handleDragStart = (e, session) => {
    dragRef.current = session; setDragging(session.id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragEnd   = () => { setDragging(null); setDragOver(null); dragRef.current = null; };
  const handleDragOver  = (e, day, hour) => { e.preventDefault(); e.dataTransfer.dropEffect="move"; setDragOver({day,hour}); };
  const handleDrop      = (e, day, hour) => { e.preventDefault(); if (dragRef.current) onDrop(dragRef.current.id, day, hour); setDragging(null); setDragOver(null); dragRef.current = null; };

  return (
    <div style={{ border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden", background:"#fff", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
      {/* Header row */}
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
        {/* Time column */}
        <div style={{ borderRight:"1px solid #e2e8f0" }}>
          {HOURS.map(h => (
            <div key={h} style={{ height:CELL_H, borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"flex-start", padding:"5px 8px 0", fontSize:"0.62rem", fontWeight:600, color:"#94a3b8" }}>
              {h}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
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
                const idx = HOURS.indexOf(s.startH);
                if (idx < 0) return null;
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
                      top: idx*CELL_H+3, height: s.dur*CELL_H-6,
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
  const [sessions,   setSessions]   = React.useState(INITIAL_SESSIONS);
  const [weekBase,   setWeekBase]   = React.useState(() => getMondayOfWeek(new Date()));
  const [showModal,  setShowModal]  = React.useState(false);
  const [editing,    setEditing]    = React.useState(null);
  const [popup,      setPopup]      = React.useState({ session:null, anchor:null });
  const [search,     setSearch]     = React.useState("");
  const [filterType, setFilterType] = React.useState("");
  const [filterMon,  setFilterMon]  = React.useState("");
  const [viewMode,   setViewMode]   = React.useState("semaine"); // semaine | jour | aujourd'hui

  const weekDates = getWeekDates(weekBase);
  const weekLabel = formatWeekLabel(weekDates);
  const today = new Date(); today.setHours(0,0,0,0);
  const todayIdx = weekDates.findIndex(d => { const c=new Date(d); c.setHours(0,0,0,0); return c.getTime()===today.getTime(); });

  const prevWeek = () => setWeekBase(d => { const n=new Date(d); n.setDate(n.getDate()-7); return n; });
  const nextWeek = () => setWeekBase(d => { const n=new Date(d); n.setDate(n.getDate()+7); return n; });
  const goToday  = () => { setWeekBase(getMondayOfWeek(new Date())); setViewMode("aujourd'hui"); };

  const hasFilters = search || filterType || filterMon;
  const resetFilters = () => { setSearch(""); setFilterType(""); setFilterMon(""); };

  const filtered = sessions.filter(s =>
    (!search     || s.name.toLowerCase().includes(search.toLowerCase()) || s.monitor.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || s.type    === filterType) &&
    (!filterMon  || s.monitor === filterMon)
  );

  const handleDrop   = useCallback((id,day,hour) => setSessions(p=>p.map(s=>s.id===id?{...s,day,startH:hour}:s)),[]);
  const handleDelete = id => setSessions(p=>p.filter(s=>s.id!==id));
  const handleSave   = s  => {
    if (editing) setSessions(p => p.map(e => e.id === s.id ? s : e));
    else setSessions(p => [...p, s]);
    setEditing(null);
  };

  const monitors = [...new Set(sessions.map(s=>s.monitor))].sort();

  return (
    <>
      <style>{FONT_LINK}</style>
      <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden", background:"#f1f5f9", fontFamily:"'Poppins',sans-serif", color:"#1e293b" }}>

        {/* ── HERO ── */}
        <div style={{ position:"relative", background:"linear-gradient(135deg,#dbeafe 0%,#bfdbfe 50%,#e0f2fe 100%)", borderBottom:"1px solid #bfdbfe", padding:"0 28px", flexShrink:0, overflow:"hidden", minHeight:110 }}>
          {/* Decorative road line */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:6, background:"repeating-linear-gradient(90deg,#fbbf24 0,#fbbf24 30px,transparent 30px,transparent 60px)", opacity:0.6 }} />

          {/* Car SVG */}
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

          {/* Traffic light SVG */}
          <div style={{ position:"absolute", right:40, bottom:0, opacity:0.85 }}>
            <svg width="36" height="100" viewBox="0 0 50 160" fill="none">
              <rect x="15" y="0" width="20" height="130" rx="10" fill="#334155" />
              <rect x="5" y="8" width="40" height="112" rx="10" fill="#1e293b" />
              <circle cx="25" cy="30" r="11" fill="#ef4444" />
              <circle cx="25" cy="63" r="11" fill="#fbbf24" />
              <circle cx="25" cy="96" r="11" fill="#22c55e" />
            </svg>
          </div>

          {/* Warning sign */}
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

            {/* View buttons */}
            <div style={{ display:"flex", gap:0, marginLeft:20, background:"rgba(255,255,255,0.6)", borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,0.8)" }}>
              {[{key:"jour",label:"Jour"},{key:"semaine",label:"Semaine"},{key:"aujourd'hui",label:"Aujourd'hui"}].map(({key,label}) => (
                <button key={key} onClick={() => { setViewMode(key); if(key==="aujourd'hui") goToday(); }}
                  style={{ padding:"8px 16px", border:"none", background: viewMode===key ? "#2563eb" : "transparent", color: viewMode===key ? "#fff" : "#3b82f6", fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Week label */}
            <div style={{ fontSize:"1.05rem", fontWeight:700, color:"#1e3a8a", marginLeft:"auto" }}>
              {weekDates[0] && `${weekDates[0].getDate()} – ${weekDates[6].getDate()} ${weekDates[6].toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}`}
            </div>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 28px", borderBottom:"1px solid #e2e8f0", background:"#fff", flexShrink:0, gap:12, flexWrap:"wrap" }}>
          {/* Week nav */}
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
          </div>

          {/* Add button */}
          <button onClick={() => { setEditing(null); setShowModal(true); }} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 18px", borderRadius:8, background:"#2563eb", border:"none", color:"#fff", fontFamily:"'Poppins',sans-serif", fontSize:"0.83rem", fontWeight:600, cursor:"pointer", boxShadow:"0 4px 14px rgba(37,99,235,0.35)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Ajouter Séance
          </button>
        </div>

        {/* ── FILTERS ── */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 28px", borderBottom:"1px solid #e2e8f0", background:"#fff", flexShrink:0, flexWrap:"wrap" }}>
          {/* Search */}
          <div style={{ position:"relative", flex:1, minWidth:200, maxWidth:320 }}>
            <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input style={{ width:"100%", boxSizing:"border-box", padding:"8px 12px 8px 32px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, color:"#1e293b", fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", outline:"none" }}
              type="text" placeholder="Search candidats..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>

          <span style={{ fontSize:"0.75rem", color:"#94a3b8", fontWeight:500 }}>Type :</span>
          <select style={{ padding:"7px 10px", borderRadius:8, background:"#f8fafc", border:"1px solid #e2e8f0", color:"#334155", fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", outline:"none", cursor:"pointer" }}
            value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="">Tous</option>
            <option value="code">Code</option>
            <option value="circulation">Circulation</option>
            <option value="creneau">Créneau</option>
            <option value="boxing">Boxing</option>
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

        {/* ── CALENDAR ── */}
        <div style={{ flex:1, overflowY:"auto", overflowX:"auto", padding:"16px 28px 20px" }}>
          <CalendarGrid
            sessions={filtered}
            weekDates={weekDates}
            todayIdx={todayIdx}
            onSessionClick={(s, rect) => setPopup({ session:s, anchor:rect })}
            onDrop={handleDrop}
          />
        </div>

        {/* ── LEGEND ── */}
        <div style={{ display:"flex", alignItems:"center", gap:24, padding:"10px 28px 14px", background:"#fff", borderTop:"1px solid #e2e8f0", flexShrink:0 }}>
          {Object.entries(COLORS).map(([type, col]) => (
            <div key={type} style={{ display:"flex", alignItems:"center", gap:7, fontSize:"0.76rem", color:"#64748b" }}>
              <div style={{ width:12, height:12, borderRadius:3, background:col.bg }} />
              {cap(type)}
            </div>
          ))}
        </div>

      </div>

      {/* ── Popups & Modals ── */}
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
        />
      )}
    </>
  );
}