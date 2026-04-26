import React, { useState, useEffect } from "react";
import { Search, TrendingUp, Users } from "lucide-react";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import { useAuth } from "../context/AuthContext";
import { useMyPermissions } from "../context/PermissionsContext";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getInitials = (nom) =>
  nom
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const AVATAR_COLORS = [
  { color: "#dbeafe", textColor: "#185fa5" },
  { color: "#dcfce7", textColor: "#3b6d11" },
  { color: "#faeeda", textColor: "#854f0b" },
  { color: "#fbeaf0", textColor: "#993556" },
  { color: "#eeedfe", textColor: "#534ab7" },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const MesCandidats = () => {
  // ── Auth + permissions ─────────────────────────────────────────────────────
  const { currentUser } = useAuth();                            // ← plus de localStorage direct
  const { CAN_VIEW_ALL_CANDIDATES } = useMyPermissions();       // ← permission dynamique

  const [search, setSearch]     = useState("");
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading]   = useState(true);

  // ─────────────────────────────────────────────
  // Chargement des données
  // ─────────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);

      const [rawCandidats, rawSeances] = await Promise.all([
        window.electron.getCandidats(),
        window.electron.getSeances(),
      ]);

      const moniteurId = currentUser?.id;

      // Si CAN_VIEW_ALL_CANDIDATES → on voit toutes les séances (tous moniteurs)
      // Sinon → uniquement les séances de ce moniteur
      const mesSeances = CAN_VIEW_ALL_CANDIDATES
        ? rawSeances
        : moniteurId
          ? rawSeances.filter((s) => s.moniteur_id === moniteurId)
          : [];

      // Set des ids candidats présents dans mes séances
      const candidatIdSet = new Set();
      mesSeances.forEach((s) => {
        if (!s.candidatsIds) return;
        String(s.candidatsIds)
          .split(",")
          .forEach((id) => candidatIdSet.add(parseInt(id.trim())));
      });

      const now = new Date();
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      const formatted = rawCandidats
        // Si CAN_VIEW_ALL_CANDIDATES → tous les candidats ; sinon filtre par id
        .filter((c) => CAN_VIEW_ALL_CANDIDATES || candidatIdSet.has(c.idCandidat))
        .map((c, index) => {
          // Séances de ce candidat dans mes séances
          const seancesDuCandidat = mesSeances.filter((s) => {
            if (!s.candidatsIds) return false;
            return String(s.candidatsIds)
              .split(",")
              .map((id) => parseInt(id.trim()))
              .includes(c.idCandidat);
          });

          const nbSessions = seancesDuCandidat.length;

          // Prochaine séance à venir
          const nextSeance = seancesDuCandidat
            .map((s) => {
              const dateObj = s.date instanceof Date ? s.date : new Date(s.date);
              const [h, m, sec] = (s.heure || "08:00").split(":");
              const dt = new Date(dateObj);
              dt.setHours(parseInt(h), parseInt(m), parseInt(sec || 0), 0);
              return { ...s, _dt: dt };
            })
            .filter((s) => {
              const seanceMidnight = new Date(s._dt);
              seanceMidnight.setHours(0, 0, 0, 0);
              const isToday  = seanceMidnight.getTime() === todayMidnight.getTime();
              const isFuture = seanceMidnight > todayMidnight;
              const isDone   = s.statut === "terminée" || s.statut === "annulée";
              return (isToday || isFuture) && !isDone;
            })
            .sort((a, b) => a._dt - b._dt)[0];

          const nextSession = nextSeance
            ? `${new Date(nextSeance._dt).toLocaleDateString("fr-FR")} ${nextSeance.heure}`
            : "—";

          return {
            id:          c.idCandidat,
            nom:         `${c.prenom} ${c.nom}`,
            tel:         c.telephone,
            sessions:    nbSessions,
            total:       30,
            nextSession,
            status:      c.statut,
            ...AVATAR_COLORS[index % AVATAR_COLORS.length],
          };
        });

      setCandidats(formatted);
    } catch (error) {
      console.error("Erreur lors du chargement des candidats :", error);
      setCandidats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id, CAN_VIEW_ALL_CANDIDATES]); // recharge si permission change

  // ─────────────────────────────────────────────
  // Stats dérivées
  // ─────────────────────────────────────────────
  const onTrack = candidats.filter((c) => c.sessions / c.total >= 0.5).length;

  const filtered = candidats.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.tel?.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="container">
      <div className="main">

        {/* HEADER */}
        <div className="header">
          <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1>
            <img src={SmallCar} alt="" width={40} />
            Panneau de contrôle de l'auto-école
          </h1>
          <p>
            {CAN_VIEW_ALL_CANDIDATES
              ? "Vue complète — tous les candidats de l'auto-école"
              : "Gérer mes étudiants, leçons et examens"}
          </p>
        </div>

        {/* Badge vue */}
        {CAN_VIEW_ALL_CANDIDATES && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(22,101,52,0.08)",
            border: "1px solid rgba(22,101,52,0.25)",
            borderRadius: 10, padding: "6px 14px",
            fontSize: "0.75rem", color: "#166534", fontWeight: 600,
            marginBottom: 14,
          }}>
            👥 Accès étendu — vous voyez tous les candidats
          </div>
        )}

        {/* STATS */}
        <div className="stats-row-layout">
          <div className="interactive-stat-card-small large-stat">
            <div className="stat-data">
              <p className="stat-label-small">
                {CAN_VIEW_ALL_CANDIDATES ? "Total Candidats" : "Mes Candidats"}
              </p>
              <h3 className="stat-number-small">{candidats.length}</h3>
            </div>
            <div
              className="stat-icon-circle-small large-icon"
              style={{ backgroundColor: "rgba(77,163,255,0.15)" }}
            >
              <Users size={24} color="#4da3ff" />
            </div>
          </div>

          <div className="interactive-stat-card-small large-stat">
            <div className="stat-data">
              <p className="stat-label-small">En bonne voie</p>
              <h3 className="stat-number-small">{onTrack}</h3>
            </div>
            <div
              className="stat-icon-circle-small large-icon"
              style={{ backgroundColor: "#d4edda" }}
            >
              <TrendingUp size={24} color="green" />
            </div>
          </div>
        </div>

        {/* CANDIDATS SECTION */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>{CAN_VIEW_ALL_CANDIDATES ? "Tous les Candidats" : "Mes Candidats"}</h2>
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
          {loading ? (
            <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>
              Chargement…
            </p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>
              Aucun candidat trouvé
            </p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}>
              {filtered.map((c) => {
                const pct = Math.min(Math.round((c.sessions / c.total) * 100), 100);
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
                        <div style={{ fontSize: 12, color: "#64748B" }}>{c.tel}</div>
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

                    {/* Status */}
                    <div style={{ marginTop: 8 }}>
                      <span className={`status ${c.status}`}>{c.status}</span>
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
          )}
        </div>
      </div>
    </div>
  );
};

const candidateCard = {
  background: "#f0f6ff",
  border: "1px solid #e2eaf6",
  borderRadius: 10,
  padding: "1rem 1.25rem",
};

export default MesCandidats;