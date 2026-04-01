import React from "react";
import "../../styles/Dashboard.css";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";

/* ─── StatCard ─── */
const StatCard = ({ icon, iconClass, label, value, trend, trendDown }) => (
  <div className="stat-card">
    <div className="stat-header">
      <span className="stat-label">{label}</span>
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
    </div>
    <div className="stat-value">{value}</div>
    <div className={`stat-trend ${trendDown ? "down" : ""}`}>{trend}</div>
  </div>
);

/* ─── Line Chart ─── */
const LineChart = ({ data, color = "#1e88e5" }) => {
  const max = Math.max(...data);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 280;
      const y = 100 - (v / max) * 90;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `0,100 ${points} 280,100`;
  return (
    <div className="line-chart-wrap">
      <svg viewBox="0 0 280 110" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#lineGrad)" />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/* ─── Bar Chart ─── */
const BarChart = ({ data, color }) => {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-item">
          <div
            className="bar-fill"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: color || "#26a69a",
            }}
          />
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── ADMIN DASHBOARD (contenu principal) ─── */
const AdminDashboard = () => {
  const revenueData = [3800, 4500, 5200, 4800, 6200, 6800, 7100];
  const sessionsData = [
    { label: "S1", value: 42 },
    { label: "S2", value: 55 },
    { label: "S3", value: 48 },
    { label: "S4", value: 61 },
  ];
  const exams = [
    { name: "Marie Dubois", date: "2026-03-10 09:00", type: "code" },
    { name: "Pierre Martin", date: "2026-03-10 14:00", type: "conduite" },
    { name: "Sophie Leroy", date: "2026-03-11 10:00", type: "code" },
    { name: "Luc Bernard", date: "2026-03-12 15:30", type: "conduite" },
  ];
  const activities = [
    { dot: "blue", text: "Nouvelle candidate enregistrée : Emma Petit", time: "Il y a 2 heures" },
    { dot: "green", text: "Paiement reçu de Jacques Durand", time: "Il y a 3 heures" },
    { dot: "orange", text: "Session terminée : Marie Dubois", time: "Il y a 5 heures" },
    { dot: "purple", text: "Examen prévu pour Pierre Martin", time: "Il y a 1 jour" },
  ];

  return (
    <>
      <div className="stats-grid">
        <StatCard
          icon="👥"
          iconClass="blue"
          label="Total candidats"
          value="156"
          trend="↑ +12% ce mois"
        />
        <StatCard
          icon="🚗"
          iconClass="green"
          label="Sessions actives"
          value="48"
          trend="↑ +8% ce mois"
        />
        <StatCard
          icon="📋"
          iconClass="orange"
          label="Examens à venir"
          value="23"
          trend="↓ 3% ce mois"
          trendDown
        />
        <StatCard
          icon="💰"
          iconClass="purple"
          label="Revenu mensuel"
          value="7 100 DA"
          trend="↑ +15% ce mois"
        />
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>📈 Aperçu des revenus</h3>
          <LineChart data={revenueData} color="#1e88e5" />
        </div>
        <div className="chart-card">
          <h3>📅 Sessions de ce mois</h3>
          <BarChart data={sessionsData} />
        </div>
      </div>

      <div className="bottom-row">
        <div className="section-card">
          <h3>📋 Examens à venir</h3>
          <div className="exam-list">
            {exams.map((e, i) => (
              <div key={i} className="exam-item">
                <div className="exam-info">
                  <p>{e.name}</p>
                  <span>{e.date}</span>
                </div>
                <span className={`exam-badge ${e.type}`}>
                  {e.type === "code" ? "Code" : "Conduite"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <h3>🔔 Activité récente</h3>
          <div className="activity-list">
            {activities.map((a, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-dot ${a.dot}`} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── PAGE PRINCIPALE ─── */
const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      {/* Pas de Sidebar */}
      <div className="dashboard-main">
        {/* Header identique à la page Candidats */}
        <div className="header">
          <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1>
            <img src={SmallCar} alt="" width={40} /> Panneau de contrôle de l'auto-école
          </h1>
          <p>Gérer les étudiants, les leçons et les examens</p>
        </div>

        {/* Contenu */}
        <div className="dashboard-content">
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;