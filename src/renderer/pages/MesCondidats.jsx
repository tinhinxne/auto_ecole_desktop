import React, { useState } from "react";
import { Search, TrendingUp, CheckCircle } from "lucide-react";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";

const candidates = [
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

const MesCandidats = () => {
  const [search, setSearch] = useState("");

  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const onTrack = candidates.filter(
    (c) => c.progress / c.total >= 0.5
  ).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fb" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: 180,
        background: "#fff",
        borderRight: "1px solid #e8eaf0",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #e8eaf0" }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#1a2340" }}>
            AutoEcole{" "}
            <span style={{ color: "#3b8dff", fontWeight: 800 }}>Pro</span>
          </span>
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {[
            { label: "Dashboard", icon: "⊞", active: false },
            { label: "My Students", icon: "👤", active: true },
            { label: "My Sessions", icon: "📅", active: false },
          ].map(({ label, icon, active }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                background: active ? "#ebf3ff" : "transparent",
                borderRight: active ? "3px solid #3b8dff" : "3px solid transparent",
                cursor: "pointer",
                color: active ? "#3b8dff" : "#6b7490",
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </div>
          ))}
        </nav>
        <div style={{ padding: "0 12px 16px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            background: "#fff0f0",
            borderRadius: 8,
            cursor: "pointer",
            color: "#e05555",
            fontSize: 14,
            fontWeight: 500,
          }}>
            <span>↩</span> Déconnexion
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 180, flex: 1, padding: "0 0 40px" }}>
        {/* HEADER BANNER */}
        <div style={{
          background: "linear-gradient(135deg, #1a2340 0%, #2a3a6e 60%, #3b5bdb 100%)",
          borderRadius: "0 0 18px 18px",
          padding: "28px 32px 24px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          position: "relative",
          overflow: "hidden",
          minHeight: 120,
        }}>
          {/* Decorative road/car illustration area */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}>
              <span style={{ fontSize: 22 }}>🚗</span>
              <h1 style={{
                color: "#fff",
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.3px",
              }}>
                Driving School Control Panel
              </h1>
            </div>
            <p style={{ color: "#a8bdff", fontSize: 14, margin: 0 }}>
              Manage students, lessons
            </p>
          </div>
          {/* Instructor badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 20,
            padding: "6px 14px 6px 8px",
          }}>
            <div style={{
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
            }}>S</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>Sonia Berg</div>
              <div style={{ color: "#a8bdff", fontSize: 11 }}>Instructor</div>
            </div>
          </div>
          {/* Decorative car image (right side) */}
          <div style={{
            position: "absolute",
            right: 160,
            bottom: 0,
            opacity: 0.18,
            fontSize: 80,
            lineHeight: 1,
            pointerEvents: "none",
          }}>🚗</div>
          {/* Traffic light decoration */}
          <div style={{
            position: "absolute",
            right: 100,
            top: 10,
            opacity: 0.22,
            fontSize: 32,
          }}>🚦</div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "28px 32px 0" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a2340", margin: "0 0 4px" }}>
            My Students
          </h2>
          <p style={{ fontSize: 13, color: "#8891aa", margin: "0 0 20px" }}>
            View and track your assigned students' progress
          </p>

          {/* STAT CARDS */}
          <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
            <div style={{
              flex: 1,
              background: "#3b5bdb",
              borderRadius: 12,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: 8,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <TrendingUp size={18} color="#fff" />
              </div>
              <div>
                <div style={{ color: "#a8bdff", fontSize: 12 }}>Total Students</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 22 }}>{candidates.length}</div>
              </div>
            </div>
            <div style={{
              flex: 1,
              background: "#22c97a",
              borderRadius: 12,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: 8,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <CheckCircle size={18} color="#fff" />
              </div>
              <div>
                <div style={{ color: "#d0fff0", fontSize: 12 }}>On Track</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 22 }}>{onTrack}</div>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            border: "1px solid #e0e4f0",
            borderRadius: 10,
            padding: "8px 14px",
            gap: 8,
            marginBottom: 22,
          }}>
            <Search size={15} color="#aab0c5" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 14,
                color: "#1a2340",
                width: "100%",
              }}
            />
          </div>

          {/* CANDIDATE CARDS GRID */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}>
            {filtered.map((c) => {
              const pct = Math.round((c.progress / c.total) * 100);
              return (
                <div
                  key={c.id}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: "1px solid #e8eaf0",
                    padding: "18px 20px",
                    transition: "box-shadow 0.15s",
                  }}
                >
                  {/* Name + email */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "#1a2340", marginBottom: 2 }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#8891aa" }}>{c.email}</div>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "#8891aa" }}>Progress</span>
                      <span style={{ fontSize: 12, color: "#8891aa" }}>{c.progress}/{c.total} sessions</span>
                    </div>
                    <div style={{
                      background: "#eef1fb",
                      borderRadius: 6,
                      height: 7,
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: "#3b5bdb",
                        borderRadius: 6,
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "1px solid #f0f2fa", margin: "14px 0 10px" }} />

                  {/* Next session */}
                  <div>
                    <div style={{ fontSize: 11, color: "#aab0c5", marginBottom: 2 }}>Next Session</div>
                    <div style={{ fontSize: 13, color: "#3b5bdb", fontWeight: 500 }}>{c.nextSession}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MesCandidats;