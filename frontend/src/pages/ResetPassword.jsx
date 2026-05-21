import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { MdOutlineLock, MdOutlineLockReset } from "react-icons/md";
import background from "../assets/background2.jpg";
import api from "../services/api";
import ButtonSpinner from "../components/ButtonSpinner";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import "./ForgotPass.css";

function validatePassword(password, confirmPassword) {
  if (!password) return "Digite a nova senha.";
  if (password.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (!/[A-Z]/.test(password)) return "Inclua pelo menos uma letra maiuscula.";
  if (!/[a-z]/.test(password)) return "Inclua pelo menos uma letra minuscula.";
  if (!/\d/.test(password)) return "Inclua pelo menos um numero.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Inclua pelo menos um simbolo.";
  if (password !== confirmPassword) return "As senhas nao conferem.";
  return null;
}

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async () => {
    if (isLoading || completed) return;

    if (!token) {
      showMusicError("Link de redefinicao invalido ou incompleto.");
      return;
    }

    const validationError = validatePassword(password, confirmPassword);
    if (validationError) {
      showMusicError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        novaSenha: password,
      });
      setCompleted(true);
      showMusicSuccess("Senha redefinida com sucesso!");
    } catch (error) {
      showMusicError(error.message || "Nao foi possivel redefinir sua senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-page" style={{ backgroundImage: `url(${background})` }}>
      <div className="forgot-overlay"></div>

      <section className="forgot-wrapper">
        <div className="forgot-icon-circle">
          <MdOutlineLockReset className="forgot-main-icon" />
        </div>

        <div className="forgot-text">
          <h1>Nova senha</h1>
          <p>
            Defina uma senha forte para voltar a acessar sua conta Deefy.
          </p>
        </div>

        <div className="forgot-form-area">
          <div className="forgot-input-group">
            <h3>NOVA SENHA</h3>
            <div className="forgot-input-box">
              <MdOutlineLock className="forgot-input-icon" />
              <input
                type="password"
                placeholder="Digite sua nova senha"
                value={password}
                disabled={isLoading || completed}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          <div className="forgot-input-group">
            <h3>CONFIRMAR SENHA</h3>
            <div className="forgot-input-box">
              <MdOutlineLock className="forgot-input-icon" />
              <input
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                disabled={isLoading || completed}
                onChange={(event) => setConfirmPassword(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          <button
            className="forgot-button-primary"
            onClick={completed ? () => navigate("/login") : handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <ButtonSpinner /> : completed ? "Ir para o login" : "Salvar nova senha"}
          </button>
        </div>

        <div className="forgot-back-login" onClick={() => navigate("/login")}>
          <IoChevronBack />
          <span>Voltar para o Login</span>
        </div>
      </section>
    </div>
  );
}

export default ResetPassword;
