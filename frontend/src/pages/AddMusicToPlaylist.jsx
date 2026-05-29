import { useState, useEffect } from 'react'
import { FaArrowLeft, FaCheck, FaMusic, FaPlus, FaSearch } from 'react-icons/fa'
import { Link, useParams } from 'react-router-dom'
import './AddMusicToPlaylist.css'

import Sidebar from '../components/Sidebar.jsx'
import SongListSkeleton from '../components/SongListSkeleton.jsx'
import { musicService } from '../services/musicService.js'
import { useDebounce } from '../hooks/useDebounce.js'
import { showMusicSuccess, showMusicError } from '../utils/musicToast'
import { normalizeMusic } from '../utils/musicNormalizer.js'

function getSongKey(song) {
  const normalizedSong = normalizeMusic(song)
  if (!normalizedSong?.id && normalizedSong?.id !== 0) return null
  return String(normalizedSong.id)
}

function uniqueSongs(songs) {
  return Array.from(new Map(
    songs
      .map(normalizeMusic)
      .filter(Boolean)
      .map((music, index) => [getSongKey(music) || `${music.title}-${music.artist}-${index}`, music])
  ).values())
}

function AddMusicToPlaylist() {
  const { id } = useParams()
  const [search, setSearch] = useState('')
  const debouncedQuery = useDebounce(search, 300)
  
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [addingId, setAddingId] = useState(null)
  const [addedIds, setAddedIds] = useState(() => new Set())

  useEffect(() => {
    if (!id) return

    let isMounted = true

    musicService.getPlaylistById(id)
      .then((playlist) => {
        if (!isMounted) return

        const existingIds = (playlist.tracks || [])
          .map(getSongKey)
          .filter(Boolean)

        setAddedIds(new Set(existingIds))
      })
      .catch((err) => {
        console.error('Erro ao buscar músicas da playlist', err)
      })

    return () => { isMounted = false }
  }, [id])

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    if (!debouncedQuery.trim()) {
      musicService.getHomeMusics(12)
        .then((data) => {
          if (!isMounted) return
          setResults(uniqueSongs(data || []))
        })
        .catch((err) => {
          if (!isMounted) return
          console.error('Erro ao buscar recomendações', err)
          setResults([])
        })
        .finally(() => {
          if (isMounted) setIsLoading(false)
        })

      return () => { isMounted = false }
    }

    musicService.searchMusicsSmart(debouncedQuery, {
      fields: ['title', 'artist', 'album', 'genre'],
    }).then((data) => {
      if (!isMounted) return;
      setResults(uniqueSongs(data || []));
    }).catch((err) => {
      if (!isMounted) return;
      console.error('Erro ao buscar músicas', err);
      setResults([]);
    }).finally(() => {
      if (isMounted) setIsLoading(false);
    })

    return () => { isMounted = false }
  }, [debouncedQuery])

  async function handleAdd(song) {
    if (!id) return;

    const songKey = getSongKey(song)

    if (!songKey) {
      showMusicError("Não foi possível identificar esta música.")
      return
    }

    if (addedIds.has(songKey)) return

    try {
      setAddingId(songKey)
      await musicService.addMusicToPlaylist(id, song)
      setAddedIds((currentIds) => new Set(currentIds).add(songKey))
      showMusicSuccess("Música adicionada à playlist!")
    } catch (err) {
      if (err?.status === 409) {
        setAddedIds((currentIds) => new Set(currentIds).add(songKey))
        showMusicError("Essa música já está na playlist.")
      } else {
        showMusicError(err?.response?.data?.message || "Erro ao adicionar música.")
      }
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="add-music-page">
      <Sidebar />

      <main className="add-music-main">
        <section className="add-music-header">
          <div className="add-music-header-top">
            <span>ADICIONAR MÚSICAS</span>
            <Link to={`/user-playlist-detail/${id}`} className="add-music-back">
              <FaArrowLeft />
              <span>Voltar para playlist</span>
            </Link>
          </div>

          <h1>Monte sua playlist</h1>
          <p>Busque músicas ou escolha recomendações para adicionar à sua playlist pessoal.</p>
        </section>

        <section className="add-music-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar música, artista ou álbum..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </section>

        <section className="add-music-section">
          <h2>{debouncedQuery ? "Resultados da busca" : "Recomendações para você"}</h2>

          {isLoading ? (
            <div style={{ marginTop: '20px' }}>
              <SongListSkeleton count={5} />
            </div>
          ) : (
            <div className="add-music-list">
              {results.map((song, index) => {
                const songKey = getSongKey(song)
                const isAdded = Boolean(songKey && addedIds.has(songKey))
                const isAdding = addingId === songKey

                return (
                <article className={`add-music-card${isAdded ? ' is-added' : ''}`} key={songKey || `${song.title}-${index}`}>
                  <div className="add-music-info">
                    {song.coverUrl ? (
                      <img
                        src={song.coverUrl}
                        alt={`Capa de ${song.title || 'música'}`}
                      />
                    ) : (
                      <span className="add-music-cover-placeholder" aria-hidden="true">
                        <FaMusic />
                      </span>
                    )}

                    <div>
                      <h3>{song.title || 'Título não informado'}</h3>
                      <p>{song.artist || 'Artista não informado'}</p>
                    </div>
                  </div>

                  <span className="add-music-album">{song.album || 'Álbum não informado'}</span>
                  <span className="add-music-duration">{song.duration || '--:--'}</span>

                  <button 
                    className="add-music-button"
                    type="button"
                    onClick={() => handleAdd(song)}
                    disabled={isAdding || isAdded}
                  >
                    {isAdded ? <FaCheck /> : <FaPlus />}
                    {isAdded ? "Já adicionada" : isAdding ? "..." : "Adicionar"}
                  </button>
                </article>
              )})}
              
              {debouncedQuery && results.length === 0 && (
                <p>Nenhuma música encontrada.</p>
              )}

              {!debouncedQuery && results.length === 0 && (
                <p>Nenhuma recomendação disponível agora.</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AddMusicToPlaylist
