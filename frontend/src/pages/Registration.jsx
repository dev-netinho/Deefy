import {
  MdOutlineRemoveRedEye,
  MdOutlineEmail,
  MdOutlineLock
} from "react-icons/md";
import { FaChevronRight, FaGoogle } from "react-icons/fa";
import logo from "../assets/logo.svg";
import background from "../assets/background.jpg";
import { useState } from "react";
import "./Registration.css";
import api from "../services/api";
import { setToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function Registration() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!fullName.trim()) return "O nome completo é obrigatório.";
    if (!emailRegex.test(email)) return "Insira um e-mail válido.";
    if (!passwordRegex.test(password)) {
      return "Senha fraca! Use pelo menos 8 caracteres, com letras maiúsculas, minúsculas, números e símbolos.";
    }
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
      const response = await api.post("/api/v1/auth/register", {
        nome: fullName,
        email,
        senha: password
      });

      const token = response.data.token || response.data?.data?.token;

      if (token) {
        setToken(token);
        alert("Cadastro realizado! Login feito com sucesso.");
        navigate("/home");
      } else {
        alert("Cadastro realizado com sucesso! Faça login para continuar.");
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Erro ao tentar criar conta.");
    }
  };

  return (
    <div
      className="registration-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="registration-overlay"></div>

      <section className="registration-wrapper">
        <div className="registration-logo">
          <img src={logo} alt="Logo Deefy" />
        </div>

        <div className="registration-card">
          <div className="registration-input-group">
            <h3>NOME COMPLETO</h3>
            <div className="registration-input-box registration-input-box-name">
              <input
                type="text"
                placeholder="Insira seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="registration-input-group">
            <h3>EMAIL</h3>
            <div className="registration-input-box">
              <MdOutlineEmail className="registration-input-icon" />
              <input
                type="text"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="registration-input-group">
            <h3>SENHA</h3>
            <div className="registration-input-box">
              <MdOutlineLock className="registration-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <MdOutlineRemoveRedEye
                className="registration-input-eye"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          {error && <p className="registration-error">{error}</p>}

          <button className="registration-button-primary" onClick={handleSubmit}>
            Criar conta <FaChevronRight />
          </button>
        </div>

        <div className="registration-divider">
          <div></div>
          <span>OU CONTINUE COM</span>
          <div></div>
        </div>

        <button className="registration-google-button">
          <FaGoogle />
        </button>

        <p className="registration-login-text">
          Já possui uma conta existente?{" "}
          <span onClick={() => navigate("/login")}>Acessar agora</span>
        </p>
      </section>
    </div>
  );
}

export default Registration;
