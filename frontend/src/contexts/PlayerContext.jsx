/* eslint-disable react-refresh/only-export-components */
// Exporting both PlayerProvider and usePlayer from the same file is intentional:
// this is standard React context pattern. The Fast Refresh warning is suppressed here.
import { createContext, useCallback, useEffect, useState, useContext } from 'react';


const PlayerContext = createContext();
const PLAYER_STATE_STORAGE_KEY = '@deefy-player-state';

function getTrackId(track) {
  const id = track?.id ?? track?.musicId ?? track?.musicaId ?? track?.uuid ?? track?.slug ?? '';
  return id === undefined || id === null ? '' : String(id);
}

function normalizeQueue(items) {
  return Array.isArray(items) ? items.filter(Boolean) : [];
}

function shuffleQueue(items, currentTrack) {
  const currentId = getTrackId(currentTrack);
  const copy = normalizeQueue(items);
  const currentItem = copy.find((track) => getTrackId(track) === currentId);
  const rest = copy.filter((track) => getTrackId(track) !== currentId);

  for (let index = rest.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [rest[index], rest[randomIndex]] = [rest[randomIndex], rest[index]];
  }

  return currentItem ? [currentItem, ...rest] : rest;
}

function readStoredPlayerState() {
  if (typeof window === 'undefined') return {};

  try {
    const storedState = window.localStorage.getItem(PLAYER_STATE_STORAGE_KEY);
    return storedState ? JSON.parse(storedState) : {};
  } catch (error) {
    console.warn('Deefy player: nao foi possivel restaurar o estado salvo.', error);
    return {};
  }
}

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(() => readStoredPlayerState().currentTrack || null);
  const [isPlaying, setIsPlaying] = useState(() => Boolean(readStoredPlayerState().isPlaying));
  const [queue, setQueue] = useState(() => {
    const storedQueue = readStoredPlayerState().queue;
    return Array.isArray(storedQueue) ? storedQueue : [];
  });
  const [sourceQueue, setSourceQueue] = useState(() => {
    const storedSourceQueue = readStoredPlayerState().sourceQueue;
    return Array.isArray(storedSourceQueue) ? storedSourceQueue : [];
  });
  const [isShuffle, setIsShuffle] = useState(() => Boolean(readStoredPlayerState().isShuffle));
  const [playbackCommand, setPlaybackCommand] = useState(null);
  const [expandedRequestId, setExpandedRequestId] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(
        PLAYER_STATE_STORAGE_KEY,
        JSON.stringify({ currentTrack, isPlaying, queue, sourceQueue, isShuffle })
      );
    } catch (error) {
      console.warn('Deefy player: nao foi possivel salvar o estado atual.', error);
    }
  }, [currentTrack, isPlaying, queue, sourceQueue, isShuffle]);

  const playTrack = useCallback((track, newQueue) => {
    const nextSourceQueue = newQueue ? normalizeQueue(newQueue) : sourceQueue;
    setCurrentTrack(track);
    setIsPlaying(true);

    if (newQueue) {
      setSourceQueue(nextSourceQueue);
      setQueue(isShuffle ? shuffleQueue(nextSourceQueue, track) : nextSourceQueue);
    } else if (!queue.length && track) {
      setSourceQueue([track]);
      setQueue([track]);
    }
  }, [isShuffle, queue.length, sourceQueue]);

  const playNext = useCallback(() => {
    if (!queue.length || !currentTrack) return;
    const currentIndex = queue.findIndex(t => getTrackId(t) === getTrackId(currentTrack));
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      setCurrentTrack(queue[currentIndex + 1]);
      setIsPlaying(true);
    }
  }, [currentTrack, queue]);

  const playPrevious = useCallback(() => {
    if (!queue.length || !currentTrack) return;
    const currentIndex = queue.findIndex(t => getTrackId(t) === getTrackId(currentTrack));
    if (currentIndex > 0) {
      setCurrentTrack(queue[currentIndex - 1]);
      setIsPlaying(true);
    }
  }, [currentTrack, queue]);

  const togglePlay = useCallback(() => {
    setPlaybackCommand((current) => ({
      id: (current?.id || 0) + 1,
      type: 'toggle',
    }));
  }, []);

  const setPlaying = useCallback((nextPlaying) => {
    setIsPlaying(Boolean(nextPlaying));
  }, []);

  const setShuffleMode = useCallback((updater) => {
    setIsShuffle((currentShuffle) => {
      const nextShuffle = typeof updater === 'function' ? updater(currentShuffle) : Boolean(updater);
      const baseQueue = sourceQueue.length ? sourceQueue : queue;

      if (nextShuffle) {
        setQueue(shuffleQueue(baseQueue, currentTrack));
      } else {
        setQueue(baseQueue);
      }

      return nextShuffle;
    });
  }, [currentTrack, queue, sourceQueue]);

  const requestExpandedPlayer = useCallback(() => {
    setExpandedRequestId((current) => current + 1);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        sourceQueue,
        isShuffle,
        playbackCommand,
        playTrack,
        playNext,
        playPrevious,
        togglePlay,
        setPlaying,
        setShuffleMode,
        requestExpandedPlayer,
        expandedRequestId,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
