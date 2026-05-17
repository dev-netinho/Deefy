import { NavLink, useNavigate } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { MdPlaylistPlay, MdLogout, MdSettings } from "react-icons/md";
import { removeToken } from "../utils/auth";
import logo from "../assets/logo.svg";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-brand">
          <img src={logo} alt="Deefy" className="sidebar-logo" />
          <span className="sidebar-wordmark">Deefy</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <NavLink
            to="/home"
            end
            className={({ isActive }) =>
              `sidebar-link${isActive ? " sidebar-link--active" : ""}`
            }
          >
            <IoMdHome className="sidebar-icon" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/playlists"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " sidebar-link--active" : ""}`
            }
          >
            <MdPlaylistPlay className="sidebar-icon" />
            <span>Playlists</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <MdLogout className="sidebar-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom navigation bar ────────────────── */}
      <nav className="bottom-nav">
        <NavLink
          to="/home"
          end
          className={({ isActive }) =>
            `bottom-nav-item${isActive ? " bottom-nav-item--active" : ""}`
          }
        >
          <IoMdHome />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/playlists"
          className={({ isActive }) =>
            `bottom-nav-item${isActive ? " bottom-nav-item--active" : ""}`
          }
        >
          <MdPlaylistPlay />
          <span>Playlists</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `bottom-nav-item${isActive ? " bottom-nav-item--active" : ""}`
          }
        >
          <MdSettings />
          <span>Config</span>
        </NavLink>

        <button className="bottom-nav-item bottom-nav-logout" onClick={handleLogout}>
          <MdLogout />
          <span>Sair</span>
        </button>
      </nav>
    </>
  );
}

export default Sidebar;
