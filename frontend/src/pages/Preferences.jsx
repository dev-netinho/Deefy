import logo from '../assets/logo.svg'
import background from '../assets/background.jpg'
import './Preferences.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Preferences() {
  const navigate = useNavigate();

  const [selectedArtists, setSelectedArtists] = useState([]);

  function toggleArtist(id) {
    setSelectedArtists((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  let artistasSelecionados = selectedArtists.length;
  let statusSelecao = "";

  if (artistasSelecionados === 0) {
    statusSelecao = <p>Nenhum artista selecionado</p>;
  } else {
    statusSelecao = <p className="trueSelection">{artistasSelecionados} artistas selecionados</p>;
  }

  return (
    <div
      className="preferences-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="preferences-overlay"></div>

      <section className="preferences-center">
        <div className="preferences-header">
          <div className="preferences-text">
            <h1>
              O que você ama?
            </h1>
            <p>
              Selecione pelo menos 3 artistas para nos ajudar a ajustar seu Deefy. <br />Quanto mais você escolher, melhores serão as recomendações.
            </p>
          </div>
          <div className="preferences-logo">
            <img src={logo} alt="Logo Deefy" />
          </div>
        </div>
        <input type="text" placeholder="Pesquisar Artistas..." />
        <div className="circle-container">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
            <div className="circle-wrapper" key={id}>
              <div
                className={`circle ${selectedArtists.includes(id) ? 'selected' : ''}`}
                onClick={() => toggleArtist(id)}
              >
                <div className="circle-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <h2>Lorem Ipsum</h2>
              <h3>Gênero</h3>
            </div>
          ))}
        </div>
        <div className="preferences-selection-container">
          <div className="preferences-selection">
            {statusSelecao}
            <button className="button button-primary" onClick={() => navigate('/home')}>
              Continue
              <span>→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Preferences;
