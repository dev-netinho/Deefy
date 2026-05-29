import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaCompactDisc, FaPlay } from 'react-icons/fa'
import { MdClose, MdSearch } from 'react-icons/md'
import Sidebar from '../components/Sidebar.jsx'
import { musicService } from '../services/musicService.js'
import { pickWeightedRecommendations } from '../utils/recommendationEngine.js'
import { filterBySearch, getSearchableText } from '../utils/search.js'
import './Catalog.css'

function firstText(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || ''
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
    'Playlist Deefy',
  )
}

function getTrackCover(track) {
  return firstText(
    track?.coverUrl,
    track?.capaUrl,
    track?.imageUrl,
    track?.imagemUrl,
    track?.thumbnailUrl,
    track?.albumCover,
  )
}

function getPlaylistCover(playlist) {
  return firstText(
    playlist?.coverUrl,
    playlist?.capaUrl,
    playlist?.imageUrl,
    playlist?.imagemUrl,
    playlist?.thumbnailUrl,
    playlist?.tracks?.map(getTrackCover).find(Boolean),
  )
}

function getPlaylistDescription(playlist) {
  const trackCount = playlist?.tracks?.length || playlist?.musics?.length || playlist?.musicas?.length || 0

  return firstText(
    playlist?.description,
    playlist?.descricao,
    trackCount ? `${trackCount} músicas no catálogo.` : '',
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

  const visiblePlaylists = filterBySearch(playlists, catalogSearch, (playlist) => (
    getSearchableText(
      getPlaylistTitle(playlist),
      playlist?.description,
      playlist?.descricao,
      playlist?.genre,
      playlist?.genero,
    )
  ))
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
          <div className="catalog-featured-grid catalog-featured-grid--loading" aria-hidden="true">
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
                      to={`/playlist-detail/${getPlaylistId(mainPlaylist)}`}
                    >
                      <div className="catalog-playlist-hero-cover-wrap">
                        {getPlaylistCover(mainPlaylist) ? (
                          <img
                            className="catalog-playlist-hero-cover"
                            src={getPlaylistCover(mainPlaylist)}
                            alt={`Capa de ${getPlaylistTitle(mainPlaylist)}`}
                            loading="lazy"
                          />
                        ) : (
                          <div className="catalog-playlist-hero-cover catalog-playlist-cover-placeholder" aria-hidden="true">
                            <FaCompactDisc />
                          </div>
                        )}
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
                      {secondaryPlaylists.map((playlist) => {
                        const cover = getPlaylistCover(playlist)

                        return (
                          <Link
                            className="catalog-playlist-side-card"
                            to={`/playlist-detail/${getPlaylistId(playlist)}`}
                            key={getPlaylistId(playlist) || getPlaylistTitle(playlist)}
                          >
                            {cover ? (
                              <img
                                src={cover}
                                alt={`Capa de ${getPlaylistTitle(playlist)}`}
                                loading="lazy"
                              />
                            ) : (
                              <div className="catalog-playlist-side-cover catalog-playlist-cover-placeholder" aria-hidden="true">
                                <FaCompactDisc />
                              </div>
                            )}

                            <div>
                              <span>Recomendada</span>
                              <h3>{getPlaylistTitle(playlist)}</h3>
                              <p>{getPlaylistDescription(playlist)}</p>
                            </div>
                          </Link>
                        )
                      })}
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
                  {remainingPlaylists.map((playlist) => {
                    const cover = getPlaylistCover(playlist)

                    return (
                      <Link
                        className="catalog-playlist-card"
                        to={`/playlist-detail/${getPlaylistId(playlist)}`}
                        key={getPlaylistId(playlist) || getPlaylistTitle(playlist)}
                        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                      >
                        <span className="catalog-card-icon">
                          <FaCompactDisc />
                        </span>
                        <div>
                          <h2>{getPlaylistTitle(playlist)}</h2>
                          <p>{getPlaylistDescription(playlist)}</p>
                        </div>
                      </Link>
                    )
                  })}
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
