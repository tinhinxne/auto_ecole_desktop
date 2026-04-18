import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaThLarge,
  FaUserFriends,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardList,
  FaSignOutAlt,
  FaCog
} from "react-icons/fa";
import SidebarImage from "../../assets/sidebarImage.png";

const SidebarMoniteur = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/connexion");
  };

  const menu = [
    { name: "Dashboard",    icon: <FaThLarge />,        path: "/moniteur/dashboard" },
    { name: "Mes Candidats",icon: <FaUserFriends />,    path: "/moniteur/candidat"  },
    { name: "Mes Séances",  icon: <FaCalendarAlt />,    path: "/moniteur/agenda"    },
    { name: "Paiements",    icon: <FaMoneyBillWave />,  path: "/moniteur/paiements" },
    { name: "Examens",      icon: <FaClipboardList />,  path: "/moniteur/examens"   },
  ];

  return (
    <>
      <div className="sidebar">
        {/* BRAND / LOGO */}
        <div className="sidebar-brand">
          <div className="brand-icon">M</div>
          <h2 className="logo">Espace <span>Moniteur</span></h2>
        </div>

        {/* NAVIGATION */}
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

          <Link to="/moniteur/parametres" className="menu-link">
            <li className={`menu-item ${location.pathname === "/moniteur/parametres" ? "active" : ""}`}>
              <div className="active-indicator"></div>
              <span className="icon"><FaCog /></span>
              <span className="text">Paramètres</span>
            </li>
          </Link>
        </nav>

        {/* FOOTER AVEC LOGOUT ET IMAGE */}
        <div className="sidebar-footer">
          <div className="logout-card" onClick={handleLogout}>
            <div className="logout-btn">
              <FaSignOutAlt />
              <span>Déconnexion</span>
            </div>
          </div>
          <img src={SidebarImage} alt="" className="footer-bg-img" />
        </div>
      </div>

      <style>{`
        :root {
          --sidebar-bg: #1e293b; 
          --active-blue: #4da3ff;
          --text-gray: #94a3b8;
        }

        .sidebar {
          width: 260px;
          height: 100vh;
          background: var(--sidebar-bg);
          display: flex;
          flex-direction: column;
          padding: 30px 0;
          color: white;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 25px;
          margin-bottom: 40px;
        }

        .brand-icon {
          background: var(--active-blue);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          color: white;
        }

        .logo {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }

        .logo span { color: var(--active-blue); }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
        }

        .menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .menu-link { text-decoration: none; color: inherit; }

        .menu-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 25px;
          color: var(--text-gray);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .active-indicator {
          position: absolute;
          left: 0;
          width: 0;
          height: 100%;
          background: var(--active-blue);
          transition: width 0.3s ease;
        }

        .menu-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
          padding-left: 30px;
        }

        .menu-item.active {
          color: white;
          background: rgba(77, 163, 255, 0.1);
        }

        .menu-item.active .active-indicator {
          width: 5px;
        }

        .menu-item.active .icon {
          color: var(--active-blue);
          transform: scale(1.1);
        }

        .icon {
          font-size: 18px;
          display: flex;
          align-items: center;
          transition: transform 0.3s ease;
        }

        .separator {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          margin: 20px 25px;
        }

        .sidebar-footer {
          position: relative;
          padding: 0 20px;
          height: 150px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .logout-card {
          background: rgba(228, 76, 60, 0.1);
          border: 1px solid rgba(228, 76, 60, 0.2);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          z-index: 10;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #E44C3C;
          font-weight: 600;
          font-size: 14px;
        }

        .logout-card:hover {
          background: #E44C3C;
          transform: translateY(-2px);
        }

        .logout-card:hover .logout-btn {
          color: white;
        }

        .footer-bg-img {
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 100%;
          opacity: 0.1;
          z-index: 1;
          pointer-events: none;
          filter: grayscale(100%);
        }
      `}</style>
    </>
  );
};

export default SidebarMoniteur;