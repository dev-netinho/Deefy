import logo from '../assets/logo.svg'
import background from '../assets/background.jpg'
import '../Welcome.css'
import { useNavigate } from 'react-router-dom'

function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      className="welcome-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="welcome-overlay"></div>

      <section className="welcome-center">
        <div className="welcome-logo">
          <img src={logo} alt="Logo Deefy" />
        </div>

        <div className="welcome-text">
          <h1>
            Música para os <br /> seus ouvidos
          </h1>

          <p>
            Experiência sonora imersiva em alta fidelidade. Milhões de faixas,
            playlists incríveis e som espacial para transformar seu dia.
          </p>
        </div>

        <div className="welcome-actions">
          <button
            className="button button-primary"
            onClick={() => navigate('/registration')}
          >
            Registrar
          </button>

          <button
            className="button button-secondary"
            onClick={() => navigate('/login')}
          >
            Entrar
          </button>
        </div>
      </section>
    </div>
  );
}

export default Welcome;
