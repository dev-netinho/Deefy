import { useState, useEffect, useRef } from 'react';
import { MdOutlineUploadFile } from "react-icons/md";
import { IoCameraOutline, IoTrashOutline, IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import background from "../assets/background2.jpg";
import "./EditProfile.css";
import api from "../services/api";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import ButtonSpinner from "../components/ButtonSpinner";

function EditProfile() {
  const navigate = useNavigate();
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // ── Fetch current user profile on mount ─────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setProfile(res.data);
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        showMusicError('Não foi possível carregar as informações do seu perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // ── Upload via POST /users/me/photo/upload (multipart/form-data) ─
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMusicError('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMusicError('A imagem deve ter no máximo 5 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await api.post('/users/me/photo/upload', formData, {
        headers: { 'Content-Type': undefined },
      });
      setProfile(res.data);
      showMusicSuccess('Foto de perfil atualizada com sucesso!');
    } catch (err) {
      console.error('Erro no upload de foto:', err);
      showMusicError(err?.message || 'Falha ao atualizar a foto de perfil.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // ── Remove via DELETE /users/me/photo ────────────────────────────
  const handleRemovePhoto = async () => {
    if (!profile?.fotoPerfilUrl) {
      showMusicError('Você não possui nenhuma foto de perfil para remover.');
      return;
    }
    setIsUploading(true);
    try {
      const res = await api.delete('/users/me/photo');
      setProfile(res.data);
      showMusicSuccess('Foto de perfil removida com sucesso!');
    } catch (err) {
      console.error('Erro ao remover foto:', err);
      showMusicError(err?.message || 'Falha ao remover a foto de perfil.');
    } finally {
      setIsUploading(false);
    }
  };

  const busy = loading || isUploading;
  const hasPhoto = !!profile?.fotoPerfilUrl;

  return (
    <div
      className="edit-profile-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="edit-profile-overlay"></div>

      {/* Hidden file inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={busy}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={busy}
      />

      <section className="edit-profile-wrapper">

        {/* Back button */}
        <div className="edit-profile-back-btn" onClick={() => navigate(-1)}>
          <IoChevronBack /> Voltar
        </div>

        {/* Avatar + header */}
        <div className="edit-profile-user">
          <div className="edit-profile-avatar-wrapper">
            <div className="edit-profile-user-img">
              {loading ? (
                <div className="edit-profile-avatar-spinner">
                  <ButtonSpinner color="#02FFD4" />
                </div>
              ) : hasPhoto ? (
                <img
                  src={profile.fotoPerfilUrl}
                  alt="Foto de perfil"
                  className="edit-profile-avatar-img"
                />
              ) : (
                <div className="edit-profile-avatar-initials">
                  {getInitials(profile?.nome)}
                </div>
              )}
              {isUploading && (
                <div className="edit-profile-avatar-uploading">
                  <ButtonSpinner color="#0a0a0a" />
                </div>
              )}
            </div>
          </div>
          <div className="edit-profile-text-content">
            <h2>
              {loading
                ? 'Carregando…'
                : `Olá, ${profile?.nome || 'Usuário'}!`}
            </h2>
            <p>
              {isUploading
                ? 'Atualizando sua foto…'
                : 'Mude a sua foto de perfil e brilhe no palco!'}
            </p>
          </div>
        </div>

        {/* Gallery upload card */}
        <div
          className={`edit-profile-card${busy ? ' edit-profile-card--disabled' : ''}`}
          onClick={() => !busy && galleryInputRef.current.click()}
        >
          <div className="edit-profile-input-icon-box">
            <MdOutlineUploadFile className="edit-profile-input-icon" />
          </div>
          <div className="edit-profile-text-content">
            <h1>Upload da galeria</h1>
            <p>Selecione uma imagem da sua galeria.</p>
          </div>
        </div>

        {/* Camera capture card */}
        <div
          className={`edit-profile-card${busy ? ' edit-profile-card--disabled' : ''}`}
          onClick={() => !busy && cameraInputRef.current.click()}
        >
          <div className="edit-profile-input-icon-box">
            <IoCameraOutline className="edit-profile-input-icon" />
          </div>
          <div className="edit-profile-text-content">
            <h1>Tirar foto</h1>
            <p>Tire uma foto com a sua câmera.</p>
          </div>
        </div>

        {/* Remove photo card */}
        <div
          className={`edit-profile-card trash-card${(busy || !hasPhoto) ? ' edit-profile-card--disabled' : ''}`}
          onClick={() => !busy && hasPhoto && handleRemovePhoto()}
        >
          <div className="edit-profile-input-icon-box">
            <IoTrashOutline className="edit-profile-input-icon" />
          </div>
          <div className="edit-profile-text-content">
            <h1>Remover foto do perfil</h1>
            <p>Redefina a sua foto de perfil para o padrão.</p>
          </div>
        </div>

      </section>
    </div>
  );
}

export default EditProfile;
