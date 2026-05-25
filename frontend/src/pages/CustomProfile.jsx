import { useState, useEffect } from "react";
import { IoChevronBack, IoCameraOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import background from "../assets/background2.jpg";
import "./CustomProfile.css";
import "./Registration.css";
import { useNavigate } from "react-router-dom";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import ButtonSpinner from "../components/ButtonSpinner";
import api from "../services/api";

function CustomProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // ── Load current profile ──────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setProfile(res.data);
        setFullName(res.data?.nome || "");
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        showMusicError("Não foi possível carregar seu perfil.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // ── Validate ─────────────────────────────────────────────────────
  const validate = () => {
    if (!fullName.trim()) return "O nome de usuário é obrigatório.";
    if (fullName.trim().length < 3) return "O nome precisa ter pelo menos 3 caracteres.";
    if (fullName.trim() === profile?.nome) return "O nome informado é igual ao atual.";
    return null;
  };

  // ── PATCH /users/me/name ──────────────────────────────────────────
  const handleSubmit = async () => {
    if (isLoading) return;
    const validationError = validate();
    if (validationError) {
      showMusicError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.patch("/users/me/name", { nome: fullName.trim() });
      setProfile(res.data);
      setSent(true);
      showMusicSuccess("Nome atualizado com sucesso!");
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      const message = err?.message || "Erro ao atualizar o perfil. Tente novamente.";
      showMusicError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="custom-profile-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="custom-profile-overlay"></div>

      <section className="custom-profile-wrapper">

        {/* Back button */}
        <div className="custom-profile-back-login custom-profile-back-top" onClick={() => navigate(-1)}>
          <IoChevronBack />
          <span>Voltar</span>
        </div>

        <div className="custom-profile-avatar-area">

          <div className="custom-profile-edit-photo-btn" onClick={() => navigate("/edit-profile")}>
            <div className="custom-profile-edit-photo-icon-wrapper">
              <IoCameraOutline />
            </div>
            <div className="custom-profile-edit-photo-text">Editar<br />Foto</div>
          </div>

          <div className="custom-profile-icon-circle">
            {loadingProfile ? (
              <div className="custom-profile-avatar-spinner">
                <ButtonSpinner color="#02FFD4" />
              </div>
            ) : profile?.fotoPerfilUrl ? (
              <img
                src={profile.fotoPerfilUrl}
                alt="Foto de perfil"
                className="custom-profile-avatar-img"
              />
            ) : (
              <div className="custom-profile-avatar-initials">
                {getInitials(profile?.nome)}
              </div>
            )}
          </div>
        </div>

        <div className="custom-profile-text">
          <h1>
            {loadingProfile ? "Carregando…" : (profile?.nome || "Editar perfil")}
          </h1>
          <p>Atualize seus dados pessoais.</p>
        </div>

        <div className="custom-profile-form-area">
          <div className="registration-input-group">
            <h3>NOME DO USUÁRIO</h3>
            <div className="registration-input-box registration-input-box-name">
              <FaUser className="registration-input-icon custom-profile-input-icon-pos" />
              <input
                type="text"
                placeholder={loadingProfile ? "Carregando…" : "Insira seu nome"}
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setSent(false); }}
                className="custom-profile-name-input"
                disabled={isLoading || loadingProfile}
              />
            </div>
          </div>

          <button
            className={`custom-profile-button-primary${isLoading || loadingProfile || sent ? " custom-profile-button--disabled" : ""}`}
            onClick={handleSubmit}
            disabled={isLoading || loadingProfile || sent}
          >
            {isLoading
              ? <ButtonSpinner />
              : sent
                ? "Nome atualizado ✓"
                : "Salvar alterações"}
          </button>
        </div>

      </section>
    </div>
  );
}

export default CustomProfile;
