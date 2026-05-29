import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import { usePlayer } from '../contexts/PlayerContext.jsx'
import { musicService } from '../services/musicService.js'
import { normalizeMusic } from '../utils/musicNormalizer.js'
import './SharedMusic.css'

function SharedMusic() {
  const { id } = useParams()
  const { playTrack, requestExpandedPlayer } = usePlayer()
  const [status, setStatus] = useState('Carregando música compartilhada...')

  useEffect(() => {
    let isMounted = true

    musicService.getMusicById(id)
      .then((music) => {
        if (!isMounted) return

        const track = normalizeMusic(music)
        if (!track) {
          setStatus('Não foi possível abrir essa música.')
          return
        }

        playTrack(track, [track])
        requestExpandedPlayer()
        setStatus(`Abrindo "${track.title}" no player...`)
      })
      .catch(() => {
        if (isMounted) setStatus('Essa música não foi encontrada.')
      })

    return () => {
      isMounted = false
    }
  }, [id, playTrack, requestExpandedPlayer])

  return (
    <div className="shared-music-page">
      <Sidebar />
      <main className="shared-music-main">
        <section className="shared-music-panel">
          <span>DEEFY LINK</span>
          <h1>{status}</h1>
          <Link to="/home">Voltar para a Home</Link>
        </section>
      </main>
    </div>
  )
}

export default SharedMusic
