import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaHeart, FaPlus } from 'react-icons/fa'

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

function Playlists() {
  const [userPlaylists, setUserPlaylists] = useState([])
  const [genrePlaylists, setGenrePlaylists] = useState([])

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

          <button className="playlist-main-card playlist-main-card--add">
            <div className="playlist-main-icon">
              <FaPlus />
            </div>

            <div>
              <h2>Adicionar playlist</h2>
              <p>Crie uma nova playlist personalizada.</p>
            </div>
          </button>
        </section>

        {/* PLAYLISTS DO USUÁRIO */}

        <section className="playlists-user-section">
          <h2>Suas playlists</h2>

          <div className="playlists-user-grid">
            {userPlaylists.map((playlist) => (
  <Link
    to="/user-playlist-detail"
    className="playlist-user-card"
    key={playlist.title}
    style={{ backgroundImage: `url(${playlist.image})` }}
  >
    <h3>{playlist.title}</h3>
  </Link>
))}
          </div>
        </section>

        {/* EXPLORE */}

        <section className="playlists-explore">
          <div className="playlists-section-title">
            <h2>Explore novos estilos</h2>
          </div>

          <div className="playlists-grid">
            {genrePlaylists.map((playlist) => (
              <Link
                to="/playlist-detail"
                className={`playlist-card ${playlist.className}`}
                key={playlist.title}
              >
                <h3>{playlist.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Playlists