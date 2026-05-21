import {
  MdOutlineRemoveRedEye,
  MdOutlineEmail,
  MdOutlineLock,
  MdOutlineVisibilityOff
} from "react-icons/md";
import { FaChevronRight, FaGoogle, FaUser } from "react-icons/fa";
import logo from "../assets/logo.svg";
import background from "../assets/background.jpg";
import { useState } from "react";
import "./Registration.css";
import api from "../services/api";
import { setToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import ButtonSpinner from "../components/ButtonSpinner";

function Registration() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const validate = () => {
    if (!fullName.trim()) return "O nome completo é obrigatório na lista VIP.";
    if (fullName.trim().length < 3) return "Seu nome artístico precisa de pelo menos 3 caracteres.";
    
    if (!email.trim()) return "O palco precisa do seu e-mail!";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "E-mail desafinado! Verifique o formato.";
    
    if (!password) return "A senha é a chave do estúdio. Não pode ficar vazia!";
    if (password.length < 8) return "Senha curta! O solo precisa de pelo menos 8 notas (caracteres).";
    if (!/[A-Z]/.test(password)) return "Adicione uma letra maiúscula para dar mais volume à senha.";
    if (!/[a-z]/.test(password)) return "Uma letra minúscula é essencial para a harmonia da senha.";
    if (!/\d/.test(password)) return "Coloque um número para marcar o ritmo da senha.";
    if (!/[^A-Za-z0-9]/.test(password)) return "Falta um símbolo especial para o toque final na senha!";
    
    if (password !== confirmPassword) return "As senhas estão fora de sincronia! Tente novamente.";
    
    return null;
  };

  const verifyMXRecord = async (emailAddress) => {
    try {
      const domain = emailAddress.split("@")[1];
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
      const data = await response.json();
      return data.Answer && data.Answer.length > 0;
    } catch {
      return false; // Fallback in case of network issues
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    const validationError = validate();

    if (validationError) {
      showMusicError(validationError);
      return;
    }

    setIsLoading(true);
    
    const hasMX = await verifyMXRecord(email);
    if (!hasMX) {
      showMusicError("Este domínio de e-mail não parece receber mensagens. Tente outro.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        nome: fullName,
        email,
        senha: password
      });

      const token = response.data.token || response.data?.data?.token;

      if (token) {
        setToken(token);
        showMusicSuccess("Cadastro VIP realizado com sucesso!");
        navigate("/");
      } else {
        showMusicSuccess("Cadastro realizado! Faça login para continuar.");
        navigate("/login");
      }
    } catch (err) {
      const status = err.status || err.response?.status;
      const apiMessage = err.response?.data?.message || "";

      // O back-end retorna 400 com a mensagem da EmailJaCadastradoException
      const isEmailTaken =
        status === 400 &&
        (apiMessage.toLowerCase().includes("email") ||
          apiMessage.toLowerCase().includes("e-mail") ||
          apiMessage.toLowerCase().includes("cadastrado") ||
          apiMessage.toLowerCase().includes("already"));

      const errorMessage = isEmailTaken
        ? "Este e-mail já está em uso. Tente fazer login ou use outro endereço."
        : apiMessage || "Erro nos bastidores ao tentar criar conta.";

      showMusicError(errorMessage);
    } finally {
      setIsLoading(false);
    }

  };

  const strength = calculatePasswordStrength(password);

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

          <div className="registration-input-group">
            <h3>EMAIL</h3>
            <div className="registration-input-box">
              <MdOutlineEmail className="registration-input-icon" />
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
            className="registration-button-primary" 
            onClick={handleSubmit}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? <ButtonSpinner color="#045547" /> : <>Criar conta <FaChevronRight /></>}
          </button>
        </div>

        {/*<div className="registration-divider">
          <div></div>
          <span>OU CONTINUE COM</span>
          <div></div>
        </div>

        <button className="registration-google-button">
          <FaGoogle />
        </button>*/}

        <p className="registration-login-text">
          Já possui uma conta existente?{" "}
          <span onClick={() => navigate("/login")}>Acessar agora</span>
        </p>
      </section>
    </div>
  );
}

export default Registration;
