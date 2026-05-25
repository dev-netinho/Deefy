import './UserPlaylistDetail.css'

import Sidebar from '../components/Sidebar.jsx'
import SongList from '../components/SongList.jsx'
import SongListSkeleton from '../components/SongListSkeleton.jsx'
import MusicPlayer from '../components/MusicPlayer.jsx'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  MdDelete,
  MdEdit,
  MdClose,
  MdMoreHoriz,
  MdPlayArrow,
  MdPlaylistAdd,
  MdShuffle,
} from 'react-icons/md'
import { musicService } from '../services/musicService.js'
import { showMusicError, showMusicSuccess } from '../utils/musicToast'
import { usePlayer } from '../contexts/PlayerContext.jsx'
import { normalizeMusic } from '../utils/musicNormalizer.js'
import { isAdmin } from '../utils/auth.js'

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'

function shuffleSongs(songs) {
  const shuffled = [...songs]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentSong = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = currentSong
  }

  return shuffled
}

function UserPlaylistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTrack, playTrack } = usePlayer()
  const menuRef = useRef(null)
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isShuffleActive, setIsShuffleActive] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleDelete = async () => {
    setIsMenuOpen(false)

    if (window.confirm("Tem certeza que deseja excluir esta playlist?")) {
      setIsDeleting(true)
      try {
        await musicService.deletePlaylist(id)
        showMusicSuccess("Playlist excluída com sucesso.")
        navigate('/playlists')
      } catch {
        showMusicError("Erro ao excluir playlist.")
        setIsDeleting(false)
      }
    }
  }

  useEffect(() => {
    musicService.getPlaylistById(id)
      .then(data => {
        setPlaylist(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Erro ao buscar playlist", err)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  const songs = (playlist?.tracks || []).map(normalizeMusic).filter(Boolean)
  const playlistDescription = playlist?.description || playlist?.descricao || ''
  const playlistCoverUrl = playlist?.coverUrl || playlist?.capaUrl || ''
  const isPublicPlaylist = playlist?.publica === true || playlist?.publica === 'true'
  const canManagePlaylist = Boolean(playlist) && (!isPublicPlaylist || isAdmin())

  const handleSongRemoved = (removedSong) => {
    const removedMusicId = removedSong?.id !== undefined && removedSong?.id !== null
      ? String(removedSong.id)
      : null
    const removedTrackId = removedSong?.playlistTrackId !== undefined && removedSong?.playlistTrackId !== null
      ? String(removedSong.playlistTrackId)
      : null

    setPlaylist((currentPlaylist) => {
      if (!currentPlaylist) return currentPlaylist

      return {
        ...currentPlaylist,
        tracks: (currentPlaylist.tracks || []).filter((track) => {
          const currentSong = normalizeMusic(track)
          if (!currentSong) return false

          if (removedTrackId) {
            return String(currentSong.playlistTrackId) !== removedTrackId
          }

          return !removedMusicId || String(currentSong.id) !== removedMusicId
        }),
      }
    })
  }

  const handlePlayPlaylist = () => {
    if (!songs.length) {
      showMusicError("Adicione músicas antes de reproduzir a playlist.")
      return
    }

    const queue = isShuffleActive ? shuffleSongs(songs) : songs
    playTrack(queue[0], queue)
  }

  const handleShufflePlaylist = () => {
    if (!songs.length) {
      showMusicError("Adicione músicas antes de ativar o aleatório.")
      return
    }

    const nextShuffleState = !isShuffleActive
    const queue = nextShuffleState ? shuffleSongs(songs) : songs
    const nextTrack = nextShuffleState
      ? queue[0]
      : songs.find((song) => song.id === currentTrack?.id) || queue[0]

    setIsShuffleActive(nextShuffleState)
    playTrack(nextTrack, queue)
  }

  const renderCover = () => {
    if (playlistCoverUrl) {
      return <img className="user-playlist-cover" src={playlistCoverUrl} alt="Capa da playlist" />
    }

    if (songs.length >= 4) {
      return (
        <div className="user-playlist-cover-grid">
          <img src={songs[0].coverUrl || FALLBACK_COVER} alt={`Capa de ${songs[0].title || 'música'}`} />
          <img src={songs[1].coverUrl || FALLBACK_COVER} alt={`Capa de ${songs[1].title || 'música'}`} />
          <img src={songs[2].coverUrl || FALLBACK_COVER} alt={`Capa de ${songs[2].title || 'música'}`} />
          <img src={songs[3].coverUrl || FALLBACK_COVER} alt={`Capa de ${songs[3].title || 'música'}`} />
        </div>
      )
    }
    const cover = songs[0]?.coverUrl || FALLBACK_COVER
    return <img className="user-playlist-cover" src={cover} alt="Capa da playlist" />
  }

  if (loading) {
    return (
      <div className="user-playlist-page">
        <Sidebar />
        <main className="user-playlist-main">
          <div className="user-playlist-close-row">
            <Link
              to="/playlists"
              className="user-playlist-close-btn"
              aria-label="Fechar detalhes da playlist"
              title="Fechar"
            >
              <MdClose />
            </Link>
          </div>

          <section className="user-playlist-hero" style={{ opacity: 0.6 }}>
            <div
              className="user-playlist-cover"
              style={{ backgroundColor: '#222', width: '232px', height: '232px', borderRadius: '8px' }}
            />

            <div className="user-playlist-info">
              <span>CARREGANDO...</span>
              <h1>Aguarde</h1>
              <p>Carregando informações da playlist...</p>
            </div>
          </section>

          <div style={{ marginTop: '20px' }}>
            <SongListSkeleton count={8} />
          </div>
        </main>
        <MusicPlayer />
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="user-playlist-page">
        <Sidebar />
        <main className="user-playlist-main">
          <div className="user-playlist-close-row">
            <Link
              to="/playlists"
              className="user-playlist-close-btn"
              aria-label="Fechar detalhes da playlist"
              title="Fechar"
            >
              <MdClose />
            </Link>
          </div>
          Playlist não encontrada.
        </main>
        <MusicPlayer />
      </div>
    )
  }

  return (
    <div className="user-playlist-page">
      <Sidebar />

      <main className="user-playlist-main">
        <div className="user-playlist-close-row">
          <Link
            to="/playlists"
            className="user-playlist-close-btn"
            aria-label="Fechar detalhes da playlist"
            title="Fechar"
          >
            <MdClose />
          </Link>
        </div>

        <section className="user-playlist-hero">
          {renderCover()}

          <div className="user-playlist-info">
            <span>PLAYLIST PÚBLICA</span>

            <h1>{playlist.name}</h1>

            {playlistDescription && (
              <p className="user-playlist-description">{playlistDescription}</p>
            )}

            <p>Criada em {playlist.dataCriacao || new Date().toLocaleDateString('pt-BR')} • {songs.length} músicas</p>

            <div className="user-playlist-actions">
              <button
                type="button"
                className="user-playlist-icon-btn user-playlist-play-btn"
                onClick={handlePlayPlaylist}
                disabled={!songs.length}
                aria-label="Reproduzir playlist"
                title="Reproduzir playlist"
              >
                <MdPlayArrow />
              </button>

              <button
                type="button"
                className={`user-playlist-icon-btn user-playlist-shuffle-btn${isShuffleActive ? ' is-active' : ''}`}
                onClick={handleShufflePlaylist}
                disabled={!songs.length}
                aria-label="Tocar playlist aleatoriamente"
                aria-pressed={isShuffleActive}
                title="Tocar playlist aleatoriamente"
              >
                <MdShuffle />
              </button>

              {canManagePlaylist && (
                <div className="user-playlist-actions-menu-wrap" ref={menuRef}>
                  <button
                    type="button"
                    className={`user-playlist-icon-btn user-playlist-more-btn${isMenuOpen ? ' is-active' : ''}`}
                    onClick={() => setIsMenuOpen((current) => !current)}
                    aria-label="Mais ações da playlist"
                    aria-expanded={isMenuOpen}
                    aria-haspopup="menu"
                    title="Mais ações"
                  >
                    <MdMoreHoriz />
                  </button>

                  {isMenuOpen && (
                    <div className="user-playlist-actions-menu" role="menu">
                      <Link
                        to={`/playlist/${playlist.id}/add-music`}
                        className="user-playlist-menu-item"
                        role="menuitem"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <MdPlaylistAdd />
                        <span>Adicionar música</span>
                      </Link>

                      <Link
                        to={`/playlist/${playlist.id}/edit`}
                        className="user-playlist-menu-item"
                        role="menuitem"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <MdEdit />
                        <span>Editar playlist</span>
                      </Link>

                      <button
                        type="button"
                        className="user-playlist-menu-item user-playlist-menu-item-danger"
                        role="menuitem"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        <MdDelete />
                        <span>{isDeleting ? 'Excluindo...' : 'Excluir playlist'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {songs.length > 0 ? (
          <SongList
            songs={songs}
            title=""
            playlistId={canManagePlaylist ? playlist.id : undefined}
            onSongRemoved={handleSongRemoved}
            allowAddToPlaylist={canManagePlaylist}
          />
        ) : (
          <p style={{ margin: '20px 0', color: '#a9a9a9' }}>Você ainda não adicionou nenhuma música a esta playlist.</p>
        )}
      </main>

      <MusicPlayer />
    </div>
  )
}

export default UserPlaylistDetail
