import logo from '../assets/logo.svg'
import background from '../assets/background.jpg'
import './Preferences.css'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { musicService } from '../services/musicService'
import { filterBySearch, getSearchableText } from '../utils/search'

function firstText(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || ''
}

function getArtistId(artist, index) {
  return String(artist?.id || artist?.uuid || artist?.slug || getArtistName(artist) || index)
}

function getArtistName(artist) {
  return firstText(
    artist?.name,
    artist?.nome,
    artist?.artistName,
    artist?.artistaNome,
    artist?.title,
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
  )
}

function getArtistImage(artist) {
  return firstText(
    artist?.imageUrl,
    artist?.imagemUrl,
    artist?.photoUrl,
    artist?.fotoUrl,
    artist?.avatarUrl,
    artist?.coverUrl,
  )
}

function getArtistInitials(artist) {
  return (getArtistName(artist) || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function getArtistSearchText(artist) {
  return getSearchableText(
    getArtistName(artist),
    getArtistMeta(artist),
  )
}

function Preferences() {
  const navigate = useNavigate();

  const [selectedArtists, setSelectedArtists] = useState([]);
  const [artistSearch, setArtistSearch] = useState('');
  const [artists, setArtists] = useState([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(true);

  useEffect(() => {
    let isMounted = true;

    musicService.getArtists()
      .then((data) => {
        if (isMounted) setArtists(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Erro ao carregar artistas para preferências.', error);
        if (isMounted) setArtists([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingArtists(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function toggleArtist(id) {
    setSelectedArtists((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  const visibleArtists = filterBySearch(artists, artistSearch, getArtistSearchText);

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
        <input
          type="text"
          placeholder="Pesquisar Artistas..."
          value={artistSearch}
          onChange={(event) => setArtistSearch(event.target.value)}
        />
        <div className="circle-container">
          {isLoadingArtists && (
            <p className="preferences-empty">Carregando artistas...</p>
          )}

          {!isLoadingArtists && visibleArtists.length === 0 && (
            <p className="preferences-empty">
              {artistSearch ? 'Nenhum artista encontrado.' : 'Nenhum artista disponível agora.'}
            </p>
          )}

          {!isLoadingArtists && visibleArtists.map((artist, index) => {
            const id = getArtistId(artist, index);
            const image = getArtistImage(artist);
            const isSelected = selectedArtists.includes(id);

            return (
              <div className="circle-wrapper" key={id}>
                <button
                  type="button"
                  className={`circle${image ? ' circle--image' : ''}${isSelected ? ' selected' : ''}`}
                  onClick={() => toggleArtist(id)}
                  aria-label={`Selecionar ${getArtistName(artist) || 'artista'}`}
                  aria-pressed={isSelected}
                  style={image ? { backgroundImage: `url(${image})` } : undefined}
              >
                  {!image && <span className="circle-initials">{getArtistInitials(artist)}</span>}
                  <div className="circle-badge">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </button>
                <h2>{getArtistName(artist) || 'Artista'}</h2>
                <h3>{getArtistMeta(artist) || 'Sem gênero informado'}</h3>
              </div>
            );
          })}
        </div>
        <div className="preferences-selection-container">
          <div className="preferences-selection">
            {statusSelecao}
            <button className="button button-primary" onClick={() => navigate('/welcome')}>
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
