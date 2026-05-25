/* eslint-disable react-refresh/only-export-components */
// Exporting both PlayerProvider and usePlayer from the same file is intentional:
// this is standard React context pattern. The Fast Refresh warning is suppressed here.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';


const PlayerContext = createContext();

function sameTrack(left, right) {
  if (!left || !right) return false;
  return String(left.id) === String(right.id);
}

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [playbackCommand, setPlaybackCommand] = useState(null);

  const playTrack = useCallback((track, newQueue) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (newQueue) {
      setQueue(newQueue);
    }
  }, []);

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

  const value = useMemo(() => ({
    currentTrack,
    isPlaying,
    queue,
    playbackCommand,
    playTrack,
    playNext,
    playPrevious,
    togglePlay,
    setPlaying,
  }), [
    currentTrack,
    isPlaying,
    queue,
    playbackCommand,
    playTrack,
    playNext,
    playPrevious,
    togglePlay,
    setPlaying,
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
