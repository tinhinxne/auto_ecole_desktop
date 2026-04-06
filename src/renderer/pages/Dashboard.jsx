import React from "react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { FiUsers, FiActivity, FiCalendar, FiClock } from "react-icons/fi";
import ConnexionImg from "../../assets/Connexion.png";
import SmallCar from "../../assets/SmallCar.png";
import "../../styles/Dashboard.css";

// Animations de base
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper">
      {/* BANNIÈRE AVEC ENTRÉE DOUCE */}
      <motion.div 
        className="header-banner-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
            {/* HEADER */}
               <div className="header">
          <img src={ConnexionImg} alt="illustration" className="header-img" />
          <h1>
            <img src={SmallCar} alt="" width={40} /> Panneau de contrôle de l'auto-école
          </h1>
          <p>Gérer les étudiants, les leçons et les examens de conduite</p>
        </div>
        
      </motion.div>

      <motion.div className="welcome-section" {...fadeInUp}>
        <h2>Tableau de bord de l'administateur</h2>
        <p>Bon retour ! Voici votre emploi du temps pour aujourd'hui.</p>
      </motion.div>

      {/* CARDS INTERACTIVES : SURVOL ET CLIC */}
      <div className="stats-grid">
        {[
          { label: "Nombre total de candidats", val: "156", trend: "+12%", color: "blue", icon: <FiUsers /> },
          { label: "Sessions actives", val: "48", trend: "+8%", color: "green", icon: <FiActivity /> },
          { label: "Examens à venir", val: "23", trend: "-3%", color: "red", icon: <FiCalendar /> },
          { label: "Revenu mensuel", val: "7,100 DA", trend: "+15%", color: "orange", icon: <FiActivity /> }
        ].map((item, i) => (
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
               <span className={`stat-trend ${item.color}`}>{item.trend}</span>
            </div>
            <div className={`stat-icon ${item.color}`}>{item.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* GRAPHIQUES AVEC TOOLTIPS INTERACTIFS */}
      <div className="charts-main-grid">
        <motion.div className="chart-box blue-bg" {...fadeInUp} transition={{ delay: 0.4 }}>
          <h3>Aperçu des revenus</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={[
              { n: "Jan", v: 4000 }, { n: "Feb", v: 3000 }, { n: "Mar", v: 5000 }, 
              { n: "Apr", v: 4500 }, { n: "May", v: 7000 }, { n: "Jun", v: 6500 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="n" tick={{fill: '#fff'}} axisLine={false} />
              <YAxis tick={{fill: '#fff'}} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', color: '#1e293b' }}
                cursor={{ stroke: '#fff', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="v" stroke="#fff" fillOpacity={0.4} fill="#fff" animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="chart-box blue-bg" {...fadeInUp} transition={{ delay: 0.5 }}>
          <h3>Sessions de ce mois</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{n:'W1', v:45}, {n:'W2', v:52}, {n:'W3', v:48}, {n:'W4', v:61}]}>
              <XAxis dataKey="n" tick={{fill: '#fff'}} axisLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} />
              <Bar dataKey="v" fill="#065F46" radius={[6, 6, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* LISTES AVEC EFFET DE GLISSEMENT AU SURVOL */}
      <div className="bottom-sections">
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

        <motion.div className="list-container blue-container" {...fadeInUp} transition={{ delay: 0.7 }}>
          <h3><FiClock /> Activité récente</h3>
          {["Emma Petit", "Jacques Durand", "Marie Dubois", "Pierre Martin"].map((name, i) => (
            <motion.div 
              key={i} 
              className="modern-item-row"
              whileHover={{ x: 10, backgroundColor: "#fff" }}
            >
              <div className="activity-flex">
                <div className="blue-dot"></div>
                <div className="item-details">
                  <strong>Action effectuée pour {name}</strong>
                  <span>Il y a {i + 2} heures</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;