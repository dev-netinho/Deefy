/* eslint-disable react-refresh/only-export-components */
// Exporting both PlayerProvider and usePlayer from the same file is intentional:
// this is standard React context pattern. The Fast Refresh warning is suppressed here.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';


const PlayerContext = createContext();

function sameTrack(left, right) {
  if (!left || !right) return false;
  return String(left.id) === String(right.id);
}

function normalizeQueue(track, newQueue) {
  if (Array.isArray(newQueue) && newQueue.length) {
    return [...newQueue];
  }

  return track ? [track] : [];
}

function shuffleItems(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = currentItem;
  }

  return shuffled;
}

function buildShuffledQueue(sourceQueue, currentTrack) {
  if (!Array.isArray(sourceQueue) || sourceQueue.length <= 1) {
    return Array.isArray(sourceQueue) ? [...sourceQueue] : [];
  }

  const activeIndex = currentTrack
    ? sourceQueue.findIndex((track) => sameTrack(track, currentTrack))
    : -1;

  if (activeIndex < 0) {
    return shuffleItems(sourceQueue);
  }

  const activeTrack = sourceQueue[activeIndex];
  const remainingTracks = sourceQueue.filter((_, index) => index !== activeIndex);
  return [activeTrack, ...shuffleItems(remainingTracks)];
}

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [sourceQueue, setSourceQueue] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playbackCommand, setPlaybackCommand] = useState(null);

  const playTrack = useCallback((track, newQueue) => {
    const nextSourceQueue = normalizeQueue(track, newQueue);

    setCurrentTrack(track);
    setIsPlaying(true);
    setSourceQueue(nextSourceQueue);
    setQueue(isShuffle ? buildShuffledQueue(nextSourceQueue, track) : nextSourceQueue);
  }, [isShuffle]);

  const playNext = useCallback(() => {
    if (!queue.length || !currentTrack) return;
    const currentIndex = queue.findIndex(t => sameTrack(t, currentTrack));
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      setCurrentTrack(queue[currentIndex + 1]);
      setIsPlaying(true);
    }
  }, [currentTrack, queue]);

  const playPrevious = useCallback(() => {
    if (!queue.length || !currentTrack) return;
    const currentIndex = queue.findIndex(t => sameTrack(t, currentTrack));
    if (currentIndex > 0) {
      setCurrentTrack(queue[currentIndex - 1]);
      setIsPlaying(true);
    }
  }, [currentTrack, queue]);

  const togglePlay = useCallback(() => {
    setPlaybackCommand((current) => ({ type: 'toggle', id: (current?.id ?? 0) + 1 }));
  }, []);

  const setPlaying = useCallback((nextPlaying) => {
    setIsPlaying(Boolean(nextPlaying));
  }, []);

  const setShuffleMode = useCallback((nextShuffle) => {
    const enabled = typeof nextShuffle === 'function'
      ? Boolean(nextShuffle(isShuffle))
      : Boolean(nextShuffle);

    setIsShuffle(enabled);
    setQueue((currentQueue) => {
      const baseQueue = sourceQueue.length ? sourceQueue : currentQueue;
      return enabled ? buildShuffledQueue(baseQueue, currentTrack) : [...baseQueue];
    });
  }, [currentTrack, isShuffle, sourceQueue]);

  const value = useMemo(() => ({
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
  }), [
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
  ]);

  return (
    <PlayerContext.Provider value={value}>
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
