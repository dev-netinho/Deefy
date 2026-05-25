import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoChevronBack } from "react-icons/io5";
import { MdOutlineLockReset, MdOutlineEmail, MdOutlineLock, MdOutlineRemoveRedEye, MdOutlineVisibilityOff } from "react-icons/md";
import { useState } from "react";
import background from "../assets/background2.jpg";
import "./ForgotPass.css";
import "./Registration.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import ButtonSpinner from "../components/ButtonSpinner";

function RedefinePass() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score < 3) return { width: "33%", color: "#ff5d5d" }; // Weak (Red)
    if (score < 5) return { width: "66%", color: "#ffd700" }; // Medium (Yellow)
    return { width: "100%", color: "#39f0d0" }; // Strong (Green)
  };

  const strength = calculatePasswordStrength(password);

  const validate = () => {
    if (!password) return "A senha é a chave do estúdio. Não pode ficar vazia!";
    if (password.length < 8) return "Senha curta! O solo precisa de pelo menos 8 notas (caracteres).";
    if (!/[A-Z]/.test(password)) return "Adicione uma letra maiúscula para dar mais volume à senha.";
    if (!/[a-z]/.test(password)) return "Uma letra minúscula é essencial para a harmonia da senha.";
    if (!/\d/.test(password)) return "Coloque um número para marcar o ritmo da senha.";
    if (!/[^A-Za-z0-9]/.test(password)) return "Falta um símbolo especial para o toque final na senha!";
    
    if (password !== confirmPassword) return "As senhas estão fora de sincronia! Tente novamente.";
    
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
    if (!token) {
      showMusicError("Link inválido: Token de recuperação ausente. Por favor, use o link enviado para o seu e-mail.");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/auth/reset-password", { token, novaSenha: password });
      setSent(true);
      showMusicSuccess("Senha alterada com sucesso! Você já pode fazer login.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erro ao alterar a senha. Tente novamente.";
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
          <h1>Alterar senha</h1>
          <p>
            Deseja alterar a senha? Repita a sua palavra-passe duas vezes.
          </p>
        </div>

        <div className="forgot-form-area">
          <div className="registration-input-group">
            <h3>SENHA</h3>
            <div className="registration-input-box">
              <MdOutlineLock className="registration-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              {showPassword ? (
                <MdOutlineRemoveRedEye
                  className="registration-input-eye"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <MdOutlineVisibilityOff
                  className="registration-input-eye"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
            {password && (
              <div className="password-strength-container">
                <div 
                  className="password-strength-bar" 
                  style={{ width: strength.width, backgroundColor: strength.color }}
                ></div>
              </div>
            )}
          </div>

          <div className="registration-input-group">
            <h3>CONFIRMAR SENHA</h3>
            <div className="registration-input-box">
              <MdOutlineLock className="registration-input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              {showConfirmPassword ? (
                <MdOutlineRemoveRedEye
                  className="registration-input-eye"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <MdOutlineVisibilityOff
                  className="registration-input-eye"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
            </div>
          </div>

          <button
            className="forgot-button-primary"
            onClick={handleSubmit}
            disabled={isLoading || sent}
            style={{ opacity: isLoading || sent ? 0.7 : 1, cursor: isLoading || sent ? "not-allowed" : "pointer", marginTop: "15px" }}
          >
            {isLoading
              ? <ButtonSpinner />
              : sent
                ? "Senha alterada ✓"
                : "Alterar senha"}
          </button>
        </div>

        <div className="forgot-info-card">
          <IoIosInformationCircleOutline className="forgot-info-icon" />
          <div className="forgot-info-text">
            <h2>Dica de Segurança</h2>
            <p>
              Crie uma senha forte contendo letras maiúsculas, minúsculas, números e caracteres especiais para melhor proteção.
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}

export default RedefinePass;