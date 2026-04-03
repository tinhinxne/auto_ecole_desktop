import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaThLarge,
  FaUserFriends,
  FaCalendarAlt,
  FaSignOutAlt
} from "react-icons/fa";

import SidebarImage from "../../assets/sidebarImage.png";

const SidebarMoniteur = () => {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", icon: <FaThLarge />, path: "/moniteur/dashboard" },
    { name: "Mes Candidats", icon: <FaUserFriends />, path: "/moniteur/candidats" },
    { name: "Mes Séances", icon: <FaCalendarAlt />, path: "/moniteur/seances" },
  ];

  return (
    <>
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">Moniteur</h2>

          <ul className="menu">
            {menu.map((item) => (
              <Link to={item.path} key={item.name} className="menu-link">
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
          </ul>
        </div>

        <div className="sidebar-bottom">
          <div className="logout">
            <FaSignOutAlt />
            <span>Déconnexion</span>
          </div>

          <img src={SidebarImage} alt="sidebar" className="sidebar-image" />
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          background: #4E96E1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px 12px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .logo {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 25px;
        }

        .menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .menu-link {
          text-decoration: none;
          color: inherit;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 8px;
          transition: 0.2s;
          color: white;
        }

        .menu-item:hover {
          background: rgba(0, 0, 0, 0.15);
        }

        .menu-item.active {
          background: #2F2F2F;
        }

        .icon {
          display: flex;
          align-items: center;
          font-size: 16px;
        }

        .sidebar-bottom {
          position: relative;
        }

        .logout {
          background: #E44C3C;
          padding: 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 10px;
          z-index: 2;
        }

        .sidebar-image {
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          pointer-events: none;
        }
      `}</style>
    </>
  );
};

export default SidebarMoniteur;