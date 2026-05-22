import {
  MdOutlinePerson,
  MdOutlineExitToApp,
  MdOutlineLock,
} from "react-icons/md";
import { IoCameraOutline } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import "./Configuration.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { removeToken } from "../utils/auth";
import defaultProfileAvatar from "../assets/default-profile-avatar.svg";

const USER_STORAGE_KEY = "@deefy-user";

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Configuration() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const hasStoredUser = Boolean(user);
  const displayName = user?.nome || user?.name || "Ouvinte";
  const profilePhotoUrl = user?.fotoPerfilUrl || user?.fotoPerfilurl || "";
  const avatarUrl = profilePhotoUrl || defaultProfileAvatar;

  useEffect(() => {
    let isMounted = true;

    api.get("/users/me")
      .then((response) => {
        if (!isMounted) return;

        const profile = response.data;
        setUser(profile);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      })
      .catch(() => {
        if (isMounted && !hasStoredUser) {
          setUser({ nome: "Ouvinte" });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [hasStoredUser]);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <div
      className="configuration-page"
    >
      <div className="configuration-overlay"></div>

      <section className="configuration-wrapper">
        <div className="configuration-user">
          <div className="configuration-avatar-wrapper">
            <div
              className="configuration-user-img"
              style={{ backgroundImage: `url(${avatarUrl})` }}
              aria-label="Foto de perfil"
            ></div>

            <div className="configuration-edit-photo-btn" onClick={() => navigate("/edit-profile")}>
              <div className="configuration-edit-photo-icon-wrapper">
                <IoCameraOutline />
              </div>
              <div className="configuration-edit-photo-text" >Editar<br />Foto</div>
            </div>
          </div>
          <h2>{displayName}</h2>
        </div>



        {/* Perfil */}

        <div className="configuration-input-group">
          <h3>PERFIL</h3>
          <div className="configuration-input-box" onClick={() => navigate("/custom-profile")}>
            <MdOutlinePerson className="configuration-input-icon" />
            <div className="configuration-input-content">
              Editar perfil
            </div>
            <IoIosArrowForward className="configuration-input-arrow" />
          </div>
          <div className="configuration-input-box" onClick={() => navigate("/redefinepass")}>
            <MdOutlineLock className="configuration-input-icon" />
            <div className="configuration-input-content">
              Alterar senha
            </div>
            <IoIosArrowForward className="configuration-input-arrow" />
          </div>
        </div>

        {/* Pessoal 

        <div className="configuration-input-group">
          <h3>PESSOAL</h3>
          <div className="configuration-input-box">
            <IoStatsChartSharp className="configuration-input-icon" />
            <div className="configuration-input-content">
              Editar preferências
            </div>
            <IoIosArrowForward className="configuration-input-arrow" />
          </div>
          <div className="configuration-input-box">
            <MdOutlineStarOutline className="configuration-input-icon" />
            <div className="configuration-input-content">
              Atalho de favoritos
            </div>
            <IoIosArrowForward className="configuration-input-arrow" />
          </div>
        </div>

        */}

        {/* Privacidade 

        <div className="configuration-input-group">
          <h3>PRIVACIDADE</h3>
          <div className="configuration-input-box">
            <MdOutlineLock className="configuration-input-icon" />
            <div className="configuration-input-content">
              Alterar conta
            </div>
            <IoIosArrowForward className="configuration-input-arrow" />
          </div>
        </div>
        
        */}

        <button
          className="configuration-button-primary"
          onClick={handleLogout}
          style={{ marginTop: "24px" }}
        >
          <MdOutlineExitToApp /> Sair da conta
        </button>
      </section>
    </div>
  );
}

export default Configuration;
