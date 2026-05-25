import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './FavoritesDetail.css'

import { FaHeart } from 'react-icons/fa'
import { MdClose, MdPlayArrow, MdShuffle } from 'react-icons/md'
import Sidebar from '../components/Sidebar.jsx'
import SongList from '../components/SongList.jsx'
import SongListSkeleton from '../components/SongListSkeleton.jsx'
import MusicPlayer from '../components/MusicPlayer.jsx'
import { usePlayer } from '../contexts/PlayerContext.jsx'
import { musicService } from '../services/musicService.js'
import { getMusicIdFromTrack, normalizeMusic } from '../utils/musicNormalizer.js'
import { showMusicError } from '../utils/musicToast'

const FALLBACK_COVER = 'https://picsum.photos/seed/favorites/500/500'

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

function FavoritesDetail() {
  const { currentTrack, playTrack } = usePlayer()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [isShuffleActive, setIsShuffleActive] = useState(false)

  useEffect(() => {
    musicService.getFavoriteMusics()
      .then((data) => {
        setFavorites(data)
      })
      .catch((err) => {
        console.error("Erro ao buscar favoritos", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const songs = favorites.map(normalizeMusic).filter(Boolean)

  const handleFavoriteRemoved = (removedSong) => {
    const removedMusicId = getMusicIdFromTrack(removedSong)

    setFavorites((currentFavorites) => (
      currentFavorites.filter((track) => {
        const currentMusicId = getMusicIdFromTrack(track)

        if (removedMusicId === undefined || removedMusicId === null || removedMusicId === '') {
          return track !== removedSong
        }

        return String(currentMusicId) !== String(removedMusicId)
      })
    ))
  }

  const handlePlayFavorites = () => {
    if (!songs.length) {
      showMusicError("Adicione músicas aos favoritos antes de reproduzir.")
      return
    }

    const queue = isShuffleActive ? shuffleSongs(songs) : songs
    playTrack(queue[0], queue)
  }

  const handleShuffleFavorites = () => {
    if (!songs.length) {
      showMusicError("Adicione músicas aos favoritos antes de ativar o aleatório.")
      return
    }

    const nextShuffleState = !isShuffleActive
    const queue = nextShuffleState ? shuffleSongs(songs) : songs
    const nextTrack = nextShuffleState
      ? queue[0]
      : songs.find((song) => String(song.id) === String(currentTrack?.id)) || queue[0]

    setIsShuffleActive(nextShuffleState)
    playTrack(nextTrack, queue)
  }

  const renderCover = () => {
    if (songs.length >= 4) {
      return (
        <div className="favorites-cover-grid">
          <img src={songs[0].coverUrl || FALLBACK_COVER} alt={`Capa de ${songs[0].title || 'música'}`} />
          <img src={songs[1].coverUrl || FALLBACK_COVER} alt={`Capa de ${songs[1].title || 'música'}`} />
          <img src={songs[2].coverUrl || FALLBACK_COVER} alt={`Capa de ${songs[2].title || 'música'}`} />
          <img src={songs[3].coverUrl || FALLBACK_COVER} alt={`Capa de ${songs[3].title || 'música'}`} />
        </div>
      )
    }

    if (songs[0]?.coverUrl) {
      return (
        <img
          className="favorites-cover favorites-cover-image"
          src={songs[0].coverUrl}
          alt="Capa dos favoritos"
        />
      )
    }

    return (
      <div className="favorites-cover favorites-cover-empty">
        <FaHeart />
      </div>
    )
  }

  return (
    <div className="favorites-page">
      <Sidebar />

      <main className="favorites-main">
        <div className="favorites-close-row">
          <Link
            to="/playlists"
            className="favorites-close-btn"
            aria-label="Fechar favoritos"
            title="Fechar"
          >
            <MdClose />
          </Link>
        </div>

        <section className="favorites-hero">
          {renderCover()}

          <div className="favorites-info">
            <span>PLAYLIST</span>
            <h1>Favoritos</h1>
            <p>
              {songs.length === 1
                ? '1 música curtida por você'
                : `${songs.length} músicas curtidas por você`}
            </p>

            <div className="favorites-actions">
              <button
                type="button"
                className="favorites-icon-btn favorites-play-btn"
                onClick={handlePlayFavorites}
                disabled={!songs.length}
                aria-label="Reproduzir favoritos"
                title="Reproduzir favoritos"
              >
                <MdPlayArrow />
              </button>

              <button
                type="button"
                className={`favorites-icon-btn favorites-shuffle-btn${isShuffleActive ? ' is-active' : ''}`}
                onClick={handleShuffleFavorites}
                disabled={!songs.length}
                aria-label="Tocar favoritos aleatoriamente"
                aria-pressed={isShuffleActive}
                title="Tocar favoritos aleatoriamente"
              >
                <MdShuffle />
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div style={{ marginTop: '20px' }}>
            <SongListSkeleton count={8} />
          </div>
        ) : songs.length > 0 ? (
          <SongList
            songs={songs}
            title=""
            isFavoriteContext
            onFavoriteRemoved={handleFavoriteRemoved}
          />
        ) : (
          <p className="favorites-empty">
            Nenhuma música nos favoritos ainda. Use o menu de três pontinhos em uma música para adicioná-la aqui.
          </p>
        )}
      </main>

      <MusicPlayer />
    </div>
  )
}

export default FavoritesDetail
