import { MdSettings } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./Header.css";

/**
 * Returns a time-aware greeting in Portuguese.
 * @returns {string}
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

/**
 * Retrieves the display name from localStorage (set during login/registration).
 * Falls back to a generic label so the greeting never breaks.
 * @returns {string}
 */
function getUserName() {
  try {
    const raw = localStorage.getItem("@deefy-user");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.name || "Ouvinte";
    }
  } catch {
    /* noop */
  }
  return "Ouvinte";
}

function Header() {
  const navigate = useNavigate();
  const greeting = getGreeting();
  const name = getUserName();

  return (
    <header className="home-header">
      <div className="home-header-greeting">
        <p className="home-header-sub">{greeting},</p>
        <h1 className="home-header-name">{name} 👋</h1>
      </div>

      <button
        className="home-header-settings"
        onClick={() => navigate("/configuration")}
        aria-label="Configurações"
        title="Configurações"
      >
        <MdSettings />
      </button>
    </header>
  );
}

export default Header;
