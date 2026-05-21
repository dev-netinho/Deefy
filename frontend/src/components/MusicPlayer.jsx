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
import "./MusicPlayer.css";

const MOCK_TRACK = {
  title: "Nightdrive Anthem",
  artist: "Synth Lord",
  album: "Neon Nights",
  coverUrl: "https://picsum.photos/seed/deefy-nightdrive/160/160",
  durationInSeconds: 252,
};

function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
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

  const isMuted = volume === 0;
  const currentSeconds = (progress / 100) * MOCK_TRACK.durationInSeconds;
  const currentTime = formatTime(currentSeconds);
  const duration = formatTime(MOCK_TRACK.durationInSeconds);

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

  const togglePlaying = () => setIsPlaying((current) => !current);
  const toggleFavorite = () => setIsFavorite((current) => !current);
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
        <div className="deefy-player-track">
          <img
            className="deefy-player-cover"
            src={MOCK_TRACK.coverUrl}
            alt={`Capa de ${MOCK_TRACK.title}`}
            draggable="false"
          />

          <div className="deefy-player-copy">
            <p className="deefy-player-title">{MOCK_TRACK.title}</p>
            <p className="deefy-player-meta">
              {MOCK_TRACK.artist} - {MOCK_TRACK.album}
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
              onClick={stopCompactControlClick}
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
              onClick={stopCompactControlClick}
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
              onChange={(event) => setProgress(Number(event.target.value))}
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
                src={MOCK_TRACK.coverUrl}
                alt={`Capa de ${MOCK_TRACK.title}`}
                draggable="false"
              />
            </div>

            <div className="deefy-player-expanded-content">
              <div className="deefy-player-expanded-track-row">
                <div className="deefy-player-expanded-copy">
                  <p className="deefy-player-expanded-title">{MOCK_TRACK.title}</p>
                  <p className="deefy-player-expanded-meta">
                    {MOCK_TRACK.artist} - {MOCK_TRACK.album}
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
                  onChange={(event) => setProgress(Number(event.target.value))}
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
