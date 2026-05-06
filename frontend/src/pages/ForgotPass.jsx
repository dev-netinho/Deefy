import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoChevronBack } from "react-icons/io5";
import { MdOutlineLockReset, MdOutlineEmail } from "react-icons/md";
import { useState } from "react";
import background from "../assets/background2.jpg";
import "./ForgotPass.css";
import { useNavigate } from "react-router-dom";

function ForgotPass() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

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
                type="text"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button className="forgot-button-primary">
            Enviar Link de Recuperação
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