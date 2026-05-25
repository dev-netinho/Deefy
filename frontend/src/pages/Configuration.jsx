import { useState, useEffect } from 'react';
import {
  MdOutlinePerson,
  MdOutlineMail,
  MdOutlineExitToApp,
  MdOutlineStarOutline,
  MdOutlineLock,
  MdOutlineCameraAlt
} from "react-icons/md";
import {
  IoStatsChartSharp,
  IoCameraOutline
} from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa";
import "./Configuration.css";
import { useNavigate } from "react-router-dom";

function Configuration() {
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <div
      className="configuration-page"
    >
      <div className="configuration-overlay"></div>

      <section className="configuration-wrapper">
        <div className="configuration-user">
          <div className="configuration-avatar-wrapper">
            <div className="configuration-user-img"></div>

            <div className="configuration-edit-photo-btn" onClick={() => navigate("/edit-profile")}>
              <div className="configuration-edit-photo-icon-wrapper">
                <IoCameraOutline />
              </div>
              <div className="configuration-edit-photo-text" >Editar<br />Foto</div>
            </div>
          </div>
          <h2>João Gomes</h2>
        </div>



        {/* Perfil */}

        <div className="configuration-input-group">
          <h3>PERFIL</h3>
          <div className="configuration-input-box" onClick={() => navigate("/custom-profile")}>
            <MdOutlinePerson className="configuration-input-icon" />
            <div className="configuration-input-content">
              Editar perfil
            </div>
            <IoIosArrowForward className="configuration-input-arrow" />
          </div>
          <div className="configuration-input-box" onClick={() => navigate("/redefinepass")}>
            <MdOutlineLock className="configuration-input-icon" />
            <div className="configuration-input-content">
              Alterar senha
            </div>
            <IoIosArrowForward className="configuration-input-arrow" />
          </div>
        </div>

        {/* Pessoal 

        <div className="configuration-input-group">
          <h3>PESSOAL</h3>
          <div className="configuration-input-box">
            <IoStatsChartSharp className="configuration-input-icon" />
            <div className="configuration-input-content">
              Editar preferências
            </div>
            <IoIosArrowForward className="configuration-input-arrow" />
          </div>
          <div className="configuration-input-box">
            <MdOutlineStarOutline className="configuration-input-icon" />
            <div className="configuration-input-content">
              Atalho de favoritos
            </div>
            <IoIosArrowForward className="configuration-input-arrow" />
          </div>
        </div>

        */}

        {/* Privacidade 

        <div className="configuration-input-group">
          <h3>PRIVACIDADE</h3>
          <div className="configuration-input-box">
            <MdOutlineLock className="configuration-input-icon" />
            <div className="configuration-input-content">
              Alterar conta
            </div>
            <IoIosArrowForward className="configuration-input-arrow" />
          </div>
        </div>
        
        */}

        <button
          className="configuration-button-primary"
          onClick={() => navigate("/")}
          style={{ marginTop: "24px" }}
        >
          <MdOutlineExitToApp /> Sair da conta
        </button>
      </section>
    </div>
  );
}

export default Configuration;
