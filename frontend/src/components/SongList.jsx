import { useEffect, useMemo, useState } from "react";
import { MdFavorite, MdMusicNote } from "react-icons/md";
import { usePlayer } from "../contexts/PlayerContext";
import { FAVORITE_MUSIC_CHANGED_EVENT, musicService } from "../services/musicService";
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
  allowRemoveFromPlaylist = Boolean(onSongRemoved),
}) {
  const { currentTrack, playTrack, togglePlay } = usePlayer();
  const [favoriteSongIds, setFavoriteSongIds] = useState(() => new Set());
  const normalizedSongs = useMemo(
    () => (songs || []).map(normalizeMusic).filter(Boolean),
    [songs],
  );

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

  useEffect(() => {
    const handleFavoriteChanged = (event) => {
      const eventSongId = event.detail?.musicId;
      if (!eventSongId) return;

      setFavoriteSongIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (event.detail?.isFavorite) {
          nextIds.add(String(eventSongId));
        } else {
          nextIds.delete(String(eventSongId));
        }

        return nextIds;
      });
    };

    window.addEventListener(FAVORITE_MUSIC_CHANGED_EVENT, handleFavoriteChanged);
    return () => {
      window.removeEventListener(FAVORITE_MUSIC_CHANGED_EVENT, handleFavoriteChanged);
    };
  }, []);

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

  const handlePlaySong = (song, isActive) => {
    if (isActive) {
      togglePlay();
      return;
    }

    recordListeningSignal(song);
    playTrack(song, normalizedSongs);
  };

  return (
    <section className="song-list" aria-label={title}>
      <h2 className="song-list-title">{title}</h2>

      <div className="song-list-table" role="table" aria-label="Lista de músicas">
        {/* Table header */}
<div className="song-list-header" role="row">
  <span className="song-col-num" role="columnheader">#</span>
  <span className="song-col-info" role="columnheader">TÍTULO</span>
  <span className="song-col-album" role="columnheader">GÊNEROS</span>
  <span className="song-col-dur" role="columnheader">⏱</span>
  <span className="song-col-options" role="columnheader"></span>
</div>

        {/* Rows */}
        {normalizedSongs.map((song, index) => {
          const songId = getSongId(song);
          const isActive = Boolean(songId && String(currentTrack?.id ?? '') === songId);
          const isFavorite = isFavoriteContext || favoriteSongIds.has(songId) || Boolean(song.isFavorite);

          return (
            <div
              key={song.id || `${song.title}-${index}`}
              className={`song-row${isActive ? " song-row--active" : ""}${isFavorite ? " song-row--favorite" : ""}`}
              role="row"
              tabIndex={0}
              onClick={() => {
                handlePlaySong(song, isActive);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handlePlaySong(song, isActive);
                }
              }}
            >
              {/* # / play icon */}
              <span className="song-col-num" role="cell">
                {isActive ? (
                  <span className="song-sound-wave" aria-label="Música selecionada">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
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
                  {song.coverUrl ? (
                    <img
                      className="song-cover"
                      src={song.coverUrl}
                      alt={`Capa de ${song.title || "música"}`}
                      loading="lazy"
                      draggable="false"
                    />
                  ) : (
                    <span className="song-cover song-cover-placeholder" aria-hidden="true">
                      <MdMusicNote />
                    </span>
                  )}
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
                    {song.title || "Título não informado"}
                  </span>
                  <span className="song-artist">{song.artist || "Artista não informado"}</span>
                </div>
              </div>

              {/* Album */}
              <span className="song-col-album" role="cell">
                {song.genre || song.genero || song.album || "Gênero não informado"}
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
    allowAddToPlaylist={allowAddToPlaylist}
    allowRemoveFromPlaylist={allowRemoveFromPlaylist}
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
