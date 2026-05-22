import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MdOutlineCheckCircle, MdOutlineErrorOutline } from "react-icons/md";
import background from "../assets/background2.jpg";
import api from "../services/api";
import "./ForgotPass.css";
import "./Registration.css";
import ButtonSpinner from "../components/ButtonSpinner";

function VerifyAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const hasAttempted = useRef(false); // To prevent strict mode double rendering from firing API twice

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => {
        setStatus("error");
        setErrorMessage("Link de ativação inválido ou ausente.");
      });
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const verify = async () => {
      try {
        await api.post("/auth/verify-account", { token });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message ||
          "Não foi possível ativar sua conta. O link pode ter expirado ou ser inválido."
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div
      className="forgot-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="forgot-overlay"></div>

      <section className="forgot-wrapper" style={{ textAlign: "center", minHeight: "350px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {status === "loading" && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
               <ButtonSpinner />
            </div>
            <div className="forgot-text">
              <h1>Ativando sua conta...</h1>
              <p>Aguarde enquanto verificamos o seu código de ativação na Deefy.</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="forgot-icon-circle" style={{ backgroundColor: "rgba(57, 240, 208, 0.1)", margin: "0 auto 20px auto" }}>
              <MdOutlineCheckCircle className="forgot-main-icon" style={{ color: "#39f0d0" }} />
            </div>
            <div className="forgot-text">
              <h1>Conta Ativada!</h1>
              <p>Sua conta foi ativada com sucesso. Você já pode acessar a plataforma e começar a curtir suas músicas.</p>
            </div>
            <button
              className="forgot-button-primary"
              onClick={() => navigate("/login")}
              style={{ marginTop: "20px" }}
            >
              Fazer Login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="forgot-icon-circle" style={{ backgroundColor: "rgba(255, 93, 93, 0.1)", margin: "0 auto 20px auto" }}>
              <MdOutlineErrorOutline className="forgot-main-icon" style={{ color: "#ff5d5d" }} />
            </div>
            <div className="forgot-text">
              <h1>Ops, erro na ativação</h1>
              <p>{errorMessage}</p>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                className="forgot-button-primary"
                onClick={() => navigate("/login")}
                style={{ flex: 1, backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.2)" }}
              >
                Ir para Login
              </button>
              <button
                className="forgot-button-primary"
                onClick={() => navigate("/registration")}
                style={{ flex: 1 }}
              >
                Cadastre-se Novamente
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default VerifyAccount;
