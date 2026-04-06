import React, { useState } from "react";
import { Search, TrendingUp, Users } from "lucide-react";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";

const candidatsData = [
  { id: 1, nom: "Marie Dubois",   email: "marie.dubois@email.com",  sessions: 18, total: 30, nextSession: "2026-03-10 09:00", color: "#dbeafe", textColor: "#185fa5" },
  { id: 2, nom: "Pierre Martin",  email: "pierre.martin@email.com", sessions: 12, total: 30, nextSession: "2026-03-10 14:00", color: "#dcfce7", textColor: "#3b6d11" },
  { id: 3, nom: "Sophie Leroy",   email: "sophie.leroy@email.com",  sessions: 28, total: 30, nextSession: "2026-03-11 10:00", color: "#faeeda", textColor: "#854f0b" },
  { id: 4, nom: "Luc Bernard",    email: "luc.bernard@email.com",   sessions: 20, total: 30, nextSession: "2026-03-12 15:00", color: "#fbeaf0", textColor: "#993556" },
  { id: 5, nom: "Emma Petit",     email: "emma.petit@email.com",    sessions: 5,  total: 30, nextSession: "2026-03-13 11:00", color: "#eeedfe", textColor: "#534ab7" },
];

const getInitials = (nom) =>
  nom.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const onTrack = candidatsData.filter((c) => c.sessions / c.total >= 0.5).length;

const MesCandidats = () => {
  const [search, setSearch] = useState("");

  const filtered = candidatsData.filter((c) =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="main">

        {/* HEADER */}
        <div className="header">
          <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1>
            <img src={SmallCar} alt="" width={40} /> Panneau de contrôle de l'auto-école
          </h1>
          <p>Gérer les étudiants, les leçons et les examens</p>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
          <div style={statCard}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "rgba(77,163,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Users size={18} color="#4da3ff" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 2 }}>Total Candidats</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>{candidatsData.length}</div>
            </div>
          </div>

          <div style={statCard}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "#d4edda",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <TrendingUp size={18} color="green" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 2 }}>En bonne voie</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>{onTrack}</div>
            </div>
          </div>
        </div>

        {/* SECTION CANDIDATS */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Mes Candidats</h2>
              <p>Voir et suivre la progression de vos candidats</p>
            </div>
          </div>

          {/* SEARCH */}
          <div className="search-bar">
            <div className="search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher des candidats..."
                className="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* CARDS GRID */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 12,
          }}>
            {filtered.map((c) => {
              const pct = Math.round((c.sessions / c.total) * 100);
              return (
                <div key={c.id} style={candidateCard}>
                  {/* Avatar + nom */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: c.color, color: c.textColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>
                      {getInitials(c.nom)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{c.nom}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>{c.email}</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span className="progress-text">Progression</span>
                    <span className="progress-text">{c.sessions}/{c.total} sessions</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${pct}%` }} />
                  </div>

                  {/* Next session */}
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>
                    Prochaine session :{" "}
                    <span style={{ color: "#1e293b", fontWeight: 600 }}>{c.nextSession}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const statCard = {
  background: "white",
  borderRadius: 10,
  padding: "1rem 1.25rem",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const candidateCard = {
  background: "#f0f6ff",
  border: "1px solid #e2eaf6",
  borderRadius: 10,
  padding: "1rem 1.25rem",
};

export default MesCandidats;