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
import fallbackCover from "../assets/logo.svg";
import { usePlayer } from "../context/usePlayer";
import { showMusicInfo } from "../utils/musicToast";
import "./MusicPlayer.css";

function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function MusicPlayer() {
  const {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    progressPercent,
    effectiveVolume,
    isMuted,
    isShuffle,
    isRepeat,
    hasTrack,
    canPlay,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedClosing, setIsExpandedClosing] = useState(false);
  const [dragStartY, setDragStartY] = useState(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const compactDragActiveRef = useRef(false);
  const expandedDragActiveRef = useRef(false);
  const suppressCompactClickRef = useRef(false);
  const dragStartYRef = useRef(null);
  const dragOffsetYRef = useRef(0);

  const trackTitle = currentTrack?.title || "Escolha uma musica";
  const trackArtist = currentTrack?.artist || "Clique em uma faixa para comecar";
  const trackAlbum = currentTrack?.album || "Deefy";
  const trackCover = currentTrack?.coverUrl || fallbackCover;
  const currentTimeText = formatTime(currentTime);
  const durationText = duration > 0 ? formatTime(duration) : currentTrack?.duration || "--:--";
  const rangeMax = duration > 0 ? duration : 100;
  const rangeValue = duration > 0 ? Math.min(currentTime, duration) : 0;

  const progressStyle = {
    "--deefy-player-fill": `${progressPercent}%`,
  };

  const volumeStyle = {
    "--deefy-player-fill": `${effectiveVolume}%`,
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

  const toggleFavorite = () => setIsFavorite((current) => !current);
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

  const handleQueueInfo = (event) => {
    stopCompactControlClick(event);
    showMusicInfo(
      queue.length
        ? `Fila atual: ${currentIndex + 1} de ${queue.length} musicas.`
        : "A fila sera criada quando voce tocar uma lista."
    );
  };

  const handleSeekChange = (event) => {
    seekTo(Number(event.target.value));
  };

  const handleVolumeChange = (event) => {
    setVolume(Number(event.target.value));
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
        className={`deefy-player-shell${!hasTrack ? " deefy-player-shell--empty" : ""}`}
        aria-label="Player musical"
        onClick={handleCompactPlayerClick}
        onTouchStart={handleCompactTouchStart}
        onTouchMove={handleCompactTouchMove}
        onTouchEnd={handleCompactTouchEnd}
        onTouchCancel={resetDrag}
      >
        <div className="deefy-player-track">
          <img
            className="deefy-player-cover"
            src={trackCover}
            alt={hasTrack ? `Capa de ${trackTitle}` : "Logo Deefy"}
            draggable="false"
          />

          <div className="deefy-player-copy">
            <p className="deefy-player-title">{trackTitle}</p>
            <p className="deefy-player-meta">
              {trackArtist} - {trackAlbum}
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
            disabled={!hasTrack}
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
              disabled={!hasTrack}
            >
              <FaRandom />
            </button>

            <button
              type="button"
              className="deefy-player-control-action deefy-player-skip-action"
              onClick={(event) => {
                stopCompactControlClick(event);
                previousTrack();
              }}
              aria-label="Musica anterior"
              disabled={!hasTrack}
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
                togglePlay();
              }}
              aria-label="Reproduzir/Pausar"
              aria-pressed={isPlaying}
              disabled={!canPlay}
            >
              <span className="deefy-player-main-icon">
                {isPlaying ? <FaPause /> : <FaPlay />}
              </span>
            </button>

            <button
              type="button"
              className="deefy-player-control-action deefy-player-skip-action"
              onClick={(event) => {
                stopCompactControlClick(event);
                nextTrack();
              }}
              aria-label="Proxima musica"
              disabled={!hasTrack}
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
              disabled={!hasTrack}
            >
              <FiRepeat />
            </button>
          </div>

          <div className="deefy-player-timeline">
            <span className="deefy-player-time">{currentTimeText}</span>
            <input
              className="deefy-player-range"
              type="range"
              min="0"
              max={rangeMax}
              value={rangeValue}
              onClick={stopCompactControlClick}
              onChange={handleSeekChange}
              style={progressStyle}
              aria-label="Progresso da musica"
              disabled={!duration}
            />
            <span className="deefy-player-time">{durationText}</span>
          </div>
        </div>

        <div className="deefy-player-actions">
          <button
            type="button"
            className="deefy-player-control-action"
            onClick={handleQueueInfo}
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
            value={effectiveVolume}
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
                src={trackCover}
                alt={hasTrack ? `Capa de ${trackTitle}` : "Logo Deefy"}
                draggable="false"
              />
            </div>

            <div className="deefy-player-expanded-content">
              <div className="deefy-player-expanded-track-row">
                <div className="deefy-player-expanded-copy">
                  <p className="deefy-player-expanded-title">{trackTitle}</p>
                  <p className="deefy-player-expanded-meta">
                    {trackArtist} - {trackAlbum}
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
                  disabled={!hasTrack}
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
                  max={rangeMax}
                  value={rangeValue}
                  onChange={handleSeekChange}
                  style={progressStyle}
                  aria-label="Progresso da musica"
                  disabled={!duration}
                />
                <div className="deefy-player-expanded-time-row">
                  <span className="deefy-player-time">{currentTimeText}</span>
                  <span className="deefy-player-time">{durationText}</span>
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
                  disabled={!hasTrack}
                >
                  <FaRandom />
                </button>

                <button
                  type="button"
                  className="deefy-player-control-action deefy-player-expanded-control deefy-player-expanded-skip"
                  onClick={previousTrack}
                  aria-label="Musica anterior"
                  disabled={!hasTrack}
                >
                  <FaStepBackward />
                </button>

                <button
                  type="button"
                  className={`deefy-player-main-action deefy-player-expanded-main ${
                    isPlaying ? "is-playing" : ""
                  }`}
                  onClick={togglePlay}
                  aria-label="Reproduzir/Pausar"
                  aria-pressed={isPlaying}
                  disabled={!canPlay}
                >
                  <span className="deefy-player-main-icon">
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </span>
                </button>

                <button
                  type="button"
                  className="deefy-player-control-action deefy-player-expanded-control deefy-player-expanded-skip"
                  onClick={nextTrack}
                  aria-label="Proxima musica"
                  disabled={!hasTrack}
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
                  disabled={!hasTrack}
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
                  value={effectiveVolume}
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
