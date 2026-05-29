import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  MdMoreVert,
  MdPlaylistAdd,
  MdPlaylistRemove,
  MdFavoriteBorder,
  MdFavorite,
  MdShare,
  MdSearch,
  MdKeyboardArrowRight,
  MdClose,
  MdContentCopy,
} from 'react-icons/md'
import { FaEnvelope, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa'
import './SongOptionsMenu.css'
import { musicService } from '../services/musicService.js'
import { showMusicError, showMusicSuccess } from '../utils/musicToast'
import { getMusicIdFromTrack } from '../utils/musicNormalizer.js'

function getPlaylistId(playlist) {
  return playlist?.id || playlist?.uuid || playlist?.playlistId || ''
}

function getPlaylistTitle(playlist) {
  return playlist?.name || playlist?.nome || playlist?.title || playlist?.titulo || 'Playlist sem nome'
}

function SongOptionsMenu({
  song,
  playlistId,
  onRemoveFromPlaylist,
  isFavoriteContext = false,
  isFavorite = false,
  onFavoriteRemoved,
  onFavoriteChanged,
  allowAddToPlaylist = true,
  allowRemoveFromPlaylist = true,
}) {
  const optionsRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [copiedShareLink, setCopiedShareLink] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isFavoriteBusy, setIsFavoriteBusy] = useState(false)
  const [userPlaylists, setUserPlaylists] = useState([])
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false)
  const [addingPlaylistId, setAddingPlaylistId] = useState(null)
  const isPlaylistSong = playlistId !== undefined && playlistId !== null
  const canRemoveFromPlaylist = isPlaylistSong && allowRemoveFromPlaylist
  const musicId = getMusicIdFromTrack(song)
  const shareUrl = musicId && typeof window !== 'undefined'
    ? `${window.location.origin}/music/${musicId}`
    : ''
  const shareText = `Ouça "${song?.title || 'essa música'}" no Deefy`

  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      if (!optionsRef.current?.contains(event.target)) {
        setIsOpen(false)
        setShowPlaylists(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setShowPlaylists(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (!showPlaylists || userPlaylists.length > 0 || isLoadingPlaylists) {
      return undefined
    }

    let isMounted = true

    setIsLoadingPlaylists(true)
    musicService.getUserPlaylists()
      .then((playlists) => {
        if (isMounted) setUserPlaylists(Array.isArray(playlists) ? playlists : [])
      })
      .catch(() => {
        if (isMounted) {
          setUserPlaylists([])
          showMusicError('Não foi possível carregar suas playlists.')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingPlaylists(false)
      })

    return () => {
      isMounted = false
    }
  }, [isLoadingPlaylists, showPlaylists, userPlaylists.length])

  const searchOnGoogle = () => {
    const query = encodeURIComponent(`${song?.title || ''} ${song?.artist || ''}`)
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  const handleAddToPlaylist = async (playlist) => {
    const selectedPlaylistId = getPlaylistId(playlist)

    if (!selectedPlaylistId) {
      showMusicError('Não foi possível identificar a playlist.')
      return
    }

    try {
      setAddingPlaylistId(selectedPlaylistId)
      await musicService.addMusicToPlaylist(selectedPlaylistId, song)
      showMusicSuccess(`Música adicionada em "${getPlaylistTitle(playlist)}".`)
      setIsOpen(false)
      setShowPlaylists(false)
    } catch (err) {
      const status = err?.status || err?.response?.status
      showMusicError(
        status === 409
          ? 'Essa música já está nesta playlist.'
          : err?.response?.data?.message || err?.message || 'Erro ao adicionar música à playlist.',
      )
    } finally {
      setAddingPlaylistId(null)
    }
  }

  const handleRemoveFromPlaylist = async () => {
    if (!canRemoveFromPlaylist || !song?.id) {
      showMusicError("Não foi possível remover esta música.")
      return
    }

    try {
      setIsRemoving(true)
      await musicService.removeMusicFromPlaylist(playlistId, song)
      onRemoveFromPlaylist?.(song)
      showMusicSuccess("Música removida da playlist.")
      setIsOpen(false)
    } catch (err) {
      showMusicError(err?.response?.data?.message || err?.message || "Erro ao remover música da playlist.")
    } finally {
      setIsRemoving(false)
    }
  }

  const handleFavoriteAction = async () => {
    const musicId = getMusicIdFromTrack(song)

    if (musicId === undefined || musicId === null || musicId === '') {
      showMusicError("Não foi possível identificar esta música.")
      return
    }

    try {
      setIsFavoriteBusy(true)
      await musicService.toggleFavorite(musicId, isFavoriteContext)

      if (isFavoriteContext) {
        onFavoriteRemoved?.(song)
        showMusicSuccess("Música removida dos favoritos.")
      } else {
        onFavoriteChanged?.(song, true)
        showMusicSuccess("Música adicionada aos favoritos.")
      }

      setIsOpen(false)
    } catch (err) {
      const status = err?.response?.status
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error

      if (!isFavoriteContext && status === 409) {
        onFavoriteChanged?.(song, true)
        showMusicSuccess("Essa música já está nos favoritos.")
        setIsOpen(false)
      } else if (isFavoriteContext && status === 404) {
        onFavoriteRemoved?.(song)
        showMusicSuccess("Essa música já saiu dos favoritos.")
        setIsOpen(false)
      } else {
        showMusicError(apiMessage || "Erro ao atualizar favoritos.")
      }
    } finally {
      setIsFavoriteBusy(false)
    }
  }

  const handleShare = () => {
    if (!shareUrl) {
      showMusicError("Não foi possível criar o link dessa música.")
      return
    }

    setIsOpen(false)
    setIsShareOpen(true)
  }

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedShareLink(true)
      window.setTimeout(() => setCopiedShareLink(false), 1600)
    } catch {
      showMusicError("Não foi possível copiar o link.")
    }
  }

  return (
    <div className="song-options" ref={optionsRef}>
      <button
        type="button"
        className="song-options-button"
        onClick={(event) => {
          event.stopPropagation()
          setIsOpen(!isOpen)
          setShowPlaylists(false)
        }}
      >
        <MdMoreVert />
      </button>

      {isOpen && (
        <div
          className="song-options-menu"
          onClick={(event) => event.stopPropagation()}
        >
          {canRemoveFromPlaylist ? (
            <button
              type="button"
              className="song-options-danger"
              onClick={handleRemoveFromPlaylist}
              disabled={isRemoving}
            >
              <MdPlaylistRemove />
              <span>{isRemoving ? 'Removendo...' : 'Remover da playlist'}</span>
            </button>
          ) : isFavoriteContext ? (
            <button
              type="button"
              className="song-options-danger"
              onClick={handleFavoriteAction}
              disabled={isFavoriteBusy}
            >
              <MdFavorite />
              <span>{isFavoriteBusy ? 'Removendo...' : 'Remover dos favoritos'}</span>
            </button>
          ) : allowAddToPlaylist ? (
            <>
              <button
                type="button"
                onClick={() => setShowPlaylists(!showPlaylists)}
              >
                <MdPlaylistAdd />
                <span>Adicionar à playlist</span>
                <MdKeyboardArrowRight className="song-options-arrow" />
              </button>

              {showPlaylists && (
                <div className="song-options-submenu">
                  {isLoadingPlaylists && (
                    <span className="song-options-empty">Carregando playlists...</span>
                  )}

                  {!isLoadingPlaylists && userPlaylists.length === 0 && (
                    <span className="song-options-empty">Nenhuma playlist criada.</span>
                  )}

                  {!isLoadingPlaylists && userPlaylists.map((playlist) => {
                    const selectedPlaylistId = getPlaylistId(playlist)
                    const isAdding = String(addingPlaylistId) === String(selectedPlaylistId)

                    return (
                      <button
                        type="button"
                        key={selectedPlaylistId || getPlaylistTitle(playlist)}
                        onClick={() => handleAddToPlaylist(playlist)}
                        disabled={isAdding}
                      >
                        {isAdding ? 'Adicionando...' : getPlaylistTitle(playlist)}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : null}

          {!isFavoriteContext && (
            <button
              type="button"
              className={isFavorite ? 'song-options-positive' : undefined}
              onClick={handleFavoriteAction}
              disabled={isFavoriteBusy || isFavorite}
            >
              {isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
              <span>
                {isFavorite
                  ? 'Já nos favoritos'
                  : (isFavoriteBusy ? 'Adicionando...' : 'Favoritos')}
              </span>
            </button>
          )}

          <button type="button" onClick={handleShare}>
            <MdShare />
            <span>Compartilhar</span>
          </button>

          <button type="button" onClick={searchOnGoogle}>
            <MdSearch />
            <span>Buscar no Google</span>
          </button>
        </div>
      )}

      {isShareOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="song-share-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsShareOpen(false)
          }}
        >
          <section className="song-share-modal" aria-label="Compartilhar música">
            <button
              type="button"
              className="song-share-close"
              onClick={() => setIsShareOpen(false)}
              aria-label="Fechar compartilhamento"
            >
              <MdClose />
            </button>

            <h2>Compartilhar música</h2>
            <p>{shareText}</p>

            <div className="song-share-link-row">
              <input value={shareUrl} readOnly aria-label="Link da música" />
              <button type="button" onClick={handleCopyShareLink}>
                <MdContentCopy />
                <span>{copiedShareLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div className="song-share-actions">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText}: ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noreferrer"
              >
                <FaTelegramPlane />
                <span>Telegram</span>
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`}
              >
                <FaEnvelope />
                <span>Email</span>
              </a>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </div>
  )
}

export default SongOptionsMenu
