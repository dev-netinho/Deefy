import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaHeart,
  FaPause,
  FaPlay,
  FaRandom,
  FaRegHeart,
  FaStepBackward,
  FaStepForward,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { FiChevronDown, FiMaximize2, FiRepeat } from "react-icons/fi";
import { MdPlaylistAdd } from "react-icons/md";
import { toast } from "sonner";
import { usePlayer } from "../contexts/PlayerContext";
import { FAVORITE_MUSIC_CHANGED_EVENT, musicService } from "../services/musicService";
import "./MusicPlayer.css";

const EMPTY_TRACK = {
  id: null,
  title: "Nenhuma musica selecionada",
  artist: "",
  album: "",
  coverUrl: "",
  audioUrl: "",
  durationSeconds: 0,
  isFavorite: false,
};

function parseDuration(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;

  const parts = value.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return 0;

  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];

  return 0;
}

function resolveMediaUrl(value) {
  if (!value || typeof value !== "string") return "";
  if (/^(https?:|blob:|data:)/i.test(value)) return value;

  if (value.startsWith("/")) {
    const baseUrl = (import.meta.env.VITE_API_URL || "https://deefy.olua.me")
      .replace(/\/api\/v1\/?$/, "")
      .replace(/\/$/, "");

    return `${baseUrl}${value}`;
  }

  return value;
}

function sameTrack(left, right) {
  if (!left || !right) return false;
  return String(left.id) === String(right.id);
}

function normalizeTrack(track) {
  if (!track) return EMPTY_TRACK;

  const artist =
    track.artistName ||
    track.artist?.name ||
    track.artist?.nome ||
    track.artista?.nome ||
    track.artista?.name ||
    track.artist ||
    track.artista ||
    "";

  const album =
    track.albumName ||
    track.album?.title ||
    track.album?.name ||
    track.album?.nome ||
    track.album ||
    "";

  const audioUrl = resolveMediaUrl(
    track.audioUrl ||
      track.arquivoUrl ||
      track.arquivourl ||
      track.url ||
      track.fileUrl ||
      track.src ||
      track.streamUrl ||
      track.previewUrl ||
      ""
  );

  const coverUrl = resolveMediaUrl(
    track.coverUrl ||
      track.capaUrl ||
      track.imageUrl ||
      track.thumbnailUrl ||
      track.cover ||
      track.capa ||
      track.albumCover ||
      ""
  );

  return {
    id: track.id ?? track.uuid ?? track.slug ?? audioUrl ?? null,
    title: track.title || track.name || track.nome || "Musica sem titulo",
    artist: typeof artist === "string" ? artist : "",
    album: typeof album === "string" ? album : "",
    coverUrl,
    audioUrl,
    isFavorite: Boolean(track.isFavorite || track.favorite),
    durationSeconds:
      track.durationSeconds ||
      track.duracaoSegundos ||
      track.durationInSeconds ||
      track.lengthSeconds ||
      parseDuration(track.duration || track.duracao),
  };
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function MusicPlayer({ playlists = [], onAddToPlaylist }) {
  const audioRef = useRef(null);
  const compactDragActiveRef = useRef(false);
  const expandedDragActiveRef = useRef(false);
  const suppressCompactClickRef = useRef(false);
  const dragStartYRef = useRef(null);
  const dragOffsetYRef = useRef(0);
  const playlistMenuRef = useRef(null);
  const contextIsPlayingRef = useRef(false);
  const shouldResumePlaybackRef = useRef(false);
  const lastPlaybackCommandIdRef = useRef(null);
  const favoriteStatusRequestRef = useRef(0);

  const {
    currentTrack: contextTrack,
    isPlaying: contextIsPlaying,
    isShuffle,
    queue,
    playbackCommand,
    playNext,
    playPrevious,
    setPlaying: setContextPlaying,
    setShuffleMode,
  } = usePlayer();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(72);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteBusy, setIsFavoriteBusy] = useState(false);
  const [playlistMenuContext, setPlaylistMenuContext] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedClosing, setIsExpandedClosing] = useState(false);
  const [dragStartY, setDragStartY] = useState(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const tracks = useMemo(() => {
    if (Array.isArray(queue) && queue.length) return queue;
    return contextTrack ? [contextTrack] : [];
  }, [queue, contextTrack]);

  const currentTrackIndex = contextTrack
    ? tracks.findIndex((track) => sameTrack(track, contextTrack))
    : -1;
  const activeTrackIndex = currentTrackIndex >= 0 ? currentTrackIndex : 0;
  const rawTrack = contextTrack || tracks[activeTrackIndex] || null;
  const hasSelectedTrack = Boolean(rawTrack);
  const currentTrack = useMemo(() => normalizeTrack(rawTrack), [rawTrack]);
  const hasAudioUrl = Boolean(currentTrack.audioUrl);
  const hasPrevious = tracks.length > 1 && activeTrackIndex > 0;
  const hasNext = tracks.length > 1 && activeTrackIndex < tracks.length - 1;
  const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const progressStyle = {
    "--deefy-player-fill": `${progressPercent}%`,
  };

  const volumeStyle = {
    "--deefy-player-fill": `${isMuted ? 0 : volume}%`,
  };

  const expandedDragStyle = {
    "--deefy-player-drag-offset": `${Math.max(dragOffsetY, 0)}px`,
  };

  const isMobileViewport = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 860px)").matches;

  const isInteractiveTarget = (target) =>
    target?.closest?.("button, input, select, textarea, a");

  const resetDrag = () => {
    dragStartYRef.current = null;
    dragOffsetYRef.current = 0;
    setDragStartY(null);
    setDragOffsetY(0);
    setIsDragging(false);
    compactDragActiveRef.current = false;
    expandedDragActiveRef.current = false;
  };

  const syncContextPlaying = useCallback((nextPlaying) => {
    if (contextIsPlayingRef.current !== nextPlaying) {
      setContextPlaying(nextPlaying);
      contextIsPlayingRef.current = nextPlaying;
    }
  }, [setContextPlaying]);

  useEffect(() => {
    contextIsPlayingRef.current = contextIsPlaying;
  }, [contextIsPlaying]);

  useEffect(() => {
    setIsFavorite(currentTrack.isFavorite);
  }, [currentTrack.id, currentTrack.isFavorite]);

  useEffect(() => {
    if (!currentTrack.id) {
      setIsFavorite(false);
      return undefined;
    }

    const requestId = favoriteStatusRequestRef.current + 1;
    favoriteStatusRequestRef.current = requestId;

    musicService.getFavoriteStatus(currentTrack.id)
      .then((isCurrentFavorite) => {
        if (favoriteStatusRequestRef.current === requestId) {
          setIsFavorite(isCurrentFavorite);
        }
      })
      .catch((error) => {
        console.warn("Deefy player: nao foi possivel consultar favorito.", error);
      });

    return undefined;
  }, [currentTrack.id]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleFavoriteChanged = (event) => {
      if (!currentTrack.id || String(event.detail?.musicId) !== String(currentTrack.id)) {
        return;
      }

      setIsFavorite(Boolean(event.detail?.isFavorite));
    };

    window.addEventListener(FAVORITE_MUSIC_CHANGED_EVENT, handleFavoriteChanged);
    return () => window.removeEventListener(FAVORITE_MUSIC_CHANGED_EVENT, handleFavoriteChanged);
  }, [currentTrack.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume / 100;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    shouldResumePlaybackRef.current = isPlaying || contextIsPlaying;
  }, [isPlaying, contextIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const resetTimer = window.setTimeout(() => {
      setCurrentTime(0);
      setDuration(currentTrack.durationSeconds || 0);
    }, 0);

    audio.pause();
    audio.load();

    if (!hasAudioUrl) {
      window.setTimeout(() => setIsPlaying(false), 0);
      if (contextIsPlayingRef.current) syncContextPlaying(false);
      if (currentTrack.id) {
        console.info("Deefy player: faixa sem URL de audio. Aguardando audioUrl/url/fileUrl/src do backend.");
      }
      return () => window.clearTimeout(resetTimer);
    }

    if (shouldResumePlaybackRef.current) {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          syncContextPlaying(true);
        })
        .catch((error) => {
          setIsPlaying(false);
          syncContextPlaying(false);
          console.warn("Deefy player: nao foi possivel iniciar o audio.", error);
        });
    }

    return () => window.clearTimeout(resetTimer);
  }, [
    currentTrack.audioUrl,
    currentTrack.durationSeconds,
    currentTrack.id,
    hasAudioUrl,
    syncContextPlaying,
  ]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime || 0);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setDuration(Number.isFinite(audio.duration) ? audio.duration : currentTrack.durationSeconds || 0);
  };

  const togglePlaying = useCallback(() => {
    const audio = audioRef.current;

    if (!audio || !hasAudioUrl) {
      setIsPlaying(false);
      syncContextPlaying(false);
      console.info("Deefy player: nenhuma URL de audio disponivel para tocar esta faixa.");
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      syncContextPlaying(false);
      return;
    }

    audio.play()
      .then(() => {
        setIsPlaying(true);
        syncContextPlaying(true);
      })
      .catch((error) => {
        setIsPlaying(false);
        syncContextPlaying(false);
        console.warn("Deefy player: play bloqueado pelo navegador ou URL invalida.", error);
      });
  }, [hasAudioUrl, isPlaying, syncContextPlaying]);

  useEffect(() => {
    if (!playbackCommand || playbackCommand.id === lastPlaybackCommandIdRef.current) {
      return;
    }

    lastPlaybackCommandIdRef.current = playbackCommand.id;

    if (playbackCommand.type === "toggle") {
      togglePlaying();
    }
  }, [playbackCommand, togglePlaying]);

  const handleSeek = (event) => {
    const nextTime = Number(event.target.value);
    const audio = audioRef.current;

    setCurrentTime(nextTime);

    if (audio && Number.isFinite(nextTime)) {
      audio.currentTime = nextTime;
    }
  };

  const handleVolumeChange = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted((current) => !current);
  };

  const toggleShuffle = () => {
    setShuffleMode((current) => !current);
  };

  const handlePrevious = () => {
    if (!hasPrevious) return;
    shouldResumePlaybackRef.current = true;
    playPrevious();
  };

  const handleNext = () => {
    if (!hasNext) return;
    shouldResumePlaybackRef.current = true;
    playNext();
  };

  const handleEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        setIsPlaying(false);
        syncContextPlaying(false);
        console.warn("Deefy player: nao foi possivel repetir o audio.", error);
      });
      return;
    }

    if (hasNext) {
      shouldResumePlaybackRef.current = true;
      handleNext();
      return;
    }

    setIsPlaying(false);
    syncContextPlaying(false);
  };

  const toggleFavorite = async () => {
    if (!currentTrack.id) return;

    const nextFavorite = !isFavorite;
    favoriteStatusRequestRef.current += 1;
    setIsFavoriteBusy(true);
    setIsFavorite(nextFavorite);

    try {
      const savedFavoriteState = await musicService.toggleFavorite(currentTrack.id, isFavorite);
      setIsFavorite(savedFavoriteState);
    } catch (error) {
      setIsFavorite(!nextFavorite);
      console.warn("Deefy player: nao foi possivel atualizar favorito.", error);
    } finally {
      setIsFavoriteBusy(false);
    }
  };

  const togglePlaylistMenu = (context) => {
    setPlaylistMenuContext((current) => (current === context ? null : context));
  };

  const handleAddToPlaylist = async (playlist) => {
    if (!currentTrack.id || !playlist?.id || typeof onAddToPlaylist !== "function") {
      console.info("Deefy player: aguardando integracao real de playlists para adicionar a faixa.");
      setPlaylistMenuContext(null);
      return;
    }

    try {
      await onAddToPlaylist(playlist, currentTrack);
      toast.success(`Musica adicionada a playlist ${playlist.name || playlist.title}`);
    } catch (error) {
      console.warn("Deefy player: nao foi possivel adicionar a playlist.", error);
    } finally {
      setPlaylistMenuContext(null);
    }
  };

  const openExpandedPlayer = () => {
    setPlaylistMenuContext(null);
    resetDrag();
    setIsExpandedClosing(false);
    setIsExpanded(true);
  };

  const closeExpandedPlayer = () => {
    setPlaylistMenuContext(null);
    resetDrag();
    setIsExpandedClosing(false);
    setIsExpanded(false);
  };

  const stopCompactControlClick = (event) => {
    event.stopPropagation();
  };

  const handleCompactPlayerClick = (event) => {
    const isInteractiveElement = isInteractiveTarget(event.target);

    if (suppressCompactClickRef.current) {
      suppressCompactClickRef.current = false;
      return;
    }

    if (!isInteractiveElement && isMobileViewport()) {
      openExpandedPlayer();
    }
  };

  const handleCompactTouchStart = (event) => {
    if (!isMobileViewport() || isInteractiveTarget(event.target)) {
      compactDragActiveRef.current = false;
      return;
    }

    compactDragActiveRef.current = true;
    suppressCompactClickRef.current = false;
    dragStartYRef.current = event.touches[0].clientY;
    dragOffsetYRef.current = 0;
    setDragStartY(event.touches[0].clientY);
    setDragOffsetY(0);
    setIsDragging(false);
  };

  const handleCompactTouchMove = (event) => {
    const startY = dragStartYRef.current ?? dragStartY;
    if (!compactDragActiveRef.current || startY === null) return;

    const nextOffset = event.touches[0].clientY - startY;

    if (Math.abs(nextOffset) > 8) {
      suppressCompactClickRef.current = true;
      setIsDragging(true);
    }

    dragOffsetYRef.current = nextOffset;
    setDragOffsetY(nextOffset);
  };

  const handleCompactTouchEnd = () => {
    if (!compactDragActiveRef.current) return;

    if (dragOffsetYRef.current < -70) {
      openExpandedPlayer();
      suppressCompactClickRef.current = true;
      return;
    }

    resetDrag();
  };

  const handleExpandedTouchStart = (event) => {
    if (!isMobileViewport() || isInteractiveTarget(event.target)) {
      expandedDragActiveRef.current = false;
      return;
    }

    expandedDragActiveRef.current = true;
    dragStartYRef.current = event.touches[0].clientY;
    dragOffsetYRef.current = 0;
    setDragStartY(event.touches[0].clientY);
    setDragOffsetY(0);
    setIsDragging(false);
  };

  const handleExpandedTouchMove = (event) => {
    const startY = dragStartYRef.current ?? dragStartY;
    if (!expandedDragActiveRef.current || startY === null) return;

    const nextOffset = Math.max(event.touches[0].clientY - startY, 0);

    if (nextOffset > 8) setIsDragging(true);

    dragOffsetYRef.current = nextOffset;
    setDragOffsetY(nextOffset);
  };

  const handleExpandedTouchEnd = () => {
    if (!expandedDragActiveRef.current) return;

    if (dragOffsetYRef.current > 90) {
      closeExpandedPlayer();
      return;
    }

    resetDrag();
  };

  const handleExpandedBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeExpandedPlayer();
    }
  };

  useEffect(() => {
    if (!playlistMenuContext) return undefined;

    const handlePointerDown = (event) => {
      if (playlistMenuRef.current?.contains(event.target)) return;
      setPlaylistMenuContext(null);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setPlaylistMenuContext(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [playlistMenuContext]);

  useEffect(() => {
    if (!isExpanded) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !playlistMenuContext) {
        dragStartYRef.current = null;
        dragOffsetYRef.current = 0;
        compactDragActiveRef.current = false;
        expandedDragActiveRef.current = false;
        setDragStartY(null);
        setDragOffsetY(0);
        setIsDragging(false);
        setIsExpandedClosing(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded, playlistMenuContext]);

  useEffect(() => {
    if (!isExpandedClosing) return undefined;

    const closeTimer = window.setTimeout(() => {
      setIsExpanded(false);
      setIsExpandedClosing(false);
    }, 190);

    return () => window.clearTimeout(closeTimer);
  }, [isExpandedClosing]);

  const handleCoverExpand = (event) => {
    event.stopPropagation();
    openExpandedPlayer();
  };

  const handleCoverKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    event.stopPropagation();
    openExpandedPlayer();
  };

  const renderCover = (className, canExpand = false) => {
    const coverClassName = canExpand
      ? `${className} deefy-player-cover-expand-trigger`
      : className;
    const expandProps = canExpand
      ? {
          role: "button",
          tabIndex: 0,
          onClick: handleCoverExpand,
          onKeyDown: handleCoverKeyDown,
          "aria-label": "Expandir player pela capa",
        }
      : {};

    if (!currentTrack.coverUrl) {
      return (
        <div
          className={`${coverClassName} deefy-player-cover-placeholder`}
          aria-hidden={canExpand ? undefined : "true"}
          {...expandProps}
        />
      );
    }

    return (
      <img
        className={coverClassName}
        src={currentTrack.coverUrl}
        alt={`Capa de ${currentTrack.title}`}
        draggable="false"
        {...expandProps}
      />
    );
  };

  const renderPlaylistMenu = (context, extraClassName = "") => {
    const isOpen = playlistMenuContext === context;
    const hasPlaylists = Array.isArray(playlists) && playlists.length > 0;

    return (
      <div
        className={`deefy-player-playlist-wrap ${extraClassName}`}
        ref={isOpen ? playlistMenuRef : null}
      >
        <button
          type="button"
          className={`deefy-player-control-action deefy-player-playlist-action ${
            isOpen ? "is-active" : ""
          }`}
          onClick={(event) => {
            stopCompactControlClick(event);
            togglePlaylistMenu(context);
          }}
          aria-label="Adicionar a playlist"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <MdPlaylistAdd />
        </button>

        {isOpen && (
          <div
            className="deefy-player-playlist-menu"
            role="menu"
            aria-label="Playlists"
          >
            <p className="deefy-player-playlist-menu-title">Adicionar em</p>
            <div className="deefy-player-playlist-menu-list">
              {hasPlaylists ? (
                playlists.map((playlist) => (
                  <button
                    key={playlist.id || playlist.name || playlist.title}
                    type="button"
                    className="deefy-player-playlist-menu-item"
                    role="menuitem"
                    onClick={(event) => {
                      stopCompactControlClick(event);
                      handleAddToPlaylist(playlist);
                    }}
                  >
                    <span className="deefy-player-playlist-menu-icon">
                      <MdPlaylistAdd />
                    </span>
                    <span className="deefy-player-playlist-menu-name">
                      {playlist.name || playlist.title || "Playlist"}
                    </span>
                  </button>
                ))
              ) : (
                <p className="deefy-player-playlist-empty">
                  Nenhuma playlist disponivel
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!hasSelectedTrack) {
    return null;
  }

  return (
    <>
      <aside
        className="deefy-player-shell"
        aria-label="Player musical"
        onClick={handleCompactPlayerClick}
        onTouchStart={handleCompactTouchStart}
        onTouchMove={handleCompactTouchMove}
        onTouchEnd={handleCompactTouchEnd}
        onTouchCancel={resetDrag}
      >
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl || undefined}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(event) => {
            setIsPlaying(false);
            syncContextPlaying(false);
            console.warn("Deefy player: erro ao carregar audio.", event.currentTarget.error);
          }}
        />

        <div className="deefy-player-track">
          {renderCover("deefy-player-cover", true)}

          <div className="deefy-player-copy">
            <p className="deefy-player-title" title={currentTrack.title}>
              {currentTrack.title}
            </p>
            <p className="deefy-player-meta">
              {currentTrack.artist}
              {currentTrack.album ? ` - ${currentTrack.album}` : ""}
            </p>
          </div>

          <button
            type="button"
            className={`deefy-player-favorite-action ${
              isFavorite ? "is-favorite" : ""
            }`}
            onClick={(event) => {
              stopCompactControlClick(event);
              toggleFavorite();
            }}
            disabled={!currentTrack.id || isFavoriteBusy}
            aria-label="Favoritar"
            aria-pressed={isFavorite}
          >
            <span className="deefy-player-favorite-icon">
              {isFavorite ? <FaHeart /> : <FaRegHeart />}
            </span>
          </button>
        </div>

        <div className="deefy-player-center">
          <div className="deefy-player-controls" aria-label="Controles de reproducao">
            <button
              type="button"
              className={`deefy-player-control-action ${
                isShuffle ? "is-active" : ""
              }`}
              onClick={(event) => {
                stopCompactControlClick(event);
                toggleShuffle();
              }}
              aria-label="Aleatorio"
              aria-pressed={isShuffle}
            >
              <FaRandom />
            </button>

            <button
              type="button"
              className="deefy-player-control-action deefy-player-skip-action"
              onClick={(event) => {
                stopCompactControlClick(event);
                handlePrevious();
              }}
              disabled={!hasPrevious}
              aria-label="Musica anterior"
            >
              <FaStepBackward />
            </button>

            <button
              type="button"
              className={`deefy-player-main-action ${isPlaying ? "is-playing" : ""}`}
              onClick={(event) => {
                stopCompactControlClick(event);
                togglePlaying();
              }}
              disabled={!hasAudioUrl}
              aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              aria-pressed={isPlaying}
            >
              <span className="deefy-player-main-icon">
                {isPlaying ? <FaPause /> : <FaPlay />}
              </span>
            </button>

            {renderPlaylistMenu("mobile", "deefy-player-mobile-playlist-wrap")}

            <button
              type="button"
              className="deefy-player-control-action deefy-player-skip-action"
              onClick={(event) => {
                stopCompactControlClick(event);
                handleNext();
              }}
              disabled={!hasNext}
              aria-label="Proxima musica"
            >
              <FaStepForward />
            </button>

            <button
              type="button"
              className={`deefy-player-control-action ${
                isRepeat ? "is-active" : ""
              }`}
              onClick={(event) => {
                stopCompactControlClick(event);
                setIsRepeat((current) => !current);
              }}
              aria-label="Repetir"
              aria-pressed={isRepeat}
            >
              <FiRepeat />
            </button>
          </div>

          <div className="deefy-player-timeline">
            <span className="deefy-player-time">{formatTime(currentTime)}</span>
            <input
              className="deefy-player-range"
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onClick={stopCompactControlClick}
              onChange={handleSeek}
              disabled={!hasAudioUrl || duration <= 0}
              style={progressStyle}
              aria-label="Progresso da musica"
            />
            <span className="deefy-player-time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="deefy-player-actions">
          {renderPlaylistMenu("desktop")}

          <button
            type="button"
            className={`deefy-player-control-action ${isMuted ? "is-active" : ""}`}
            onClick={(event) => {
              stopCompactControlClick(event);
              toggleMute();
            }}
            aria-label={isMuted ? "Ativar volume" : "Silenciar"}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>

          <input
            className="deefy-player-range deefy-player-volume"
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onClick={stopCompactControlClick}
            onChange={handleVolumeChange}
            style={volumeStyle}
            aria-label="Volume"
          />

          <button
            type="button"
            className="deefy-player-control-action"
            onClick={(event) => {
              stopCompactControlClick(event);
              openExpandedPlayer();
            }}
            aria-label="Expandir player"
          >
            <FiMaximize2 />
          </button>
        </div>
      </aside>

      {isExpanded && (
        <div
          className={`deefy-player-expanded ${
            isExpandedClosing ? "is-closing" : ""
          } ${isDragging ? "is-dragging" : ""}`}
          style={expandedDragStyle}
          onClick={handleExpandedBackdropClick}
          onTouchStart={handleExpandedTouchStart}
          onTouchMove={handleExpandedTouchMove}
          onTouchEnd={handleExpandedTouchEnd}
          onTouchCancel={resetDrag}
          role="dialog"
          aria-modal="true"
          aria-label="Player expandido"
        >
          <div className="deefy-player-expanded-panel">
            <div className="deefy-player-expanded-topbar">
              <div className="deefy-player-expanded-heading">
                <span className="deefy-player-expanded-kicker">Deefy</span>
                <span className="deefy-player-expanded-status">
                  {isPlaying ? "Reproduzindo agora" : "Player pausado"}
                </span>
              </div>

              <button
                type="button"
                className="deefy-player-expanded-close"
                onClick={(event) => {
                  event.stopPropagation();
                  closeExpandedPlayer();
                }}
                aria-label="Minimizar player"
              >
                <FiChevronDown />
              </button>
            </div>

            <div className="deefy-player-expanded-body">
              <div className="deefy-player-expanded-art-wrap">
                {renderCover("deefy-player-expanded-cover")}
              </div>

              <div className="deefy-player-expanded-content">
                <div className="deefy-player-expanded-track-row">
                  <div className="deefy-player-expanded-copy">
                    <p
                      className={`deefy-player-expanded-title ${
                        currentTrack.title.length > 30 ? "is-long" : ""
                      }`}
                      title={currentTrack.title}
                    >
                      <span>{currentTrack.title}</span>
                    </p>
                    <p className="deefy-player-expanded-meta">
                      {currentTrack.artist}
                      {currentTrack.album ? ` - ${currentTrack.album}` : ""}
                    </p>
                  </div>

                  <div className="deefy-player-expanded-track-actions">
                    <button
                      type="button"
                      className={`deefy-player-favorite-action deefy-player-expanded-favorite ${
                        isFavorite ? "is-favorite" : ""
                      }`}
                      onClick={toggleFavorite}
                      disabled={!currentTrack.id || isFavoriteBusy}
                      aria-label="Favoritar"
                      aria-pressed={isFavorite}
                    >
                      <span className="deefy-player-favorite-icon">
                        {isFavorite ? <FaHeart /> : <FaRegHeart />}
                      </span>
                    </button>

                    {renderPlaylistMenu(
                      "expanded",
                      "deefy-player-expanded-playlist-wrap"
                    )}
                  </div>
                </div>

                <div className="deefy-player-expanded-timeline">
                  <input
                    className="deefy-player-range deefy-player-expanded-range"
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={Math.min(currentTime, duration || 0)}
                    onChange={handleSeek}
                    disabled={!hasAudioUrl || duration <= 0}
                    style={progressStyle}
                    aria-label="Progresso da musica"
                  />
                  <div className="deefy-player-expanded-time-row">
                    <span className="deefy-player-time">{formatTime(currentTime)}</span>
                    <span className="deefy-player-time">{formatTime(duration)}</span>
                  </div>
                </div>

                <div
                  className="deefy-player-expanded-controls"
                  aria-label="Controles de reproducao"
                >
                  <button
                    type="button"
                    className={`deefy-player-control-action deefy-player-expanded-control ${
                      isShuffle ? "is-active" : ""
                    }`}
                    onClick={toggleShuffle}
                    aria-label="Aleatorio"
                    aria-pressed={isShuffle}
                  >
                    <FaRandom />
                  </button>

                  <button
                    type="button"
                    className="deefy-player-control-action deefy-player-expanded-control deefy-player-expanded-skip"
                    onClick={handlePrevious}
                    disabled={!hasPrevious}
                    aria-label="Musica anterior"
                  >
                    <FaStepBackward />
                  </button>

                  <button
                    type="button"
                    className={`deefy-player-main-action deefy-player-expanded-main ${
                      isPlaying ? "is-playing" : ""
                    }`}
                    onClick={togglePlaying}
                    disabled={!hasAudioUrl}
                    aria-label={isPlaying ? "Pausar" : "Reproduzir"}
                    aria-pressed={isPlaying}
                  >
                    <span className="deefy-player-main-icon">
                      {isPlaying ? <FaPause /> : <FaPlay />}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="deefy-player-control-action deefy-player-expanded-control deefy-player-expanded-skip"
                    onClick={handleNext}
                    disabled={!hasNext}
                    aria-label="Proxima musica"
                  >
                    <FaStepForward />
                  </button>

                  <button
                    type="button"
                    className={`deefy-player-control-action deefy-player-expanded-control ${
                      isRepeat ? "is-active" : ""
                    }`}
                    onClick={() => setIsRepeat((current) => !current)}
                    aria-label="Repetir"
                    aria-pressed={isRepeat}
                  >
                    <FiRepeat />
                  </button>
                </div>

                <div className="deefy-player-expanded-volume">
                  <button
                    type="button"
                    className={`deefy-player-control-action ${isMuted ? "is-active" : ""}`}
                    onClick={toggleMute}
                    aria-label={isMuted ? "Ativar volume" : "Silenciar"}
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>

                  <input
                    className="deefy-player-range"
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    style={volumeStyle}
                    aria-label="Volume"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MusicPlayer;
