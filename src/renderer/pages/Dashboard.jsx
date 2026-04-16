import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { FiUsers, FiActivity, FiCalendar, FiClock } from "react-icons/fi";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import "../../styles/Dashboard.css";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

// Couleur du badge selon statut séance
const statutColor = (statut) => {
  if (!statut) return { bg: "#F1F5F9", color: "#64748B" };
  const s = statut.toLowerCase();
  if (s === "planifiée" || s === "planifiee") return { bg: "#EFF6FF", color: "#3B82F6" };
  if (s === "terminée"  || s === "terminee")  return { bg: "#F0FDF4", color: "#16A34A" };
  return { bg: "#FFF7ED", color: "#EA580C" };
};

const Dashboard = () => {
  const [stats, setStats]     = useState({ totalCandidats: 0, sessionsToday: 0, revenuMois: 0 });
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      window.electron.getDashboardStats(),
      window.electron.getSeances(),
    ]).then(([s, allSeances]) => {
      setStats(s ?? { totalCandidats: 0, sessionsToday: 0, revenuMois: 0 });
      // 5 séances les plus récentes pour l'activité récente
      setSeances((allSeances ?? []).slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Cards dynamiques — seules les valeurs changent, le design reste identique
  const cardData = [
    {
      label: "Nombre total de candidats",
      val: loading ? "…" : String(stats.totalCandidats ?? 0),
      trend: null,
      color: "blue",
      icon: <FiUsers />
    },
    {
      label: "Sessions aujourd'hui",
      val: loading ? "…" : String(stats.sessionsToday ?? 0),
      trend: null,
      color: "green",
      icon: <FiActivity />
    },
    {
      label: "Examens à venir",
      val: "—",          // pas encore dans le backend, placeholder
      trend: null,
      color: "red",
      icon: <FiCalendar />
    },
    {
      label: "Revenu mensuel",
      val: loading ? "…" : `${Number(stats.revenuMois ?? 0).toLocaleString("fr-DZ")} DA`,
      trend: null,
      color: "orange",
      icon: <FiActivity />
    }
  ];

  return (
    <div className="dashboard-wrapper">
      {/* BANNIÈRE */}
      <motion.div
        className="header-banner-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="header">
          <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1>
            <img src={SmallCar} alt="" width={40} /> Panneau de contrôle de l'auto-école
          </h1>
          <p>Gérer les étudiants, les leçons et les examens de conduite</p>
        </div>
      </motion.div>

      <motion.div className="welcome-section" {...fadeInUp}>
        <h2>Tableau de bord de l'administrateur</h2>
        <p>Bon retour ! Voici votre emploi du temps pour aujourd'hui.</p>
      </motion.div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        {cardData.map((item, i) => (
          <motion.div
            key={i}
            className="stat-card-modern"
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-left">
              <span className="stat-label">{item.label}</span>
              <span className="stat-value">{item.val}</span>
              {item.trend && (
                <span className={`stat-trend ${item.color}`}>{item.trend}</span>
              )}
            </div>
            <div className={`stat-icon ${item.color}`}>{item.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* GRAPHIQUES (données statiques de démonstration — à connecter plus tard) */}
      <div className="charts-main-grid">
        <motion.div className="chart-box blue-bg" {...fadeInUp} transition={{ delay: 0.4 }}>
          <h3>Aperçu des revenus</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={[
              { n: "Jan", v: 4000 }, { n: "Fév", v: 3000 }, { n: "Mar", v: 5000 },
              { n: "Avr", v: 4500 }, { n: "Mai", v: 7000 }, { n: "Jun", v: 6500 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="n" tick={{ fill: "#fff" }} axisLine={false} />
              <YAxis tick={{ fill: "#fff" }} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", color: "#1e293b" }}
                cursor={{ stroke: "#fff", strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="v" stroke="#fff" fillOpacity={0.4} fill="#fff" animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="chart-box blue-bg" {...fadeInUp} transition={{ delay: 0.5 }}>
          <h3>Sessions de ce mois</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{ n: "S1", v: 45 }, { n: "S2", v: 52 }, { n: "S3", v: 48 }, { n: "S4", v: 61 }]}>
              <XAxis dataKey="n" tick={{ fill: "#fff" }} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.1)" }} />
              <Bar dataKey="v" fill="#065F46" radius={[6, 6, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* LISTES BAS DE PAGE */}
      <div className="bottom-sections">

        {/* Examens à venir — placeholder statique */}
        <motion.div className="list-container blue-container" {...fadeInUp} transition={{ delay: 0.6 }}>
          <h3><FiCalendar /> Examens à venir</h3>
          {["Marie Dubois", "Pierre Martin", "Sophie Leroy", "Luc Bernard"].map((name, i) => (
            <motion.div
              key={i}
              className="modern-item-row"
              whileHover={{ x: 10, backgroundColor: "#fff" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="item-details">
                <strong>{name}</strong>
                <span>2026-03-10 à 09:00</span>
              </div>
              <span className="type-badge">Code</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Activité récente — DONNÉES RÉELLES */}
        <motion.div className="list-container blue-container" {...fadeInUp} transition={{ delay: 0.7 }}>
          <h3><FiClock /> Activité récente (séances)</h3>

          {loading && <p style={{ color: "#94A3B8", fontSize: 14 }}>Chargement…</p>}

          {!loading && seances.length === 0 && (
            <p style={{ color: "#94A3B8", fontSize: 14 }}>Aucune séance enregistrée.</p>
          )}

          {!loading && seances.map((s) => {
            const { bg, color } = statutColor(s.statut);
            return (
              <motion.div
                key={s.idSeance}
                className="modern-item-row"
                whileHover={{ x: 10, backgroundColor: "#fff" }}
              >
                <div className="activity-flex">
                  <div className="blue-dot"></div>
                  <div className="item-details">
                    <strong>
                      Séance {s.type} — {s.moniteurNom ?? "Moniteur inconnu"}
                    </strong>
                    <span>
                      {new Date(s.date).toLocaleDateString("fr-FR")} à {s.heure}
                      {s.candidatsNoms ? ` · ${s.candidatsNoms}` : ""}
                    </span>
                  </div>
                </div>
                <span
                  className="type-badge"
                  style={{ background: bg, color, border: "none" }}
                >
                  {s.statut}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;