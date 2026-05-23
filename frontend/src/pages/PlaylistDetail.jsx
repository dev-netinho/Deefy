import './PlaylistDetail.css'
import Sidebar from '../components/Sidebar.jsx'
import SongList from '../components/SongList.jsx'
import MusicPlayer from '../components/MusicPlayer.jsx'
import { MOCK_SONGS } from '../mocks/musicData.js'

function PlaylistDetail() {
  return (
    <div className="playlist-detail-page">
      <Sidebar />

      <main className="playlist-detail-main">
        <div className="playlist-detail-top-icons">
          <button>🔔</button>
          <button>⚙️</button>
        </div>

        <section className="playlist-detail-hero">
          <img
            className="playlist-detail-cover"
            src="https://picsum.photos/seed/cyberpunk/300/300"
            alt="Capa da playlist"
          />

<div className="playlist-detail-info">
  <span>PLAYLIST SELECIONADA</span>
  <h1>Cyberpunk Essentials</h1>
  <p>⏱ 3h 42m • 48 faixas</p>

  <div className="playlist-detail-actions">
    <button className="playlist-play-btn">▶ Play</button>
    <button className="playlist-random-btn">⤨ Iniciar Aleatoriamente</button>
  </div>
</div>
</section>

        <SongList songs={MOCK_SONGS} title="" />
      </main>

      <MusicPlayer />
    </div>
  )
}

export default PlaylistDetail