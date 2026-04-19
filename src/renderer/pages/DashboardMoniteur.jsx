import React, { useEffect, useState } from "react";
import { FaUserFriends, FaCar, FaCalendarCheck, FaCheckCircle, FaClock } from "react-icons/fa";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import { useAuth } from "../context/AuthContext";
import "../../styles/DashboardMoniteur.css";

const DashboardMoniteur = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ candidats: 0, aujourd_hui: 0, semaine: 0, terminees: 0 });
  const [prochaines, setProchaines] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    window.electron.getSeances().then(seances => {
      const miennes = seances.filter(s => s.moniteur_id === currentUser.id);
      const today = new Date().toISOString().split("T")[0];
      const lundi = new Date();
      lundi.setDate(lundi.getDate() - lundi.getDay() + 1);
      const dimanche = new Date(lundi);
      dimanche.setDate(dimanche.getDate() + 6);

      const auj = miennes.filter(s => s.date?.slice(0,10) === today);
      const semaine = miennes.filter(s => {
        const d = new Date(s.date);
        return d >= lundi && d <= dimanche;
      });
      const terminees = miennes.filter(s => s.statut === "terminée");

      setStats({
        candidats: new Set(miennes.flatMap(s => s.candidatsIds?.split(",") || [])).size,
        aujourd_hui: auj.length,
        semaine: semaine.length,
        terminees: terminees.length,
      });

      // Prochaines séances aujourd'hui
      setProchaines(auj.slice(0, 3));
    });
  }, [currentUser]);

  const statCards = [
    { label: "Mes étudiants",       value: stats.candidats,    icon: <FaUserFriends />, color: "#1a1a2e" },
    { label: "Séances Aujourd'hui", value: stats.aujourd_hui,  icon: <FaCar />,         color: "#10b981" },
    { label: "Cette semaine",       value: stats.semaine,      icon: <FaCalendarCheck />,color: "#f59e0b" },
    { label: "Terminées",           value: stats.terminees,    icon: <FaCheckCircle />, color: "#8b5cf6" },
  ];

  return (
    <div className="dashboard-moniteur-container">
      <div className="main-content-wrapper">
        <div className="header">
          <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1><img src={SmallCar} alt="" width={40} /> Panneau de contrôle de l'auto-école</h1>
          <p>Bienvenue, {currentUser?.prenom} {currentUser?.nom}</p>
        </div>

        <div className="dashboard-content-body">
          <div className="welcome-section">
            <h2 className="welcome-title">Tableau de bord du moniteur</h2>
            <p className="welcome-subtitle">Bon retour ! Voici votre emploi du temps pour aujourd'hui.</p>
          </div>

          <div className="stats-row-layout">
            {statCards.map((stat, index) => (
              <div key={index} className="interactive-stat-card-small">
                <div className="stat-data">
                  <p className="stat-label-small">{stat.label}</p>
                  <h3 className="stat-number-small">{stat.value}</h3>
                </div>
                <div className="stat-icon-circle-small" style={{ backgroundColor: stat.color }}>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="info-grid-columns">
            <div className="content-column sessions-theme">
              <h3 className="column-header"><FaClock /> Prochaines séances</h3>
              {prochaines.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Aucune séance aujourd'hui.</p>
              ) : prochaines.map(s => (
                <div key={s.idSeance} className="interactive-item-card">
                  <div className="item-details">
                    <strong>{s.candidatsNoms || "—"}</strong>
                    <p>{s.heure} • {s.type}</p>
                  </div>
                  <span className="badge-today">Aujourd'hui</span>
                </div>
              ))}
            </div>

            <div className="content-column alerts-theme">
              <h3 className="column-header"><FaUserFriends /> Infos</h3>
              <div className="interactive-item-card alert-layout">
                <div className="status-dot dot-orange" />
                <div className="item-details">
                  <strong>Permissions</strong>
                  <p>Contactez l'admin pour modifier vos accès</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMoniteur;