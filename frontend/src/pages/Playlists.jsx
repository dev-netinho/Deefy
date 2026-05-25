import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaHeart, FaMusic, FaPlus } from 'react-icons/fa'

import './Playlists.css'
import Sidebar from '../components/Sidebar.jsx'

const mainPlaylists = [
  {
    title: 'Favoritos',
    description: 'Músicas curtidas por você.',
    icon: <FaHeart />,
    className: 'playlist-main-card--favorites',
  },
]
import { musicService } from '../services/musicService'
import api from '../services/api' // To fetch genres directly if needed
import { normalizeMusic } from '../utils/musicNormalizer'
import { usePlayer } from '../contexts/PlayerContext.jsx'
import { showMusicError } from '../utils/musicToast'

const fallbackPlaylistCover = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'

function Playlists() {
  const { playTrack } = usePlayer()
  const [userPlaylistsApi, setUserPlaylistsApi] = useState([])
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [genresApi, setGenresApi] = useState([])
  const [isLoadingGenres, setIsLoadingGenres] = useState(true)
  const [globalPlaylistsApi, setGlobalPlaylistsApi] = useState([])
  const [isLoadingGlobalPlaylists, setIsLoadingGlobalPlaylists] = useState(true)

  useEffect(() => {
    musicService.getUserPlaylists()
      .then(data => {
        setUserPlaylistsApi(data)
        setIsLoadingUser(false)
      })
      .catch(err => {
        console.error("Erro ao buscar playlists", err)
        setIsLoadingUser(false)
      })

    // Search real genres from backend
    api.get('/genres')
      .then(res => {
        setGenresApi(res.data?.content || res.data || [])
        setIsLoadingGenres(false)
      })
      .catch(err => {
        console.error("Erro ao buscar gêneros", err)
        setIsLoadingGenres(false)
      })

    musicService.getGlobalPlaylists()
      .then(data => {
        setGlobalPlaylistsApi(data)
        setIsLoadingGlobalPlaylists(false)
      })
      .catch(err => {
        console.error("Erro ao buscar playlists globais", err)
        setIsLoadingGlobalPlaylists(false)
      })
  }, [])

  const renderPlaylistCard = (playlist) => {
    const songs = (playlist.tracks || []).map(normalizeMusic).filter(Boolean)
    const manualCover = playlist.coverUrl || playlist.capaUrl || ''
    const description = playlist.description || playlist.descricao || ''
    const hasGrid = !manualCover && songs.length >= 4
    const singleCover = manualCover || songs[0]?.coverUrl || fallbackPlaylistCover

    return (
      <Link
        to={`/user-playlist-detail/${playlist.id}`}
        className={`playlist-card ${hasGrid ? 'playlist-has-grid' : ''}`}
        key={`global-${playlist.id}`}
        style={!hasGrid ? { backgroundImage: `url(${singleCover})` } : {}}
      >
        {hasGrid && (
          <div className="playlist-grid-bg">
            <img src={songs[0].coverUrl || fallbackPlaylistCover} alt="" />
            <img src={songs[1].coverUrl || fallbackPlaylistCover} alt="" />
            <img src={songs[2].coverUrl || fallbackPlaylistCover} alt="" />
            <img src={songs[3].coverUrl || fallbackPlaylistCover} alt="" />
          </div>
        )}
        <div className="playlist-user-card-content">
          <h3>{playlist.name}</h3>
          {description && <p>{description}</p>}
        </div>
      </Link>
    )
  }

  const handlePlayGenre = async (genreName) => {
    if (!genreName) return

    try {
      const songs = await musicService.searchMusicsByGenre(genreName)

      if (!songs.length) {
        showMusicError(`Nenhuma música encontrada em ${genreName}.`)
        return
      }

      playTrack(songs[0], songs)
    } catch (error) {
      console.error(`Erro ao tocar músicas do gênero ${genreName}`, error)
      showMusicError(`Não foi possível tocar ${genreName} agora.`)
    }
  }

  const isLoadingExplore = isLoadingGenres || isLoadingGlobalPlaylists

  return (
    <div className="playlists-page">
      <Sidebar />

      <main className="playlists-main">
        <section className="playlists-header">
          <span>PLAYLIST</span>

          <h1>Escolha o que quer ouvir</h1>

          <p>
            Encontre seus favoritos, crie sua própria seleção
            ou explore novos estilos.
          </p>
        </section>

        {/* FAVORITOS + ADD PLAYLIST */}

        <section className="playlists-main-grid">
          {mainPlaylists.map((playlist) => (
            <Link
              to="/favorites"
              className={`playlist-main-card ${playlist.className}`}
              key={playlist.title}
            >
              <div className="playlist-main-icon">
                {playlist.icon}
              </div>

              <div>
                <h2>{playlist.title}</h2>
                <p>{playlist.description}</p>
              </div>
            </Link>
          ))}

<Link
  to="/create-playlist"
  className="playlist-main-card playlist-main-card--add"
>
  <div className="playlist-main-icon">
    <FaPlus />
  </div>

  <div>
    <h2>Adicionar playlist</h2>
    <p>Crie uma nova playlist personalizada.</p>
  </div>
</Link>
        </section>

        {/* PLAYLISTS DO USUÁRIO */}

        <section className="playlists-user-section">
          <h2>Suas playlists</h2>

          <div className="playlists-user-grid">
            {isLoadingUser ? (
              // Skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`skel-${i}`} className="playlist-user-skeleton"></div>
              ))
            ) : userPlaylistsApi.length > 0 ? (
              userPlaylistsApi.map((playlist) => {
                const songs = (playlist.tracks || []).map(normalizeMusic).filter(Boolean)
                const manualCover = playlist.coverUrl || playlist.capaUrl || ''
                const description = playlist.description || playlist.descricao || 'Sem descrição adicionada.'
                const hasGrid = !manualCover && songs.length >= 4
                const singleCover = manualCover || songs[0]?.coverUrl || fallbackPlaylistCover

                return (
                  <Link
                    to={`/user-playlist-detail/${playlist.id}`}
                    className={`playlist-user-card ${hasGrid ? 'playlist-has-grid' : ''}`}
                    key={playlist.id}
                    style={!hasGrid ? { backgroundImage: `url(${singleCover})` } : {}}
                  >
                    {hasGrid && (
                      <div className="playlist-grid-bg">
                        <img src={songs[0].coverUrl || fallbackPlaylistCover} alt="" />
                        <img src={songs[1].coverUrl || fallbackPlaylistCover} alt="" />
                        <img src={songs[2].coverUrl || fallbackPlaylistCover} alt="" />
                        <img src={songs[3].coverUrl || fallbackPlaylistCover} alt="" />
                      </div>
                    )}
                    <div className="playlist-user-card-content">
                      <h3>{playlist.name}</h3>
                      <p>{description}</p>
                    </div>
                  </Link>
                )
              })
            ) : (
              <p>Você ainda não tem nenhuma playlist criada.</p>
            )}
          </div>
        </section>

        {/* EXPLORE */}

        <section className="playlists-explore">
          <div className="playlists-section-title">
            <h2>Explore novos estilos</h2>
          </div>

          <div className="playlists-grid">
            {isLoadingExplore ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={`g-skel-${i}`} style={{ width: '100%', height: '140px', borderRadius: '16px', background: '#222', animation: 'loading-shimmer 1.5s infinite linear', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #1f1f22 25%, #2a2a2e 50%, #1f1f22 75%)' }}></div>
              ))
            ) : globalPlaylistsApi.length > 0 || genresApi.length > 0 ? (
              <>
                {globalPlaylistsApi.map(renderPlaylistCard)}
                {genresApi.map((genre) => {
                  const genreName = genre.name || genre.nome || genre.titulo
                  if (!genreName) return null

                  return (
                    <button
                      type="button"
                      className="playlist-card playlist-card--genre-simple"
                      key={genre.id || genreName}
                      onClick={() => handlePlayGenre(genreName)}
                      aria-label={`Tocar músicas do gênero ${genreName}`}
                    >
                      <span className="playlist-genre-icon" aria-hidden="true">
                        <FaMusic />
                      </span>
                      <h3>{genreName}</h3>
                    </button>
                  )
                })}
              </>
            ) : (
              <p>Nenhum estilo encontrado.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Playlists
