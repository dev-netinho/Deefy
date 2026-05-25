import { useEffect, useMemo, useState } from "react";
import { MdFavorite, MdPlayArrow } from "react-icons/md";
import { usePlayer } from "../contexts/PlayerContext";
import { musicService } from "../services/musicService";
import { getMusicIdFromTrack, normalizeMusic } from "../utils/musicNormalizer";
import { recordListeningSignal } from "../utils/recommendationEngine";
import "./SongList.css";
import SongOptionsMenu from './SongOptionsMenu.jsx'

function getSongId(song) {
  const songId = getMusicIdFromTrack(song) ?? song?.id;
  return songId === undefined || songId === null || songId === '' ? '' : String(songId);
}

/**
 * Renders the list of songs as a styled table.
 *
 * @param {{
 *   songs: Array<Object>,
 *   title?: string
 * }} props
 */
function SongList({
  songs,
  title = "Todas as Músicas",
  playlistId,
  onSongRemoved,
  isFavoriteContext = false,
  onFavoriteRemoved,
  onFavoriteChanged,
  allowAddToPlaylist = true,
}) {
  const { currentTrack, playTrack, togglePlay } = usePlayer();
  const [favoriteSongIds, setFavoriteSongIds] = useState(() => new Set());
  const normalizedSongs = useMemo(
    () => (songs || []).map(normalizeMusic).filter(Boolean),
    [songs],
  );
  const currentTrackId = getSongId(currentTrack);

  useEffect(() => {
    if (isFavoriteContext) {
      return undefined;
    }

    let isMounted = true;

    musicService.getFavoriteMusics()
      .then((favorites) => {
        if (!isMounted) return;
        setFavoriteSongIds(new Set((favorites || []).map(getSongId).filter(Boolean)));
      })
      .catch((error) => {
        console.warn("Não foi possível carregar marcações de favoritos.", error);
      });

    return () => {
      isMounted = false;
    };
  }, [isFavoriteContext, normalizedSongs]);

  const handleFavoriteChanged = (song, isFavorite) => {
    const songId = getSongId(song);

    if (songId) {
      setFavoriteSongIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (isFavorite) {
          nextIds.add(songId);
        } else {
          nextIds.delete(songId);
        }

        return nextIds;
      });
    }

    onFavoriteChanged?.(song, isFavorite);
  };

  const handleFavoriteRemoved = (song) => {
    handleFavoriteChanged(song, false);
    onFavoriteRemoved?.(song);
  };

  const shouldAllowSongPlaylistActions = Boolean(playlistId) || allowAddToPlaylist;

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
  <span className="song-col-options" role="columnheader"></span>
</div>

        {/* Rows */}
        {normalizedSongs.map((song, index) => {
          const songId = getSongId(song);
          const isActive = Boolean(songId && currentTrackId === songId);
          const isFavorite = isFavoriteContext || favoriteSongIds.has(songId) || Boolean(song.isFavorite);
          const handleSongAction = () => {
            if (isActive) {
              togglePlay();
              return;
            }

            recordListeningSignal(song);
            playTrack(song, normalizedSongs);
          };

          return (
            <div
              key={song.id || `${song.title}-${index}`}
              className={`song-row${isActive ? " song-row--active" : ""}${isFavorite ? " song-row--favorite" : ""}`}
              role="row"
              tabIndex={0}
              onClick={handleSongAction}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSongAction();
                }
              }}
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
                <div
                  className={`song-cover-wrap${isFavorite ? " is-favorite" : ""}`}
                  title={isFavorite ? "Esta música está nos favoritos" : undefined}
                >
                  <img
                    className="song-cover"
                    src={song.coverUrl || "https://picsum.photos/seed/music/80/80"}
                    alt={`Capa de ${song.title || "música"}`}
                    loading="lazy"
                    draggable="false"
                  />
                  {isFavorite && (
                    <span
                      className="song-favorite-badge"
                      aria-label="Música nos favoritos"
                    >
                      <MdFavorite />
                    </span>
                  )}
                </div>
                <div className="song-text">
                  <span className={`song-title${isActive ? " song-title--active" : ""}`}>
                    {song.title || "Música sem título"}
                  </span>
                  <span className="song-artist">{song.artist || "Artista desconhecido"}</span>
                </div>
              </div>

              {/* Album */}
              <span className="song-col-album" role="cell">
                {song.album || "Álbum desconhecido"}
              </span>

{/* Duration */}
<span className="song-col-dur" role="cell">
  {song.duration || "--:--"}
</span>

{/* Options */}
<div
  className="song-col-options"
  role="cell"
  onClick={(event) => event.stopPropagation()}
>
  <SongOptionsMenu
    song={song}
    playlistId={playlistId}
    onRemoveFromPlaylist={onSongRemoved}
    isFavoriteContext={isFavoriteContext}
    isFavorite={isFavorite}
    onFavoriteRemoved={handleFavoriteRemoved}
    onFavoriteChanged={handleFavoriteChanged}
    allowAddToPlaylist={shouldAllowSongPlaylistActions}
  />
</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SongList;
