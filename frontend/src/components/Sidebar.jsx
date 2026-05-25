import { NavLink, useNavigate } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { MdPlaylistPlay, MdLogout, MdSettings, MdLibraryAdd, MdManageAccounts } from "react-icons/md";
import { removeToken, isAdmin } from "../utils/auth";
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
      {/* ── Mobile Admin Header ────────────────────────── */}
      {isAdmin() && (
        <header className="admin-mobile-header">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-mobile-link${isActive ? " admin-mobile-link--active" : ""}`
            }
          >
            <MdLibraryAdd />
            <span>Catálogo</span>
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `admin-mobile-link${isActive ? " admin-mobile-link--active" : ""}`
            }
          >
            <MdManageAccounts />
            <span>Usuários</span>
          </NavLink>
        </header>
      )}

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-brand">
          <img src={logo} alt="Deefy" className="sidebar-logo" />
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

          <NavLink
            to="/configuration"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " sidebar-link--active" : ""}`
            }
          >
            <MdSettings className="sidebar-icon" />
            <span>Configurações</span>
          </NavLink>

          {isAdmin() && (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `sidebar-link sidebar-link--admin${isActive ? " sidebar-link--active" : ""}`
                }
              >
                <MdLibraryAdd className="sidebar-icon" />
                <span>Catálogo</span>
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `sidebar-link sidebar-link--admin${isActive ? " sidebar-link--active" : ""}`
                }
              >
                <MdManageAccounts className="sidebar-icon" />
                <span>Usuários</span>
              </NavLink>
            </>
          )}
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
          to="/configuration"
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
