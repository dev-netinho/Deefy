import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaCompactDisc, FaPlay } from 'react-icons/fa'
import { MdClose, MdSearch } from 'react-icons/md'
import Sidebar from '../components/Sidebar.jsx'
import { musicService } from '../services/musicService.js'
import { pickWeightedRecommendations } from '../utils/recommendationEngine.js'
import './Catalog.css'

const fallbackCovers = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900',
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=900',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=900',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900',
]

function firstText(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || ''
}

function hashText(value) {
  return String(value || '')
    .split('')
    .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
}

function normalizeSearch(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getPlaylistId(playlist) {
  return playlist?.id || playlist?.uuid || playlist?.slug || ''
}

function getPlaylistTitle(playlist) {
  return firstText(
    playlist?.name,
    playlist?.nome,
    playlist?.title,
    playlist?.titulo,
    'Playlist Deefy'
  )
}

function getTrackCover(track) {
  return firstText(
    track?.coverUrl,
    track?.capaUrl,
    track?.imageUrl,
    track?.imagemUrl,
    track?.thumbnailUrl,
    track?.albumCover
  )
}

function getPlaylistFallbackCover(playlist) {
  const seed = getPlaylistId(playlist) || getPlaylistTitle(playlist)
  const index = Math.abs(hashText(seed)) % fallbackCovers.length
  return fallbackCovers[index]
}

function getPlaylistCover(playlist) {
  return firstText(
    playlist?.coverUrl,
    playlist?.capaUrl,
    playlist?.imageUrl,
    playlist?.imagemUrl,
    playlist?.thumbnailUrl,
    playlist?.tracks?.map(getTrackCover).find(Boolean),
    getPlaylistFallbackCover(playlist)
  )
}

function getPlaylistDescription(playlist) {
  const trackCount = playlist?.tracks?.length || playlist?.musics?.length || playlist?.musicas?.length || 0

  return firstText(
    playlist?.description,
    playlist?.descricao,
    trackCount ? `${trackCount} músicas no catálogo.` : '',
    'Seleção recomendada para o seu momento.'
  )
}

function sortHighlightedFirst(items, highlightedId) {
  if (!highlightedId) return items

  return [...items].sort((left, right) => {
    const leftMatch = String(getPlaylistId(left)) === String(highlightedId)
    const rightMatch = String(getPlaylistId(right)) === String(highlightedId)
    return Number(rightMatch) - Number(leftMatch)
  })
}

function getPlaylistHref(playlist) {
  const playlistId = getPlaylistId(playlist)
  return playlistId ? `/user-playlist-detail/${playlistId}` : '/playlists'
}

function SystemPlaylists() {
  const [searchParams] = useSearchParams()
  const highlightedId = searchParams.get('highlight') || ''
  const [playlists, setPlaylists] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [catalogSearch, setCatalogSearch] = useState('')

  useEffect(() => {
    let isMounted = true

    musicService.getGlobalPlaylists()
      .then((data) => {
        if (!isMounted) return
        const recommended = pickWeightedRecommendations(data, data.length)
        setPlaylists(sortHighlightedFirst(recommended, highlightedId))
      })
      .catch((error) => {
        console.error('Erro ao carregar playlists do sistema.', error)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [highlightedId])

  const normalizedSearch = normalizeSearch(catalogSearch)
  const visiblePlaylists = normalizedSearch
    ? playlists.filter((playlist) => normalizeSearch(getPlaylistTitle(playlist)).includes(normalizedSearch))
    : playlists
  const featuredPlaylists = visiblePlaylists.slice(0, 3)
  const remainingPlaylists = visiblePlaylists.slice(3)
  const mainPlaylist = featuredPlaylists[0]
  const secondaryPlaylists = featuredPlaylists.slice(1)
  const hasNoResults = !isLoading && visiblePlaylists.length === 0

  return (
    <div className="catalog-page">
      <Sidebar />

      <main className="catalog-main">
        <section className="catalog-header">
          <span>DEEFY</span>
          <h1>Playlists recomendadas</h1>
          <p>Seleções públicas do catálogo, reordenadas pelo que você mais escuta.</p>
        </section>

        <div className="catalog-search" role="search">
          <MdSearch className="catalog-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={catalogSearch}
            onChange={(event) => setCatalogSearch(event.target.value)}
            placeholder="Pesquisar playlists pelo nome..."
            aria-label="Pesquisar playlists pelo nome"
          />
          {catalogSearch && (
            <button
              type="button"
              onClick={() => setCatalogSearch('')}
              aria-label="Limpar pesquisa"
            >
              <MdClose />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="catalog-featured-grid" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="catalog-skeleton catalog-skeleton--featured" key={index} />
            ))}
          </div>
        ) : (
          <>
            {featuredPlaylists.length > 0 && (
              <section className="catalog-featured-section">
                <div className="catalog-section-title">
                  <span>PARA VOCÊ</span>
                  <h2>Playlists em destaque</h2>
                </div>

                <div className="catalog-playlist-spotlight">
                  {mainPlaylist && (
                    <Link
                      className="catalog-playlist-hero"
                      to={getPlaylistHref(mainPlaylist)}
                    >
                      <div className="catalog-playlist-hero-cover-wrap">
                        <img
                          className="catalog-playlist-hero-cover"
                          src={getPlaylistCover(mainPlaylist)}
                          alt={`Capa de ${getPlaylistTitle(mainPlaylist)}`}
                          loading="lazy"
                        />
                      </div>

                      <div className="catalog-playlist-hero-copy">
                        <span className="catalog-featured-badge catalog-featured-badge--inline">
                          Mais indicada
                        </span>
                        <h2>{getPlaylistTitle(mainPlaylist)}</h2>
                        <p>{getPlaylistDescription(mainPlaylist)}</p>
                        <span className="catalog-featured-action catalog-playlist-hero-action">
                          <FaPlay />
                          <span>Abrir playlist</span>
                        </span>
                      </div>
                    </Link>
                  )}

                  {secondaryPlaylists.length > 0 && (
                    <div className="catalog-playlist-side">
                      {secondaryPlaylists.map((playlist) => (
                        <Link
                          className="catalog-playlist-side-card"
                          to={getPlaylistHref(playlist)}
                          key={getPlaylistId(playlist) || getPlaylistTitle(playlist)}
                        >
                          <img
                            src={getPlaylistCover(playlist)}
                            alt={`Capa de ${getPlaylistTitle(playlist)}`}
                            loading="lazy"
                          />

                          <div>
                            <span>Recomendada</span>
                            <h3>{getPlaylistTitle(playlist)}</h3>
                            <p>{getPlaylistDescription(playlist)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {remainingPlaylists.length > 0 && (
              <section className="catalog-list-section">
                <div className="catalog-section-title">
                  <span>CATÁLOGO</span>
                  <h2>Todas as playlists</h2>
                </div>

                <div className="catalog-grid">
                  {remainingPlaylists.map((playlist) => (
                    <Link
                      className="catalog-playlist-card"
                      to={getPlaylistHref(playlist)}
                      key={getPlaylistId(playlist) || getPlaylistTitle(playlist)}
                      style={{ backgroundImage: `url(${getPlaylistCover(playlist)})` }}
                    >
                      <span className="catalog-card-icon">
                        <FaCompactDisc />
                      </span>
                      <div>
                        <h2>{getPlaylistTitle(playlist)}</h2>
                        <p>{getPlaylistDescription(playlist)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {hasNoResults && (
          <div className="catalog-empty-state">
            <h2>Nenhuma playlist encontrada</h2>
            <p>Tente buscar por outro nome.</p>
          </div>
        )}

        {isLoading && (
          <div className="catalog-grid catalog-loading-grid" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="catalog-skeleton" key={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default SystemPlaylists
