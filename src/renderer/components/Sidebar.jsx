import React, { useState } from "react";
import "./Sidebar.css";
import {
  FaThLarge,
  FaUserFriends,
  FaUserTie,
  FaCalendarAlt,
  FaFileAlt,
  FaCreditCard,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SidebarImage from "../../assets/sidebarImage.png";

const Sidebar = ({ role = "admin" }) => {
  const [active, setActive] = useState("Dashboard");
  const navigate = useNavigate();

  // ── Admin menu ──────────────────────────────────
  const adminMenu = [
    { name: "Dashboard",  icon: <FaThLarge /> },
    { name: "Candidats",  icon: <FaUserFriends /> },
    { name: "Moniteur",   icon: <FaUserTie /> },
    { name: "Agenda",     icon: <FaCalendarAlt /> },
    { name: "Examens",    icon: <FaFileAlt /> },
    { name: "Paiements",  icon: <FaCreditCard /> },
  ];

  // ── Moniteur menu ────────────────────────────────
  const moniteurMenu = [
    { name: "Dashboard",   icon: <FaThLarge /> },
    { name: "Candidats",   icon: <FaUserFriends /> },
    { name: "Mes Sessions",icon: <FaCalendarAlt /> },
    { name: "Examens",     icon: <FaFileAlt /> },
  ];

  const menu = role === "moniteur" ? moniteurMenu : adminMenu;

  const handleLogout = () => {
    sessionStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className="sidebar">
      {/* TOP */}
      <div className="sidebar-top">
        <h2 className="logo">AutoÉcole Pro</h2>

        <ul className="menu">
          {menu.map((item) => (
            <li
              key={item.name}
              className={active === item.name ? "menu-item active" : "menu-item"}
              onClick={() => setActive(item.name)}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.name}</span>
            </li>
          ))}
        </ul>

        {/* Paramètres — admin uniquement */}
        {role === "admin" && (
          <li
            className={active === "Parametre" ? "menu-item-param menu-item-param-active" : "menu-item-param"}
            onClick={() => setActive("Parametre")}
            style={{ listStyle: "none" }}
          >
            <span className="icon"><FaCog /></span>
            <span>Paramètre</span>
          </li>
        )}
      </div>

      {/* BOTTOM IMAGE */}
      <div className="sidebar-bottom">
        <img src={SidebarImage} alt="sidebar illustration" className="sidebar-image" />
      </div>

      {/* LOGOUT */}
      <div className="logout" onClick={handleLogout} style={{ cursor: "pointer" }}>
        <FaSignOutAlt />
        <span>Déconnexion</span>
      </div>
    </div>
  );
};

export default Sidebar;
