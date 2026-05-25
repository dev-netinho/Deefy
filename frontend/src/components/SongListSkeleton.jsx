import './SongList.css';
import './SongListSkeleton.css';

function SongListSkeleton({ count = 12 }) {
  const items = Array.from({ length: count });

  return (
    <section className="song-list" aria-label="Carregando músicas">
      <div className="song-list-table">
        <div className="song-list-header">
          <span className="song-col-num">#</span>
          <span className="song-col-info">TÍTULO</span>
          <span className="song-col-album">ÁLBUM</span>
          <span className="song-col-dur">⏱</span>
          <span className="song-col-options"></span>
        </div>

        {items.map((_, index) => (
          <div key={index} className="song-row song-row-skeleton">
            <span className="song-col-num">
              <div className="skeleton-box skeleton-number"></div>
            </span>

            <div className="song-col-info">
              <div className="skeleton-box skeleton-cover"></div>
              <div className="song-text">
                <div className="skeleton-box skeleton-title"></div>
                <div className="skeleton-box skeleton-artist"></div>
              </div>
            </div>

            <span className="song-col-album">
              <div className="skeleton-box skeleton-album"></div>
            </span>

            <span className="song-col-dur">
              <div className="skeleton-box skeleton-duration"></div>
            </span>

            <span className="song-col-options">
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SongListSkeleton;
