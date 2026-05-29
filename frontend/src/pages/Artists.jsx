import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaChevronRight } from 'react-icons/fa'
import { MdClose, MdSearch } from 'react-icons/md'
import Sidebar from '../components/Sidebar.jsx'
import { musicService } from '../services/musicService.js'
import { pickWeightedRecommendations } from '../utils/recommendationEngine.js'
import { filterBySearch, getSearchableText, sanitizeSearchQuery, scoreSearchMatch } from '../utils/search.js'
import './Catalog.css'

function firstText(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || ''
}

function getArtistName(artist) {
  return firstText(
    artist?.name,
    artist?.nome,
    artist?.artistName,
    artist?.artistaNome,
    artist?.title,
    'Artista'
  )
}

function getArtistImage(artist) {
  return firstText(
    artist?.imageUrl,
    artist?.imagemUrl,
    artist?.photoUrl,
    artist?.fotoUrl,
    artist?.avatarUrl,
    artist?.coverUrl
  )
}

function getArtistMeta(artist) {
  return firstText(
    artist?.genre,
    artist?.genero,
    artist?.style,
    artist?.estilo,
    artist?.bio,
    artist?.description,
    'Informação não cadastrada'
  )
}

function Artists() {
  const [searchParams] = useSearchParams()
  const focus = searchParams.get('focus') || ''
  const [artists, setArtists] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [artistSearch, setArtistSearch] = useState('')

  useEffect(() => {
    let isMounted = true

    musicService.getArtists()
      .then((data) => {
        if (!isMounted) return

        const recommended = pickWeightedRecommendations(data, data.length)
        const normalizedFocus = sanitizeSearchQuery(focus)

        setArtists(
          normalizedFocus
            ? [...recommended].sort((left, right) => {
                const leftScore = scoreSearchMatch(getArtistName(left), normalizedFocus)
                const rightScore = scoreSearchMatch(getArtistName(right), normalizedFocus)
                return rightScore - leftScore
              })
            : recommended,
        )
      })
      .catch((error) => {
        console.error('Erro ao carregar artistas.', error)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [focus])

  const visibleArtists = filterBySearch(artists, artistSearch, (artist) => (
    getSearchableText(
      getArtistName(artist),
      getArtistMeta(artist),
      artist?.bio,
      artist?.description,
      artist?.genre,
      artist?.genero,
      artist?.style,
      artist?.estilo,
    )
  ))
  const featuredArtists = visibleArtists.slice(0, 3)
  const remainingArtists = visibleArtists.slice(3)
  const hasNoResults = !isLoading && visibleArtists.length === 0

  return (
    <div className="catalog-page">
      <Sidebar />

      <main className="catalog-main">
        <section className="catalog-header">
          <span>CATÁLOGO</span>
          <h1>Artistas</h1>
          <p>Escolha um artista para abrir a Home já filtrando músicas dele.</p>
        </section>

        <div className="catalog-search" role="search">
          <MdSearch className="catalog-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={artistSearch}
            onChange={(event) => setArtistSearch(event.target.value)}
            placeholder="Pesquisar artistas pelo nome..."
            aria-label="Pesquisar artistas pelo nome"
          />
          {artistSearch && (
            <button
              type="button"
              onClick={() => setArtistSearch('')}
              aria-label="Limpar pesquisa"
            >
              <MdClose />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="catalog-featured-grid catalog-featured-grid--artists catalog-featured-grid--loading" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="catalog-skeleton catalog-skeleton--featured" key={index} />
            ))}
          </div>
        ) : (
          <>
            {featuredArtists.length > 0 && (
              <section className="catalog-featured-section">
                <div className="catalog-section-title">
                  <span>PARA VOCÊ</span>
                  <h2>Artistas em destaque</h2>
                </div>

                <div className="catalog-featured-grid catalog-featured-grid--artists">
                  {featuredArtists.map((artist, index) => {
                    const artistName = getArtistName(artist)
                    const image = getArtistImage(artist)

                    return (
                      <Link
                        className={`catalog-featured-card catalog-featured-card--artist ${
                          index === 0 ? 'is-main' : ''
                        }`}
                        to={`/home?artist=${encodeURIComponent(artistName)}`}
                        key={artist.id || artistName}
                        style={image ? { backgroundImage: `url(${image})` } : undefined}
                      >
                        <span className="catalog-featured-badge">
                          {index === 0 && 'Mais indicado'}
                        </span>

                        <div>
                          <h2>{artistName}</h2>
                          <p>{getArtistMeta(artist)}</p>
                          <span className="catalog-featured-action">
                            <span>Ouvir artista</span>
                            <FaChevronRight />
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {remainingArtists.length > 0 && (
              <section className="catalog-list-section">
                <div className="catalog-section-title">
                  <span>CATÁLOGO</span>
                  <h2>Todos os artistas</h2>
                </div>

                <div className="catalog-grid catalog-grid--artists">
                  {remainingArtists.map((artist) => {
                    const artistName = getArtistName(artist)
                    const image = getArtistImage(artist)

                    return (
                      <Link
                        className="catalog-artist-card"
                        to={`/home?artist=${encodeURIComponent(artistName)}`}
                        key={artist.id || artistName}
                      >
                        {image ? (
                          <img src={image} alt={artistName} loading="lazy" />
                        ) : (
                          <span className="catalog-artist-avatar">
                            {artistName.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div>
                          <h2>{artistName}</h2>
                          <p>{getArtistMeta(artist)}</p>
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
            <h2>Nenhum artista encontrado</h2>
            <p>Tente buscar por outro nome.</p>
          </div>
        )}

        {isLoading && (
          <div className="catalog-grid catalog-grid--artists catalog-loading-grid" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, index) => (
              <div className="catalog-skeleton catalog-skeleton--artist" key={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Artists
