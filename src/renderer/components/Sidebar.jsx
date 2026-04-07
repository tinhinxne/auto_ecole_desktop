import React from "react";
import "./Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaThLarge, FaUserFriends, FaUserTie, FaCalendarAlt,
  FaFileAlt, FaCreditCard, FaSignOutAlt, FaCog
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
    navigate("/connexion");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">A</div>
        <h2 className="logo">AutoÉcole <span>Pro</span></h2>
      </div>

      <nav className="sidebar-nav">
        <ul className="menu">
          {menu.map((item) => (
            <Link to={item.path} key={item.name} className="menu-link">
              <li className={`menu-item ${location.pathname === item.path ? "active" : ""}`}>
                <div className="active-indicator"></div>
                <span className="icon">{item.icon}</span>
                <span className="text">{item.name}</span>
              </li>
            </Link>
          ))}
        </ul>

        <div className="separator"></div>

        <Link to="/parametres" className="menu-link">
          <li className={`menu-item ${location.pathname === "/parametres" ? "active" : ""}`}>
            <div className="active-indicator"></div>
            <span className="icon"><FaCog /></span>
            <span className="text">Paramètres</span>
          </li>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="logout-card" onClick={handleLogout}>
          <div className="logout-btn">
             <FaSignOutAlt />
             <span>Quitter</span>
          </div>
        </div>
        <img src={SidebarImage} alt="" className="footer-bg-img" />
      </div>
    </div>
  );
};

export default Sidebar;