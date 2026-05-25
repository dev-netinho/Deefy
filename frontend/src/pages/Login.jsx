import {
  MdOutlineRemoveRedEye,
  MdOutlineEmail,
  MdOutlineLock,
  MdOutlineVisibilityOff
} from "react-icons/md";
import { FaChevronRight, FaGoogle } from "react-icons/fa";
import logo from "../assets/logo.svg";
import background from "../assets/background.jpg";
import "./Login.css";
import api from "../services/api";
import { setToken, setUserRole } from "../utils/auth";
import { getRoleFromToken } from "../utils/jwt";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import ButtonSpinner from "../components/ButtonSpinner";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return "O palco precisa do seu e-mail!";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "E-mail desafinado! Verifique o endereço.";
    if (!password) return "Entrada sem ingresso VIP! A senha é obrigatória.";
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
      const response = await api.post("/auth/login", { email, senha: password });
      const token = response.data.token || response.data?.data?.token;

      if (token) {
        setToken(token);
        // Extract and persist the role from the JWT so the UI can show/hide admin features.
        // The server always validates the role — this is only used for UI rendering.
        const role = getRoleFromToken(token);
        setUserRole(role);
        showMusicSuccess("Acesso liberado aos bastidores!");
        navigate("/home");
      } else {
        showMusicError("Música pausada: O servidor não retornou um token de acesso.");
      }
    } catch (err) {
      const status = err.status || err.response?.status;
      const apiMessage = err.response?.data?.message || err.response?.data?.error;
      const errorMessage =
        status === 401 || status === 403
          ? "E-mail ou senha inválidos."
          : apiMessage || err.message || "Erro de conexão ao palco. Tente novamente.";
      showMusicError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="login-overlay"></div>

      <section className="login-wrapper">
        <div className="login-logo">
          <img src={logo} alt="Logo Deefy" />
        </div>

        <div className="login-card">
          <div className="login-input-group">
            <h3>EMAIL</h3>
            <div className="login-input-box">
              <MdOutlineEmail className="login-input-icon" />
              <input
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="login-input-group">
            <h3>SENHA</h3>
            <div className="login-input-box">
              <MdOutlineLock className="login-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              {showPassword ? (
                <MdOutlineRemoveRedEye
                  className="login-input-eye"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <MdOutlineVisibilityOff
                  className="login-input-eye"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            {/*<p
              className="login-forgot-password"
              onClick={() => navigate("/forgot-password")}
            >
              Esqueci minha senha
            </p>*/}
            <p
              className="login-forgot-password"
              onClick={() => navigate("/forgot-password")}
            >
              Esqueci minha senha
            </p>

          </div>

          <button 
            className="login-button-primary" 
            onClick={handleSubmit} 
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? <ButtonSpinner color="#045547" /> : <>Entrar <FaChevronRight /></>}
          </button>
        </div>

        {/*<div className="login-divider">
          <div></div>
          <span>OU CONTINUE COM</span>
          <div></div>
        </div>

        <button className="login-google-button">
          <FaGoogle />
        </button>*/}

        <p className="login-register-text">
          Não possui uma conta?{" "}
          <span onClick={() => navigate("/registration")}>Crie agora</span>
        </p>
      </section>
    </div>
  );
}

export default Login;
