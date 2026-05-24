import './UserPlaylistDetail.css'

import Sidebar from '../components/Sidebar.jsx'
import SongList from '../components/SongList.jsx'
import MusicPlayer from '../components/MusicPlayer.jsx'
import { MOCK_SONGS } from '../mocks/musicData.js'

function UserPlaylistDetail() {
  return (
    <div className="user-playlist-page">
      <Sidebar />

      <main className="user-playlist-main">
        <div className="user-playlist-top-icons">
          <button>🔔</button>
          <button>⚙️</button>
        </div>

        <section className="user-playlist-hero">
          <img
            className="user-playlist-cover"
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800"
            alt="Capa da playlist"
          />

          <div className="user-playlist-info">
            <span>PLAYLIST DO USUÁRIO</span>

            <h1>Treino pesado</h1>

            <p>12 músicas • criada por você</p>

            <div className="user-playlist-actions">
              <button className="user-playlist-play-btn">▶ Reproduzir</button>
              <button className="user-playlist-random-btn">⤨ Tocar aleatoriamente</button>
              <button className="user-playlist-add-btn">＋ Adicionar</button>
            </div>
          </div>
        </section>

        <SongList songs={MOCK_SONGS} title="" />
      </main>

      <MusicPlayer />
    </div>
  )
}

export default UserPlaylistDetail