import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { IoChevronBack } from "react-icons/io5";
import background from "../assets/background2.jpg";
import api from "../services/api";
import ButtonSpinner from "../components/ButtonSpinner";
import "./ForgotPass.css";

function VerifyAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Estamos ativando sua conta...");

  useEffect(() => {
    if (!token) {
      return;
    }

    api.post("/auth/verify-account", { token })
      .then((response) => {
        setStatus("success");
        setMessage(response.data?.message || "Conta ativada com sucesso!");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error.message || "Nao foi possivel ativar sua conta.");
      });
  }, [token]);

  const currentStatus = token ? status : "error";
  const currentMessage = token
    ? message
    : "Link de ativacao invalido. Solicite um novo cadastro.";

  return (
    <div className="forgot-page" style={{ backgroundImage: `url(${background})` }}>
      <div className="forgot-overlay"></div>

      <section className="forgot-wrapper">
        <div className="forgot-icon-circle">
          <MdOutlineMarkEmailRead className="forgot-main-icon" />
        </div>

        <div className="forgot-text">
          <h1>{currentStatus === "success" ? "Conta ativada" : "Ativacao de conta"}</h1>
          <p>{currentMessage}</p>
        </div>

        {currentStatus === "loading" ? (
          <button className="forgot-button-primary" disabled>
            <ButtonSpinner />
          </button>
        ) : (
          <button className="forgot-button-primary" onClick={() => navigate("/login")}>
            Ir para o login
          </button>
        )}

        <div className="forgot-back-login" onClick={() => navigate("/login")}>
          <IoChevronBack />
          <span>Voltar para o Login</span>
        </div>
      </section>
    </div>
  );
}

export default VerifyAccount;
