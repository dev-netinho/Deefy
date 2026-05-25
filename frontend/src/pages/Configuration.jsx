import { useState, useEffect } from 'react';
import {
  MdOutlinePerson,
  MdOutlineExitToApp,
  MdOutlineLock,
} from "react-icons/md";
import {
  IoCameraOutline,
  IoChevronBack
} from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import "./Configuration.css";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ButtonSpinner from "../components/ButtonSpinner";
import { removeToken } from "../utils/auth";

function Configuration() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  return (
    <div className="configuration-page">
      <div className="configuration-overlay"></div>

      <section className="configuration-wrapper">
        <div className="custom-profile-back-login custom-profile-back-top" onClick={() => navigate(-1)}>
          <IoChevronBack />
          <span>Voltar</span>
        </div>

        <div className="configuration-user">
          <div className="configuration-avatar-wrapper">
            <div className="configuration-user-img">
              {loadingProfile ? (
                <div className="configuration-avatar-spinner">
                  <ButtonSpinner color="#02FFD4" />
                </div>
              ) : profile?.fotoPerfilUrl ? (
                <img
                  src={profile.fotoPerfilUrl}
                  alt="Foto de perfil"
                  className="configuration-avatar-img"
                />
              ) : (
                <div className="configuration-avatar-initials">
                  {getInitials(profile?.nome)}
                </div>
              )}
            </div>

            <div className="configuration-edit-photo-btn" onClick={() => navigate("/edit-profile")}>
              <div className="configuration-edit-photo-icon-wrapper">
                <IoCameraOutline />
              </div>
              <div className="configuration-edit-photo-text">Editar<br />Foto</div>
            </div>
          </div>

          <h2>{loadingProfile ? "Carregando..." : (profile?.nome || "Usuário")}</h2>
        </div>

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
