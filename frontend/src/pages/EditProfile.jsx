import { MdOutlineUploadFile } from "react-icons/md";
import { IoLinkOutline, IoTrashOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import background from "../assets/background2.jpg";
import "./EditProfile.css";
import api from "../services/api";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import ButtonSpinner from "../components/ButtonSpinner";

const USER_STORAGE_KEY = "@deefy-user";

function EditProfile() {
  const navigate = useNavigate();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    api.get("/users/me")
      .then((response) => {
        if (!isMounted) return;

        const photoUrl = response.data?.fotoPerfilUrl || "";
        setProfilePhotoUrl(photoUrl);
        setInputUrl(photoUrl);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
      })
      .catch(() => {
        try {
          const raw = localStorage.getItem(USER_STORAGE_KEY);
          const storedUser = raw ? JSON.parse(raw) : null;
          const photoUrl = storedUser?.fotoPerfilUrl || "";
          if (isMounted) {
            setProfilePhotoUrl(photoUrl);
            setInputUrl(photoUrl);
          }
        } catch {
          /* noop */
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const saveProfilePhoto = async () => {
    if (isLoading) return;

    const trimmedUrl = inputUrl.trim();
    if (!trimmedUrl) {
      showMusicError("Cole uma URL pública da imagem para salvar.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.patch("/users/me/photo", { fotoPerfilUrl: trimmedUrl });
      const photoUrl = response.data?.fotoPerfilUrl || "";
      setProfilePhotoUrl(photoUrl);
      setInputUrl(photoUrl);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
      showMusicSuccess("Foto de perfil atualizada!");
      setTimeout(() => navigate("/configuration"), 800);
    } catch (err) {
      showMusicError(err.response?.data?.message || err.message || "Erro ao salvar foto de perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeProfilePhoto = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await api.delete("/users/me/photo");
      setProfilePhotoUrl("");
      setInputUrl("");
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
      showMusicSuccess("Foto de perfil removida.");
      setTimeout(() => navigate("/configuration"), 800);
    } catch (err) {
      showMusicError(err.response?.data?.message || err.message || "Erro ao remover foto de perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="edit-profile-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="edit-profile-overlay"></div>

      <section className="edit-profile-wrapper">
        <div className="edit-profile-user">
          <div className="edit-profile-avatar-wrapper">
            <div
              className="edit-profile-user-img"
              style={profilePhotoUrl ? { backgroundImage: `url(${profilePhotoUrl})` } : undefined}
              aria-label="Foto de perfil"
            ></div>
          </div>
          <div className="edit-profile-text-content">
            <h2>Mude a sua foto de perfil</h2>
            <p>Cole uma URL pública de imagem para salvar no seu perfil.</p>
          </div>
        </div>

        <div className="edit-profile-input-group">
          <h3>URL DA FOTO</h3>
          <div className="edit-profile-input-box">
            <IoLinkOutline className="edit-profile-input-icon" />
            <input
              type="url"
              placeholder="https://..."
              value={inputUrl}
              onChange={(event) => setInputUrl(event.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          className="edit-profile-card"
          type="button"
          onClick={saveProfilePhoto}
          disabled={isLoading}
        >
          <div className="edit-profile-input-icon-box">
            <MdOutlineUploadFile className="edit-profile-input-icon" />
          </div>
          <div className="edit-profile-text-content">
            <h1>Salvar foto</h1>
            <p>Grava a URL em fotoperfilurl no banco.</p>
          </div>
          {isLoading && <ButtonSpinner />}
        </button>

        <button
          className="edit-profile-card trash-card"
          type="button"
          onClick={removeProfilePhoto}
          disabled={isLoading}
        >
          <div className="edit-profile-input-icon-box">
            <IoTrashOutline className="edit-profile-input-icon" />
          </div>
          <div className="edit-profile-text-content">
            <h1>Remover foto do perfil</h1>
            <p>Redefina a sua foto de perfil para o padrão</p>
          </div>
        </button>

      </section>
    </div>
  );
}

export default EditProfile;
