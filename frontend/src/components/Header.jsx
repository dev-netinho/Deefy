import { useEffect, useState } from "react";
import "./Header.css";
import api from "../services/api";
import { getToken } from "../utils/auth";
import { decodeJwtPayload } from "../utils/jwt";

const USER_STORAGE_KEY = "@deefy-user";

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

function getFirstValue(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

function getNameFromEmail(email) {
  if (typeof email !== "string" || !email.includes("@")) return "";
  return email.split("@")[0].trim();
}

function resolveDisplayName(user) {
  if (!user || typeof user !== "object") return "";

  return getFirstValue(
    user.nome,
    user.name,
    user.fullName,
    user.nomeCompleto,
    user.username,
    getNameFromEmail(user.email),
    getNameFromEmail(user.sub),
  );
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getInitialUserName() {
  const cachedName = resolveDisplayName(getStoredUser());
  if (cachedName) return cachedName;

  const tokenName = resolveDisplayName(decodeJwtPayload(getToken()));
  return tokenName || "Ouvinte";
}

function Header() {
  const greeting = getGreeting();
  const [name, setName] = useState(getInitialUserName);

  useEffect(() => {
    let isMounted = true;

    api.get("/users/me")
      .then((response) => {
        const user = response.data?.data || response.data?.user || response.data;
        const displayName = resolveDisplayName(user);

        if (!isMounted || !displayName) return;

        setName(displayName);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      })
      .catch((error) => {
        console.warn("Não foi possível carregar o nome do usuário.", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="home-header">
      <div className="home-header-greeting">
        <p className="home-header-sub">{greeting}</p>
        <h1 className="home-header-name">{name}</h1>
      </div>
    </header>
  );
}

export default Header;
