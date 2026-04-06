import React from "react";
import { FaUserFriends, FaCar, FaCalendarCheck, FaCheckCircle, FaClock } from "react-icons/fa";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import "../../styles/DashboardMoniteur.css";

const DashboardMoniteur = () => {
  const stats = [
    { label: "Mes étudiants", value: 15, icon: <FaUserFriends />, color: "#1a1a2e" },
    { label: "Séances Aujourd'hui", value: 2, icon: <FaCar />, color: "#10b981" },
    { label: "Cette semaine", value: 12, icon: <FaCalendarCheck />, color: "#f59e0b" },
    { label: "Terminées", value: 48, icon: <FaCheckCircle />, color: "#8b5cf6" },
  ];

  return (
    <div className="dashboard-moniteur-container">
      <div className="main-content-wrapper">
        
        {/* HEADER */}
       <div className="header">
  <img src={ConnexionImg} alt="illustration" className="header-img" />
  <h1>
    <img src={SmallCar} alt="" width={40} /> Panneau de contrôle de l'auto-école
  </h1>
  <p>Gérer les étudiants, les leçons et les examens de conduite</p>
</div>

        <div className="dashboard-content-body">
          <div className="welcome-section">
            <h2 className="welcome-title">Tableau de bord du moniteur</h2>
            <p className="welcome-subtitle">Bon retour ! Voici votre emploi du temps pour aujourd'hui.</p>
          </div>

          {/* SECTION STATS - Forcée sur une seule ligne */}
          <div className="stats-row-layout">
            {stats.map((stat, index) => (
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

          {/* SECTION GRILLE INFÉRIEURE */}
          <div className="info-grid-columns">
            <div className="content-column sessions-theme">
              <h3 className="column-header"><FaClock /> Prochaines séances</h3>
              <div className="interactive-item-card">
                <div className="item-details">
                  <strong>Tinhinane belarbi</strong>
                  <p>09:00 - 11:00</p>
                </div>
                <span className="badge-today">Aujourd'hui</span>
              </div>
              <div className="interactive-item-card">
                <div className="item-details">
                  <strong>Melissa Azul</strong>
                  <p>14:00 - 15:30</p>
                </div>
                <span className="badge-today">Aujourd'hui</span>
              </div>
            </div>

            <div className="content-column alerts-theme">
              <h3 className="column-header"><FaUserFriends /> Alertes des étudiants</h3>
              <div className="interactive-item-card alert-layout">
                <div className="status-dot dot-red"></div>
                <div className="item-details">
                  <strong>Soso ben</strong>
                  <p>Prêt pour l'examen</p>
                </div>
              </div>
              <div className="interactive-item-card alert-layout">
                <div className="status-dot dot-orange"></div>
                <div className="item-details">
                  <strong>Berkani hadjer</strong>
                  <p>Pratique requise</p>
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