import { MdOutlineUploadFile } from "react-icons/md";
import { IoCameraOutline, IoCloseOutline, IoTrashOutline } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import background from "../assets/background2.jpg";
import defaultProfileAvatar from "../assets/default-profile-avatar.svg";
import "./EditProfile.css";
import api from "../services/api";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import ButtonSpinner from "../components/ButtonSpinner";

const USER_STORAGE_KEY = "@deefy-user";

function EditProfile() {
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const avatarUrl = profilePhotoUrl || defaultProfileAvatar;

  useEffect(() => {
    let isMounted = true;

    api.get("/users/me")
      .then((response) => {
        if (!isMounted) return;

        const photoUrl = response.data?.fotoPerfilUrl || "";
        setProfilePhotoUrl(photoUrl);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
      })
      .catch(() => {
        try {
          const raw = localStorage.getItem(USER_STORAGE_KEY);
          const storedUser = raw ? JSON.parse(raw) : null;
          const photoUrl = storedUser?.fotoPerfilUrl || "";
          if (isMounted) {
            setProfilePhotoUrl(photoUrl);
          }
        } catch {
          /* localStorage pode estar vazio ou corrompido; a tela continua funcional. */
        }
      });

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  const updateStoredUser = (user) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  };

  const uploadProfilePhoto = async (file) => {
    if (!file || isLoading) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    try {
      const response = await api.post("/users/me/photo/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const photoUrl = response.data?.fotoPerfilUrl || "";
      setProfilePhotoUrl(photoUrl);
      updateStoredUser(response.data);
      showMusicSuccess("Foto de perfil atualizada!");
      closeCamera();
    } catch (err) {
      showMusicError(err.response?.data?.message || err.message || "Erro ao enviar foto de perfil.");
    } finally {
      setIsLoading(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    }
  };

  const removeProfilePhoto = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await api.delete("/users/me/photo");
      setProfilePhotoUrl("");
      updateStoredUser(response.data);
      showMusicSuccess("Foto de perfil removida.");
    } catch (err) {
      showMusicError(err.response?.data?.message || err.message || "Erro ao remover foto de perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const openCamera = async () => {
    if (isLoading || isCameraStarting) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      showMusicError("Este navegador não permite abrir a câmera diretamente.");
      return;
    }

    setIsCameraOpen(true);
    setIsCameraStarting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 960 },
          height: { ideal: 960 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setIsCameraOpen(false);
      showMusicError("Não foi possível acessar a câmera. Verifique a permissão do navegador.");
    } finally {
      setIsCameraStarting(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const closeCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      showMusicError("A câmera ainda não está pronta para capturar.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        showMusicError("Não foi possível capturar a foto.");
        return;
      }

      const file = new File([blob], "foto-perfil.jpg", { type: "image/jpeg" });
      uploadProfilePhoto(file);
    }, "image/jpeg", 0.92);
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
              style={{ backgroundImage: `url(${avatarUrl})` }}
              aria-label="Foto de perfil"
            ></div>
          </div>
          <div className="edit-profile-text-content">
            <h2>Mude a sua foto de perfil</h2>
            <p>Use a sua foto favorita!</p>
          </div>
        </div>

        <button
          className="edit-profile-card"
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={isLoading}
        >
          <div className="edit-profile-input-icon-box">
            <MdOutlineUploadFile className="edit-profile-input-icon" />
          </div>
          <div className="edit-profile-text-content">
            <h1>Upload da galeria</h1>
            <p>Selecione uma imagem da sua galeria.</p>
          </div>
        </button>

        <button
          className="edit-profile-card"
          type="button"
          onClick={openCamera}
          disabled={isLoading || isCameraStarting}
        >
          <div className="edit-profile-input-icon-box">
            <IoCameraOutline className="edit-profile-input-icon" />
          </div>
          <div className="edit-profile-text-content">
            <h1>Tirar foto</h1>
            <p>Tire uma foto com a sua câmera.</p>
          </div>
          {isCameraStarting && <ButtonSpinner />}
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
          {isLoading && <ButtonSpinner />}
        </button>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="edit-profile-file-input"
          onChange={(event) => uploadProfilePhoto(event.target.files?.[0])}
        />
      </section>

      {isCameraOpen && (
        <div className="edit-profile-camera-modal" role="dialog" aria-modal="true">
          <div className="edit-profile-camera-card">
            <button
              className="edit-profile-camera-close"
              type="button"
              onClick={closeCamera}
              aria-label="Fechar câmera"
              disabled={isLoading}
            >
              <IoCloseOutline />
            </button>

            <div className="edit-profile-camera-preview">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="edit-profile-camera-video"
              />
              {isCameraStarting && (
                <div className="edit-profile-camera-loading">
                  <ButtonSpinner />
                  <span>Abrindo câmera...</span>
                </div>
              )}
            </div>

            <div className="edit-profile-camera-actions">
              <button type="button" onClick={closeCamera} disabled={isLoading}>
                Cancelar
              </button>
              <button type="button" onClick={capturePhoto} disabled={isLoading || isCameraStarting}>
                {isLoading ? <ButtonSpinner /> : "Usar esta foto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfile;
