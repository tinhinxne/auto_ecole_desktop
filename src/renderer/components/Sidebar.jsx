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
  FaCog
} from "react-icons/fa";

import SidebarImage from "../../assets/sidebarImage.png";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [active, setActive] = useState("Candidats");

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
            <li
              key={item.name}
              className={active === item.name ? "menu-item active" : "menu-item"}
              onClick={() => setActive(item.name)}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.name}</span>
            </li>
          ))}

          <li
            className={
              active === "Parametre"
                ? "menu-item param active"
                : "menu-item param"
            }
            onClick={() => setActive("Parametre")}
          >
            <FaCog />
            <span>Parametre</span>
          </li>
        </ul>
      </div>

      {/* BOTTOM */}
      <div className="sidebar-bottom">
        <div className="logout">
          <FaSignOutAlt />
          <span>Déconnexion</span>
        </div>

        <img src={SidebarImage} alt="" className="sidebar-image" />
      </div>
    </div>
  );
};

export default Sidebar;