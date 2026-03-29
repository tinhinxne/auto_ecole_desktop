import React from "react";
import "./Sidebar.css";
import { Link, useLocation } from "react-router-dom";

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

  const menu = [
    { name: "Dashboard", icon: <FaThLarge />, path: "/dashboard" },
    { name: "Candidats", icon: <FaUserFriends />, path: "/candidats" },
    { name: "Moniteur", icon: <FaUserTie />, path: "/moniteur" },
    { name: "Agenda", icon: <FaCalendarAlt />, path: "/agenda" },
    { name: "Examens", icon: <FaFileAlt />, path: "/examens" },
    { name: "Payments", icon: <FaCreditCard />, path: "/payments" },
  ];

  return (
    <div className="sidebar">

      {/* TOP */}
      <div className="sidebar-top">
        <h2 className="logo">AutoÉcole Pro</h2>

        <ul className="menu">
          {menu.map((item) => (
            <Link
              to={item.path}
              key={item.name}
              className="menu-link"
            >
              <li
                className={
                  location.pathname === item.path
                    ? "menu-item active"
                    : "menu-item"
                }
              >
                <span className="icon">{item.icon}</span>
                <span>{item.name}</span>
              </li>
            </Link>
          ))}

          {/* SETTINGS */}
          <Link to="/settings" className="menu-link">
            <li
              className={
                location.pathname === "/settings"
                  ? "menu-item active"
                  : "menu-item"
              }
            >
              <FaCog />
              <span>Paramètres</span>
            </li>
          </Link>
        </ul>
      </div>

      {/* BOTTOM */}
      <div className="sidebar-bottom">
        <div className="logout">
          <FaSignOutAlt />
          <span>Déconnexion</span>
        </div>

        <img src={SidebarImage} alt="sidebar" className="sidebar-image" />
      </div>
    </div>
  );
};

export default Sidebar;