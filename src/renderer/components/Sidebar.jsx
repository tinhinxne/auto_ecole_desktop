import React from "react";
import "./Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaUserFriends,
  FaUserTie,
  FaCalendarAlt,
  FaFileAlt,
  FaCreditCard,
  FaSignOutAlt,
  FaCog
} from "react-icons/fa";
import SidebarImage from "../../assets/sidebarImage.png";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", icon: <FaThLarge />, path: "/dashboard" },
    { name: "Candidats", icon: <FaUserFriends />, path: "/candidats" },
    { name: "Moniteur", icon: <FaUserTie />, path: "/moniteur" },
    { name: "Agenda", icon: <FaCalendarAlt />, path: "/agenda" },
    { name: "Examens", icon: <FaFileAlt />, path: "/examens" },
    { name: "Payments", icon: <FaCreditCard />, path: "/payments" },
  ];

  const handleLogout = () => {
    // Logique de déconnexion ici (ex: clear localStorage)
    navigate("/connexion");
  };

  return (
    <div className="sidebar">
      {/* SECTION HAUTE */}
      <div className="sidebar-top">
        <h2 className="logo">AutoÉcole <span style={{ color: "#FFD700" }}>Pro</span></h2>

        <ul className="menu">
          {menu.map((item) => (
            <Link to={item.path} key={item.name} className="menu-link">
              <li className={`menu-item ${location.pathname === item.path ? "active" : ""}`}>
                <span className="icon">{item.icon}</span>
                <span>{item.name}</span>
              </li>
            </Link>
          ))}

          {/* Bouton Paramètres séparé par un margin-top comme dans ton CSS */}
          <Link to="/parametres" className="menu-link">
            <li className={`menu-item param ${location.pathname === "/parametres" ? "active" : ""}`}>
              <span className="icon"><FaCog /></span>
              <span>Paramètres</span>
            </li>
          </Link>
        </ul>
      </div>

      {/* SECTION BASSE */}
      <div className="sidebar-bottom">
        <div className="logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Déconnexion</span>
        </div>

        {/* L'image de décoration en fond de sidebar */}
        <img src={SidebarImage} alt="décoration" className="sidebar-image" />
      </div>
    </div>
  );
};

export default Sidebar;