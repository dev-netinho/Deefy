import "./FeaturedSection.css";

/**
 * Displays a horizontal scroll row of user playlists.
 * Only rendered when no search query is active.
 *
 * @param {{ playlists: import('../mocks/musicData').Playlist[] }} props
 */
function FeaturedSection({ playlists }) {
  return (
    <section className="featured" aria-label="Playlists em destaque">
      <h2 className="featured-title">Featured</h2>
      <div className="featured-row">
        {playlists.map((playlist) => (
          <article key={playlist.id} className="featured-card">
            <div className="featured-card-cover">
              <img
                src={playlist.coverUrl}
                alt={playlist.name}
                loading="lazy"
                draggable="false"
              />
              <div className="featured-card-overlay">
                <button className="featured-play-btn" aria-label={`Reproduzir ${playlist.name}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="featured-card-info">
              <p className="featured-card-name">{playlist.name}</p>
              <span className="featured-card-count">{playlist.songCount} músicas</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeaturedSection;
