import { useState } from "react";
import { MdPlayArrow } from "react-icons/md";
import "./SongList.css";

/**
 * Renders the list of songs as a styled table.
 *
 * @param {{
 *   songs: import('../mocks/musicData').Song[],
 *   title?: string
 * }} props
 */
function SongList({ songs, title = "Todas as Músicas" }) {
  const [activeSongId, setActiveSongId] = useState(null);

  return (
    <section className="song-list" aria-label={title}>
      <h2 className="song-list-title">{title}</h2>

      <div className="song-list-table" role="table" aria-label="Lista de músicas">
        {/* Table header */}
        <div className="song-list-header" role="row">
          <span className="song-col-num" role="columnheader">#</span>
          <span className="song-col-info" role="columnheader">TÍTULO</span>
          <span className="song-col-album" role="columnheader">ÁLBUM</span>
          <span className="song-col-dur" role="columnheader">⏱</span>
        </div>

        {/* Rows */}
        {songs.map((song, index) => {
          const isActive = activeSongId === song.id;
          return (
            <div
              key={song.id}
              className={`song-row${isActive ? " song-row--active" : ""}`}
              role="row"
              tabIndex={0}
              onClick={() => setActiveSongId(isActive ? null : song.id)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                setActiveSongId(isActive ? null : song.id)
              }
            >
              {/* # / play icon */}
              <span className="song-col-num" role="cell">
                {isActive ? (
                  <MdPlayArrow className="song-playing-icon" />
                ) : (
                  <span className="song-index">{index + 1}</span>
                )}
              </span>

              {/* Cover + title + artist */}
              <div className="song-col-info" role="cell">
                <img
                  className="song-cover"
                  src={song.coverUrl}
                  alt={`${song.title} cover`}
                  loading="lazy"
                  draggable="false"
                />
                <div className="song-text">
                  <span className={`song-title${isActive ? " song-title--active" : ""}`}>
                    {song.title}
                  </span>
                  <span className="song-artist">{song.artist}</span>
                </div>
              </div>

              {/* Album */}
              <span className="song-col-album" role="cell">
                {song.album}
              </span>

              {/* Duration */}
              <span className="song-col-dur" role="cell">
                {song.duration}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SongList;
