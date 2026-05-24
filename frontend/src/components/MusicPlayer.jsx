import { useEffect, useRef, useState } from "react";
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
import { FiChevronDown, FiList, FiMaximize2, FiRepeat } from "react-icons/fi";
import { usePlayer } from "../contexts/PlayerContext";
import { musicService } from "../services/musicService";
import "./MusicPlayer.css";

function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function MusicPlayer() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedClosing, setIsExpandedClosing] = useState(false);
  const [dragStartY, setDragStartY] = useState(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(34);
  const [volume, setVolume] = useState(72);
  const compactDragActiveRef = useRef(false);
  const expandedDragActiveRef = useRef(false);
  const suppressCompactClickRef = useRef(false);
  const dragStartYRef = useRef(null);
  const dragOffsetYRef = useRef(0);
  const audioRef = useRef(null);


  const { currentTrack, isPlaying, togglePlay, playNext, playPrevious } = usePlayer();
  const [audioSrc, setAudioSrc] = useState(null);
  const [actualDuration, setActualDuration] = useState(0);

  // When currentTrack changes, fetch its details to get the audio URL
  useEffect(() => {
    let isMounted = true;
    if (currentTrack?.id) {
      // Temporary fallback cover while loading
      setAudioSrc(null); 
      setActualDuration(0);
      setProgress(0);

      musicService.getMusicById(currentTrack.id)
        .then((detail) => {
          if (!isMounted) return;
          // Use previewUrl or fallbacks from detail. We'll set the src.
          let src = detail.previewUrl || detail.url || detail.audioUrl || detail.fileUrl;
          if (src) {
            // Se o src for um caminho relativo, anexa a URL da API
            if (src.startsWith('/')) {
              const envUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') || 'https://deefy.olua.me';
              src = `${envUrl}${src}`;
            }
            setAudioSrc(src);
            setActualDuration(detail.durationSeconds || detail.durationInSeconds || 30);
            setIsFavorite(!!detail.isFavorite);
          } else {
            console.warn("No audio URL found for this track.", detail);
          }
        })
        .catch(err => console.error("Error fetching track details", err));
    }
    return () => { isMounted = false; };
  }, [currentTrack]);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Sync play/pause state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
           console.warn("Autoplay was prevented by browser.");
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioSrc]);

  // Handle time update
  const handleTimeUpdate = () => {
    if (!audioRef.current || actualDuration === 0) return;
    const current = audioRef.current.currentTime;
    const pct = (current / actualDuration) * 100;
    setProgress(pct);
  };

  // Handle audio ended
  const handleEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      playNext();
    }
  };

  const handleSeek = (event) => {
    const newPct = Number(event.target.value);
    setProgress(newPct);
    if (audioRef.current && actualDuration > 0) {
      audioRef.current.currentTime = (newPct / 100) * actualDuration;
    }
  };

  const trackTitle = currentTrack?.title ?? "Nenhuma música selecionada";
  const trackArtist = currentTrack?.artist ?? "";
  const trackAlbum = currentTrack?.album ?? "";
  const trackCover = currentTrack?.coverUrl ?? null;
  const trackDurationSeconds = actualDuration;

  const isMuted = volume === 0;
  const currentSeconds = (progress / 100) * trackDurationSeconds;
  const currentTime = formatTime(currentSeconds);
  const duration = formatTime(trackDurationSeconds);

  const progressStyle = {
    "--deefy-player-fill": `${progress}%`,
  };

  const volumeStyle = {
    "--deefy-player-fill": `${volume}%`,
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

  const togglePlaying = () => {
    if (currentTrack) {
      togglePlay();
    }
  };
  const toggleFavorite = async () => {
    if (!currentTrack?.id) return;
    try {
      await musicService.toggleFavorite(currentTrack.id, isFavorite);
      setIsFavorite((current) => !current);
    } catch (err) {
      console.error(err);
    }
  };
  const toggleShuffle = () => setIsShuffle((current) => !current);
  const toggleRepeat = () => setIsRepeat((current) => !current);
  const toggleMute = () => setVolume(isMuted ? 70 : 0);
  const openExpandedPlayer = () => {
    resetDrag();
    setIsExpandedClosing(false);
    setIsExpanded(true);
  };
  const closeExpandedPlayer = () => {
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

    if (!compactDragActiveRef.current || startY === null) {
      return;
    }

    const nextOffset = event.touches[0].clientY - startY;

    if (Math.abs(nextOffset) > 8) {
      suppressCompactClickRef.current = true;
      setIsDragging(true);
    }

    dragOffsetYRef.current = nextOffset;
    setDragOffsetY(nextOffset);
  };

  const handleCompactTouchEnd = () => {
    if (!compactDragActiveRef.current) {
      return;
    }

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

    if (!expandedDragActiveRef.current || startY === null) {
      return;
    }

    const nextOffset = Math.max(event.touches[0].clientY - startY, 0);

    if (nextOffset > 8) {
      setIsDragging(true);
    }

    dragOffsetYRef.current = nextOffset;
    setDragOffsetY(nextOffset);
  };

  const handleExpandedTouchEnd = () => {
    if (!expandedDragActiveRef.current) {
      return;
    }

    if (dragOffsetYRef.current > 90) {
      closeExpandedPlayer();
      return;
    }

    resetDrag();
  };

  useEffect(() => {
    if (!isExpanded) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
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
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpandedClosing) {
      return undefined;
    }

    const closeTimer = window.setTimeout(() => {
      setIsExpanded(false);
      setIsExpandedClosing(false);
    }, 190);

    return () => {
      window.clearTimeout(closeTimer);
    };
  }, [isExpandedClosing]);

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
          src={audioSrc || undefined}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={(e) => console.error("Erro ao carregar o áudio na tag HTML:", e.target.error)}
          preload="auto"
        />

        <div className="deefy-player-track">
          <img
            className="deefy-player-cover"
            src={trackCover || undefined}
            alt={trackCover ? `Capa de ${trackTitle}` : "Sem capa"}
            draggable="false"
            style={trackCover ? undefined : { opacity: 0.3 }}
          />

          <div className="deefy-player-copy">
            <p className="deefy-player-title">{trackTitle}</p>
            <p className="deefy-player-meta">
              {trackArtist}{trackAlbum ? ` - ${trackAlbum}` : ""}
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
              aria-label="Aleatório"
              aria-pressed={isShuffle}
            >
              <FaRandom />
            </button>

            <button
              type="button"
              className="deefy-player-control-action deefy-player-skip-action"
              onClick={(e) => { stopCompactControlClick(e); playPrevious(); }}
              aria-label="Música anterior"
            >
              <FaStepBackward />
            </button>

            <button
              type="button"
              className={`deefy-player-main-action ${
                isPlaying ? "is-playing" : ""
              }`}
              onClick={(event) => {
                stopCompactControlClick(event);
                togglePlaying();
              }}
              aria-label="Reproduzir/Pausar"
              aria-pressed={isPlaying}
            >
              <span className="deefy-player-main-icon">
                {isPlaying ? <FaPause /> : <FaPlay />}
              </span>
            </button>

            <button
              type="button"
              className="deefy-player-control-action deefy-player-skip-action"
              onClick={(e) => { stopCompactControlClick(e); playNext(); }}
              aria-label="Próxima música"
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
                toggleRepeat();
              }}
              aria-label="Repetir"
              aria-pressed={isRepeat}
            >
              <FiRepeat />
            </button>
          </div>

          <div className="deefy-player-timeline">
            <span className="deefy-player-time">{currentTime}</span>
              <input
                className="deefy-player-range"
                type="range"
                min="0"
                max="100"
                value={progress}
                onClick={stopCompactControlClick}
                onChange={handleSeek}
                style={progressStyle}
                aria-label="Progresso da musica"
              />
            <span className="deefy-player-time">{duration}</span>
          </div>
        </div>

        <div className="deefy-player-actions">
          <button
            type="button"
            className="deefy-player-control-action"
            onClick={stopCompactControlClick}
            aria-label="Abrir fila de musicas"
          >
            <FiList />
          </button>

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
            value={volume}
            onClick={stopCompactControlClick}
            onChange={(event) => setVolume(Number(event.target.value))}
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
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onTouchStart={(event) => {
                event.stopPropagation();
              }}
              onTouchEnd={(event) => {
                event.preventDefault();
                event.stopPropagation();
                closeExpandedPlayer();
              }}
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
              <img
                className="deefy-player-expanded-cover"
                src={trackCover || undefined}
                alt={trackCover ? `Capa de ${trackTitle}` : "Sem capa"}
                draggable="false"
                style={trackCover ? undefined : { opacity: 0.3 }}
              />
            </div>

            <div className="deefy-player-expanded-content">
              <div className="deefy-player-expanded-track-row">
                <div className="deefy-player-expanded-copy">
                  <p className="deefy-player-expanded-title">{trackTitle}</p>
                  <p className="deefy-player-expanded-meta">
                    {trackArtist}{trackAlbum ? ` - ${trackAlbum}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  className={`deefy-player-favorite-action deefy-player-expanded-favorite ${
                    isFavorite ? "is-favorite" : ""
                  }`}
                  onClick={toggleFavorite}
                  aria-label="Favoritar"
                  aria-pressed={isFavorite}
                >
                  <span className="deefy-player-favorite-icon">
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                  </span>
                </button>
              </div>

              <div className="deefy-player-expanded-timeline">
                <input
                  className="deefy-player-range deefy-player-expanded-range"
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  style={progressStyle}
                  aria-label="Progresso da musica"
                />
                <div className="deefy-player-expanded-time-row">
                  <span className="deefy-player-time">{currentTime}</span>
                  <span className="deefy-player-time">{duration}</span>
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
                  aria-label="Aleatório"
                  aria-pressed={isShuffle}
                >
                  <FaRandom />
                </button>

                <button
                  type="button"
                  className="deefy-player-control-action deefy-player-expanded-control deefy-player-expanded-skip"
                  onClick={playPrevious}
                  aria-label="Música anterior"
                >
                  <FaStepBackward />
                </button>

                <button
                  type="button"
                  className={`deefy-player-main-action deefy-player-expanded-main ${
                    isPlaying ? "is-playing" : ""
                  }`}
                  onClick={togglePlaying}
                  aria-label="Reproduzir/Pausar"
                  aria-pressed={isPlaying}
                >
                  <span className="deefy-player-main-icon">
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </span>
                </button>

                <button
                  type="button"
                  className="deefy-player-control-action deefy-player-expanded-control deefy-player-expanded-skip"
                  onClick={playNext}
                  aria-label="Próxima música"
                >
                  <FaStepForward />
                </button>

                <button
                  type="button"
                  className={`deefy-player-control-action deefy-player-expanded-control ${
                    isRepeat ? "is-active" : ""
                  }`}
                  onClick={toggleRepeat}
                  aria-label="Repetir"
                  aria-pressed={isRepeat}
                >
                  <FiRepeat />
                </button>
              </div>

              <div className="deefy-player-expanded-volume">
                <button
                  type="button"
                  className={`deefy-player-control-action ${
                    isMuted ? "is-active" : ""
                  }`}
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
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
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
