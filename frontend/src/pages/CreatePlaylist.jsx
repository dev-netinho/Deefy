import { useEffect, useState } from 'react'
import './CreatePlaylist.css'

import Sidebar from '../components/Sidebar.jsx'
import { musicService } from '../services/musicService'
import { showMusicError, showMusicSuccess } from '../utils/musicToast'
import { useNavigate, useParams } from 'react-router-dom'
import { MdAddPhotoAlternate, MdClose } from 'react-icons/md'

function getErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.response?.data?.messages?.[0] ||
    error?.data?.messages?.[0] ||
    error?.message ||
    fallbackMessage
  )
}

function CreatePlaylist() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isEditing) {
      return
    }

    let isMounted = true

    musicService.getPlaylistById(id)
      .then((playlist) => {
        if (!isMounted) {
          return
        }

        setName(playlist.name || '')
        setDescription(playlist.description || playlist.descricao || '')
        setCoverUrl(playlist.coverUrl || playlist.capaUrl || '')
        setIsPublic(Boolean(playlist.publica))
      })
      .catch((err) => {
        showMusicError(err?.response?.data?.message || "Erro ao carregar playlist.")
        navigate('/playlists')
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [id, isEditing, navigate])

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(coverFile)
    setCoverPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [coverFile])

  const previewCover = coverPreviewUrl || coverUrl

  function handleCoverFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      showMusicError("Escolha um arquivo de imagem para a capa.")
      return
    }

    setCoverFile(file)
  }

  function handleRemoveCover() {
    setCoverFile(null)
    setCoverUrl('')
  }

  async function handleSavePlaylist() {
    if (!name.trim()) {
      showMusicError("O nome da playlist é obrigatório.")
      return
    }

    try {
      setIsSubmitting(true)
      let uploadedCoverUrl = coverUrl.trim()

      if (coverFile) {
        try {
          uploadedCoverUrl = await musicService.uploadPlaylistCoverImage(coverFile)
        } catch (uploadError) {
          console.warn('Erro ao enviar capa da playlist. Salvando sem atualizar a capa.', uploadError)
          showMusicError("Não consegui enviar a capa agora, mas vou salvar a playlist mesmo assim.")
          uploadedCoverUrl = coverUrl.trim()
        }
      }

      const trimmedDescription = description.trim()
      const normalizedCoverUrl = uploadedCoverUrl.trim()

      const payload = {
        name: name.trim(),
        publica: isPublic,
        description: trimmedDescription,
        coverUrl: normalizedCoverUrl,
      }

      if (isEditing) {
        await musicService.updatePlaylist(id, payload)
        showMusicSuccess("Playlist atualizada com sucesso!")
        navigate(`/user-playlist-detail/${id}`)
        return
      }

      const created = await musicService.createPlaylist(payload)
      showMusicSuccess("Playlist criada com sucesso!")
      navigate(`/playlist/${created.id}/add-music`)
    } catch (err) {
      const fallbackMessage = isEditing ? "Erro ao editar playlist." : "Erro ao criar playlist."
      showMusicError(getErrorMessage(err, fallbackMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="create-playlist-page">
        <Sidebar />

        <main className="create-playlist-main">
          <section className="create-playlist-card">
            <div className="create-playlist-header">
              <span>CARREGANDO...</span>
              <h1>Aguarde</h1>
              <p>Buscando informações da playlist.</p>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="create-playlist-page">
      <Sidebar />

      <main className="create-playlist-main">
        <section className="create-playlist-card">
          <div className="create-playlist-header">
            <span>{isEditing ? 'EDITAR PLAYLIST' : 'NOVA PLAYLIST'}</span>
            <h1>{isEditing ? 'Edite sua playlist' : 'Crie sua playlist'}</h1>
            <p>
              {isEditing
                ? 'Atualize as informações visuais e textuais da sua seleção musical.'
                : 'Defina nome, capa e descrição para sua nova seleção musical.'}
            </p>
          </div>

          <form className="create-playlist-form">
            <div className="create-playlist-cover-panel">
              <label className={`create-playlist-cover${previewCover ? ' has-cover' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  disabled={isSubmitting}
                />

                {previewCover ? (
                  <img src={previewCover} alt="Prévia da capa da playlist" />
                ) : (
                  <span className="create-playlist-cover-placeholder">
                    <MdAddPhotoAlternate />
                    <strong>Capa opcional</strong>
                    <small>Escolha uma imagem ou deixe o Deefy montar com as músicas.</small>
                  </span>
                )}
              </label>

              {previewCover && (
                <button
                  type="button"
                  className="create-playlist-clear-cover"
                  onClick={handleRemoveCover}
                  disabled={isSubmitting}
                >
                  <MdClose />
                  <span>Remover capa manual</span>
                </button>
              )}
            </div>

            <div className="create-playlist-fields">
              <label>
                Nome da playlist
                <input
                  type="text"
                  placeholder="Ex: Treino pesado"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                Descrição opcional
                <textarea
                  placeholder="Ex: Sons para treinar, viajar ou relaxar no fim do dia."
                  value={description}
                  maxLength={180}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <label>
                URL da capa opcional
                <input
                  type="url"
                  placeholder="https://exemplo.com/capa.jpg"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value)
                    setCoverFile(null)
                  }}
                />
              </label>

              <p className="create-playlist-cover-note">
                Se você não definir uma capa, o Deefy usará automaticamente as capas das músicas da playlist.
              </p>

              <button 
                type="button" 
                className="create-playlist-save"
                onClick={handleSavePlaylist}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Salvar playlist"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default CreatePlaylist
