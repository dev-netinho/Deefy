import { useState } from 'react';
import './FavoritesDetail.css'

import { FaHeart } from 'react-icons/fa'
import Sidebar from '../components/Sidebar.jsx'
import SongList from '../components/SongList.jsx'
import MusicPlayer from '../components/MusicPlayer.jsx'

function FavoritesDetail() {
  const [favorites, setFavorites] = useState([]);

  return (
    <div className="favorites-page">
      <Sidebar />

      <main className="favorites-main">
        <div className="favorites-top-icons">
          <button>🔔</button>
          <button>⚙️</button>
        </div>

        <section className="favorites-hero">
          <div className="favorites-cover">
            <FaHeart />
          </div>

          <div className="favorites-info">
            <span>PLAYLIST</span>
            <h1>Favoritos</h1>
            <p>Músicas curtidas por você</p>

            <div className="favorites-actions">
              <button className="favorites-play-btn">▶ Reproduzir</button>
              <button className="favorites-random-btn">⤨ Tocar aleatoriamente</button>
            </div>
          </div>
        </section>

        <SongList songs={favorites} title="" />
      </main>

      <MusicPlayer />
    </div>
  )
}

export default FavoritesDetail