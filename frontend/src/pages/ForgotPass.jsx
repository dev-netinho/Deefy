import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoChevronBack } from "react-icons/io5";
import { MdOutlineLockReset, MdOutlineEmail } from "react-icons/md";
import { useState } from "react";
import background from "../assets/background2.jpg";
import "./ForgotPass.css";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import ButtonSpinner from "../components/ButtonSpinner";

function ForgotPass() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email.trim()) return "Digite seu e-mail para continuar.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "E-mail inválido. Verifique o formato.";
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
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
      showMusicSuccess("Link enviado! Verifique sua caixa de entrada.");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erro ao enviar o link. Tente novamente.";
      showMusicError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="forgot-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="forgot-overlay"></div>

      <section className="forgot-wrapper">
        <div className="forgot-icon-circle">
          <MdOutlineLockReset className="forgot-main-icon" />
        </div>

        <div className="forgot-text">
          <h1>Esqueceu sua senha?</h1>
          <p>
            Não se preocupe. Digite seu e-mail cadastrado e enviaremos um link
            para você redefinir sua senha.
          </p>
        </div>

        <div className="forgot-form-area">
          <div className="forgot-input-group">
            <h3>E-MAIL</h3>
            <div className="forgot-input-box">
              <MdOutlineEmail className="forgot-input-icon" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || sent}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          <button
            className="forgot-button-primary"
            onClick={handleSubmit}
            disabled={isLoading || sent}
            style={{ opacity: isLoading || sent ? 0.7 : 1, cursor: isLoading || sent ? "not-allowed" : "pointer" }}
          >
            {isLoading
              ? <ButtonSpinner />
              : sent
              ? "Link enviado ✓"
              : "Enviar Link de Recuperação"}
          </button>
        </div>

        <div className="forgot-info-card">
          <IoIosInformationCircleOutline className="forgot-info-icon" />
          <div className="forgot-info-text">
            <h2>Verifique sua Caixa de Entrada</h2>
            <p>
              Se o e-mail estiver correto, você receberá as instruções em alguns
              instantes. Não esqueça de checar o spam.
            </p>
          </div>
        </div>

        <div
          className="forgot-back-login"
          onClick={() => navigate("/login")}
        >
          <IoChevronBack />
          <span>Voltar para o Login</span>
        </div>
      </section>
    </div>
  );
}

export default ForgotPass;