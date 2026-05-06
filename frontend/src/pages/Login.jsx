import {
  MdOutlineRemoveRedEye,
  MdOutlineEmail,
  MdOutlineLock
} from "react-icons/md";
import { FaChevronRight, FaGoogle } from "react-icons/fa";
import logo from "../assets/logo.svg";
import background from "../assets/background.jpg";
import "./Login.css";
import api from "../services/api";
import { setToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Insira um e-mail válido.";
    if (!password) return "A senha é obrigatória.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    try {
      const response = await api.post("/api/v1/auth/login", {
        email,
        senha: password
      });
      const token = response.data.token || response.data?.data?.token;

      if (token) {
        setToken(token);
        alert("Login efetuado com sucesso!");
        navigate("/home");
      } else {
        setError("O servidor não retornou um token de acesso.");
      }
    } catch (err) {
      setError(err.message || "Erro ao tentar fazer login.");
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
                type="text"
                placeholder="seu@email.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <MdOutlineRemoveRedEye
                className="login-input-eye"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <p
              className="login-forgot-password"
              onClick={() => navigate("/forgot-password")}
            >
              Esqueci minha senha
            </p>
          </div>

          {error && <p className="login-error">{error}</p>}

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
