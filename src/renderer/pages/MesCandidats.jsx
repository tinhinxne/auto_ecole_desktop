import React, { useState } from "react";

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');`;

const CURRENT_MONITOR = "Sonia Berg";

const CANDIDATES = [
  {
    id: 1,
    name: "Marie Dubois",
    email: "marie.dubois@email.com",
    progress: 18,
    total: 30,
    nextSession: "2026-03-10 09:00",
  },
  {
    id: 2,
    name: "Pierre Martin",
    email: "pierre.martin@email.com",
    progress: 12,
    total: 30,
    nextSession: "2026-03-10 14:00",
  },
  {
    id: 3,
    name: "Sophie Leroy",
    email: "sophie.leroy@email.com",
    progress: 26,
    total: 30,
    nextSession: "2026-03-11 10:00",
  },
  {
    id: 4,
    name: "Luc Bernard",
    email: "luc.bernard@email.com",
    progress: 20,
    total: 30,
    nextSession: "2026-03-12 15:00",
  },
  {
    id: 5,
    name: "Emma Petit",
    email: "emma.petit@email.com",
    progress: 5,
    total: 30,
    nextSession: "2026-03-13 11:00",
  },
];

const AVATAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function isOnTrack(c) {
  return c.progress / c.total >= 0.5;
}

// ── CAR SVG ──────────────────────────────────────────────────────────────────
function CarSVG() {
  return (
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
  );
}

// ── TRAFFIC LIGHT SVG ────────────────────────────────────────────────────────
function TrafficLightSVG() {
  return (
    <svg width="36" height="100" viewBox="0 0 50 160" fill="none">
      <rect x="15" y="0" width="20" height="130" rx="10" fill="#334155" />
      <rect x="5" y="8" width="40" height="112" rx="10" fill="#1e293b" />
      <circle cx="25" cy="30" r="11" fill="#ef4444" />
      <circle cx="25" cy="63" r="11" fill="#fbbf24" />
      <circle cx="25" cy="96" r="11" fill="#22c55e" />
    </svg>
  );
}

// ── CANDIDATE CARD ────────────────────────────────────────────────────────────
function CandidateCard({ candidate }) {
  const pct = Math.round((candidate.progress / candidate.total) * 100);
  const onTrack = isOnTrack(candidate);
  const avatarColor = AVATAR_COLORS[(candidate.id - 1) % AVATAR_COLORS.length];

  const barColor = onTrack ? "#2563eb" : "#f59e0b";
  const statusBg = onTrack ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)";
  const statusColor = onTrack ? "#065f46" : "#92400e";
  const statusBorder = onTrack
    ? "rgba(16,185,129,0.3)"
    : "rgba(245,158,11,0.3)";
  const statusLabel = onTrack ? "✓ En bonne voie" : "⚡ À améliorer";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        padding: "18px 20px",
        cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,99,235,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Avatar + Name + Status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "#fff",
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {getInitials(candidate.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "#1e293b",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {candidate.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#94a3b8",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {candidate.email}
          </div>
        </div>
        <div
          style={{
            fontSize: "0.68rem",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 20,
            background: statusBg,
            color: statusColor,
            border: `1px solid ${statusBorder}`,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {statusLabel}
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 4 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 11, color: "#94a3b8" }}>Progression</span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            {candidate.progress}/{candidate.total} séances
          </span>
        </div>
        <div
          style={{
            background: "#e2e8f0",
            borderRadius: 6,
            height: 7,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: barColor,
              borderRadius: 6,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: barColor }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{ borderTop: "1px solid #f1f5f9", margin: "12px 0 10px" }}
      />

      {/* Next session */}
      <div>
        <div
          style={{
            fontSize: 10,
            color: "#aab0c5",
            marginBottom: 2,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Prochaine séance
        </div>
        <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>
          {candidate.nextSession}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function MesCandidats() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = CANDIDATES.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      !filterStatus ||
      (filterStatus === "on-track" && isOnTrack(c)) ||
      (filterStatus === "needs-work" && !isOnTrack(c));
    return matchSearch && matchFilter;
  });

  const onTrackCount = CANDIDATES.filter(isOnTrack).length;

  return (
    <>
      <style>{FONT_LINK}</style>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f1f5f9",
          fontFamily: "'Poppins', sans-serif",
          color: "#1e293b",
        }}
      >
        {/* ── SIDEBAR ── */}
        <aside
          style={{
            width: 180,
            background: "#fff",
            borderRight: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              padding: "18px 20px 16px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: 17,
                color: "#1a2340",
              }}
            >
              AutoEcole{" "}
              <span style={{ color: "#3b82f6", fontWeight: 800 }}>Pro</span>
            </span>
          </div>

          <nav style={{ flex: 1, padding: "16px 0" }}>
            {[
              { label: "Dashboard", icon: "⊞", active: false },
              { label: "Mes Candidats", icon: "👤", active: true },
              { label: "Mon Agenda", icon: "📅", active: false },
            ].map(({ label, icon, active }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 20px",
                  background: active ? "#ebf3ff" : "transparent",
                  borderRight: active
                    ? "3px solid #3b82f6"
                    : "3px solid transparent",
                  cursor: "pointer",
                  color: active ? "#3b82f6" : "#6b7490",
                  fontWeight: active ? 600 : 400,
                  fontSize: 13,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 15 }}>{icon}</span>
                {label}
              </div>
            ))}
          </nav>

          <div style={{ padding: "0 12px 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                background: "#fff0f0",
                borderRadius: 8,
                cursor: "pointer",
                color: "#e05555",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <span>↩</span> Déconnexion
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main
          style={{
            marginLeft: 180,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── HERO BANNER ── */}
          <div
            style={{
              position: "relative",
              background:
                "linear-gradient(135deg,#dbeafe 0%,#bfdbfe 50%,#e0f2fe 100%)",
              borderBottom: "1px solid #bfdbfe",
              padding: "0 28px",
              overflow: "hidden",
              minHeight: 110,
              flexShrink: 0,
            }}
          >
            {/* Road strip */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 6,
                background:
                  "repeating-linear-gradient(90deg,#fbbf24 0,#fbbf24 30px,transparent 30px,transparent 60px)",
                opacity: 0.6,
              }}
            />

            {/* Car */}
            <div
              style={{ position: "absolute", right: 120, bottom: 8, opacity: 0.9 }}
            >
              <CarSVG />
            </div>

            {/* Traffic light */}
            <div
              style={{ position: "absolute", right: 40, bottom: 0, opacity: 0.85 }}
            >
              <TrafficLightSVG />
            </div>

            {/* Content */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "18px 0",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "1.9rem",
                    fontWeight: 800,
                    color: "#1e3a8a",
                    margin: 0,
                    letterSpacing: -0.5,
                  }}
                >
                  Mes Candidats
                </h1>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#3b82f6",
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                >
                  Vue moniteur — {CURRENT_MONITOR}
                </div>
              </div>

              {/* Badge total */}
              <div
                style={{
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: 10,
                  padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,0.9)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#64748b",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Total candidats
                </div>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "#2563eb",
                    lineHeight: 1.1,
                  }}
                >
                  {CANDIDATES.length}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#94a3b8",
                      fontWeight: 500,
                      marginLeft: 4,
                    }}
                  >
                    candidats
                  </span>
                </div>
              </div>

              {/* Badge on track */}
              <div
                style={{
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: 10,
                  padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,0.9)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#64748b",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  En bonne voie
                </div>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "#10b981",
                    lineHeight: 1.1,
                  }}
                >
                  {onTrackCount}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#94a3b8",
                      fontWeight: 500,
                      marginLeft: 4,
                    }}
                  >
                    candidats
                  </span>
                </div>
              </div>

              {/* Instructor badge */}
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: 20,
                  padding: "6px 14px 6px 8px",
                  border: "1px solid rgba(255,255,255,0.9)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#ffb347",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "#fff",
                    fontSize: 14,
                  }}
                >
                  S
                </div>
                <div>
                  <div
                    style={{ color: "#1e3a8a", fontWeight: 600, fontSize: 13 }}
                  >
                    {CURRENT_MONITOR}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>Moniteur</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── TOOLBAR ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 28px",
              borderBottom: "1px solid #e2e8f0",
              background: "#fff",
              flexShrink: 0,
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div
              style={{ position: "relative", flex: 1, maxWidth: 360, minWidth: 180 }}
            >
              <svg
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  color: "#1e293b",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "0.8rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Filter status */}
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>
              Statut :
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "7px 10px",
                borderRadius: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#334155",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "0.8rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Tous</option>
              <option value="on-track">En bonne voie</option>
              <option value="needs-work">À améliorer</option>
            </select>

            {(search || filterStatus) && (
              <button
                onClick={() => { setSearch(""); setFilterStatus(""); }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ✕ Réinitialiser
              </button>
            )}

            {/* Legend */}
            <div
              style={{
                display: "flex",
                gap: 14,
                marginLeft: "auto",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "0.72rem",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: "#10b981",
                  }}
                />
                En bonne voie ({onTrackCount})
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: "#f59e0b",
                  }}
                />
                À améliorer ({CANDIDATES.length - onTrackCount})
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "3px 12px",
                  borderRadius: 20,
                }}
              >
                {filtered.length} candidat{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* ── CARDS GRID ── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 28px 28px",
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                }}
              >
                Aucun candidat trouvé.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 16,
                }}
              >
                {filtered.map((c) => (
                  <CandidateCard key={c.id} candidate={c} />
                ))}
              </div>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "10px 28px 14px",
              background: "#fff",
              borderTop: "1px solid #e2e8f0",
              flexShrink: 0,
            }}
          >
            {[
              { color: "#10b981", label: "En bonne voie" },
              { color: "#f59e0b", label: "À améliorer" },
              { color: "#2563eb", label: "Progression" },
            ].map(({ color, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: "0.76rem",
                  color: "#64748b",
                }}
              >
                <div
                  style={{ width: 12, height: 12, borderRadius: 3, background: color }}
                />
                {label}
              </div>
            ))}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.72rem",
                color: "#94a3b8",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {CANDIDATES.length} candidats assignés
            </div>
          </div>
        </main>
      </div>
    </>
  );
}