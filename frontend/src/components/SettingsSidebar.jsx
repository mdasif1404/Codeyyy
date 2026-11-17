
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SettingsSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Profile", icon: "◉", path: "/Profile" },
    { label: "Rooms", icon: "▣", path: "/Rooms" },
    { label: "Game Stats", icon: "▥", path: "/GameStats" },
    {
      label: "Help & Support",
      icon: "?",
      path: "mailto:your-email@example.com",
    },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="settings-sidebar">
      <Link to="/dashboard" className="settings-sidebar-logo">
        <img src="/assets/codeyyy-logo.jpg" alt="Codyyy" />
      </Link>

      <p className="settings-menu-label">SETTINGS MENU</p>

      <nav className="settings-sidebar-nav">
        {menuItems.map((item) => {
          const active =
            location.pathname.toLowerCase() === item.path.toLowerCase();

          if (item.path.startsWith("mailto:")) {
            return (
              <a
                className="settings-menu-item"
                href={item.path}
                key={item.label}
              >
                <span className="settings-menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              to={item.path}
              className={`settings-menu-item ${active ? "active" : ""}`}
              key={item.label}
            >
              <span className="settings-menu-icon">{item.icon}</span>
              <span>{item.label}</span>
              {active && (
                <span className="settings-menu-arrow">›</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="settings-sidebar-bottom">
        <div className="settings-user">
          <img src="/assets/avatar-hacker.jpg" alt="Player avatar" />
          <div>
            <strong>player_01</strong>
            <small>ARENA PLAYER</small>
          </div>
        </div>

        <button className="settings-logout" onClick={handleLogout}>
          ↪ LOG OUT
        </button>

        <small className="settings-version">
          CODYyy // VERSION 1.0
        </small>
      </div>
    </aside>
  );
};

export default SettingsSidebar;
