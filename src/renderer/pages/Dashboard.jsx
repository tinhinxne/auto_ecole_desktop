import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ConnexionImage from '../../assets/Connexion.png';
import './Dashboard.css';

/* ─── StatCard ─── */
const StatCard = ({ icon, iconClass, label, value, trend, trendDown }) => (
  <div className="stat-card">
    <div className="stat-header">
      <span className="stat-label">{label}</span>
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
    </div>
    <div className="stat-value">{value}</div>
    <div className={`stat-trend ${trendDown ? 'down' : ''}`}>{trend}</div>
  </div>
);

/* ─── Line Chart ─── */
const LineChart = ({ data, color = '#1e88e5' }) => {
  const max = Math.max(...data);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 280;
      const y = 100 - (v / max) * 90;
      return `${x},${y}`;
    })
    .join(' ');
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
            style={{ height: `${(d.value / max) * 100}%`, background: color || '#26a69a' }}
          />
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Banner commun admin + moniteur ─── */
const DashboardBanner = ({ isAdmin }) => (
  <div className="dashboard-banner">
    <img src={ConnexionImage} alt="banner" className="dashboard-banner__img" />
    <div className="dashboard-banner__overlay">
      <div className="dashboard-banner__text">
        <h2>{isAdmin ? 'Driving School Control Panel' : 'Tableau de bord — Moniteur'}</h2>
        <p>{isAdmin ? 'Manage students, lessons and driving tests' : 'Vos sessions, candidats et progression'}</p>
      </div>
    </div>
  </div>
);

/* ═══════════════════════
   ADMIN DASHBOARD
   ═══════════════════════ */
const AdminDashboard = () => {
  const revenueData = [3800, 4500, 5200, 4800, 6200, 6800, 7100];
  const sessionsData = [
    { label: 'S1', value: 42 },
    { label: 'S2', value: 55 },
    { label: 'S3', value: 48 },
    { label: 'S4', value: 61 },
  ];
  const exams = [
    { name: 'Marie Dubois',  date: '2026-03-10 09:00', type: 'code' },
    { name: 'Pierre Martin', date: '2026-03-10 14:00', type: 'conduite' },
    { name: 'Sophie Leroy',  date: '2026-03-11 10:00', type: 'code' },
    { name: 'Luc Bernard',   date: '2026-03-12 15:30', type: 'conduite' },
  ];
  const activities = [
    { dot: 'blue',   text: 'Nouvelle candidate enregistrée : Emma Petit', time: 'Il y a 2 heures' },
    { dot: 'green',  text: 'Paiement reçu de Jacques Durand',             time: 'Il y a 3 heures' },
    { dot: 'orange', text: 'Session terminée : Marie Dubois',             time: 'Il y a 5 heures' },
    { dot: 'purple', text: 'Examen prévu pour Pierre Martin',             time: 'Il y a 1 jour'   },
  ];

  return (
    <>
      <div className="stats-grid">
        <StatCard icon="👥" iconClass="blue"   label="Total candidats"  value="156"      trend="↑ +12% ce mois" />
        <StatCard icon="🚗" iconClass="green"  label="Sessions actives" value="48"       trend="↑ +8% ce mois" />
        <StatCard icon="📋" iconClass="orange" label="Examens à venir"  value="23"       trend="↓ 3% ce mois" trendDown />
        <StatCard icon="💰" iconClass="purple" label="Revenu mensuel"   value="7 100 DA" trend="↑ +15% ce mois" />
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
                  {e.type === 'code' ? 'Code' : 'Conduite'}
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

/* ═══════════════════════
   MONITEUR DASHBOARD
   ═══════════════════════ */
const MoniteurDashboard = () => {
  const progressData = [30, 50, 60, 40, 70];
  const sessions = [
    { candidate: 'Ahmed Benali',   date: '2026-03-29', heure: '09:00', type: 'Conduite', status: 'planifie' },
    { candidate: 'Fatima Zohra',   date: '2026-03-29', heure: '11:00', type: 'Conduite', status: 'termine'  },
    { candidate: 'Karim Hadj',     date: '2026-03-29', heure: '14:00', type: 'Conduite', status: 'planifie' },
    { candidate: 'Nadia Brahim',   date: '2026-03-30', heure: '09:30', type: 'Conduite', status: 'annule'   },
    { candidate: 'Youcef Mansour', date: '2026-03-30', heure: '15:00', type: 'Conduite', status: 'planifie' },
  ];
  const students = [
    { name: 'Ahmed Benali',   heures: 14, total: 20 },
    { name: 'Fatima Zohra',   heures: 18, total: 20 },
    { name: 'Karim Hadj',     heures:  8, total: 20 },
    { name: 'Nadia Brahim',   heures: 20, total: 20 },
    { name: 'Youcef Mansour', heures:  5, total: 20 },
  ];

  return (
    <>
      <div className="stats-grid">
        <StatCard icon="🎓" iconClass="blue"   label="Mes candidats"     value="12"  trend="↑ 2 ce mois" />
        <StatCard icon="📅" iconClass="green"  label="Sessions ce mois"  value="31"  trend="↑ +5 vs mois dernier" />
        <StatCard icon="✅" iconClass="orange" label="Sessions terminées" value="26"  trend="84% du total" />
        <StatCard icon="⏳" iconClass="purple" label="Heures totales"     value="62h" trend="↑ +8h ce mois" />
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>📈 Mes sessions (5 semaines)</h3>
          <LineChart data={progressData} color="#26a69a" />
        </div>
        <div className="chart-card">
          <h3>🎯 Progression des candidats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {students.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#1a2332', minWidth: '55px', fontWeight: 500 }}>
                  {s.name.split(' ')[0]}
                </span>
                <div className="progress-wrap" style={{ flex: 1 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(s.heures / s.total) * 100}%` }} />
                  </div>
                  <span className="progress-label">{s.heures}/{s.total}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-row" style={{ gridTemplateColumns: '1fr' }}>
        <div className="section-card">
          <h3>🚗 Mes sessions à venir</h3>
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Type</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{s.candidate}</td>
                  <td>{s.date}</td>
                  <td>{s.heure}</td>
                  <td>{s.type}</td>
                  <td>
                    <span className={`status-badge ${s.status}`}>
                      {s.status === 'planifie' && 'Planifiée'}
                      {s.status === 'termine'  && 'Terminée'}
                      {s.status === 'annule'   && 'Annulée'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════
   MAIN DASHBOARD
   ═══════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem('userRole');
    if (!storedRole) { navigate('/access'); return; }
    setRole(storedRole);
  }, [navigate]);

  const isAdmin = role === 'admin';
  if (!role) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />

      <div className="dashboard-main">
        {/* ── Bannière image en haut ── */}
        <DashboardBanner isAdmin={isAdmin} />

        {/* ── Topbar ── */}
        <div className="dashboard-topbar">
          <div className="topbar-left">
            <h1>🚗 {isAdmin ? "Panneau de contrôle de l'auto-école" : 'Tableau de bord — Moniteur'}</h1>
            <p>{isAdmin ? 'Gérer les étudiants, les leçons et les examens de conduite' : 'Vos sessions, candidats et progression'}</p>
          </div>
          <div className="topbar-right">
            <span className={`topbar-role-badge ${isAdmin ? '' : 'moniteur'}`}>
              {isAdmin ? 'Administrateur' : 'Moniteur'}
            </span>
            <div className="topbar-avatar">{isAdmin ? 'A' : 'M'}</div>
          </div>
        </div>

        {/* ── Contenu ── */}
        <div className="dashboard-content">
          {isAdmin ? <AdminDashboard /> : <MoniteurDashboard />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
