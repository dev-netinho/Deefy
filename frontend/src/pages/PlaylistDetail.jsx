import './PlaylistDetail.css'
import Sidebar from '../components/Sidebar.jsx'
import SongList from '../components/SongList.jsx'
import SongListSkeleton from '../components/SongListSkeleton.jsx'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MdClose, MdLibraryMusic } from 'react-icons/md'
import { musicService } from '../services/musicService.js'
import { normalizeMusic } from '../utils/musicNormalizer.js'

function PlaylistDetail() {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(Boolean(id))

  useEffect(() => {
    if (!id) {
      return
    }
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

  if (loading) {
    return (
      <div className="playlist-detail-page">
        <Sidebar />
        <main className="playlist-detail-main">
          <div className="playlist-detail-close-row">
            <Link
              to="/playlists"
              className="playlist-detail-close-btn"
              aria-label="Fechar detalhes da playlist"
              title="Fechar"
            >
              <MdClose />
            </Link>
          </div>

          <section className="playlist-detail-hero" style={{ opacity: 0.6 }}>
            <div
              className="playlist-detail-cover"
              style={{ backgroundColor: '#222', width: '232px', height: '232px', borderRadius: '8px' }}
            />

            <div className="playlist-detail-info">
              <span>CARREGANDO...</span>
              <h1>Aguarde</h1>
              <p>Carregando informações da playlist...</p>
            </div>
          </section>

          <div style={{ marginTop: '20px' }}>
            <SongListSkeleton count={8} />
          </div>
        </main>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="playlist-detail-page">
        <Sidebar />
        <main className="playlist-detail-main">
          <div className="playlist-detail-close-row">
            <Link
              to="/playlists"
              className="playlist-detail-close-btn"
              aria-label="Fechar detalhes da playlist"
              title="Fechar"
            >
              <MdClose />
            </Link>
          </div>
          Playlist não encontrada.
        </main>
      </div>
    )
  }

  const tracks = (playlist.tracks || []).map(normalizeMusic).filter(Boolean)
  const description = playlist.description || playlist.descricao || ''
  const cover = playlist.coverUrl || playlist.capaUrl || tracks[0]?.coverUrl || ''

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

  return (
    <div className="playlist-detail-page">
      <Sidebar />

      <main className="playlist-detail-main">
        <div className="playlist-detail-close-row">
          <Link
            to="/playlists"
            className="playlist-detail-close-btn"
            aria-label="Fechar detalhes da playlist"
            title="Fechar"
          >
            <MdClose />
          </Link>
        </div>

        <section className="playlist-detail-hero">
          {cover ? (
            <img
              className="playlist-detail-cover"
              src={cover}
              alt="Capa da playlist"
            />
          ) : (
            <div className="playlist-detail-cover playlist-detail-cover-placeholder" aria-hidden="true">
              <MdLibraryMusic />
            </div>
          )}

<div className="playlist-detail-info">
  <span>PLAYLIST</span>
  <h1>{playlist.name}</h1>
  {description && <p className="playlist-detail-description">{description}</p>}
  <p>{tracks.length} faixas</p>

  <div className="playlist-detail-actions">
    <button className="playlist-play-btn">▶ Play</button>
    <button className="playlist-random-btn">⤨ Iniciar Aleatoriamente</button>
  </div>
</div>
</section>

        <SongList
          songs={tracks}
          title=""
          playlistId={playlist.id}
          onSongRemoved={handleSongRemoved}
          allowRemoveFromPlaylist={false}
        />
      </main>
    </div>
  )
}

export default PlaylistDetail
