import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaChevronRight } from 'react-icons/fa'
import Sidebar from '../components/Sidebar.jsx'
import { musicService } from '../services/musicService.js'
import { pickWeightedRecommendations } from '../utils/recommendationEngine.js'
import './Catalog.css'

const fallbackArtistCover = 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=900'

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
    'Artista do catálogo'
  )
}

function Artists() {
  const [searchParams] = useSearchParams()
  const focus = searchParams.get('focus') || ''
  const [artists, setArtists] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    musicService.getArtists(80)
      .then((data) => {
        if (!isMounted) return

        const recommended = pickWeightedRecommendations(data, data.length)
        const normalizedFocus = focus.trim().toLowerCase()

        setArtists(
          normalizedFocus
            ? [...recommended].sort((left, right) => {
                const leftMatch = getArtistName(left).toLowerCase() === normalizedFocus
                const rightMatch = getArtistName(right).toLowerCase() === normalizedFocus
                return Number(rightMatch) - Number(leftMatch)
              })
            : recommended
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

  const featuredArtists = artists.slice(0, 3)
  const remainingArtists = artists.slice(3)

  return (
    <div className="catalog-page">
      <Sidebar />

      <main className="catalog-main">
        <section className="catalog-header">
          <span>CATÁLOGO</span>
          <h1>Artistas</h1>
          <p>Escolha um artista para abrir a Home já filtrando músicas dele.</p>
        </section>

        {isLoading ? (
          <div className="catalog-featured-grid catalog-featured-grid--artists" aria-hidden="true">
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
                    const image = getArtistImage(artist) || fallbackArtistCover

                    return (
                      <Link
                        className={`catalog-featured-card catalog-featured-card--artist ${
                          index === 0 ? 'is-main' : ''
                        }`}
                        to={`/home?artist=${encodeURIComponent(artistName)}`}
                        key={artist.id || artistName}
                        style={{ backgroundImage: `url(${image})` }}
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
