import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { FiChevronDown, FiMaximize2, FiRepeat, FiX } from "react-icons/fi";
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

const PLAYER_PROGRESS_STORAGE_KEY = "@deefy-player-progress";

function getTrackStorageKey(track) {
  return track?.id ?? track?.audioUrl ?? track?.title ?? "";
}

function readStoredPlaybackTime(track) {
  const trackKey = String(getTrackStorageKey(track));
  if (!trackKey || typeof window === "undefined") return 0;

  try {
    const storedProgress = window.localStorage.getItem(PLAYER_PROGRESS_STORAGE_KEY);
    const progress = storedProgress ? JSON.parse(storedProgress) : null;

    if (progress?.trackKey !== trackKey) return 0;

    const storedTime = Number(progress.currentTime);
    return Number.isFinite(storedTime) && storedTime > 0 ? storedTime : 0;
  } catch (error) {
    console.warn("Deefy player: nao foi possivel restaurar o progresso.", error);
    return 0;
  }
}

function writeStoredPlaybackTime(track, seconds) {
  const trackKey = String(getTrackStorageKey(track));
  if (!trackKey || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      PLAYER_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        trackKey,
        currentTime: Math.max(Number(seconds) || 0, 0),
      }),
    );
  } catch (error) {
    console.warn("Deefy player: nao foi possivel salvar o progresso.", error);
  }
}

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
      track.capaurl ||
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

function getPlaylistId(playlist) {
  return playlist?.id ?? playlist?.uuid ?? playlist?.slug ?? null;
}

function getPlaylistName(playlist) {
  return playlist?.name || playlist?.title || "Playlist";
}

function MusicPlayer({ playlists, onAddToPlaylist, isHidden = false }) {
  const audioRef = useRef(null);
  const compactDragActiveRef = useRef(false);
  const expandedDragActiveRef = useRef(false);
  const suppressCompactClickRef = useRef(false);
  const dragStartYRef = useRef(null);
  const dragOffsetYRef = useRef(0);
  const playlistMenuRef = useRef(null);
  const contextIsPlayingRef = useRef(false);
  const shouldResumePlaybackRef = useRef(false);
  const pendingRestoreTimeRef = useRef(0);
  const lastPersistedSecondRef = useRef(-1);
  const lastPlaybackCommandIdRef = useRef(null);
  const playlistSheetDragStartYRef = useRef(null);
  const playlistSheetDragOffsetYRef = useRef(0);

  const {
    currentTrack: contextTrack,
    isPlaying: contextIsPlaying,
    isShuffle,
    playbackCommand,
    queue,
    playNext,
    playPrevious,
    setPlaying: setContextPlaying,
    setShuffleMode,
    expandedRequestId,
  } = usePlayer();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(72);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState(() => new Set());
  const [playlistMenuContext, setPlaylistMenuContext] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [playlistError, setPlaylistError] = useState("");
  const [addingPlaylistId, setAddingPlaylistId] = useState(null);
  const [addedPlaylistIds, setAddedPlaylistIds] = useState(() => new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedClosing, setIsExpandedClosing] = useState(false);
  const [dragStartY, setDragStartY] = useState(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [playlistSheetDragOffset, setPlaylistSheetDragOffset] = useState(0);

  const tracks = useMemo(() => {
    if (Array.isArray(queue) && queue.length) return queue;
    return contextTrack ? [contextTrack] : [];
  }, [queue, contextTrack]);

  const currentTrackIndex = contextTrack
    ? tracks.findIndex((track) => String(track?.id ?? "") === String(contextTrack.id ?? ""))
    : -1;
  const activeTrackIndex = currentTrackIndex >= 0 ? currentTrackIndex : 0;
  const rawTrack = contextTrack || tracks[activeTrackIndex] || null;
  const hasSelectedTrack = Boolean(rawTrack);
  const currentTrack = useMemo(() => normalizeTrack(rawTrack), [rawTrack]);
  const hasAudioUrl = Boolean(currentTrack.audioUrl);
  const hasPrevious = tracks.length > 1 && activeTrackIndex > 0;
  const hasNext = tracks.length > 1 && activeTrackIndex < tracks.length - 1;
  const providedPlaylists = useMemo(
    () => (Array.isArray(playlists) ? playlists : []),
    [playlists],
  );
  const effectivePlaylists = useMemo(() => {
    if (providedPlaylists.length > 0) return providedPlaylists;
    return userPlaylists;
  }, [providedPlaylists, userPlaylists]);
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

  const playlistSheetStyle = {
    "--deefy-player-sheet-drag-offset": `${Math.max(playlistSheetDragOffset, 0)}px`,
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

  const resetPlaylistSheetDrag = () => {
    playlistSheetDragStartYRef.current = null;
    playlistSheetDragOffsetYRef.current = 0;
    setPlaylistSheetDragOffset(0);
  };

  const persistPlaybackProgress = useCallback((seconds) => {
    const nextSecond = Math.floor(Number(seconds) || 0);

    if (lastPersistedSecondRef.current === nextSecond) return;

    lastPersistedSecondRef.current = nextSecond;
    writeStoredPlaybackTime(currentTrack, seconds);
  }, [currentTrack]);

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
    if (!playbackCommand || playbackCommand.id === lastPlaybackCommandIdRef.current) return;

    lastPlaybackCommandIdRef.current = playbackCommand.id;

    if (playbackCommand.type === "toggle") {
      togglePlaying();
    }
  }, [playbackCommand]);

  useEffect(() => {
    let isMounted = true;

    musicService.getFavoriteMusics()
      .then((favorites) => {
        if (!isMounted) return;

        setFavoriteTrackIds(
          new Set(
            (favorites || [])
              .map((track) => track?.id)
              .filter((id) => id !== undefined && id !== null && id !== "")
              .map(String),
          ),
        );
      })
      .catch((error) => {
        console.warn("Deefy player: nao foi possivel carregar favoritos.", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const currentTrackId = currentTrack.id === null ? "" : String(currentTrack.id);
    setIsFavorite(Boolean(currentTrack.isFavorite || favoriteTrackIds.has(currentTrackId)));
  }, [currentTrack.id, currentTrack.isFavorite, favoriteTrackIds]);

  useEffect(() => {
    const handleFavoriteChanged = (event) => {
      const eventTrackId = event.detail?.musicId;
      if (!eventTrackId) return;

      setFavoriteTrackIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (event.detail?.isFavorite) {
          nextIds.add(String(eventTrackId));
        } else {
          nextIds.delete(String(eventTrackId));
        }

        return nextIds;
      });
    };

    window.addEventListener(FAVORITE_MUSIC_CHANGED_EVENT, handleFavoriteChanged);
    return () => {
      window.removeEventListener(FAVORITE_MUSIC_CHANGED_EVENT, handleFavoriteChanged);
    };
  }, []);

  useEffect(() => {
    setAddedPlaylistIds(new Set());
    lastPersistedSecondRef.current = -1;
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
    if (!isHidden) return;

    setPlaylistMenuContext(null);
    setIsExpanded(false);
    setIsExpandedClosing(false);
    resetDrag();
  }, [isHidden]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const restoredTime = readStoredPlaybackTime(currentTrack);
    pendingRestoreTimeRef.current = restoredTime;

    const resetTimer = window.setTimeout(() => {
      setCurrentTime(restoredTime);
      setDuration(currentTrack.durationSeconds || 0);
    }, 0);

    audio.pause();
    audio.load();

    if (restoredTime > 0) {
      try {
        audio.currentTime = restoredTime;
      } catch (error) {
        console.warn("Deefy player: progresso sera restaurado ao carregar metadados.", error);
      }
    }

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
    currentTrack,
  ]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = audio.currentTime || 0;
    setCurrentTime(nextTime);
    persistPlaybackProgress(nextTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextDuration = Number.isFinite(audio.duration) ? audio.duration : currentTrack.durationSeconds || 0;
    const restoredTime = pendingRestoreTimeRef.current;

    if (restoredTime > 0) {
      const safeTime = nextDuration > 0
        ? Math.min(restoredTime, Math.max(nextDuration - 0.5, 0))
        : restoredTime;

      try {
        audio.currentTime = safeTime;
      } catch (error) {
        console.warn("Deefy player: nao foi possivel restaurar o tempo salvo.", error);
      }

      pendingRestoreTimeRef.current = 0;
    }

    setCurrentTime(audio.currentTime || restoredTime || 0);
    setDuration(nextDuration);
  };

  const togglePlaying = () => {
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
  };

  const handleSeek = (event) => {
    const nextTime = Number(event.target.value);
    const audio = audioRef.current;

    setCurrentTime(nextTime);
    persistPlaybackProgress(nextTime);

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

  const handlePrevious = () => {
    if (!hasPrevious) return;
    shouldResumePlaybackRef.current = isPlaying;
    playPrevious();
  };

  const handleNext = () => {
    if (!hasNext) return;
    shouldResumePlaybackRef.current = isPlaying;
    playNext();
  };

  const handleEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      persistPlaybackProgress(0);
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
    persistPlaybackProgress(0);
  };

  const toggleFavorite = async () => {
    if (!currentTrack.id) return;

    const nextFavorite = !isFavorite;
    const currentTrackId = String(currentTrack.id);
    setIsFavorite(nextFavorite);

    try {
      const savedFavoriteState = await musicService.toggleFavorite(currentTrack.id, isFavorite);
      setFavoriteTrackIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (savedFavoriteState) {
          nextIds.add(currentTrackId);
        } else {
          nextIds.delete(currentTrackId);
        }

        return nextIds;
      });
      setIsFavorite(savedFavoriteState);
    } catch (error) {
      setIsFavorite(!nextFavorite);
      console.warn("Deefy player: nao foi possivel atualizar favorito.", error);
    }
  };

  const loadUserPlaylists = useCallback(async () => {
    if (providedPlaylists.length > 0) {
      setPlaylistError("");
      return;
    }

    try {
      setIsLoadingPlaylists(true);
      setPlaylistError("");
      const data = await musicService.getUserPlaylists();
      setUserPlaylists(Array.isArray(data) ? data : []);
    } catch (error) {
      setPlaylistError("Nao foi possivel carregar suas playlists.");
      console.warn("Deefy player: nao foi possivel carregar playlists.", error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  }, [providedPlaylists]);

  const togglePlaylistMenu = (context) => {
    setPlaylistMenuContext((current) => (current === context ? null : context));
  };

  const closePlaylistMenu = () => {
    resetPlaylistSheetDrag();
    setPlaylistMenuContext(null);
  };

  const handlePlaylistSheetTouchStart = (event) => {
    event.stopPropagation();
    playlistSheetDragStartYRef.current = event.touches[0].clientY;
    playlistSheetDragOffsetYRef.current = 0;
    setPlaylistSheetDragOffset(0);
  };

  const handlePlaylistSheetTouchMove = (event) => {
    event.stopPropagation();

    const startY = playlistSheetDragStartYRef.current;
    if (startY === null) return;

    const nextOffset = event.touches[0].clientY - startY;
    const listElement = event.target?.closest?.(".deefy-player-playlist-sheet-list");

    if (listElement && listElement.scrollTop > 0 && nextOffset > 0) {
      return;
    }

    const safeOffset = Math.max(nextOffset, 0);
    playlistSheetDragOffsetYRef.current = safeOffset;
    setPlaylistSheetDragOffset(safeOffset);
  };

  const handlePlaylistSheetTouchEnd = (event) => {
    event.stopPropagation();

    if (playlistSheetDragOffsetYRef.current > 72) {
      closePlaylistMenu();
      return;
    }

    resetPlaylistSheetDrag();
  };

  const handleAddToPlaylist = async (playlist) => {
    const playlistId = getPlaylistId(playlist);
    const playlistName = getPlaylistName(playlist);

    if (!currentTrack.id || !playlistId) {
      toast.error("Nao foi possivel identificar a musica ou playlist.");
      closePlaylistMenu();
      return;
    }

    try {
      setAddingPlaylistId(String(playlistId));

      if (typeof onAddToPlaylist === "function") {
        await onAddToPlaylist(playlist, currentTrack);
      } else {
        await musicService.addMusicToPlaylist(playlistId, currentTrack);
      }

      setAddedPlaylistIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(String(playlistId));
        return nextIds;
      });
      toast.success(`Musica adicionada a playlist ${playlistName}`);
    } catch (error) {
      if (error?.response?.status === 409 || error?.status === 409) {
        setAddedPlaylistIds((currentIds) => {
          const nextIds = new Set(currentIds);
          nextIds.add(String(playlistId));
          return nextIds;
        });
        toast.error("Essa musica ja esta nessa playlist.");
      } else {
        toast.error(error?.response?.data?.message || "Erro ao adicionar musica a playlist.");
      }
      console.warn("Deefy player: nao foi possivel adicionar a playlist.", error);
    } finally {
      setAddingPlaylistId(null);
      closePlaylistMenu();
    }
  };

  const openExpandedPlayer = () => {
    setPlaylistMenuContext(null);
    resetDrag();
    setIsExpandedClosing(false);
    setIsExpanded(true);
  };

  useEffect(() => {
    if (!expandedRequestId || isHidden || !hasSelectedTrack) return;
    setPlaylistMenuContext(null);
    dragStartYRef.current = null;
    dragOffsetYRef.current = 0;
    compactDragActiveRef.current = false;
    expandedDragActiveRef.current = false;
    setDragStartY(null);
    setDragOffsetY(0);
    setIsDragging(false);
    setIsExpandedClosing(false);
    setIsExpanded(true);
  }, [expandedRequestId, hasSelectedTrack, isHidden]);

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

    loadUserPlaylists();

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
  }, [loadUserPlaylists, playlistMenuContext]);

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

  const renderPlaylistMenuItems = () => {
    const hasPlaylists = effectivePlaylists.length > 0;

    if (isLoadingPlaylists) {
      return (
        <p className="deefy-player-playlist-empty">
          Carregando playlists...
        </p>
      );
    }

    if (playlistError) {
      return (
        <p className="deefy-player-playlist-empty deefy-player-playlist-error">
          {playlistError}
        </p>
      );
    }

    if (hasPlaylists) {
      return effectivePlaylists.map((playlist) => {
        const playlistId = getPlaylistId(playlist);
        const playlistIdKey = playlistId === null ? "" : String(playlistId);
        const isAdding = addingPlaylistId === playlistIdKey;
        const isAdded = Boolean(playlistIdKey && addedPlaylistIds.has(playlistIdKey));

        return (
          <button
            key={playlistIdKey || getPlaylistName(playlist)}
            type="button"
            className={`deefy-player-playlist-menu-item ${
              isAdded ? "is-added" : ""
            }`}
            role="menuitem"
            disabled={isAdding || isAdded}
            onClick={(event) => {
              stopCompactControlClick(event);
              handleAddToPlaylist(playlist);
            }}
          >
            <span className="deefy-player-playlist-menu-icon">
              <MdPlaylistAdd />
            </span>
            <span className="deefy-player-playlist-menu-name">
              {isAdding ? "Adicionando..." : isAdded ? "Adicionada" : getPlaylistName(playlist)}
            </span>
          </button>
        );
      });
    }

    return (
      <p className="deefy-player-playlist-empty">
        Nenhuma playlist pessoal encontrada
      </p>
    );
  };

  const renderPlaylistMenu = (context, extraClassName = "") => {
    const isOpen = playlistMenuContext === context;
    const playlistOverlay = isOpen ? (
      <div
        className="deefy-player-playlist-sheet-backdrop"
        ref={playlistMenuRef}
        onClick={(event) => {
          stopCompactControlClick(event);
          if (event.target === event.currentTarget) {
            closePlaylistMenu();
          }
        }}
        onTouchStart={stopCompactControlClick}
        onTouchMove={stopCompactControlClick}
        onTouchEnd={stopCompactControlClick}
        onTouchCancel={stopCompactControlClick}
      >
        <section
          className="deefy-player-playlist-sheet"
          style={playlistSheetStyle}
          role="menu"
          aria-label="Playlists"
          onClick={stopCompactControlClick}
          onTouchStart={handlePlaylistSheetTouchStart}
          onTouchMove={handlePlaylistSheetTouchMove}
          onTouchEnd={handlePlaylistSheetTouchEnd}
          onTouchCancel={handlePlaylistSheetTouchEnd}
        >
          <div className="deefy-player-playlist-sheet-handle" aria-hidden="true" />

          <div className="deefy-player-playlist-sheet-header">
            <div className="deefy-player-playlist-sheet-copy">
              <p className="deefy-player-playlist-sheet-kicker">Adicionar à playlist</p>
            </div>

            <button
              type="button"
              className="deefy-player-playlist-sheet-close"
              onClick={(event) => {
                stopCompactControlClick(event);
                closePlaylistMenu();
              }}
              aria-label="Fechar playlists"
            >
              <FiX />
            </button>
          </div>

          <div className="deefy-player-playlist-sheet-list">
            {renderPlaylistMenuItems()}
          </div>
        </section>
      </div>
    ) : null;

    return (
      <div
        className={`deefy-player-playlist-wrap ${extraClassName}`}
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

        {playlistOverlay && typeof document !== "undefined"
          ? createPortal(playlistOverlay, document.body)
          : playlistOverlay}
      </div>
    );
  };

  const renderExpandedActions = (className) => (
    <div className={className}>
      <button
        type="button"
        className={`deefy-player-favorite-action deefy-player-expanded-favorite ${
          isFavorite ? "is-favorite" : ""
        }`}
        onClick={toggleFavorite}
        disabled={!currentTrack.id}
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
  );

  if (!hasSelectedTrack) {
    return null;
  }

  return (
    <>
      <aside
        className={`deefy-player-shell ${isHidden ? "deefy-player-hidden" : ""}`}
        aria-label="Player musical"
        aria-hidden={isHidden}
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
          onPlay={() => {
            setIsPlaying(true);
            syncContextPlaying(true);
          }}
          onPause={() => {
            setIsPlaying(false);
            syncContextPlaying(false);
          }}
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
            disabled={!currentTrack.id}
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
                setShuffleMode((current) => !current);
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

      {isExpanded && !isHidden && (
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
                  {renderExpandedActions("deefy-player-expanded-track-actions")}

                  <div className="deefy-player-expanded-copy">
                    <p
                      className={`deefy-player-expanded-title ${
                        currentTrack.title.length > 30 ? "is-long" : ""
                      }`}
                      title={currentTrack.title}
                    >
                      <span>{currentTrack.title}</span>
                    </p>
                    <div className="deefy-player-expanded-meta-row">
                      <p className="deefy-player-expanded-meta">
                        {currentTrack.artist}
                        {currentTrack.album ? ` - ${currentTrack.album}` : ""}
                      </p>

                      {renderExpandedActions("deefy-player-expanded-mobile-actions")}
                    </div>
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
                    onClick={() => setShuffleMode((current) => !current)}
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
