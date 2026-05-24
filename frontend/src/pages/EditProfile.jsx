import {
  MdOutlineUploadFile
} from "react-icons/md";
import {
  IoCameraOutline,
  IoTrashOutline
} from "react-icons/io5";
import background from "../assets/background2.jpg";
import "./EditProfile.css";

function EditProfile() {
  return (
    <div
      className="edit-profile-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="edit-profile-overlay"></div>

      <section className="edit-profile-wrapper">
        <div className="edit-profile-user">
          <div className="edit-profile-avatar-wrapper">
            <div className="edit-profile-user-img"></div>
          </div>
          <div className="edit-profile-text-content">
            <h2>Mude a sua foto de perfil</h2>
            <p>Use a sua foto favorita!</p>
          </div>
        </div>

        <div className="edit-profile-card">
          <div className="edit-profile-input-icon-box">
            <MdOutlineUploadFile className="edit-profile-input-icon" />
          </div>
          <div className="edit-profile-text-content">
            <h1>Upload da galeria</h1>
            <p>Selecione uma imagem da sua galeria.</p>
          </div>
        </div>

        <div className="edit-profile-card">
          <div className="edit-profile-input-icon-box">
            <IoCameraOutline className="edit-profile-input-icon" />
          </div>
          <div className="edit-profile-text-content">
            <h1>Tirar foto</h1>
            <p>Tire uma foto com a sua câmera.</p>
          </div>
        </div>

        <div className="edit-profile-card trash-card">
          <div className="edit-profile-input-icon-box">
            <IoTrashOutline className="edit-profile-input-icon" />
          </div>
          <div className="edit-profile-text-content">
            <h1>Remover foto do perfil</h1>
            <p>Redefina a sua foto de perfil para o padrão</p>
          </div>
        </div>

      </section>
    </div>
  );
}

export default EditProfile;
