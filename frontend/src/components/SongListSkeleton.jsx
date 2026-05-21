import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./SongList.css";

/**
 * Renders a skeleton placeholder that exactly mirrors the SongList layout.
 * Use while music data is loading from the API.
 *
 * @param {{ count?: number }} props
 */
function SongListSkeleton({ count = 8 }) {
  return (
    <SkeletonTheme baseColor="#1a1a1e" highlightColor="#2a2a30">
      <section className="song-list" aria-label="Carregando músicas..." aria-busy="true">
        {/* Mimic the title */}
        <Skeleton width={160} height={20} borderRadius={6} style={{ marginBottom: "16px" }} />

        <div className="song-list-table" role="table">
          {/* Mimic the header */}
          <div className="song-list-header" role="row">
            <span className="song-col-num">
              <Skeleton width={14} height={12} />
            </span>
            <span className="song-col-info">
              <Skeleton width={60} height={12} />
            </span>
            <span className="song-col-album">
              <Skeleton width={50} height={12} />
            </span>
            <span className="song-col-dur">
              <Skeleton width={16} height={12} />
            </span>
          </div>

          {/* Mimic each song row */}
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="song-row" role="row" style={{ pointerEvents: "none" }}>
              {/* # column */}
              <span className="song-col-num" role="cell">
                <Skeleton circle width={18} height={18} />
              </span>

              {/* Cover + title + artist */}
              <div className="song-col-info" role="cell">
                <Skeleton width={42} height={42} borderRadius={8} style={{ flexShrink: 0 }} />
                <div className="song-text">
                  <Skeleton width={140} height={13} borderRadius={4} />
                  <Skeleton width={90} height={11} borderRadius={4} style={{ marginTop: "4px" }} />
                </div>
              </div>

              {/* Album */}
              <span className="song-col-album" role="cell">
                <Skeleton width={100} height={12} borderRadius={4} />
              </span>

              {/* Duration */}
              <span className="song-col-dur" role="cell">
                <Skeleton width={32} height={12} borderRadius={4} />
              </span>
            </div>
          ))}
        </div>
      </section>
    </SkeletonTheme>
  );
}

export default SongListSkeleton;
