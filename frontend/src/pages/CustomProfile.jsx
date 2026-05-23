import { IoChevronBack, IoCameraOutline } from "react-icons/io5";
import { MdOutlinePerson } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { useState } from "react";
import background from "../assets/background2.jpg";
import "./CustomProfile.css";
import "./Registration.css";
import { useNavigate } from "react-router-dom";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import ButtonSpinner from "../components/ButtonSpinner";

function CustomProfile() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!fullName.trim()) return "O nome de usuário é obrigatório.";
    if (fullName.trim().length < 3) return "O nome precisa ter pelo menos 3 caracteres.";
    return null;
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    const validationError = validate();
    if (validationError) {
      showMusicError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      // Simulação de atualização de perfil
      setTimeout(() => {
        setSent(true);
        showMusicSuccess("Perfil atualizado com sucesso!");
        setIsLoading(false);
      }, 800);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erro ao atualizar o perfil. Tente novamente.";
      showMusicError(message);
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

        <div className="custom-profile-icon-circle">
          <div className="custom-profile-edit-photo-btn" onClick={() => navigate("/edit-profile")}>
            <div className="custom-profile-edit-photo-icon-wrapper">
              <IoCameraOutline />
            </div>
            <div className="custom-profile-edit-photo-text" >Editar<br />Foto</div>
          </div>
        </div>

        <div className="custom-profile-text">
          <h1>Editar perfil</h1>
          <p>
            Atualize seus dados pessoais.
          </p>
        </div>

        <div className="custom-profile-form-area">
          <div className="registration-input-group">
            <h3>NOME DO USUÁRIO</h3>
            <div className="registration-input-box registration-input-box-name">
              <FaUser className="registration-input-icon" style={{ left: '16px', position: 'absolute' }} />
              <input
                type="text"
                placeholder="Insira seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ paddingLeft: '50px' }}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            className="custom-profile-button-primary"
            onClick={handleSubmit}
            disabled={isLoading || sent}
            style={{ opacity: isLoading || sent ? 0.7 : 1, cursor: isLoading || sent ? "not-allowed" : "pointer", marginTop: "15px" }}
          >
            {isLoading
              ? <ButtonSpinner />
              : sent
                ? "Perfil atualizado ✓"
                : "Salvar alterações"}
          </button>
        </div>

        {/*

        <div className="custom-profile-info-card">
          <IoIosInformationCircleOutline className="custom-profile-info-icon" />
          <div className="custom-profile-info-text">
            <h2>Dica de Segurança</h2>
            <p>
              Mantenha seu e-mail atualizado para não perder acesso à sua conta.
            </p>
          </div>
        </div>

        */}
      </section>
    </div>
  );
}

export default CustomProfile;