import React, { useState, useRef, useCallback } from "react";

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

// ── Simulated: current moniteur logged in ──
const CURRENT_MONITOR = "Moniteur 3";
// ── Simulated: admin has granted "ajouter séance" permission ──
const CAN_ADD_SESSION = false; // change to true to unlock

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

// ── LOCKED TOOLTIP ─────────────────────────────────────────────────────────
function LockedTooltip({ children }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative", display:"inline-block" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position:"absolute", bottom:"110%", left:"50%", transform:"translateX(-50%)",
          background:"#1e293b", color:"#fff", padding:"7px 13px", borderRadius:8,
          fontSize:"0.72rem", fontWeight:500, whiteSpace:"nowrap", zIndex:999,
          boxShadow:"0 8px 24px rgba(0,0,0,0.25)",
          pointerEvents:"none",
        }}>
          🔒 Permission requise par l'admin
          <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"6px solid transparent", borderRight:"6px solid transparent", borderTop:"6px solid #1e293b" }} />
        </div>
      )}
    </div>
  );
}

// ── POPUP ────────────────────────────────────────────────────────────────────
function SessionPopup({ session, anchor, onClose, isOwn }) {
  const ref = useRef();
  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  if (!session || !anchor) return null;
  const top  = Math.min(anchor.bottom + 8, window.innerHeight - 280);
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
            {`${DAYS_SHORT[session.day]} • ${session.startH}:00 – ${session.startH+session.dur}:00`}
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
          <span style={{ color:"#64748b" }}>Candidat :</span>
          <span style={{ fontWeight:500, color:"#1e293b" }}>{cap(session.name)}</span>
        </div>
        {/* Affichage "ma séance" ou "autre moniteur" */}
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.78rem" }}>
          <span style={{ color:"#64748b" }}>Séance :</span>
          <span style={{
            fontWeight:600, fontSize:"0.72rem",
            padding:"3px 10px", borderRadius:20,
            background: isOwn ? "rgba(16,185,129,0.12)" : "rgba(148,163,184,0.15)",
            color: isOwn ? "#065f46" : "#64748b",
            border: isOwn ? "1px solid rgba(16,185,129,0.3)" : "1px solid #e2e8f0",
          }}>
            {isOwn ? "✓ Ma séance" : "Autre moniteur"}
          </span>
        </div>
        {session.notes && (
          <div style={{ fontSize:"0.73rem", color:"#64748b", background:"#f8fafc", padding:"6px 9px", borderRadius:7, marginTop:2 }}>{session.notes}</div>
        )}
      </div>

      {/* Footer — lecture seule pour le moniteur */}
      <div style={{ padding:"10px 13px", borderTop:"1px solid #e2e8f0", background:"#f8fafc", textAlign:"center" }}>
        <span style={{ fontSize:"0.7rem", color:"#94a3b8", fontStyle:"italic" }}>
          🔒 Vue lecture seule — contactez l'admin pour modifier
        </span>
      </div>
    </div>
  );
}

// ── CALENDAR GRID ─────────────────────────────────────────────────────────────
function CalendarGrid({ sessions, weekDates, todayIdx, onSessionClick, currentMonitor }) {
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
              {HOURS.map((h, hIdx) => (
                <div key={h} style={{
                  height:CELL_H,
                  borderBottom: hIdx < HOURS.length-1 ? "1px solid #f1f5f9" : "none",
                  position:"relative",
                }} />
              ))}

              {daySessions.map(s => {
                const idx = HOURS.indexOf(s.startH);
                if (idx < 0) return null;
                const col = COLORS[s.type] || COLORS.code;
                const isOwn = s.monitor === currentMonitor;

                return (
                  <div key={s.id}
                    onClick={e => { e.stopPropagation(); onSessionClick(s, e.currentTarget.getBoundingClientRect()); }}
                    style={{
                      position:"absolute", left:3, right:3,
                      top: idx*CELL_H+3, height: s.dur*CELL_H-6,
                      borderRadius:8, padding:"5px 8px",
                      cursor:"pointer",
                      userSelect:"none",
                      // Own sessions: full color; others: muted/greyed
                      background: isOwn ? col.light : "rgba(148,163,184,0.10)",
                      borderLeft: isOwn ? `3px solid ${col.bg}` : "3px solid #cbd5e1",
                      boxShadow: isOwn ? `0 1px 4px ${col.bg}30` : "none",
                      opacity: isOwn ? 1 : 0.65,
                      transition:"transform 0.15s, box-shadow 0.15s",
                      overflow:"hidden",
                      zIndex: 2,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform="translateY(-1px)";
                      e.currentTarget.style.boxShadow = isOwn ? `0 4px 12px ${col.bg}40` : "0 2px 8px rgba(0,0,0,0.08)";
                      e.currentTarget.style.zIndex=5;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform="scale(1)";
                      e.currentTarget.style.boxShadow = isOwn ? `0 1px 4px ${col.bg}30` : "none";
                      e.currentTarget.style.zIndex=2;
                    }}
                  >
                    <div style={{ fontSize:"0.72rem", fontWeight:700, color: isOwn ? col.text : "#94a3b8", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {cap(s.name)}
                    </div>
                    <div style={{ fontSize:"0.6rem", color: isOwn ? "#64748b" : "#b0bec5", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", display:"flex", alignItems:"center", gap:3 }}>
                      {isOwn
                        ? <><span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#10b981", flexShrink:0 }}/>Ma séance</>
                        : "—"
                      }
                    </div>
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
export default function AgendaMoniteur() {
  const [sessions]   = React.useState(INITIAL_SESSIONS);
  const [weekBase,   setWeekBase]   = React.useState(() => getMondayOfWeek(new Date()));
  const [popup,      setPopup]      = React.useState({ session:null, anchor:null });
  const [search,     setSearch]     = React.useState("");
  const [filterType, setFilterType] = React.useState("");
  const [showLocked, setShowLocked] = React.useState(false);

  const weekDates = getWeekDates(weekBase);
  const weekLabel = formatWeekLabel(weekDates);
  const today = new Date(); today.setHours(0,0,0,0);
  const todayIdx = weekDates.findIndex(d => { const c=new Date(d); c.setHours(0,0,0,0); return c.getTime()===today.getTime(); });

  const prevWeek = () => setWeekBase(d => { const n=new Date(d); n.setDate(n.getDate()-7); return n; });
  const nextWeek = () => setWeekBase(d => { const n=new Date(d); n.setDate(n.getDate()+7); return n; });
  const goToday  = () => setWeekBase(getMondayOfWeek(new Date()));

  const hasFilters = search || filterType;
  const resetFilters = () => { setSearch(""); setFilterType(""); };

  const filtered = sessions.filter(s =>
    (!search     || s.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || s.type === filterType)
  );

  const mySessions = filtered.filter(s => s.monitor === CURRENT_MONITOR);
  const totalMySessions = sessions.filter(s => s.monitor === CURRENT_MONITOR).length;

  return (
    <>
      <style>{FONT_LINK}</style>
      <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden", background:"#f1f5f9", fontFamily:"'Poppins',sans-serif", color:"#1e293b" }}>

        {/* ── HERO ── */}
        <div style={{ position:"relative", background:"linear-gradient(135deg,#dbeafe 0%,#bfdbfe 50%,#e0f2fe 100%)", borderBottom:"1px solid #bfdbfe", padding:"0 28px", flexShrink:0, overflow:"hidden", minHeight:110 }}>
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
          <div style={{ position:"absolute", right:40, bottom:0, opacity:0.85 }}>
            <svg width="36" height="100" viewBox="0 0 50 160" fill="none">
              <rect x="15" y="0" width="20" height="130" rx="10" fill="#334155" />
              <rect x="5" y="8" width="40" height="112" rx="10" fill="#1e293b" />
              <circle cx="25" cy="30" r="11" fill="#ef4444" />
              <circle cx="25" cy="63" r="11" fill="#fbbf24" />
              <circle cx="25" cy="96" r="11" fill="#22c55e" />
            </svg>
          </div>

          <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", gap:20, padding:"18px 0" }}>
            <div>
              <h1 style={{ fontSize:"1.9rem", fontWeight:800, color:"#1e3a8a", margin:0, letterSpacing:-0.5 }}>Mon Agenda</h1>
              <div style={{ fontSize:"0.75rem", color:"#3b82f6", marginTop:2, fontWeight:500 }}>
                Vue moniteur — {CURRENT_MONITOR}
              </div>
            </div>

            {/* Badge: mes séances */}
            <div style={{ background:"rgba(255,255,255,0.7)", borderRadius:10, padding:"8px 16px", border:"1px solid rgba(255,255,255,0.9)", backdropFilter:"blur(6px)" }}>
              <div style={{ fontSize:"0.65rem", color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>Mes séances cette semaine</div>
              <div style={{ fontSize:"1.4rem", fontWeight:800, color:"#2563eb", lineHeight:1.1 }}>
                {sessions.filter(s => s.monitor === CURRENT_MONITOR).length}
                <span style={{ fontSize:"0.7rem", color:"#94a3b8", fontWeight:500, marginLeft:4 }}>séances</span>
              </div>
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

          {/* ── BOUTON AJOUTER SÉANCE — locked si pas de permission ── */}
          {CAN_ADD_SESSION ? (
            <button style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 18px", borderRadius:8, background:"#2563eb", border:"none", color:"#fff", fontFamily:"'Poppins',sans-serif", fontSize:"0.83rem", fontWeight:600, cursor:"pointer", boxShadow:"0 4px 14px rgba(37,99,235,0.35)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              + Ajouter Séance
            </button>
          ) : (
            <LockedTooltip>
              <button
                onClick={() => setShowLocked(true)}
                style={{
                  display:"flex", alignItems:"center", gap:7,
                  padding:"8px 18px", borderRadius:8,
                  background:"#e2e8f0",
                  border:"1px solid #cbd5e1",
                  color:"#94a3b8",
                  fontFamily:"'Poppins',sans-serif", fontSize:"0.83rem", fontWeight:600,
                  cursor:"not-allowed",
                  filter:"grayscale(1)",
                  position:"relative",
                  userSelect:"none",
                }}>
                {/* Lock overlay */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                + Ajouter Séance
              </button>
            </LockedTooltip>
          )}
        </div>

        {/* ── Locked banner ── */}
        {showLocked && (
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"10px 28px",
            background:"linear-gradient(90deg,rgba(239,68,68,0.06),rgba(239,68,68,0.02))",
            borderBottom:"1px solid rgba(239,68,68,0.15)",
            flexShrink:0,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:"0.8rem", color:"#b91c1c" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <strong>Action non autorisée</strong> — La création de séances est réservée aux administrateurs. Contactez votre admin pour obtenir la permission.
            </div>
            <button onClick={() => setShowLocked(false)} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:16 }}>✕</button>
          </div>
        )}

        {/* ── FILTERS ── */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 28px", borderBottom:"1px solid #e2e8f0", background:"#fff", flexShrink:0, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:200, maxWidth:320 }}>
            <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input style={{ width:"100%", boxSizing:"border-box", padding:"8px 12px 8px 32px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, color:"#1e293b", fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", outline:"none" }}
              type="text" placeholder="Rechercher candidat..." value={search} onChange={e=>setSearch(e.target.value)} />
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

          {hasFilters && (
            <button onClick={resetFilters} style={{ padding:"6px 12px", borderRadius:8, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#ef4444", fontFamily:"'Poppins',sans-serif", fontSize:"0.75rem", fontWeight:600, cursor:"pointer" }}>
              ✕ Réinitialiser
            </button>
          )}

          {/* Légende mine vs autres */}
          <div style={{ display:"flex", gap:12, marginLeft:"auto", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.72rem", color:"#64748b" }}>
              <div style={{ width:10, height:10, borderRadius:2, background:"#3b82f6" }} />Mes séances ({totalMySessions})
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.72rem", color:"#94a3b8" }}>
              <div style={{ width:10, height:10, borderRadius:2, background:"#cbd5e1" }} />Autres moniteurs
            </div>
            <div style={{ fontSize:"0.72rem", color:"#94a3b8", background:"#f8fafc", border:"1px solid #e2e8f0", padding:"3px 12px", borderRadius:20 }}>
              {filtered.length} séance{filtered.length!==1?"s":""}
            </div>
          </div>
        </div>

        {/* ── CALENDAR ── */}
        <div style={{ flex:1, overflowY:"auto", overflowX:"auto", padding:"16px 28px 20px" }}>
          <CalendarGrid
            sessions={filtered}
            weekDates={weekDates}
            todayIdx={todayIdx}
            currentMonitor={CURRENT_MONITOR}
            onSessionClick={(s, rect) => setPopup({ session:s, anchor:rect })}
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
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, fontSize:"0.72rem", color:"#94a3b8" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Vue lecture seule
          </div>
        </div>
      </div>

      {popup.session && (
        <SessionPopup
          session={popup.session}
          anchor={popup.anchor}
          isOwn={popup.session.monitor === CURRENT_MONITOR}
          onClose={() => setPopup({session:null, anchor:null})}
        />
      )}
    </>
  );
}