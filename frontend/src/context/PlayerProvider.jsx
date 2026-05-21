import { useEffect, useRef, useState } from "react";
import fallbackCover from "../assets/logo.svg";
import { showMusicError } from "../utils/musicToast";
import { PlayerContext } from "./player-context";

const STORAGE_KEY = "@deefy-player-state";
const DEFAULT_VOLUME = 72;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseDuration(duration) {
  if (Number.isFinite(duration) && duration > 0) {
    return duration;
  }

  if (typeof duration !== "string" || !duration.includes(":")) {
    return 0;
  }

  const parts = duration.split(":").map((part) => Number(part));

  if (parts.some((part) => !Number.isFinite(part))) {
    return 0;
  }

  return parts.reduce((total, part) => total * 60 + part, 0);
}

function normalizeTrack(track) {
  if (!track) {
    return null;
  }

  const fileUrl = track.fileUrl || track.arquivoUrl || track.audioUrl || "";
  const durationSeconds =
    Number(track.durationSeconds || track.duracaoSegundos || track.duracao) || 0;
  const fallbackDuration = durationSeconds || parseDuration(track.duration);

  return {
    ...track,
    id: track.id,
    title: track.title || track.titulo || "Musica sem titulo",
    artist: track.artist || track.artista || "Artista nao informado",
    album: track.album || track.albumTitle || "Sem album",
    coverUrl: track.coverUrl || track.capaUrl || fallbackCover,
    fileUrl,
    audioUrl: fileUrl,
    durationSeconds: fallbackDuration,
    duration: track.duration || "--:--",
  };
}

function sameTrack(left, right) {
  if (!left || !right) {
    return false;
  }

  return String(left.id) === String(right.id);
}

function readStoredState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    return {
      volume: clamp(Number(stored.volume) || DEFAULT_VOLUME, 0, 100),
      isMuted: Boolean(stored.isMuted),
      isShuffle: Boolean(stored.isShuffle),
      isRepeat: Boolean(stored.isRepeat),
      currentTrack: normalizeTrack(stored.currentTrack),
    };
  } catch {
    return {
      volume: DEFAULT_VOLUME,
      isMuted: false,
      isShuffle: false,
      isRepeat: false,
      currentTrack: null,
    };
  }
}

function persistState(nextState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        volume: nextState.volume,
        isMuted: nextState.isMuted,
        isShuffle: nextState.isShuffle,
        isRepeat: nextState.isRepeat,
        currentTrack: nextState.currentTrack,
      })
    );
  } catch {
    // Storage can be unavailable in private contexts; playback must still work.
  }
}

export default function PlayerProvider({ children }) {
  const [storedState] = useState(readStoredState);
  const audioRef = useRef(null);
  const endedActionRef = useRef(() => {});
  const pendingPlayRef = useRef(false);
  const lastAudibleVolumeRef = useRef(
    storedState.volume > 0 ? storedState.volume : DEFAULT_VOLUME
  );

  const [currentTrack, setCurrentTrack] = useState(storedState.currentTrack);
  const [queue, setQueue] = useState(() =>
    storedState.currentTrack ? [storedState.currentTrack] : []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    storedState.currentTrack?.durationSeconds || 0
  );
  const [volume, setVolumeState] = useState(storedState.volume);
  const [isMuted, setIsMuted] = useState(storedState.isMuted);
  const [isShuffle, setIsShuffle] = useState(storedState.isShuffle);
  const [isRepeat, setIsRepeat] = useState(storedState.isRepeat);
  const [playbackError, setPlaybackError] = useState(null);

  const pauseAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const playAudio = () => {
    const audio = audioRef.current;

    if (!audio || !currentTrack?.fileUrl) {
      showMusicError("Escolha uma musica com arquivo valido para tocar.");
      return;
    }

    pendingPlayRef.current = false;
    audio.play()
      .then(() => {
        setPlaybackError(null);
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
        setPlaybackError("Nao foi possivel tocar esta musica.");
        showMusicError("Nao foi possivel tocar esta musica.");
      });
  };

  const selectTrackAt = (index, shouldPlay = true) => {
    if (!queue.length) {
      return;
    }

    const nextIndex = clamp(index, 0, queue.length - 1);
    const nextTrack = queue[nextIndex];

    if (!nextTrack?.fileUrl) {
      showMusicError("Esta musica nao possui arquivo de audio.");
      return;
    }

    pendingPlayRef.current = shouldPlay;
    setCurrentIndex(nextIndex);
    setCurrentTrack(nextTrack);
    setCurrentTime(0);
    setDuration(nextTrack.durationSeconds || 0);
    setPlaybackError(null);
  };

  const nextTrack = () => {
    if (!queue.length) {
      return;
    }

    if (isShuffle && queue.length > 1) {
      let nextIndex = currentIndex;

      while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }

      selectTrackAt(nextIndex, true);
      return;
    }

    if (currentIndex < queue.length - 1) {
      selectTrackAt(currentIndex + 1, true);
      return;
    }

    pauseAudio();
    setCurrentTime(0);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const previousTrack = () => {
    if (!queue.length) {
      return;
    }

    if (audioRef.current?.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (currentIndex > 0) {
      selectTrackAt(currentIndex - 1, true);
      return;
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }

    setCurrentTime(0);
  };

  const playTrack = (track, nextQueue = []) => {
    const normalizedTrack = normalizeTrack(track);

    if (!normalizedTrack?.fileUrl) {
      showMusicError("Esta musica nao possui arquivo de audio.");
      return;
    }

    const normalizedQueue = nextQueue
      .map(normalizeTrack)
      .filter((item) => item?.fileUrl);
    const playableQueue = normalizedQueue.length ? normalizedQueue : [normalizedTrack];
    const nextIndex = playableQueue.findIndex((item) => sameTrack(item, normalizedTrack));
    const safeIndex = nextIndex >= 0 ? nextIndex : 0;
    const selectedTrack = playableQueue[safeIndex];

    pendingPlayRef.current = true;
    setQueue(playableQueue);
    setCurrentIndex(safeIndex);
    setCurrentTrack(selectedTrack);
    setCurrentTime(0);
    setDuration(selectedTrack.durationSeconds || 0);
    setPlaybackError(null);
  };

  const togglePlay = () => {
    if (!currentTrack?.fileUrl) {
      showMusicError("Escolha uma musica para comecar.");
      return;
    }

    if (isPlaying) {
      pauseAudio();
      return;
    }

    playAudio();
  };

  const seekTo = (seconds) => {
    const audio = audioRef.current;
    const safeDuration = duration || audio?.duration || 0;

    if (!audio || !Number.isFinite(safeDuration) || safeDuration <= 0) {
      return;
    }

    const nextTime = clamp(Number(seconds) || 0, 0, safeDuration);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const setPlayerVolume = (nextVolume) => {
    const safeVolume = clamp(Number(nextVolume) || 0, 0, 100);

    setVolumeState(safeVolume);
    setIsMuted(safeVolume === 0);

    if (safeVolume > 0) {
      lastAudibleVolumeRef.current = safeVolume;
    }
  };

  const toggleMute = () => {
    if (isMuted || volume === 0) {
      setVolumeState(lastAudibleVolumeRef.current || DEFAULT_VOLUME);
      setIsMuted(false);
      return;
    }

    lastAudibleVolumeRef.current = volume;
    setIsMuted(true);
  };

  const toggleShuffle = () => setIsShuffle((current) => !current);
  const toggleRepeat = () => setIsRepeat((current) => !current);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => endedActionRef.current();

    const handleError = () => {
      setIsPlaying(false);
      setPlaybackError("Nao foi possivel tocar esta musica.");
      showMusicError("Nao foi possivel tocar esta musica.");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    endedActionRef.current = () => {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      if (isRepeat) {
        audio.currentTime = 0;
        playAudio();
        return;
      }

      nextTrack();
    };
  });

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack?.fileUrl) {
      return;
    }

    if (audio.src !== currentTrack.fileUrl) {
      audio.src = currentTrack.fileUrl;
      audio.load();
    }

    if (pendingPlayRef.current) {
      playAudio();
    }
  });

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = isMuted ? 0 : clamp(volume, 0, 100) / 100;
  }, [volume, isMuted]);

  useEffect(() => {
    persistState({
      volume,
      isMuted,
      isShuffle,
      isRepeat,
      currentTrack,
    });
  }, [volume, isMuted, isShuffle, isRepeat, currentTrack]);

  const effectiveVolume = isMuted ? 0 : volume;
  const safeDuration =
    Number.isFinite(duration) && duration > 0
      ? duration
      : currentTrack?.durationSeconds || 0;
  const progressPercent =
    safeDuration > 0 ? clamp((currentTime / safeDuration) * 100, 0, 100) : 0;

  const value = {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration: safeDuration,
    progressPercent,
    volume,
    effectiveVolume,
    isMuted,
    isShuffle,
    isRepeat,
    playbackError,
    hasTrack: Boolean(currentTrack),
    canPlay: Boolean(currentTrack?.fileUrl),
    playTrack,
    togglePlay,
    seekTo,
    setVolume: setPlayerVolume,
    toggleMute,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
