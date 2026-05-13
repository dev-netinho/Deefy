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
import { setToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    if (!email.trim()) return "O palco precisa do seu e-mail!";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "E-mail desafinado! Verifique o endereco.";
    if (!password) return "Entrada sem ingresso VIP! A senha e obrigatoria.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      showMusicError(validationError);
      return;
    }

    try {
      const response = await api.post("/api/v1/auth/login", {
        email,
        senha: password
      });
      const token = response.data.token || response.data?.data?.token;

      if (token) {
        setToken(token);
        showMusicSuccess("Acesso liberado aos bastidores!");
        navigate("/home");
      } else {
        showMusicError("Musica pausada: o servidor nao retornou um token de acesso.");
      }
    } catch (err) {
      showMusicError(err.message || "Erro de conexao ao palco. Tente novamente.");
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

            <p
              className="login-forgot-password"
              onClick={() => navigate("/forgot-password")}
            >
              Esqueci minha senha
            </p>
          </div>

          <button className="login-button-primary" onClick={handleSubmit}>
            Entrar <FaChevronRight />
          </button>
        </div>

        <div className="login-divider">
          <div></div>
          <span>OU CONTINUE COM</span>
          <div></div>
        </div>

        <button className="login-google-button">
          <FaGoogle />
        </button>

        <p className="login-register-text">
          Não possui uma conta?{" "}
          <span onClick={() => navigate("/registration")}>Crie agora</span>
        </p>
      </section>
    </div>
  );
}

export default Login;
